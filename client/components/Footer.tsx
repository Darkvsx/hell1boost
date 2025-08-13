// No router imports needed for MPA
import { Button } from "@/components/ui/button";
import {
  Github,
  Twitter,
  MessageCircle,
  Mail,
  Shield,
  Clock,
  Award,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <img
                  src="/placeholder.svg"
                  alt="HelldiversBoost Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="text-lg font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                  HELLDIVERS II
                </div>
                <div className="text-sm text-primary font-semibold">
                  BOOSTING
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Professional Helldivers 2 boosting services. Fast, secure, and
              reliable gaming enhancement for the ultimate Super Earth
              experience.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Safe & Secure</span>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <div className="space-y-2">
              <a
                href="/faq"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                FAQ
              </a>
              <a
                href="/contact"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
              <a
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          {/* Community & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Community</h3>
            <div className="space-y-3">
              <a
                href="https://discord.gg/helldivers2boost"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Join Discord</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <span>Professional Team</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} HelldiversBoost. All rights reserved.
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-muted-foreground">
                Powered by PayPal Secure Payments
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">
                  SSL Secured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
