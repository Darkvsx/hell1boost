import "./global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";

console.log('🚀 MPA Router initializing...');

// Route definitions
const routes = {
  '/': () => import('@/pages/Index'),
  '/bundles': () => import('@/pages/Bundles'),
  '/contact': () => import('@/pages/Contact'),
  '/faq': () => import('@/pages/FAQ'),
  '/custom-order': () => import('@/pages/CustomOrder'),
  '/terms': () => import('@/pages/Terms'),
  '/privacy': () => import('@/pages/Privacy'),
  '/login': () => import('@/pages/Login'),
  '/register': () => import('@/pages/Register'),
  '/forgot-password': () => import('@/pages/ForgotPassword'),
  '/email-confirmation': () => import('@/pages/EmailConfirmation'),
  '/account': () => import('@/pages/Account'),
  '/cart': () => import('@/pages/Cart'),
  '/checkout': () => import('@/pages/Checkout'),
  '/admin': () => import('@/pages/AdminDashboard'),
};

// Page titles
const titles = {
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

// Get current path
function getCurrentPath(): string {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  console.log('📍 Current path:', path);
  return path;
}

// Update document title
function updateTitle(path: string) {
  const title = titles[path as keyof typeof titles] || 'HelldiversBoost';
  document.title = title;
  console.log('📝 Title updated:', title);
}

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading page...</p>
        <p className="mt-2 text-xs text-muted-foreground">Path: {getCurrentPath()}</p>
      </div>
    </div>
  );
}

// Error component
function ErrorPage({ error, path }: { error: Error; path: string }) {
  console.error('❌ Page load error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-bold text-destructive mb-4">Failed to Load Page</h1>
        <p className="text-muted-foreground mb-2">Path: <code>{path}</code></p>
        <p className="text-muted-foreground mb-4">Error: {error.message}</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded w-full"
          >
            Reload Page
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded w-full"
          >
            Go Home
          </button>
        </div>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground">Debug Info</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.stack}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Not found component
function NotFoundPage({ path }: { path: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-4">The path <code>{path}</code> doesn't exist.</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.href = '/'} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded w-full"
          >
            Go Home
          </button>
        </div>
        <div className="mt-4 text-left">
          <p className="text-sm text-muted-foreground mb-2">Available routes:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {Object.keys(routes).map(route => (
              <li key={route}>
                <a href={route} className="hover:text-primary">{route}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main app initialization
async function initializeApp() {
  console.log('🔧 Initializing MPA app...');
  
  try {
    // Check for root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element #root not found in DOM");
    }
    console.log('✅ Root element found');

    // Create React root
    const root = createRoot(rootElement);
    console.log('✅ React root created');

    // Get current path
    const currentPath = getCurrentPath();
    
    // Update title
    updateTitle(currentPath);

    // Show loading state
    root.render(
      <MPALayout>
        <LoadingPage />
        <Toaster />
        <Sonner />
      </MPALayout>
    );
    console.log('✅ Loading state rendered');

    // Load route
    const routeLoader = routes[currentPath as keyof typeof routes];
    
    if (!routeLoader) {
      console.warn('⚠️ No route found for path:', currentPath);
      root.render(
        <MPALayout>
          <NotFoundPage path={currentPath} />
          <Toaster />
          <Sonner />
        </MPALayout>
      );
      return;
    }

    console.log('📦 Loading component for:', currentPath);
    
    // Dynamically import the component
    const moduleImport = await routeLoader();
    const PageComponent = moduleImport.default;
    
    if (!PageComponent) {
      throw new Error(`Component for route ${currentPath} has no default export`);
    }
    
    console.log('✅ Component loaded successfully');

    // Render the page
    root.render(
      <MPALayout>
        <PageComponent />
        <Toaster />
        <Sonner />
      </MPALayout>
    );
    
    console.log('🎉 Page rendered successfully for:', currentPath);

    // Initialize analytics after page loads
    try {
      const { initializeAnalytics } = await import("@/lib/analytics");
      initializeAnalytics();
      console.log('📊 Analytics initialized');
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }

  } catch (error) {
    console.error('💥 App initialization failed:', error);
    
    // Try to render error page
    try {
      const rootElement = document.getElementById("root");
      if (rootElement) {
        const root = createRoot(rootElement);
        root.render(
          <MPALayout>
            <ErrorPage error={error as Error} path={getCurrentPath()} />
            <Toaster />
            <Sonner />
          </MPALayout>
        );
      }
    } catch (renderError) {
      console.error('💥 Failed to render error page:', renderError);
      // Last resort: show basic error in DOM
      const rootElement = document.getElementById("root");
      if (rootElement) {
        rootElement.innerHTML = `
          <div style="padding: 20px; text-align: center; font-family: sans-serif;">
            <h1 style="color: red;">MPA App Failed to Load</h1>
            <p>Path: ${getCurrentPath()}</p>
            <p>Error: ${(error as Error).message}</p>
            <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 10px;">Reload</button>
            <button onclick="window.location.href='/'" style="padding: 10px 20px; margin: 10px;">Go Home</button>
          </div>
        `;
      }
    }
  }
}

// Add error handler for unhandled errors
window.addEventListener('error', (event) => {
  console.error('🚨 Unhandled error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
