import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  discord_username?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<boolean>;
  updateProfile: (
    updates: Partial<{ username: string; discord_username: string }>,
  ) => Promise<boolean>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      console.log("Loading profile for user:", userId);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, try to create it
        console.log("Profile not found, creating new profile...");

        // Get user data from auth.users
        const { data: userData } = await supabase.auth.getUser();

        if (userData.user) {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: userData.user.email,
              username: userData.user.email?.split("@")[0] || "User",
              role: userData.user.email?.includes("@helldivers.com")
                ? "admin"
                : "user",
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
          } else if (newProfile) {
            console.log("Profile created successfully:", newProfile);
            setUser({
              id: newProfile.id,
              username: newProfile.username || "User",
              email: newProfile.email || "",
              role: (newProfile.role as "user" | "admin") || "user",
              discord_username: newProfile.discord_username || undefined,
              created_at: newProfile.created_at || undefined,
            });
          }
        }
      } else if (profile) {
        console.log("Profile loaded successfully:", profile);
        setUser({
          id: profile.id,
          username: profile.username || "User",
          email: profile.email || "",
          role: (profile.role as "user" | "admin") || "user",
          discord_username: profile.discord_username || undefined,
          created_at: profile.created_at || undefined,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting login for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }

      if (data.user) {
        console.log("Login successful for user:", data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    email: string,
    password: string,
    username: string,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });
      return !error;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const resendConfirmation = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=true`,
        },
      });
      return !error;
    } catch (error) {
      console.error("Resend confirmation error:", error);
      return false;
    }
  };

  const updateProfile = async (
    updates: Partial<{ username: string; discord_username: string }>,
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Profile update error:", error);
        return false;
      }

      // Update local user state
      setUser((prev) =>
        prev
          ? {
              ...prev,
              username: updates.username || prev.username,
              discord_username:
                updates.discord_username !== undefined
                  ? updates.discord_username
                  : prev.discord_username,
            }
          : null,
      );
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  // Memoize expensive computations
  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  // Memoize callback functions to prevent unnecessary rerenders
  const memoizedLogin = useCallback(login, []);
  const memoizedRegister = useCallback(register, []);
  const memoizedLogout = useCallback(logout, []);
  const memoizedResendConfirmation = useCallback(resendConfirmation, []);
  const memoizedUpdateProfile = useCallback(updateProfile, []);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      user,
      loading,
      login: memoizedLogin,
      register: memoizedRegister,
      logout: memoizedLogout,
      resendConfirmation: memoizedResendConfirmation,
      updateProfile: memoizedUpdateProfile,
      isAuthenticated,
      isAdmin,
    }),
    [
      user,
      loading,
      memoizedLogin,
      memoizedRegister,
      memoizedLogout,
      memoizedResendConfirmation,
      memoizedUpdateProfile,
      isAuthenticated,
      isAdmin,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
