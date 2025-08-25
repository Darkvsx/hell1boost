import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';

export default function TestStripePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [envCheck, setEnvCheck] = useState<any>(null);

  const checkEnvironment = () => {
    const checks = {
      stripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      stripeKeyFormat: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_'),
      supabaseUrlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('supabase.co'),
    };

    const allPassed = Object.values(checks).every(check => check === true);

    setEnvCheck({
      ...checks,
      allPassed,
      timestamp: new Date().toISOString()
    });
  };

  const testPaymentIntentCreation = async () => {
    setIsLoading(true);
    setResult(null);
    setError('');

    try {
      // First, let's test server connectivity with a simple ping
      console.log('🏓 Testing server connectivity...');
      try {
        const pingResponse = await fetch('/api/ping');
        const pingText = await pingResponse.text();
        console.log('🏓 Ping response:', pingResponse.status, pingText);
      } catch (pingError) {
        console.warn('⚠️ Ping failed:', pingError);
        // Continue anyway, as ping might not exist
      }
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

      console.log('🧪 Testing Stripe Payment Intent Creation');
      console.log('📤 Request data:', testData);
      console.log('🌐 Request URL:', '/api/stripe/create-payment-intent');

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      // Read the response body once as text
      const responseText = await response.text();
      console.log('📥 Raw response status:', response.status, response.statusText);
      console.log('📥 Raw response text:', responseText);

      // Check if response text is empty
      if (!responseText.trim()) {
        throw new Error(`Empty response from server. Status: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📋 Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ JSON Parse error:', parseError);
        console.error('📄 Response text that failed to parse:', responseText);
        throw new Error(`Failed to parse JSON response. Server returned: ${responseText.substring(0, 500)}`);
      }

      // Check if the request was successful AFTER parsing the response
      if (!response.ok) {
        console.error('❌ HTTP Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: data
        });

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        if (data.error) {
          errorMessage = data.error;
          if (data.details) {
            errorMessage += ` - ${data.details}`;
          }
        }

        // Special handling for common Stripe errors
        if (response.status === 400) {
          if (data.error?.includes('payment_method_configuration')) {
            errorMessage = 'Invalid Stripe payment method configuration. Please check your Stripe settings.';
          }
        }

        throw new Error(errorMessage);
      }

      setResult(data);
      console.log('✅ SUCCESS: Payment intent created successfully');
      console.log('📋 Payment Intent Details:', {
        id: data.paymentIntentId,
        amount: data.amount,
        currency: data.currency,
        clientSecretPresent: !!data.clientSecret
      });

    } catch (err: any) {
      console.error('❌ ERROR: Payment intent creation failed');
      console.error('🔍 Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });

      let errorMessage = 'Unknown error occurred';

      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === 'TypeError') {
        errorMessage = `Network or parsing error: ${err.toString()}`;
      } else if (err.name === 'SyntaxError') {
        errorMessage = `Response parsing error: ${err.toString()}`;
      }

      setError(errorMessage);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={checkEnvironment}
                variant="outline"
                className="h-12 text-base"
              >
                Check Environment Setup
              </Button>

              <Button
                onClick={testPaymentIntentCreation}
                disabled={isLoading}
                className="h-12 text-base"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Testing Payment Intent...
                  </>
                ) : (
                  'Test Payment Intent Creation'
                )}
              </Button>
            </div>

            {/* Environment Check Results */}
            {envCheck && (
              <Card className={`border ${envCheck.allPassed ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    {envCheck.allPassed ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-yellow-600 mr-2" />
                    )}
                    <h3 className={`font-semibold ${envCheck.allPassed ? 'text-green-800 dark:text-green-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                      Environment Check {envCheck.allPassed ? 'Passed' : 'Issues Found'}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Required Variables:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          {envCheck.stripePublishableKey ? '✅' : '❌'} Stripe Publishable Key
                        </li>
                        <li className="flex items-center">
                          {envCheck.supabaseUrl ? '✅' : '❌'} Supabase URL
                        </li>
                        <li className="flex items-center">
                          {envCheck.supabaseAnonKey ? '✅' : '❌'} Supabase Anon Key
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Format Validation:</h4>
                      <ul className="space-y-1">
                        <li className="flex items-center">
                          {envCheck.stripeKeyFormat ? '✅' : '❌'} Stripe Key Format (pk_)
                        </li>
                        <li className="flex items-center">
                          {envCheck.supabaseUrlFormat ? '✅' : '❌'} Supabase URL Format
                        </li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3">
                    Checked at: {new Date(envCheck.timestamp).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            )}

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
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {result.supportedPaymentMethods?.map((method: string) => (
                            <Badge key={method} variant="secondary" className="text-xs">
                              {method.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                        {result.automaticPaymentMethods && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Automatic Payment Methods:</strong> {result.automaticPaymentMethods.enabled ? 'Enabled' : 'Disabled'}
                            {result.automaticPaymentMethods.allow_redirects && (
                              <span> • Redirects: {result.automaticPaymentMethods.allow_redirects}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {result.supportedPaymentMethods?.length || 0} base payment methods
                        {result.automaticPaymentMethods?.enabled && ' + automatic detection'}
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
                  <div className="space-y-3">
                    <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                      {error}
                    </p>

                    <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-3 rounded">
                      <strong>Common Issues & Solutions:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li><strong>400 Error:</strong> Usually indicates invalid Stripe configuration</li>
                        <li><strong>Invalid payment_method_configuration:</strong> Venmo/payment config doesn't exist in your Stripe account</li>
                        <li><strong>Environment Variables:</strong> Check Stripe keys are valid for your account</li>
                        <li><strong>Database Connection:</strong> Ensure Supabase credentials are correct</li>
                        <li><strong>Service IDs:</strong> Make sure test service exists in database</li>
                      </ul>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <strong>🔍 Debugging Steps:</strong>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Open browser DevTools → Console tab</li>
                        <li>Look for detailed error logs above</li>
                        <li>Check the Network tab for the exact API response</li>
                        <li>Verify all environment variables are set correctly</li>
                      </ol>
                    </div>
                  </div>
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
