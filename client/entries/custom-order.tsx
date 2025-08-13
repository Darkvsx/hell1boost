import "../global.css";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { MPALayout } from "@/components/MPALayout";
import CustomOrder from "@/pages/CustomOrder";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <MPALayout>
    <CustomOrder />
    <Toaster />
    <Sonner />
  </MPALayout>,
);
