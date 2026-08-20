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
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Car Bargain Manager" },
      {
        name: "description",
        content: "Create your showroom account to start managing cars and deals.",
      },
      { property: "og:title", content: "Sign Up — Car Bargain Manager" },
      { property: "og:description", content: "Registration page for the dealership dashboard." },
    ],
  }),
  component: SignUp,
});

// Complete schema for all fields
const schema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Please confirm your password"),
    bargainName: z.string().min(1, "Bargain name is required"),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Both passwords must be same",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

function SignUp() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm: "",
      bargainName: "",
    },
    mode: "onChange",
  });

  // Step 1 fields
  const step1Fields = [
    { name: "name" as const, label: "Full Name", type: "text", placeholder: "Ahmed Raza" },
    { name: "email" as const, label: "Email", type: "email", placeholder: "you@showroom.pk" },
    { name: "password" as const, label: "Password", type: "password", placeholder: "••••••••" },
    {
      name: "confirm" as const,
      label: "Confirm Password",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  // Step 2 fields
  const step2Fields = [
    {
      name: "bargainName" as const,
      label: "Bargain Name",
      type: "text",
      placeholder: "My Showroom",
    },
  ];

  // Handle next step
  const handleNextStep = async () => {
    console.log("Button clicked - Step 1 validation starting...");

    // Trigger validation for step 1 fields
    const isValid = await form.trigger(["name", "email", "password", "confirm"]);

    console.log("Validation result:", isValid);

    if (isValid) {
      console.log("Moving to step 2");
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      console.log("Validation failed");
      toast.error("Please fill in all fields correctly", {
        description: "Make sure all fields are filled and passwords match.",
      });
    }
  };

  // Handle final submission
  const onSubmit = async (values: FormValues) => {
    console.log("Submitting form with values:", values);
    console.log("Logo file:", logoFile);

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("password", values.password);
      formData.append("bargainName", values.bargainName);

      if (logoFile) {
        formData.append("logo", logoFile);
        console.log("Logo file appended:", logoFile.name, logoFile.size, logoFile.type);
      } else {
        console.log("No logo file selected");
      }

      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/";
      console.log("API URL:", apiUrl);

      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);

      // Parse the response
      let data;
      const responseText = await response.text();
      console.log("Response text:", responseText);

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        throw new Error("Server returned invalid response");
      }

      // Check if response was not successful
      if (!response.ok) {
        // Display the specific error message from the server
        const errorMessage = data.message || `Registration failed (${response.status})`;
        console.log("Error message from server:", errorMessage);

        // Show specific error messages
        if (
          errorMessage.toLowerCase().includes("email already") ||
          errorMessage.toLowerCase().includes("already registered")
        ) {
          toast.error("Email Already Registered", {
            description: "This email is already registered. Please use a different email or login.",
            icon: <AlertCircle className="h-5 w-5" />,
            duration: 5000,
          });
        } else if (errorMessage.toLowerCase().includes("password")) {
          toast.error("Password Error", {
            description: errorMessage,
            duration: 4000,
          });
        } else {
          toast.error("Registration Failed", {
            description: errorMessage,
            duration: 4000,
          });
        }

        throw new Error(errorMessage);
      }

      // SUCCESS - Handle successful registration
      console.log("Registration successful:", data);

      // Store token and user data via AuthContext, so the router's auth
      // state updates immediately (not just localStorage)
      if (data.token) {
        login(data.user, data.token);
        console.log("Token and user data stored via AuthContext");
      }

      // Show success message
      toast.success("Account created successfully!", {
        description: `Welcome ${data.user.name}! You can now start managing your showroom.`,
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        duration: 4000,
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        console.log("Navigating to dashboard...");
        navigate({ to: "/" });
      }, 1500);
    } catch (error) {
      console.error("Registration error:", error);
      // If error wasn't already shown above, show generic error
      if (!(
        error instanceof Error &&
        (error.message.toLowerCase().includes("email") ||
          error.message.toLowerCase().includes("password"))
      )) {
        toast.error("Registration Failed", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Logo selected:", file.name, file.size, file.type);

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Logo must be less than 5MB",
        });
        e.target.value = "";
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Please upload JPEG, PNG, SVG, or WebP images",
        });
        e.target.value = "";
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById("logo-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const goToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 1
              ? "bg-gold text-white"
              : currentStep === 2
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-600"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm ${currentStep === 1 ? "text-gold font-medium" : "text-gray-500"}`}
        >
          Personal Info
        </span>
      </div>

      <div className={`w-12 h-0.5 ${currentStep === 2 ? "bg-gold" : "bg-gray-300"}`} />

      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === 2 ? "bg-gold text-white" : "bg-gray-200 text-gray-600"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${currentStep === 2 ? "text-gold font-medium" : "text-gray-500"}`}
        >
          Bargain Details
        </span>
      </div>
    </div>
  );

  return (
    <AuthLayout
      title={currentStep === 1 ? "Create Account" : "Set Up Your Bargain"}
      subtitle={
        currentStep === 1
          ? "Make an account for your showroom staff."
          : "Tell us about your bargain/brand."
      }
      footer={
        <span>
          Already have an account?{" "}
          <Link to="/auth/signin" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <StepIndicator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              {step1Fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={f.type}
                          placeholder={f.placeholder}
                          className="h-11 rounded-xl"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                type="button"
                className="h-11 w-full rounded-xl gap-2"
                onClick={handleNextStep}
                disabled={isLoading}
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Bargain Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {step2Fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type={f.type}
                          placeholder={f.placeholder}
                          className="h-11 rounded-xl"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Bargain Logo (Optional)
                </label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="h-11 rounded-xl cursor-pointer"
                  disabled={isLoading}
                />

                {logoPreview && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-12 w-12 object-contain rounded"
                    />
                    <span className="text-sm text-muted-foreground flex-1">{logoFile?.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeLogo}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Upload your showroom logo (PNG, JPG, SVG, WebP - max 5MB)
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1 rounded-xl gap-2"
                  onClick={goToStep1}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                <Button type="submit" className="h-11 flex-1 rounded-xl" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </AuthLayout>
  );
}
