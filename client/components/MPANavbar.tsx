import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Package,
  Crown,
  Bell,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
}

const navigation: NavigationItem[] = [
  { name: "Services", href: "/", icon: Crown },
  { name: "Bundles", href: "/bundles", icon: Package, badge: "Popular" },
  {
    name: "Custom Order",
    href: "/custom-order",
    icon: Settings,
    isNew: true,
  },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export function MPANavbar() {
  const { user, isLoading, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState([]);

  const currentPath = window.location.pathname;
  const cartItemCount = getTotalItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [signOut]);

  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    window.location.href = href;
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/" || currentPath === "/index.html";
    }
    return currentPath === href || currentPath === href + "/";
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200",
        isScrolled && "shadow-md border-border/40",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            >
              <Crown className="h-6 w-6" />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                HelldiversBoost
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary group",
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  {item.isNew && (
                    <Badge
                      variant="destructive"
                      className="ml-1 text-xs animate-pulse"
                    >
                      New
                    </Badge>
                  )}
                </a>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 px-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Search */}
            <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-9 w-9 px-0"
              onClick={() => (window.location.href = "/cart")}
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>

            {/* User menu */}
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="relative h-9 w-9 px-0"
                      >
                        <User className="h-4 w-4" />
                        {notifications.length > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-2 w-2 p-0">
                            <span className="sr-only">
                              {notifications.length} notifications
                            </span>
                          </Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.user_metadata?.display_name || user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => (window.location.href = "/account")}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Account</span>
                      </DropdownMenuItem>
                      {user.user_metadata?.role === "admin" && (
                        <DropdownMenuItem
                          onClick={() => (window.location.href = "/admin")}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = "/login")}
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = "/register")}
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 px-0">
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-primary" />
                      <span>HelldiversBoost</span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 flex flex-col space-y-3">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleNavigation(item.href)}
                          className={cn(
                            "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left w-full",
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.name}</span>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-auto text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.isNew && (
                            <Badge
                              variant="destructive"
                              className="ml-auto text-xs"
                            >
                              New
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
