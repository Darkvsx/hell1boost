import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Stripe with latest stable API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
  typescript: true,
});

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Request validation schema
const createPaymentIntentSchema = z.object({
  services: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().positive().int(),
    }),
  ),
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
  referralCode: z.string().optional(),
  referralDiscount: z.number().nonnegative().optional(),
  creditsUsed: z.number().nonnegative().optional(),
  currency: z.string().default("usd"),
  metadata: z.record(z.string()).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Payment intent creation request received");

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY environment variable");
      return res.status(500).json({
        error: "Payment service not configured",
        details: "Stripe secret key missing",
      });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return res.status(500).json({
        error: "Database service not configured",
        details: "Supabase credentials missing",
      });
    }

    console.log("Environment variables validated successfully");

    // Log request data for debugging
    console.log("Request body received:", JSON.stringify(req.body, null, 2));

    // Validate and parse request body
    const parseResult = createPaymentIntentSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error("Request validation failed:", parseResult.error.issues);
      return res.status(400).json({
        error: "Invalid request data",
        details: parseResult.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", "),
      });
    }

    console.log("Request validation successful");

    const {
      services,
      customOrderData,
      referralCode,
      referralDiscount = 0,
      creditsUsed = 0,
      currency,
      metadata = {},
    } = parseResult.data;

    // Fetch actual service prices from database
    let servicesTotal = 0;
    if (services.length > 0) {
      const serviceIds = services.map((s) => s.id);
      const { data: dbServices, error: servicesError } = await supabase
        .from("services")
        .select("id, price, active, title")
        .in("id", serviceIds)
        .eq("active", true);

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        return res
          .status(500)
          .json({ error: "Failed to fetch service pricing" });
      }

      // Verify all requested services exist and are active
      console.log("Database services found:", {
        requested: serviceIds,
        found:
          dbServices?.map((s) => ({
            id: s.id,
            price: s.price,
            active: s.active,
          })) || [],
        count: dbServices?.length || 0,
      });

      const foundServiceIds = new Set(dbServices?.map((s) => s.id) || []);
      const missingServices = serviceIds.filter(
        (id) => !foundServiceIds.has(id),
      );
      if (missingServices.length > 0) {
        console.error("Missing services error:", {
          requested: serviceIds,
          found: Array.from(foundServiceIds),
          missing: missingServices,
        });
        return res.status(400).json({
          error: "Invalid services in cart",
          details: `Some services in your cart are no longer available. Please remove them and add current services.`,
          invalidServices: missingServices,
          availableServices:
            dbServices?.map((s) => ({
              id: s.id,
              title: s.title,
              price: s.price,
            })) || [],
          action: "clear_cart",
        });
      }

      // Calculate total using database prices
      const servicesPriceMap = new Map(dbServices!.map((s) => [s.id, s.price]));
      servicesTotal = services.reduce((sum, serviceRequest) => {
        const dbPrice = servicesPriceMap.get(serviceRequest.id)!;
        return sum + dbPrice * serviceRequest.quantity;
      }, 0);
    }

    // Calculate custom order total (these are pre-calculated by admin)
    let customOrderTotal = 0;
    if (customOrderData?.items) {
      customOrderTotal = customOrderData.items.reduce(
        (sum, item) => sum + item.total_price,
        0,
      );
    }

    // Calculate totals first
    const subtotal = servicesTotal + customOrderTotal;

    // Server-side promo code validation for security
    let validatedReferralDiscount = 0;
    if (referralCode && referralCode.trim()) {
      try {
        const { data: validation, error: validationError } = await supabase.rpc(
          "validate_referral_code",
          {
            code: referralCode.trim(),
            user_id: null,
          },
        );

        if (validationError) {
          console.error("Error validating referral code:", validationError);
          return res.status(400).json({
            error: "Invalid promo code",
            details: "Could not validate the provided promo code",
          });
        }

        if (validation && validation.valid) {
          // Apply the discount (usually 15% as per REFERRAL_CONFIG)
          validatedReferralDiscount = Math.min(
            referralDiscount,
            subtotal * 0.15, // Max 15% discount for safety
          );
        } else {
          return res.status(400).json({
            error: "Invalid promo code",
            details:
              validation?.error || "The promo code is not valid or has expired",
          });
        }
      } catch (err) {
        console.error("Error during promo code validation:", err);
        return res.status(400).json({
          error: "Invalid promo code",
          details: "Could not validate the provided promo code",
        });
      }
    }

    // Calculate final amount with validated values
    const TAX_RATE = 0.08;
    const totalAfterDiscount = subtotal - validatedReferralDiscount;
    const tax = Math.max(0, totalAfterDiscount * TAX_RATE);
    const totalWithTax = totalAfterDiscount + tax;

    // Validate credits used don't exceed the total
    const validatedCreditsUsed = Math.min(creditsUsed, totalWithTax);
    const finalAmount = Math.max(0.5, totalWithTax - validatedCreditsUsed); // Stripe minimum $0.50

    // Minimum charge validation (Stripe minimum is $0.50)
    if (finalAmount < 0.5) {
      return res.status(400).json({
        error: "Order total too low",
        details: "Minimum payment amount is $0.50",
      });
    }

    // Log payment calculation for debugging
    console.log("Payment calculation:", {
      servicesTotal,
      customOrderTotal,
      subtotal,
      validatedReferralDiscount,
      tax,
      validatedCreditsUsed,
      finalAmount,
    });

    // Create payment intent with comprehensive payment method support
    console.log("Creating Stripe PaymentIntent with Venmo support...");

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(finalAmount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "always",
      },
      metadata: {
        ...metadata,
        servicesTotal: servicesTotal.toFixed(2),
        customOrderTotal: customOrderTotal.toFixed(2),
        subtotal: subtotal.toFixed(2),
        referralCode: referralCode || "",
        referralDiscount: validatedReferralDiscount.toFixed(2),
        creditsUsed: validatedCreditsUsed.toFixed(2),
        tax: tax.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        calculatedAt: new Date().toISOString(),
        venmo_capability: process.env.STRIPE_VENMO_CAPABILITY || "",
      },
      setup_future_usage: "off_session", // Allow saving payment methods for future use
      receipt_email: metadata.userEmail,
      shipping: {
        name: metadata.userName || "Customer",
        address: {
          line1: "Digital Service",
          city: "Online",
          state: "Digital",
          postal_code: "00000",
          country: "US",
        },
      },
    };

    // Add Venmo-specific configuration if capability is available
    if (process.env.STRIPE_VENMO_CAPABILITY) {
      paymentIntentParams.payment_method_configuration =
        process.env.STRIPE_VENMO_CAPABILITY;
    }

    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentParams);

    // Log successful creation with enhanced details
    console.log("PaymentIntent created successfully:", {
      id: paymentIntent.id,
      amount: finalAmount,
      currency: currency,
      payment_method_types: paymentIntent.payment_method_types,
      automatic_payment_methods: paymentIntent.automatic_payment_methods,
      venmo_enabled: !!process.env.STRIPE_VENMO_CAPABILITY,
    });

    // Return successful response
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: finalAmount,
      currency: currency,
      supportedPaymentMethods: paymentIntent.payment_method_types,
      breakdown: {
        servicesTotal: Number(servicesTotal.toFixed(2)),
        customOrderTotal: Number(customOrderTotal.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        referralCode: referralCode || null,
        referralDiscount: Number(validatedReferralDiscount.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        creditsUsed: Number(validatedCreditsUsed.toFixed(2)),
        finalAmount: Number(finalAmount.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);

    // Enhanced error handling
    if (error.type === "StripeRateLimitError") {
      return res.status(429).json({
        error: "Too many requests. Please wait a moment and try again.",
      });
    }

    if (error.type === "StripeInvalidRequestError") {
      console.error("Stripe Invalid Request:", error.message, error.param);
      return res.status(400).json({
        error: error.message || "Invalid request parameters",
        details: error.param ? `Invalid parameter: ${error.param}` : undefined,
      });
    }

    if (error.type === "StripeAuthenticationError") {
      console.error("Stripe Authentication Error:", error.message);
      return res.status(401).json({
        error: "Authentication failed. Please contact support.",
      });
    }

    if (error.type === "StripeConnectionError") {
      return res.status(502).json({
        error: "Connection to payment processor failed. Please try again.",
      });
    }

    if (error.type === "StripeAPIError") {
      console.error("Stripe API Error:", error.message);
      return res.status(500).json({
        error: "Payment processor error. Please try again or contact support.",
      });
    }

    // Generic error with more details for debugging
    console.error("Unexpected payment error:", {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      stack: error.stack,
    });

    res.status(500).json({
      error: error.message || "Failed to create payment intent",
      details:
        "An unexpected error occurred while creating the payment intent. Please try again.",
    });
  }
}
