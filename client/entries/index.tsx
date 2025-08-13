import "../global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";
import Index from "@/pages/Index";
import { initializeAnalytics } from "@/lib/analytics";

// Initialize analytics
initializeAnalytics();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <MPALayout>
    <Index />
    <Toaster />
    <Sonner />
  </MPALayout>,
);
