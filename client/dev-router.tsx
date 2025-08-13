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

// Simple MPA router for development
function getPageComponent() {
  const path = window.location.pathname;
  
  switch (path) {
    case "/":
    case "/index.html":
      return <Index />;
    case "/bundles":
    case "/bundles.html":
      return <Bundles />;
    case "/contact":
    case "/contact.html":
      return <Contact />;
    case "/faq":
    case "/faq.html":
      return <FAQ />;
    case "/custom-order":
    case "/custom-order.html":
      return <CustomOrder />;
    case "/terms":
    case "/terms.html":
      return <Terms />;
    case "/privacy":
    case "/privacy.html":
      return <Privacy />;
    case "/login":
    case "/login.html":
      return <Login />;
    case "/register":
    case "/register.html":
      return <Register />;
    case "/forgot-password":
    case "/forgot-password.html":
      return <ForgotPassword />;
    case "/email-confirmation":
    case "/email-confirmation.html":
      return <EmailConfirmation />;
    case "/account":
    case "/account.html":
      return <Account />;
    case "/cart":
    case "/cart.html":
      return <Cart />;
    case "/checkout":
    case "/checkout.html":
      return <Checkout />;
    case "/admin":
    case "/admin.html":
      return <AdminDashboard />;
    default:
      return <NotFound />;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const PageComponent = getPageComponent();

createRoot(root).render(
  <MPALayout>
    {PageComponent}
    <Toaster />
    <Sonner />
  </MPALayout>
);
