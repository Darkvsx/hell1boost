import "./global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";
import { initializeAnalytics } from "@/lib/analytics";

// Import all page components
import Index from "@/pages/Index";
import Bundles from "@/pages/Bundles";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import CustomOrder from "@/pages/CustomOrder";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import EmailConfirmation from "@/pages/EmailConfirmation";
import Account from "@/pages/Account";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

// Initialize analytics
initializeAnalytics();

// Get the page component based on the current URL path
function getPageComponent() {
  const path = window.location.pathname;
  
  console.log('MPA Router - Current path:', path);
  
  // Remove trailing slash and normalize path
  const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  
  switch (normalizedPath) {
    case "/":
      return <Index />;
    case "/bundles":
      return <Bundles />;
    case "/contact":
      return <Contact />;
    case "/faq":
      return <FAQ />;
    case "/custom-order":
      return <CustomOrder />;
    case "/terms":
      return <Terms />;
    case "/privacy":
      return <Privacy />;
    case "/login":
      return <Login />;
    case "/register":
      return <Register />;
    case "/forgot-password":
      return <ForgotPassword />;
    case "/email-confirmation":
      return <EmailConfirmation />;
    case "/account":
      return <Account />;
    case "/cart":
      return <Cart />;
    case "/checkout":
      return <Checkout />;
    case "/admin":
      return <AdminDashboard />;
    default:
      console.log('MPA Router - Unknown path, showing 404:', normalizedPath);
      return <NotFound />;
  }
}

// Update document title based on the page
function updateDocumentTitle() {
  const path = window.location.pathname;
  const normalizedPath = path === "/" ? "/" : path.replace(/\/$/, "");
  
  const titles: { [key: string]: string } = {
    "/": "HelldiversBoost - Professional Helldivers 2 Boosting Services",
    "/bundles": "Bundles - HelldiversBoost",
    "/contact": "Contact - HelldiversBoost",
    "/faq": "FAQ - HelldiversBoost",
    "/custom-order": "Custom Order - HelldiversBoost",
    "/terms": "Terms of Service - HelldiversBoost",
    "/privacy": "Privacy Policy - HelldiversBoost",
    "/login": "Login - HelldiversBoost",
    "/register": "Register - HelldiversBoost",
    "/forgot-password": "Forgot Password - HelldiversBoost",
    "/email-confirmation": "Email Confirmation - HelldiversBoost",
    "/account": "Account - HelldiversBoost",
    "/cart": "Shopping Cart - HelldiversBoost",
    "/checkout": "Checkout - HelldiversBoost",
    "/admin": "Admin Dashboard - HelldiversBoost",
  };
  
  document.title = titles[normalizedPath] || "HelldiversBoost";
}

// Update title and get component
updateDocumentTitle();
const PageComponent = getPageComponent();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

console.log('MPA Router - Rendering page for:', window.location.pathname);

createRoot(root).render(
  <MPALayout>
    {PageComponent}
    <Toaster />
    <Sonner />
  </MPALayout>
);
