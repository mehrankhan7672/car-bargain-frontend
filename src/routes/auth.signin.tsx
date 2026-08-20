import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — Car Bargain Manager" },
      {
        name: "description",
        content: "Sign in to your showroom dashboard to manage cars, deals and staff.",
      },
      { property: "og:title", content: "Sign In — Car Bargain Manager" },
      { property: "og:description", content: "Login page for the dealership dashboard." },
    ],
  }),
  component: SignIn,
});

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", values.email);
      console.log("Password length:", values.password.length);

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/";

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response status text:", response.statusText);

      // Get raw response text first
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      // Parse response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Server returned an invalid response. Please try again.");
      }

      console.log("Parsed response:", data);
      console.log("Response success:", data.success);
      console.log("Response message:", data.message);

      // Check if login was successful
      if (response.ok && data.success) {
        console.log("=== LOGIN SUCCESS ===");
        console.log("Token received:", data.token ? "Yes" : "No");
        console.log("User data:", data.user);

        // Store token and user data via AuthContext, so the router's auth
        // state updates immediately (not just localStorage)
        if (data.token) {
          login(data.user, data.token);
          console.log("Token and user data stored via AuthContext");
        }

        // Show success message with backend response
        toast.success("Welcome back!", {
          description: data.message || `Signed in as ${data.user?.name || "User"}`,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          duration: 3000,
        });

        // Navigate to dashboard after a short delay
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          navigate({ to: "/" });
        }, 1000);
      } else {
        // Login failed - show backend error message
        console.log("=== LOGIN FAILED ===");
        console.log("Error message from backend:", data.message);

        let errorMessage = data.message || "Invalid credentials. Please try again.";

        // Specific error messages based on status code
        if (response.status === 401) {
          if (data.message?.toLowerCase().includes("inactive")) {
            errorMessage = "Your account has been deactivated. Please contact support.";
          } else if (data.message?.toLowerCase().includes("invalid")) {
            errorMessage = "Invalid email or password. Please try again.";
          } else {
            errorMessage = data.message || "Invalid credentials. Please try again.";
          }
        } else if (response.status === 400) {
          errorMessage = data.message || "Please check your email and password.";
        } else if (response.status === 404) {
          errorMessage = "Login endpoint not found. Please check your API URL.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        // Show backend error message
        toast.error("Sign In Failed", {
          description: errorMessage,
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("=== LOGIN ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);

      // Show error message
      toast.error("Sign In Failed", {
        description: error.message || "An unexpected error occurred. Please try again.",
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      console.log("=== LOGIN ATTEMPT COMPLETED ===");
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Enter your email and password to open the dashboard."
      footer={
        <span>
          New here?{" "}
          <Link to="/auth/signup" className="font-semibold text-gold hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@showroom.pk"
                    className="h-11 rounded-xl"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="••••••••"
                    className="h-11 rounded-xl"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-gold hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="h-11 w-full rounded-xl" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
