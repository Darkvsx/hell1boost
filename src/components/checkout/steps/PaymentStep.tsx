import { motion } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { SimplePaymentForm } from "../SimplePaymentForm";
import { Button } from "@/components/ui/button";

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface PaymentStepProps {
  cartItems: any[];
  customOrder: any;
  stepData: {
    orderNotes: string;
    promoCode: string;
    promoDiscount: number;
    agreeToTerms: boolean;
    discordUsername: string;
    creditsUsed?: number;
  };
  total: number;
  onPaymentSuccess: (paymentIntent: any, stepData?: any) => void;
  onPaymentError: (error: string) => void;
  onCreditsOnly?: () => void;
  isProcessing: boolean;
  user: any;
}

export function PaymentStep({
  cartItems,
  customOrder,
  stepData,
  total,
  onPaymentSuccess,
  onPaymentError,
  onCreditsOnly,
  isProcessing,
  user,
}: PaymentStepProps) {
  // Clean cart items - remove any with invalid data
  const cleanedCartItems = cartItems.filter(
    (item) =>
      item.service &&
      item.service.id &&
      item.service.title &&
      typeof item.service.price === "number" &&
      item.quantity > 0,
  );

  // Payment metadata
  const paymentMetadata = {
    orderId: `order_${Date.now()}`,
    userEmail: user?.email || "",
    userName: user?.username || "",
    userId: user?.id || "",
  };

  const canProceedToPayment = () => {
    return (
      cleanedCartItems.length > 0 &&
      stepData.agreeToTerms &&
      stepData.discordUsername.trim()
    );
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Complete Payment</h2>
          <p className="text-muted-foreground text-lg">
            Secure payment powered by Stripe
          </p>
        </div>
      </motion.div>

      {/* Security Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="flex items-center space-x-4">
          <Badge
            variant="outline"
            className="bg-green-500/10 border-green-500/30 px-4 py-2"
          >
            <Shield className="w-4 h-4 mr-2 text-green-400" />
            <span className="text-green-300">SSL Secured</span>
          </Badge>
          <Badge
            variant="outline"
            className="bg-blue-500/10 border-blue-500/30 px-4 py-2"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-blue-300">PCI Compliant</span>
          </Badge>
          <Badge
            variant="outline"
            className="bg-purple-500/10 border-purple-500/30 px-4 py-2"
          >
            <Shield className="w-4 h-4 mr-2 text-purple-400" />
            <span className="text-purple-300">Fraud Protected</span>
          </Badge>
        </div>
      </motion.div>

      {/* Payment Form */}
      {canProceedToPayment() &&
      total < 0.5 &&
      (stepData.creditsUsed || 0) > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-3" />
                  Pay with Credits
                </div>
                <div className="text-xl text-primary font-bold">
                  ${total.toFixed(2)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Your available credits cover the full order amount. Complete
                  your purchase without a card.
                </AlertDescription>
              </Alert>
              <Button
                onClick={onCreditsOnly}
                className="w-full h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              >
                Complete Order with Credits
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : canProceedToPayment() ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 mr-3" />
                  Payment Details
                </div>
                <div className="text-xl text-primary font-bold">
                  ${total.toFixed(2)}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  mode: "payment",
                  amount: Math.round(total * 100),
                  currency: "usd",
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "hsl(213, 93%, 68%)",
                      colorBackground: "hsl(var(--background))",
                      colorText: "hsl(var(--foreground))",
                      colorDanger: "hsl(var(--destructive))",
                      fontFamily: "Inter, system-ui, sans-serif",
                      spacingUnit: "6px",
                      borderRadius: "12px",
                    },
                  },
                }}
              >
                <SimplePaymentForm
                  total={total}
                  cartItems={cleanedCartItems}
                  customOrderData={customOrder}
                  referralCode={stepData.promoCode}
                  referralDiscount={stepData.promoDiscount}
                  creditsUsed={stepData.creditsUsed || 0}
                  onPaymentSuccess={(paymentIntent) =>
                    onPaymentSuccess(paymentIntent, stepData)
                  }
                  onPaymentError={onPaymentError}
                  isProcessing={isProcessing}
                  metadata={paymentMetadata}
                />
              </Elements>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          {/* Discord Username Requirement Alert */}
          {!stepData.discordUsername.trim() && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please go back to Step 2 and enter your Discord username. This
                is required for communication during your boosting service.
              </AlertDescription>
            </Alert>
          )}

          {/* Terms Requirement Alert */}
          {!stepData.agreeToTerms && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please go back to Step 2 and agree to the Terms of Service and
                Privacy Policy to proceed with payment.
              </AlertDescription>
            </Alert>
          )}

          {/* Minimum Amount Alert */}
          {total < 0.5 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Minimum payment amount is $0.50. Please go back to Step 1 and
                add more items to your cart.
              </AlertDescription>
            </Alert>
          )}

          {/* Empty Cart Alert */}
          {cleanedCartItems.length === 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your cart is empty. Please go back to Step 1 and add services to
                your cart.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Card className="border-0 shadow-xl bg-card">
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">
                Please wait while we process your order...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Order Summary Quick View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>
                <strong>Order Summary:</strong> {cleanedCartItems.length} item
                {cleanedCartItems.length !== 1 ? "s" : ""}
                {stepData.promoCode && ` • Code: ${stepData.promoCode}`}
              </span>
              <span className="font-bold">${total.toFixed(2)}</span>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
