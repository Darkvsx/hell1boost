import "../global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";
import FAQ from "@/pages/FAQ";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <MPALayout>
    <FAQ />
    <Toaster />
    <Sonner />
  </MPALayout>,
);
