import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogIn, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const cartItemCount = getCartItemCount();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10">
              <img
                src="/placeholder.svg"
                alt="HelldiversBoost Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                HELLDIVERS II
              </span>
              <div className="text-sm text-primary font-semibold">BOOSTING</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/#services"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Services
            </Link>
            <Link
              to="/bundles"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Bundles
            </Link>
            <Link
              to="/custom-order"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Custom Order
            </Link>
            <Link
              to="/faq"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              FAQ
            </Link>
          </div>

          {/* Desktop Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">
                      <User className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/account">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="relative">
                  <Link to="/cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.username}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/cart">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/#services"
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                to="/bundles"
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Bundles
              </Link>
              <Link
                to="/faq"
                className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>

              <div className="border-t border-border pt-2 mt-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/account"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Account
                    </Link>
                    <Link
                      to="/cart"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart ({cartItemCount})
                    </Link>
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Welcome, {user?.username}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/cart"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Cart ({cartItemCount})
                    </Link>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
