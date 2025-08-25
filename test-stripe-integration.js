// Test script to validate Stripe payment intent creation
// Run with: node test-stripe-integration.js

const https = require('https');

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

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/stripe/create-payment-intent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(JSON.stringify(testData))
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Headers:', res.headers);
    
    try {
      const responseData = JSON.parse(data);
      console.log('Response Data:', JSON.stringify(responseData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS: Payment intent created successfully');
        console.log('Client Secret:', responseData.clientSecret ? '✓ Present' : '✗ Missing');
        console.log('Payment Intent ID:', responseData.paymentIntentId ? '✓ Present' : '✗ Missing');
        console.log('Amount:', responseData.amount);
        console.log('Supported Payment Methods:', responseData.supportedPaymentMethods?.length || 0);
      } else {
        console.log('❌ ERROR: Payment intent creation failed');
        console.log('Error:', responseData.error);
        console.log('Details:', responseData.details);
      }
    } catch (err) {
      console.log('❌ ERROR: Failed to parse response');
      console.log('Raw response:', data);
      console.log('Parse error:', err.message);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ REQUEST ERROR:', err.message);
});

console.log('🧪 Testing Stripe Payment Intent Creation...');
console.log('Test Data:', JSON.stringify(testData, null, 2));
console.log('Making request to:', `http://localhost:3000${options.path}`);

req.write(JSON.stringify(testData));
req.end();
