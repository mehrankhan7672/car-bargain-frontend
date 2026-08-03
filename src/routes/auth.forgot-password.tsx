import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Car Bargain Manager" },
      { name: "description", content: "Reset the password of your showroom dashboard account." },
      { property: "og:title", content: "Forgot Password — Car Bargain Manager" },
      { property: "og:description", content: "Password reset page for the dealership dashboard." },
    ],
  }),
  component: ForgotPassword,
});

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

function ForgotPassword() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we will send a reset link."
      footer={
        <Link to="/auth/signin" className="font-semibold text-gold hover:underline">
          Back to sign in
        </Link>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() =>
            toast.success("Reset link sent", { description: "Demo mode — no email is sent." }),
          )}
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
          <Button type="submit" className="h-11 w-full rounded-xl">
            Send Reset Link
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
