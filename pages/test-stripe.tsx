import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

export default function TestStripePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const testPaymentIntentCreation = async () => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      const testData = {
        services: [
          {
            id: "5265efed-3187-4ede-943c-e01be26ef4f8", // Level Boost (1-50)
            quantity: 1
          }
        ],
        referralCode: "",
        referralDiscount: 0,
        creditsUsed: 0,
        currency: "usd",
        metadata: {
          userEmail: "test@example.com",
          userName: "Test User",
          timestamp: new Date().toISOString()
        }
      };

      console.log('Testing with data:', testData);

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      // Clone the response to read it multiple times if needed
      const responseClone = response.clone();

      let data;
      let responseText;

      try {
        responseText = await response.text();
        console.log('Raw response:', responseText);

        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Failed to parse response: ${responseText || 'No response text'}`);
      }

      if (!responseClone.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}: ${response.statusText}`);
      }

      setResult(data);
      console.log('✅ SUCCESS: Payment intent created:', data);

    } catch (err: any) {
      console.error('❌ ERROR:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Stripe Integration Test</h1>
          <p className="text-muted-foreground text-lg">
            Test the payment intent creation with a sample service
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              Payment Intent Creation Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold mb-2">Test Configuration:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Service: Level Boost (1-50) - $5.00</li>
                <li>• Quantity: 1</li>
                <li>• Currency: USD</li>
                <li>• No referral code</li>
                <li>• No credits used</li>
              </ul>
            </div>

            <Button 
              onClick={testPaymentIntentCreation}
              disabled={isLoading}
              className="w-full h-12 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Testing Payment Intent Creation...
                </>
              ) : (
                'Test Payment Intent Creation'
              )}
            </Button>

            {/* Success Result */}
            {result && (
              <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      Payment Intent Created Successfully!
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Payment Details:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>
                          <strong>Payment Intent ID:</strong>{' '}
                          <Badge variant="outline">{result.paymentIntentId}</Badge>
                        </li>
                        <li><strong>Amount:</strong> ${result.amount}</li>
                        <li><strong>Currency:</strong> {result.currency?.toUpperCase()}</li>
                        <li>
                          <strong>Client Secret:</strong>{' '}
                          <Badge variant="outline">
                            {result.clientSecret ? 'Present ✓' : 'Missing ✗'}
                          </Badge>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Payment Methods:</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.supportedPaymentMethods?.map((method: string) => (
                          <Badge key={method} variant="secondary" className="text-xs">
                            {method.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {result.supportedPaymentMethods?.length || 0} payment methods available
                      </p>
                    </div>
                  </div>

                  {result.breakdown && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <h4 className="font-medium mb-2">Price Breakdown:</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Services Total:</span>
                          <span>${result.breakdown.servicesTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Custom Order Total:</span>
                          <span>${result.breakdown.customOrderTotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${result.breakdown.subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8%):</span>
                          <span>${result.breakdown.tax}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-green-200 pt-1">
                          <span>Final Amount:</span>
                          <span>${result.breakdown.finalAmount}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Result */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <h3 className="font-semibold text-red-800 dark:text-red-200">
                      Payment Intent Creation Failed
                    </h3>
                  </div>
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Environment Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Stripe Configuration:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>Publishable Key:</strong>{' '}
                    <Badge variant={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'default' : 'destructive'}>
                      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set ✓' : 'Missing ✗'}
                    </Badge>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Supabase Configuration:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <strong>URL:</strong>{' '}
                    <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'default' : 'destructive'}>
                      {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set ✓' : 'Missing ✗'}
                    </Badge>
                  </li>
                  <li>
                    <strong>Anon Key:</strong>{' '}
                    <Badge variant={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'default' : 'destructive'}>
                      {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗'}
                    </Badge>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
