import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { security } from "@/lib/security";

// Initialize Stripe according to official documentation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
  typescript: true,
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomOrderItem {
  category: string;
  item_name: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  description?: string;
}

// Request validation schema
const verifyPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
  orderData: z.object({
    userId: z.string().optional(),
    customerEmail: z.string().email(),
    customerName: z.string().min(1),
    customerDiscord: z
      .string()
      .min(1, "Discord username is required")
      .refine((discord) => security.validateDiscordTag(discord.trim()), {
        message: "Invalid Discord username format",
      }),
    orderNotes: z.string().optional(),
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(), // This will be ignored - we'll fetch from DB
        quantity: z.number().positive().int(),
      }),
    ),
    notes: z.string().optional(),
    referralCode: z.string().optional(),
    referralDiscount: z.number().nonnegative().optional(),
    referralCreditsUsed: z.number().nonnegative().optional(),
    ipAddress: z.string().optional(),
    customOrderData: z
      .object({
        items: z.array(
          z.object({
            category: z.string(),
            item_name: z.string(),
            quantity: z.number().positive().int(),
            price_per_unit: z.number().positive(),
            total_price: z.number().positive(),
            description: z.string().optional(),
          }),
        ),
        special_instructions: z.string().optional(),
        customer_discord: z.string().optional(),
      })
      .optional(),
  }),
});

interface VerifyPaymentRequest {
  paymentIntentId: string;
  orderData: {
    userId?: string;
    customerEmail: string;
    customerName: string;
    customerDiscord: string;
    orderNotes?: string;
    services: OrderItem[];
    notes?: string;
    referralCode?: string;
    referralDiscount?: number;
    referralCreditsUsed?: number;
    ipAddress?: string;
    customOrderData?: {
      items: CustomOrderItem[];
      special_instructions?: string;
      customer_discord?: string;
    };
  };
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
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return res.status(500).json({
        error: "Server configuration error",
        details: "Payment processing not configured",
      });
    }

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
    const parseResult = verifyPaymentSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parseResult.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", "),
      });
    }

    const { paymentIntentId, orderData } = parseResult.data;

    // Retrieve and verify the PaymentIntent from Stripe
    let paymentIntent: Stripe.PaymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeError: any) {
      console.error("Failed to retrieve PaymentIntent:", stripeError);
      return res.status(400).json({
        error: "Invalid payment",
        details: "Payment verification failed",
      });
    }

    // Verify payment was successful
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not completed",
        details: `Payment status: ${paymentIntent.status}`,
      });
    }

    // Calculate expected total using SERVER-SIDE prices (SECURITY: Never trust client prices)
    const TAX_RATE = 0.08;
    let servicesTotal = 0;

    // Fetch actual service AND bundle prices from database - CRITICAL SECURITY
    if (orderData.services.length > 0) {
      const allIds = orderData.services.map((s) => s.id);

      // Query both services and bundles tables to support both types
      const [servicesResult, bundlesResult] = await Promise.all([
        supabase
          .from("services")
          .select("id, price, active, title")
          .in("id", allIds)
          .eq("active", true),
        supabase
          .from("bundles")
          .select("id, discounted_price, active, name")
          .in("id", allIds)
          .eq("active", true),
      ]);

      if (servicesResult.error) {
        console.error(
          "Error fetching services for verification:",
          servicesResult.error,
        );
        return res.status(500).json({
          error: "Failed to verify service pricing",
        });
      }

      if (bundlesResult.error) {
        console.error(
          "Error fetching bundles for verification:",
          bundlesResult.error,
        );
        return res.status(500).json({
          error: "Failed to verify bundle pricing",
        });
      }

      const dbServices = servicesResult.data || [];
      const dbBundles = bundlesResult.data || [];

      // Verify all requested items exist and are active (services OR bundles)
      const foundServiceIds = new Set(dbServices.map((s) => s.id));
      const foundBundleIds = new Set(dbBundles.map((b) => b.id));
      const allFoundIds = new Set([...foundServiceIds, ...foundBundleIds]);

      const missingItems = allIds.filter((id) => !allFoundIds.has(id));
      if (missingItems.length > 0) {
        console.error("Missing items in order verification:", {
          requestedIds: allIds,
          foundServices: Array.from(foundServiceIds),
          foundBundles: Array.from(foundBundleIds),
          missing: missingItems,
        });
        return res.status(400).json({
          error: "Invalid items in order",
          details: `Items not found or inactive: ${missingItems.join(", ")}`,
        });
      }

      // Calculate total using DATABASE prices (not client-provided prices)
      // Combine services and bundles price maps
      const servicesPriceMap = new Map(
        dbServices.map((s) => [s.id, parseFloat(s.price)]),
      );
      const bundlesPriceMap = new Map(
        dbBundles.map((b: any) => [b.id, parseFloat(b.discounted_price)]),
      );

      servicesTotal = orderData.services.reduce((sum, serviceRequest) => {
        // Check both services and bundles for price
        let dbPrice = servicesPriceMap.get(serviceRequest.id);
        if (dbPrice === undefined) {
          dbPrice = bundlesPriceMap.get(serviceRequest.id);
        }

        if (dbPrice === undefined) {
          throw new Error(`Price not found for item ${serviceRequest.id}`);
        }
        return sum + dbPrice * serviceRequest.quantity;
      }, 0);

      console.log("Order verification pricing:", {
        requestedItems: allIds.length,
        servicesFound: dbServices.length,
        bundlesFound: dbBundles.length,
        calculatedTotal: servicesTotal,
      });
    }

    // Add custom order items if present
    let customOrderTotal = 0;
    if (orderData.customOrderData?.items) {
      customOrderTotal = orderData.customOrderData.items.reduce(
        (sum, item) => sum + item.total_price,
        0,
      );
    }

    const subtotal = servicesTotal + customOrderTotal;

    // SECURITY: Server-side promo code validation (never trust client discount amounts)
    let validatedDiscountAmount = 0;
    if (orderData.referralCode && orderData.referralCode.trim()) {
      try {
        const { data: validation, error: validationError } = await supabase.rpc(
          "validate_referral_code",
          {
            code: orderData.referralCode.trim(),
            user_id: orderData.userId || null,
          },
        );

        if (validationError) {
          console.error("Server-side promo validation error:", validationError);
          return res.status(400).json({
            error: "Invalid promo code",
            details: "Could not validate promo code on server",
          });
        }

        if (validation && validation.valid) {
          // Calculate discount server-side based on type
          if (validation.type === "promo") {
            if (validation.discount_type === "percentage") {
              validatedDiscountAmount =
                subtotal * (validation.discount_value / 100);
            } else {
              validatedDiscountAmount = Math.min(
                validation.discount_value,
                subtotal,
              );
            }
          } else {
            // Referral code - 15% discount (from constants)
            validatedDiscountAmount = subtotal * 0.15;
          }
        } else {
          return res.status(400).json({
            error: "Invalid promo code",
            details:
              validation?.error || "Promo code is not valid or has expired",
          });
        }
      } catch (err) {
        console.error("Error during server-side promo validation:", err);
        return res.status(400).json({
          error: "Promo code validation failed",
          details: "Could not validate promo code",
        });
      }
    }

    const creditsUsed = orderData.referralCreditsUsed || 0;
    const totalBeforeCredits = subtotal - validatedDiscountAmount;
    const tax = Math.max(0, totalBeforeCredits * TAX_RATE);
    const expectedTotal = Math.max(0, totalBeforeCredits + tax - creditsUsed);

    // Verify the payment amount matches expected total (with small tolerance for rounding)
    const paidAmount = paymentIntent.amount / 100; // Convert from cents
    const tolerance = 0.01; // 1 cent tolerance

    if (Math.abs(paidAmount - expectedTotal) > tolerance) {
      console.error("Payment amount mismatch:", {
        paid: paidAmount,
        expected: expectedTotal,
        difference: Math.abs(paidAmount - expectedTotal),
        subtotal,
        validatedDiscountAmount,
        tax,
        creditsUsed,
        promoCode: orderData.referralCode,
      });
      return res.status(400).json({
        error: "Payment amount mismatch",
        details: "Payment amount does not match order total",
      });
    }

    // Check if order already exists with this transaction ID (idempotency)
    const { data: existingOrder, error: existingOrderError } = await supabase
      .from("orders")
      .select("id")
      .eq("transaction_id", paymentIntentId)
      .maybeSingle();

    if (existingOrderError) {
      console.error("Error checking for existing order:", existingOrderError);
      return res.status(500).json({
        error: "Database error",
        details: "Failed to check for existing orders",
      });
    }

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        orderId: existingOrder.id,
        duplicate: true,
      });
    }

    // Create the order(s) in the database
    const results = await createOrdersInDatabase(
      orderData,
      paymentIntentId,
      expectedTotal,
      validatedDiscountAmount,
    );

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      ...results,
    });
  } catch (error: any) {
    console.error("Error in verify-and-create endpoint:", error);

    // Ensure we always return proper JSON
    const errorMessage = error.message || "Failed to process order";
    const errorCode = error.code || "UNKNOWN_ERROR";

    return res.status(500).json({
      error: "Internal server error",
      details: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}

async function createOrdersInDatabase(
  orderData: VerifyPaymentRequest["orderData"],
  transactionId: string,
  totalAmount: number,
  validatedDiscountAmount: number,
) {
  const results: any = {};

  // Create regular order if there are services
  if (orderData.services && orderData.services.length > 0) {
    const orderRecord = {
      user_id: orderData.userId || null,
      customer_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      items: orderData.services.map((service) => {
        return {
          service_id: service.id,
          service_name: service.name,
          price: service.price || 0,
          quantity: service.quantity,
        };
      }),
      status: "pending",
      payment_status: "paid",
      total_amount: parseFloat(totalAmount.toFixed(2)), // Fix precision
      notes: `Discord: ${orderData.customerDiscord}${orderData.orderNotes || orderData.notes ? ` | Notes: ${orderData.orderNotes || orderData.notes}` : ""}`,
      transaction_id: transactionId,
      referral_code: orderData.referralCode || null,
      referral_discount:
        validatedDiscountAmount > 0
          ? parseFloat(validatedDiscountAmount.toFixed(2))
          : null,
      referral_credits_used:
        orderData.referralCreditsUsed != null
          ? parseFloat(orderData.referralCreditsUsed.toFixed(2))
          : null,
      ip_address: orderData.ipAddress || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([orderRecord])
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    results.orderId = order.id;
  }

  // Create custom order if there is custom order data
  if (
    orderData.customOrderData?.items &&
    orderData.customOrderData.items.length > 0
  ) {
    const customOrderRecord = {
      customer_email: orderData.customerEmail,
      customer_name: orderData.customerName,
      customer_discord: orderData.customerDiscord,
      items: orderData.customOrderData.items,
      special_instructions:
        orderData.orderNotes ||
        orderData.customOrderData.special_instructions ||
        orderData.notes ||
        null,
      status: "pending",
      total_amount: parseFloat(
        orderData.customOrderData.items
          .reduce((sum, item) => sum + item.total_price, 0)
          .toFixed(2),
      ), // Fix precision
      currency: "USD",
      payment_intent_id: transactionId, // Fix: webhooks query by payment_intent_id
      referral_code: orderData.referralCode || null,
      referral_discount:
        validatedDiscountAmount > 0
          ? parseFloat(validatedDiscountAmount.toFixed(2))
          : null,
      referral_credits_used:
        orderData.referralCreditsUsed != null
          ? parseFloat(orderData.referralCreditsUsed.toFixed(2))
          : null,
      user_id: orderData.userId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: customOrder, error: customOrderError } = await supabase
      .from("custom_orders")
      .insert([customOrderRecord])
      .select()
      .single();

    if (customOrderError) {
      throw new Error(
        `Failed to create custom order: ${customOrderError.message}`,
      );
    }

    results.customOrderId = customOrder.id;
  }

  return results;
}
