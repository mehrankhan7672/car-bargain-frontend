import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — Car Bargain Manager" },
      { name: "description", content: "Sign in to your showroom dashboard to manage cars, deals and staff." },
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

function SignIn() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

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
        <form
          onSubmit={form.handleSubmit(() => {
            toast.success("Signed in", { description: "Demo mode — no real login." });
            navigate({ to: "/" });
          })}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="you@showroom.pk" className="h-11 rounded-xl" />
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
                  <Input {...field} type="password" placeholder="••••••••" className="h-11 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Link to="/auth/forgot-password" className="text-sm font-medium text-gold hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl">
            Sign In
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
