import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  FileText,
  Package,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Step Components (will be created separately)
import { CartReviewStep } from "./steps/CartReviewStep";
import { OrderDetailsStep } from "./steps/OrderDetailsStep";
import { OrderSummaryStep } from "./steps/OrderSummaryStep";
import { PaymentStep } from "./steps/PaymentStep";

interface StepData {
  id: number;
  title: string;
  icon: any;
  component: React.ComponentType<any>;
}

interface StepperCheckoutProps {
  // Props will match what the current checkout page needs
  cartItems: any[];
  customOrder?: any;
  user: any;
  isAuthenticated?: boolean;
  onPaymentSuccess: (paymentIntent: any, stepData?: any) => void;
  onPaymentError: (error: string) => void;
  onCreditsOnly?: (payload: { stepData: any; cartItems: any[] }) => void;
  isProcessing: boolean;
  updateQuantity: (serviceId: string, quantity: number) => void;
  removeFromCart: (serviceId: string) => void;
  // Optional totals provided by parent
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  // Optional fallback function for legacy callers
  getCartTotal?: () => number;
}

const steps: StepData[] = [
  {
    id: 1,
    title: "Review Cart",
    icon: ShoppingCart,
    component: CartReviewStep,
  },
  {
    id: 2,
    title: "Order Details",
    icon: FileText,
    component: OrderDetailsStep,
  },
  {
    id: 3,
    title: "Review Order",
    icon: Package,
    component: OrderSummaryStep,
  },
  {
    id: 4,
    title: "Payment",
    icon: CreditCard,
    component: PaymentStep,
  },
];

export function StepperCheckout({
  cartItems,
  customOrder,
  user,
  onPaymentSuccess,
  onPaymentError,
  onCreditsOnly,
  isProcessing,
  updateQuantity,
  removeFromCart,
  subtotal: providedSubtotal,
  taxAmount: providedTax,
  total: providedTotal,
  getCartTotal,
  isAuthenticated,
}: StepperCheckoutProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [stepData, setStepData] = useState({
    orderNotes: "",
    promoCode: "",
    promoDiscount: 0,
    agreeToTerms: false,
    discordUsername: "",
    useReferralCredits: false,
    creditsUsed: 0,
  });

  // Calculate totals (prefer provided values)
  const baseSubtotal =
    typeof providedSubtotal === "number"
      ? providedSubtotal
      : (typeof getCartTotal === "function" ? getCartTotal() : 0) +
        (customOrder?.total || 0);
  const discount = stepData.promoDiscount;
  const taxBase = Math.max(0, baseSubtotal - discount);
  const tax = typeof providedTax === "number" ? providedTax : taxBase * 0.08;
  const totalBeforeCredits = Math.max(0, taxBase + tax);
  const creditsApplied = Math.min(
    stepData.creditsUsed || 0,
    totalBeforeCredits,
  );
  const total =
    typeof providedTotal === "number"
      ? providedTotal
      : Math.max(0, totalBeforeCredits - creditsApplied);
  const subtotal = baseSubtotal;

  // Step validation
  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Always can access first step
      case 2:
        return cartItems.length > 0; // Must have items in cart
      case 3:
        return cartItems.length > 0; // Must have items
      case 4:
        return (
          cartItems.length > 0 &&
          stepData.agreeToTerms &&
          stepData.discordUsername.trim() !== "" &&
          (total >= 0.5 || (stepData.creditsUsed || 0) > 0)
        );
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length && canProceedToStep(currentStep + 1)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  // Update step data from child components
  const updateStepData = (data: Partial<typeof stepData>) => {
    setStepData((prev) => ({ ...prev, ...data }));
  };

  // Animation variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [[page, direction], setPage] = useState([currentStep, 0]);

  useEffect(() => {
    setPage([currentStep, currentStep > page ? 1 : -1]);
  }, [currentStep]);

  // Normalize cart items to legacy shape expected by step components
  const normalizedCartItems = useMemo(() => {
    return (cartItems || []).map((item: any) => {
      if (item?.service && item?.quantity != null) return item;
      const product = item?.product || {};
      const id = product.id ?? item?.id ?? "";
      const title =
        product.name ?? product.title ?? item?.service?.title ?? "Item";
      const price =
        item?.unit_price ??
        product.sale_price ??
        product.base_price ??
        product.price ??
        0;
      const quantity = item?.quantity ?? 1;
      return { service: { id, title, price }, quantity };
    });
  }, [cartItems]);

  // Safe component access with bounds checking
  const currentStepData = steps[currentStep - 1];
  const CurrentStepComponent = currentStepData?.component;

  // If no valid step found, default to first step
  if (!CurrentStepComponent) {
    console.error(`Invalid step: ${currentStep}, falling back to step 1`);
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-card/95 to-card/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Checkout Process</h1>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {steps.length}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
              <Progress
                value={(currentStep / steps.length) * 100}
                className="h-2"
              />

              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = currentStep === step.id;
                  const isAccessible = step.id <= currentStep || isCompleted;

                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(step.id)}
                      disabled={!isAccessible}
                      className={cn(
                        "flex flex-col items-center space-y-2 p-2 rounded-lg transition-all",
                        isAccessible
                          ? "cursor-pointer hover:bg-muted/50"
                          : "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isCurrent
                              ? "bg-primary border-primary text-white"
                              : isAccessible
                                ? "border-primary text-primary"
                                : "border-muted-foreground text-muted-foreground",
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          isCurrent ? "text-primary" : "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm min-h-96">
          <CardContent className="p-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                <CurrentStepComponent
                  cartItems={normalizedCartItems}
                  customOrder={customOrder}
                  user={user}
                  isAuthenticated={isAuthenticated}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  stepData={stepData}
                  updateStepData={updateStepData}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                  onCreditsOnly={
                    // Provide access to original cart items and step data
                    steps[currentStep - 1]?.title === "Payment" &&
                    typeof onCreditsOnly === "function"
                      ? () => onCreditsOnly?.({ stepData, cartItems })
                      : undefined
                  }
                  isProcessing={isProcessing}
                />
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < steps.length ? (
            <Button
              onClick={nextStep}
              disabled={!canProceedToStep(currentStep + 1)}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <div className="text-sm text-muted-foreground">
              Complete payment to finish your order
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
