import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Car Bargain Manager" },
      { name: "description", content: "Create your showroom account to start managing cars and deals." },
      { property: "og:title", content: "Sign Up — Car Bargain Manager" },
      { property: "og:description", content: "Registration page for the dealership dashboard." },
    ],
  }),
  component: SignUp,
});

const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Please confirm your password"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Both passwords must be same",
    path: ["confirm"],
  });

function SignUp() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirm: "" },
  });

  const fields = [
    { name: "name" as const, label: "Full Name", type: "text", placeholder: "Ahmed Raza" },
    { name: "email" as const, label: "Email", type: "text", placeholder: "you@showroom.pk" },
    { name: "phone" as const, label: "Phone Number", type: "text", placeholder: "+92 300 1234567" },
    { name: "password" as const, label: "Password", type: "password", placeholder: "••••••••" },
    { name: "confirm" as const, label: "Confirm Password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Make an account for your showroom staff."
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/auth/signin" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(() => {
            toast.success("Account created", { description: "Demo mode — no real account." });
            navigate({ to: "/" });
          })}
          className="space-y-4"
        >
          {fields.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    <Input {...field} type={f.type} placeholder={f.placeholder} className="h-11 rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="h-11 w-full rounded-xl">
            Create Account
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}
