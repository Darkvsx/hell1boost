import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileText,
  CheckCircle,
  Loader2,
  AlertTriangle,
  DollarSign,
  Shield,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { security } from "@/lib/security";
import Link from "next/link";
import { useReferrals } from "@/hooks/useReferrals";

interface OrderDetailsStepProps {
  stepData: {
    orderNotes: string;
    promoCode: string;
    promoDiscount: number;
    agreeToTerms: boolean;
    discordUsername: string;
    useReferralCredits: boolean;
    creditsUsed: number;
  };
  updateStepData: (data: any) => void;
  user: any;
  subtotal: number;
  isAuthenticated: boolean;
}

interface ValidationResponse {
  valid: boolean;
  error?: string;
  type?: "promo" | "referral";
  discount_type?: "percentage" | "fixed";
  discount_value?: number;
}

export function OrderDetailsStep({
  stepData,
  updateStepData,
  user,
  subtotal,
  isAuthenticated,
}: OrderDetailsStepProps) {
  const { toast } = useToast();
  const [promoCodeStatus, setPromoCodeStatus] = useState<
    "idle" | "loading" | "applied" | "error"
  >("idle");
  const [discordError, setDiscordError] = useState<string>("");
  const { stats } = useReferrals();
  const availableCredits = isAuthenticated
    ? Math.max(0, Number(stats?.creditBalance || 0))
    : 0;

  const validateDiscordUsername = (username: string) => {
    if (!username.trim()) {
      setDiscordError("Discord username is required for communication.");
      return false;
    }

    if (!security.validateDiscordTag(username.trim())) {
      setDiscordError(
        "Please enter a valid Discord username (e.g., YourUsername#1234 or YourUsername).",
      );
      return false;
    }

    setDiscordError("");
    return true;
  };

  const handleDiscordChange = (value: string) => {
    updateStepData({ discordUsername: value });
    if (value.trim()) {
      validateDiscordUsername(value);
    } else {
      setDiscordError("Discord username is required for communication.");
    }
  };

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      updateStepData({ promoDiscount: 0 });
      setPromoCodeStatus("idle");
      return;
    }

    setPromoCodeStatus("loading");

    try {
      const resp = await fetch("/api/referrals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code.trim(), userId: user?.id || null }),
      });

      if (!resp.ok) {
        setPromoCodeStatus("error");
        toast({
          title: "Error",
          description: "Could not validate promo code. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const validation = (await resp.json()) as unknown as ValidationResponse;

      if (!validation || !validation.valid) {
        setPromoCodeStatus("error");
        toast({
          title: "Invalid promo code",
          description: validation?.error || "Please enter a valid promo code.",
          variant: "destructive",
        });
        updateStepData({ promoDiscount: 0 });
        return;
      }

      // Calculate discount
      let discountAmount = 0;
      if (validation.type === "promo") {
        if (validation.discount_type === "percentage") {
          discountAmount = subtotal * (validation.discount_value! / 100);
        } else {
          discountAmount = Math.min(validation.discount_value!, subtotal);
        }
      } else {
        // Referral code - use standardized discount from constants
        const { REFERRAL_CONSTANTS } = await import("@/lib/constants");
        discountAmount = subtotal * REFERRAL_CONSTANTS.CUSTOMER_DISCOUNT;
      }

      updateStepData({ promoDiscount: discountAmount });
      setPromoCodeStatus("applied");
      toast({
        title: "Promo code applied!",
        description: `You saved $${discountAmount.toFixed(2)} with the promo code.`,
      });
    } catch (err) {
      console.error("Unexpected error validating promo code:", err);
      setPromoCodeStatus("error");
      toast({
        title: "Error",
        description: "Could not validate promo code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Order Details</h2>
          <p className="text-muted-foreground text-lg">
            Provide your Discord username and optional preferences
          </p>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Discord Username - Required */}
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="border-2 border-primary/20 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center text-primary">
                <MessageSquare className="w-5 h-5 mr-2" />
                Discord Username{" "}
                <span className="text-destructive ml-1">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label
                  htmlFor="discordUsername"
                  className="text-base font-medium"
                >
                  Your Discord Username
                </Label>
                <Input
                  id="discordUsername"
                  value={stepData.discordUsername}
                  onChange={(e) => handleDiscordChange(e.target.value)}
                  onBlur={() =>
                    validateDiscordUsername(stepData.discordUsername)
                  }
                  placeholder="YourUsername#1234 or YourUsername"
                  className="h-12 border-border/50 focus:border-primary/50 bg-background/50 mt-2"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Required for communication during your boosting service
                </p>
                {discordError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{discordError}</AlertDescription>
                  </Alert>
                )}
              </div>
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                <MessageSquare className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Important:</strong> A valid Discord username is
                  absolutely required for our team to communicate with you
                  during the boosting process.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Notes */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Order Notes (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="orderNotes" className="text-base">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="orderNotes"
                    value={stepData.orderNotes}
                    onChange={(e) =>
                      updateStepData({ orderNotes: e.target.value })
                    }
                    placeholder="Include preferred gaming hours, specific requirements, or any other notes..."
                    rows={4}
                    className="resize-none border-border/50 focus:border-primary/50 bg-background/50 mt-2"
                  />
                </div>
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Let us know your preferred gaming
                    hours or any specific requirements for your service.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          {/* Promo Code */}
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="promoCode" className="text-base">
                    Enter Code
                  </Label>
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <Input
                        id="promoCode"
                        value={stepData.promoCode}
                        onChange={(e) =>
                          updateStepData({
                            promoCode: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Enter promo code"
                        className="h-12 pr-10 border-border/50 focus:border-primary/50 text-base"
                        disabled={promoCodeStatus === "loading"}
                      />
                      {promoCodeStatus === "applied" && (
                        <CheckCircle className="w-5 h-5 text-green-600 absolute right-3 top-3.5" />
                      )}
                    </div>
                    <Button
                      onClick={() => validatePromoCode(stepData.promoCode)}
                      disabled={
                        !stepData.promoCode.trim() ||
                        promoCodeStatus === "loading"
                      }
                      className="h-12 px-6"
                    >
                      {promoCodeStatus === "loading" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>

                  {stepData.promoDiscount > 0 && (
                    <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        <strong>Promo code applied!</strong> You saved $
                        {stepData.promoDiscount.toFixed(2)}
                      </AlertDescription>
                    </Alert>
                  )}

                  {promoCodeStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Invalid promo code. Please check the code and try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Credits Application */}
      {isAuthenticated && (
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Use Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="useCredits"
                    checked={!!stepData.useReferralCredits}
                    onCheckedChange={(checked) =>
                      updateStepData({
                        useReferralCredits: !!checked,
                        creditsUsed: checked ? availableCredits : 0,
                      })
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="useCredits" className="text-base">
                    Apply available credits to this order
                  </Label>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-green-600">
                    ${availableCredits.toFixed(2)}
                  </span>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>

              {stepData.useReferralCredits && stepData.creditsUsed > 0 && (
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    $
                    {Math.min(stepData.creditsUsed, availableCredits).toFixed(
                      2,
                    )}{" "}
                    credits will be applied at payment.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Terms Agreement */}
      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <Checkbox
                id="terms"
                checked={stepData.agreeToTerms}
                onCheckedChange={(checked) =>
                  updateStepData({ agreeToTerms: checked as boolean })
                }
                className="mt-1 w-5 h-5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="terms"
                  className="text-base leading-7 cursor-pointer"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  You must agree to our terms to proceed with your order
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {(!stepData.agreeToTerms ||
        !stepData.discordUsername.trim() ||
        discordError) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {!stepData.discordUsername.trim() &&
                "Please enter your Discord username. "}
              {discordError && `${discordError} `}
              {!stepData.agreeToTerms &&
                "Please agree to the Terms of Service and Privacy Policy to continue."}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  );
}
