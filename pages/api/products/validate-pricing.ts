import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Request validation schema
const validatePricingSchema = z.object({
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().positive().int(),
      product_type: z.enum(["service", "bundle", "custom_item"]).optional(),
    }),
  ),
});

interface CartItem {
  product_id: string;
  quantity: number;
  product_type: "service" | "bundle" | "custom_item";
}

interface ValidatedItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  product_type: string;
}

interface InvalidItem {
  product_id: string;
  reason: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate environment variables
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return res.status(500).json({
        error: "Server configuration error",
        details: "Database access not configured",
      });
    }

    // Validate and parse request body
    const parseResult = validatePricingSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parseResult.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", "),
      });
    }

    const { items } = parseResult.data;

    if (items.length === 0) {
      return res.status(200).json({
        validatedItems: [],
        invalidItems: [],
      });
    }

    // Extract product IDs
    const productIds = items.map((item) => item.product_id);

    // Fetch products from unified products table
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(
        "id, name, product_type, base_price, sale_price, price_per_unit, minimum_quantity, maximum_quantity, status, visibility",
      )
      .in("id", productIds)
      .eq("status", "active")
      .in("visibility", ["public"]);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return res.status(500).json({
        error: "Failed to fetch products",
        details: "Database error occurred while validating products",
        code: productsError.code || "DATABASE_ERROR",
      });
    }

    const validatedItems: ValidatedItem[] = [];
    const invalidItems: InvalidItem[] = [];

    // Process each cart item
    for (const item of items) {
      const product = products?.find((p) => p.id === item.product_id);

      if (!product) {
        invalidItems.push({
          product_id: item.product_id,
          reason: "Product not found or inactive",
        });
        continue;
      }

      // Validate quantity constraints
      if (item.quantity < (product.minimum_quantity || 1)) {
        invalidItems.push({
          product_id: item.product_id,
          reason: `Minimum quantity is ${product.minimum_quantity || 1}`,
        });
        continue;
      }

      if (
        product.maximum_quantity &&
        item.quantity > product.maximum_quantity
      ) {
        invalidItems.push({
          product_id: item.product_id,
          reason: `Maximum quantity is ${product.maximum_quantity}`,
        });
        continue;
      }

      // Calculate pricing based on product type
      let unitPrice: number;

      switch (product.product_type) {
        case "service":
        case "bundle":
          // Use sale_price if available, otherwise base_price
          unitPrice = parseFloat(product.sale_price || product.base_price);
          break;

        case "custom_item":
          // For custom items, base_price + (price_per_unit * quantity)
          const basePrice = parseFloat(product.base_price);
          const pricePerUnit = parseFloat(product.price_per_unit || 0);
          unitPrice = basePrice + pricePerUnit * item.quantity;
          break;

        default:
          invalidItems.push({
            product_id: item.product_id,
            reason: "Unknown product type",
          });
          continue;
      }

      const totalPrice = unitPrice * item.quantity;

      validatedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: parseFloat(unitPrice.toFixed(2)),
        total_price: parseFloat(totalPrice.toFixed(2)),
        product_name: product.name,
        product_type: product.product_type,
      });
    }

    // Log validation results for debugging
    console.log("Product pricing validation:", {
      requestedItems: items.length,
      validatedItems: validatedItems.length,
      invalidItems: invalidItems.length,
      totalValidatedValue: validatedItems.reduce(
        (sum, item) => sum + item.total_price,
        0,
      ),
    });

    return res.status(200).json({
      validatedItems,
      invalidItems,
      summary: {
        requested: items.length,
        validated: validatedItems.length,
        invalid: invalidItems.length,
        totalValue: validatedItems.reduce(
          (sum, item) => sum + item.total_price,
          0,
        ),
      },
    });
  } catch (error: any) {
    console.error("Error in product pricing validation:", error);

    // Ensure we always return proper JSON
    const errorMessage = error.message || "Failed to validate product pricing";
    const errorCode = error.code || "UNKNOWN_ERROR";

    return res.status(500).json({
      error: "Internal server error",
      details: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}
