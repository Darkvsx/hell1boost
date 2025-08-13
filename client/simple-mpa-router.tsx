import "./global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";

// Simple page loading function
function loadPageComponent() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  
  console.log('Loading page for path:', path);
  
  // Use dynamic imports to avoid loading all components at once
  switch (path) {
    case '/':
      return import('@/pages/Index').then(module => module.default);
    case '/bundles':
      return import('@/pages/Bundles').then(module => module.default);
    case '/contact':
      return import('@/pages/Contact').then(module => module.default);
    case '/faq':
      return import('@/pages/FAQ').then(module => module.default);
    case '/custom-order':
      return import('@/pages/CustomOrder').then(module => module.default);
    case '/terms':
      return import('@/pages/Terms').then(module => module.default);
    case '/privacy':
      return import('@/pages/Privacy').then(module => module.default);
    case '/login':
      return import('@/pages/Login').then(module => module.default);
    case '/register':
      return import('@/pages/Register').then(module => module.default);
    case '/forgot-password':
      return import('@/pages/ForgotPassword').then(module => module.default);
    case '/email-confirmation':
      return import('@/pages/EmailConfirmation').then(module => module.default);
    case '/account':
      return import('@/pages/Account').then(module => module.default);
    case '/cart':
      return import('@/pages/Cart').then(module => module.default);
    case '/checkout':
      return import('@/pages/Checkout').then(module => module.default);
    case '/admin':
      return import('@/pages/AdminDashboard').then(module => module.default);
    default:
      return import('@/pages/NotFound').then(module => module.default);
  }
}

// Update document title
function updateTitle() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const titles: Record<string, string> = {
    '/': 'HelldiversBoost - Professional Helldivers 2 Boosting Services',
    '/bundles': 'Bundles - HelldiversBoost',
    '/contact': 'Contact - HelldiversBoost',
    '/faq': 'FAQ - HelldiversBoost',
    '/custom-order': 'Custom Order - HelldiversBoost',
    '/terms': 'Terms of Service - HelldiversBoost',
    '/privacy': 'Privacy Policy - HelldiversBoost',
    '/login': 'Login - HelldiversBoost',
    '/register': 'Register - HelldiversBoost',
    '/forgot-password': 'Forgot Password - HelldiversBoost',
    '/email-confirmation': 'Email Confirmation - HelldiversBoost',
    '/account': 'Account - HelldiversBoost',
    '/cart': 'Shopping Cart - HelldiversBoost',
    '/checkout': 'Checkout - HelldiversBoost',
    '/admin': 'Admin Dashboard - HelldiversBoost',
  };
  
  document.title = titles[path] || 'HelldiversBoost';
}

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

// Error boundary component
function ErrorPage({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Page</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Main app function
async function initializeApp() {
  const root = document.getElementById("root");
  if (!root) {
    console.error("Root element not found!");
    return;
  }

  // Update title
  updateTitle();

  // Show loading initially
  const reactRoot = createRoot(root);
  reactRoot.render(
    <MPALayout>
      <LoadingPage />
      <Toaster />
      <Sonner />
    </MPALayout>
  );

  try {
    // Load the page component
    const PageComponent = await loadPageComponent();
    
    // Render the actual page
    reactRoot.render(
      <MPALayout>
        <PageComponent />
        <Toaster />
        <Sonner />
      </MPALayout>
    );
    
    console.log('Page loaded successfully for:', window.location.pathname);
  } catch (error) {
    console.error('Error loading page:', error);
    reactRoot.render(
      <MPALayout>
        <ErrorPage error={error as Error} />
        <Toaster />
        <Sonner />
      </MPALayout>
    );
  }
}

// Initialize the app
initializeApp();
