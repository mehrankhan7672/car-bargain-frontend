// src/routes/employees.$id.edit.tsx
import { useState, useEffect } from "react";
import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { employeeService } from "@/services/employeeService";

export const Route = createFileRoute("/employees/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Employee — Car Bargain Manager" },
      { name: "description", content: "Update staff role, phone number, joining date or salary." },
      { property: "og:title", content: "Edit Employee — Car Bargain Manager" },
      { property: "og:description", content: "Change a saved employee record." },
    ],
  }),
  component: EditEmployee,
});

// Validation schema with Pakistani phone number format
const employeeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  role: z.string().min(1, "Please select a role"),
  phone: z
    .string()
    .min(11, "Phone number must be 11 digits (e.g., 03001234567)")
    .max(11, "Phone number must be 11 digits (e.g., 03001234567)")
    .regex(/^03\d{9}$/, "Please enter a valid Pakistani number (e.g., 03001234567)"),
  joiningDate: z.string().min(1, "Joining date is required"),
  salary: z
    .string()
    .min(1, "Salary is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Salary must be a positive number",
    }),
});

// Role options
const ROLE_OPTIONS = [
  { value: "Manager", label: "Manager" },
  { value: "Salesman", label: "Salesman" },
  { value: "Accountant", label: "Accountant" },
  { value: "Driver", label: "Driver" },
  { value: "Watchman", label: "Watchman" },
  { value: "Cleaner", label: "Cleaner" },
  { value: "Cook", label: "Cook" },
  { value: "Waiter", label: "Waiter" },
];

function EditEmployee() {
  const { id } = useParams({ from: "/employees/$id/edit" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [employee, setEmployee] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isValid },
    trigger,
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(employeeSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      role: "",
      phone: "",
      joiningDate: "",
      salary: "",
    },
  });

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const data = await employeeService.getEmployeeById(id);
        setEmployee(data);

        // Reset form with employee data
        reset({
          name: data.name,
          role: data.role,
          phone: data.phone,
          joiningDate: data.joiningDate,
          salary: String(data.salary),
        });
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Failed to load employee", {
          description: error.message,
        });
        setEmployee(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id, reset]);

  // Clear server error when user starts typing
  useEffect(() => {
    if (serverError) {
      setServerError("");
    }
  }, [watch()]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError("");

    try {
      const updateData = {
        ...data,
        salary: Number(data.salary),
      };

      await employeeService.updateEmployee(id, updateData);

      toast.success("Employee updated", {
        description: `${data.name}'s information has been updated.`,
      });

      navigate({ to: "/employees" });
    } catch (error) {
      console.error("Update error:", error);

      // Handle validation errors from server
      if (error.message && error.message.includes("validation failed")) {
        const errorMsg = error.message;
        if (errorMsg.includes("phone:")) {
          setError("phone", {
            type: "manual",
            message: "Please enter a valid Pakistani phone number",
          });
        }
        setServerError(error.message);
        toast.error("Validation Error", {
          description: error.message,
        });
      } else {
        setServerError(error.message);
        toast.error("Failed to update employee", {
          description: error.message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to check if field has error
  const hasError = (fieldName) => {
    return errors && errors[fieldName];
  };

  // Helper to get error message
  const getErrorMessage = (fieldName) => {
    return errors && errors[fieldName] ? errors[fieldName].message : "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return <EmptyState title="Employee not found" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Edit Employee"
        subtitle={`Update ${employee.name}'s information`}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate({ to: "/employees" })}
            className="rounded-xl"
          >
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card-soft p-6 space-y-4">
          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter employee name"
              {...register("name", {
                onChange: (e) => {
                  trigger("name");
                },
              })}
              className={`h-11 rounded-xl ${
                hasError("name") ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {hasError("name") && (
              <p className="text-sm text-red-500 font-medium">{getErrorMessage("name")}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="grid gap-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => {
                setValue("role", value);
                trigger("role");
              }}
              value={watch("role")}
            >
              <SelectTrigger
                className={`h-11 rounded-xl ${
                  hasError("role") ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              >
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError("role") && (
              <p className="text-sm text-red-500 font-medium">{getErrorMessage("role")}</p>
            )}
          </div>

          {/* Phone Field - Pakistani Number Format */}
          <div className="grid gap-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="03001234567"
              {...register("phone", {
                onChange: (e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, "");
                  e.target.value = value;
                  trigger("phone");
                },
              })}
              className={`h-11 rounded-xl ${
                hasError("phone")
                  ? "border-red-500 focus-visible:ring-red-500"
                  : watch("phone") && !hasError("phone")
                    ? "border-green-500"
                    : ""
              }`}
              maxLength={11}
            />
            {hasError("phone") && (
              <p className="text-sm text-red-500 font-medium">{getErrorMessage("phone")}</p>
            )}
            {watch("phone") && !hasError("phone") && watch("phone").length === 11 && (
              <p className="text-sm text-green-500 font-medium">✓ Valid Pakistani number</p>
            )}
            <p className="text-xs text-muted-foreground">
              Format: 03001234567 (11 digits starting with 03)
            </p>
          </div>

          {/* Joining Date Field */}
          <div className="grid gap-2">
            <Label htmlFor="joiningDate" className="flex items-center gap-2">
              Joining Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="joiningDate"
              type="date"
              {...register("joiningDate", {
                onChange: () => trigger("joiningDate"),
              })}
              className={`h-11 rounded-xl ${
                hasError("joiningDate") ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {hasError("joiningDate") && (
              <p className="text-sm text-red-500 font-medium">{getErrorMessage("joiningDate")}</p>
            )}
          </div>

          {/* Salary Field */}
          <div className="grid gap-2">
            <Label htmlFor="salary" className="flex items-center gap-2">
              Monthly Salary (PKR) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="salary"
              type="number"
              placeholder="Enter salary amount"
              {...register("salary", {
                onChange: () => trigger("salary"),
              })}
              className={`h-11 rounded-xl ${
                hasError("salary") ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {hasError("salary") && (
              <p className="text-sm text-red-500 font-medium">{getErrorMessage("salary")}</p>
            )}
          </div>

          {/* Server Error Display */}
          {serverError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm font-medium text-red-600">Error:</p>
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          {/* Form Status */}
          <div className="flex items-center justify-between text-xs">
            <span className={!isValid && isDirty ? "text-red-500" : "text-muted-foreground"}>
              {isDirty && !isValid
                ? "⚠️ Please fix all errors before submitting"
                : isDirty && isValid
                  ? "✓ All fields are valid"
                  : isDirty
                    ? "No changes made"
                    : "Make changes to update employee"}
            </span>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate({ to: "/employees" })}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl"
            disabled={submitting || !isDirty || !isValid}
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                Updating...
              </>
            ) : (
              "Update Employee"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
