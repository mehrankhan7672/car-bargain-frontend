import { useState, useEffect, useRef } from "react";
import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { ChevronLeft, ChevronRight, Check, Edit, Eye, Upload, X, Search } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";

import { carService } from "@/services/carService";
import { getImageUrl } from "@/lib/image-url";

/* ============================================================
   FIELD CONFIG
============================================================ */

export type FieldConfig = {
  name: string;
  label: string;

  type?: "text" | "number" | "date" | "select" | "textarea" | "file" | "combobox";

  options?: string[];
  placeholder?: string;
  optional?: boolean;
  full?: boolean;
  step?: number;

  dependsOn?: string;

  showWhen?: (value: any) => boolean;

  requiredWhenVisible?: boolean;

  onOptionSelect?: (value: string, setFieldValue: (name: string, value: any) => void) => void;

  onClear?: (setFieldValue: (name: string, value: any) => void) => void;
};

/* ============================================================
   STEP CONFIG
============================================================ */

export type StepConfig = {
  step: number;
  title: string;
  icon: string;
  description: string;
};

/* ============================================================
   HELPERS
============================================================ */

const isEmptyValue = (value: any) => value === undefined || value === null || value === "";

/* ============================================================
   BUILD VALIDATION SCHEMA
============================================================ */

export function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`);

  const optionalString = () => z.string().optional();

  const requiredNumber = (label: string, min?: number, minMessage?: string) =>
    z.preprocess(
      (value) => {
        if (value === "" || value === undefined || value === null) {
          return undefined;
        }

        if (typeof value === "string") {
          return Number(value);
        }

        return value;
      },
      z
        .number({
          invalid_type_error: `${label} must be a number`,
        })
        .refine((value) => min === undefined || value >= min, {
          message: minMessage || `${label} cannot be negative`,
        }),
    );

  const optionalNumber = (label: string, min?: number, minMessage?: string) =>
    z.preprocess(
      (value) => {
        if (value === "" || value === undefined || value === null) {
          return undefined;
        }

        if (typeof value === "string") {
          return Number(value);
        }

        return value;
      },
      z
        .number({
          invalid_type_error: `${label} must be a number`,
        })
        .refine((value) => min === undefined || value >= min, {
          message: minMessage || `${label} cannot be negative`,
        })
        .optional(),
    );

  const enumString = (label: string, values: string[], required: boolean) => {
    const base = required
      ? z.string().trim().min(1, `${label} is required`)
      : z.string().optional();

    return base.refine((value) => value === undefined || value === "" || values.includes(value), {
      message: `${label} must be one of: ${values.join(", ")}`,
    });
  };

  for (const field of fields) {
    const conditional = !!field.dependsOn;

    const treatAsOptional = field.optional || conditional;

    switch (field.name) {
      case "userPhone":
        shape[field.name] = z
          .string()
          .trim()
          .min(1, "Phone number is required")
          .regex(
            /^(\d{4}-\d{7}|\d{11})$/,
            "Please enter a valid phone number (e.g., 0300-1234567 or 03001234567)",
          );
        break;

      case "userCnic":
        shape[field.name] = z
          .string()
          .trim()
          .min(1, "CNIC number is required")
          .regex(/^\d{13}$/, "CNIC must be exactly 13 digits (e.g., 1234567890123)");
        break;

      case "year": {
        const maxYear = new Date().getFullYear() + 1;

        shape[field.name] = requiredNumber("Year", 1900, "Year must be 1900 or later").refine(
          (value) => value <= maxYear,
          {
            message: "Year cannot be in the future",
          },
        );

        break;
      }

      case "mileage":
        shape[field.name] = requiredNumber("Mileage", 0, "Mileage cannot be negative");
        break;

      case "engineCC":
        shape[field.name] = requiredNumber("Engine CC", 0, "Engine CC cannot be negative");
        break;

      case "fuelType":
        shape[field.name] = enumString(
          "Fuel type",
          ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
          true,
        );
        break;

      case "transmission":
        shape[field.name] = enumString("Transmission", ["Automatic", "Manual", "CVT", "DCT"], true);
        break;

      case "condition":
        shape[field.name] = enumString("Condition", ["New", "Used", "Certified Pre-Owned"], true);
        break;

      case "carType":
        shape[field.name] = enumString(
          "Car type",
          ["NCP (Non-Custom Paid)", "CP (Custom Paid)"],
          true,
        );
        break;

      case "transactionType":
        shape[field.name] = enumString(
          "Transaction type",
          ["Direct Purchase", "Exchange with Bargain"],
          true,
        );
        break;

      case "exchangeType":
        shape[field.name] = z.preprocess(
          (value) => (value === "" || value === null ? undefined : value),
          z.enum(["Car Only", "Car + Money"]).optional(),
        );
        break;

      case "status":
        shape[field.name] = enumString("Status", ["Available", "Reserved", "Sold"], true);
        break;

      case "salePrice":
        shape[field.name] = optionalNumber("Sale price", 0, "Sale price cannot be negative");
        break;

      case "purchasePrice":
        shape[field.name] = optionalNumber(
          "Purchase price",
          0,
          "Purchase price cannot be negative",
        );
        break;

      case "expectedPrice":
        shape[field.name] = optionalNumber(
          "Expected price",
          0,
          "Expected price cannot be negative",
        );
        break;

      case "exchangeAdditionalAmount":
        shape[field.name] = optionalNumber(
          "Additional amount",
          0,
          "Additional amount cannot be negative",
        );
        break;

      case "exchangeMoneyAmount":
        shape[field.name] = optionalNumber("Money amount", 0, "Money amount cannot be negative");
        break;

      // --- Added validation for amount and category ---
      case "amount":
        shape[field.name] = requiredNumber("Amount", 0, "Amount cannot be negative");
        break;

      case "category":
        shape[field.name] = enumString(
          "Category",
          ["Repair", "Fuel", "Office", "Salary", "Marketing", "Other"],
          true,
        );
        break;

      case "userName":
        shape[field.name] = requiredString("Full name");
        break;

      case "userAddress":
        shape[field.name] = requiredString("Address");
        break;

      case "company":
        shape[field.name] = requiredString("Company");
        break;

      case "model":
        shape[field.name] = requiredString("Model");
        break;

      case "color":
        shape[field.name] = requiredString("Color");
        break;

      case "chassisNumber":
        shape[field.name] = requiredString("Chassis number");
        break;

      case "engineNumber":
        shape[field.name] = requiredString("Engine number");
        break;

      case "dateAdded":
        shape[field.name] = requiredString("Date added");
        break;

      case "registrationNumber":
      case "registrationCity":
      case "localNumber":
        shape[field.name] = optionalString();
        break;

      case "file":
        shape[field.name] = z.any().optional();
        break;

      default:
        if (field.type === "file") {
          shape[field.name] = z.any().optional();
        } else if (field.type === "number") {
          shape[field.name] = treatAsOptional
            ? optionalNumber(field.label)
            : requiredNumber(field.label);
        } else {
          shape[field.name] = treatAsOptional ? optionalString() : requiredString(field.label);
        }
    }
  }

  return z
    .object(shape)
    .passthrough()
    .superRefine((data, ctx) => {
      /* CP */
      if (data.carType === "CP (Custom Paid)") {
        if (!String(data.registrationNumber ?? "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["registrationNumber"],
            message: "Registration number is required for a registered (CP) car",
          });
        }

        if (!String(data.registrationCity ?? "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["registrationCity"],
            message: "Registration city is required for a registered (CP) car",
          });
        }
      }

      /* NCP */
      if (data.carType === "NCP (Non-Custom Paid)") {
        if (!String(data.localNumber ?? "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["localNumber"],
            message: "Local number is required for a non-custom-paid (NCP) car",
          });
        }
      }

      /* CAR + MONEY */
      if (data.exchangeType === "Car + Money") {
        const amount = data.exchangeMoneyAmount;

        if (typeof amount !== "number" || amount <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["exchangeMoneyAmount"],
            message: 'Money amount is required when exchange type is "Car + Money"',
          });
        }
      }
    });
}

/* ============================================================
   COMBOBOX
============================================================ */

const ComboboxField = ({
  value,
  onChange,
  onOptionSelect,
  onClear,
  options,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  onOptionSelect?: (value: string) => void;
  onClear?: () => void;
  options: string[];
  placeholder?: string;
  label?: string;
}) => {
  const [searchTerm, setSearchTerm] = useState(value || "");

  const [isOpen, setIsOpen] = useState(false);

  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOptions(options.slice(0, 10));
    } else {
      setFilteredOptions(
        options.filter((option) => option.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    setHighlightedIndex(-1);
  }, [searchTerm, options]);

  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value || "");
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectOption = (option: string) => {
    setSearchTerm(option);
    onChange(option);

    onOptionSelect?.(option);

    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setSearchTerm("");
    onChange("");

    onClear?.();

    setIsOpen(false);
    setHighlightedIndex(-1);

    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setIsOpen(true);
        event.preventDefault();
      }

      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();

        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));

        break;

      case "ArrowUp":
        event.preventDefault();

        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));

        break;

      case "Enter":
        event.preventDefault();

        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }

        break;

      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const highlightMatch = (text: string, search: string) => {
    if (!search.trim()) {
      return text;
    }

    const index = text.toLowerCase().indexOf(search.toLowerCase());

    if (index === -1) {
      return text;
    }

    return (
      <>
        {text.substring(0, index)}

        <span className="bg-primary/20 font-semibold">
          {text.substring(index, index + search.length)}
        </span>

        {text.substring(index + search.length)}
      </>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || `Type or select ${label || "option"}...`}
          className="h-11 rounded-xl pr-10"
          autoComplete="off"
        />

        {searchTerm.trim() !== "" && onClear ? (
          <button
            type="button"
            aria-label={`Clear ${label || "field"}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-white shadow-lg dark:bg-gray-800">
          {filteredOptions.map((option, index) => (
            <div
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-4 py-2.5 transition-colors",
                index === highlightedIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-primary/10",
              )}
              onClick={() => handleSelectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="flex-1">{highlightMatch(option, searchTerm)}</span>

              {option.toLowerCase() === searchTerm.toLowerCase() && (
                <span className="text-xs opacity-60">✓ Selected</span>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && searchTerm.trim() !== "" && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white p-4 text-center text-muted-foreground shadow-lg dark:bg-gray-800">
          No matching dealers found. You can type a custom name.
        </div>
      )}

      {isOpen && filteredOptions.length === 0 && searchTerm.trim() === "" && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border bg-white p-4 text-center text-muted-foreground shadow-lg dark:bg-gray-800">
          Start typing to search dealers...
        </div>
      )}
    </div>
  );
};

/* ============================================================
   ENTITY FORM PROPS
============================================================ */

interface EntityFormProps<T extends FieldValues> {
  fields: FieldConfig[];
  defaultValues: DefaultValues<T>;

  submitLabel?: string;
  successMessage?: string;

  backTo: string;

  extra?: React.ReactNode;

  steps?: StepConfig[];

  entityLabel?: string;

  onSubmit?: (data: T) => Promise<void> | void;

  isSubmitting?: boolean;

  // Opt out of the built-in Review step. Defaults to true so the existing
  // Car wizard (which relies on it) is completely unaffected.
  enableReview?: boolean;
}

/* ============================================================
   DEFAULT STEPS
============================================================ */

const defaultStepConfigs: StepConfig[] = [
  {
    step: 1,
    title: "User Details",
    icon: "👤",
    description: "Enter buyer/seller personal information",
  },

  {
    step: 2,
    title: "Car Information",
    icon: "🚗",
    description: "Enter the basic vehicle details",
  },

  {
    step: 3,
    title: "Pricing",
    icon: "💰",
    description: "Set purchase, sale, and expected prices",
  },

  {
    step: 4,
    title: "Inventory & Details",
    icon: "📋",
    description: "Add images, description, and notes",
  },

  {
    step: 5,
    title: "Review",
    icon: "✓",
    description: "Review all information before saving",
  },
];

/* ============================================================
   FORMAT VALUE
============================================================ */

const formatValue = (value: any, field: FieldConfig) => {
  if (isEmptyValue(value)) {
    return "Not provided";
  }

  if (field.type === "date") {
    return new Date(value).toLocaleDateString();
  }

  if (field.type === "file") {
    if (Array.isArray(value)) {
      return `${value.length} image(s)`;
    }

    if (value?.name) {
      return value.name;
    }

    return "No images";
  }

  if (
    field.name.includes("Price") ||
    field.name.includes("price") ||
    field.name.includes("Amount") ||
    field.name.includes("Money")
  ) {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  if (field.type === "number") {
    return new Intl.NumberFormat().format(Number(value));
  }

  return value;
};

/* ============================================================
   ENTITY FORM
============================================================ */

export function EntityForm<T extends FieldValues>({
  fields,
  defaultValues,
  submitLabel = "Save",
  successMessage = "Saved successfully",
  backTo,
  extra,
  steps: stepsProp,
  entityLabel = "Car",
  onSubmit: onSubmitProp,
  isSubmitting: isSubmittingProp,
  enableReview = true, // default to true – Car wizard unaffected
}: EntityFormProps<T>) {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [internalSubmitting, setInternalSubmitting] = useState(false);

  const isSubmitting = isSubmittingProp ?? internalSubmitting;

  const [isSuccess, setIsSuccess] = useState(false);

  const [uploadedImages, setUploadedImages] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = stepsProp ?? defaultStepConfigs;

  const totalSteps = steps.length;

  const currentFields = fields.filter((field) => field.step === currentStep);

  const schema = buildSchema(fields);

  /* Prevent accidental form submit */
  const submitClickedRef = useRef(false);

  const form = useForm<T>({
    resolver: zodResolver(schema) as never,
    defaultValues,
    mode: "onChange",
  });

  const {
    formState: { isValid },
    watch,
    setValue,
    trigger,
  } = form;

  const watchedValues = watch();

  /* ==========================================================
     VISIBLE FIELDS
  ========================================================== */

  const getVisibleFields = (fieldsList: FieldConfig[]) => {
    return fieldsList.filter((field) => {
      if (!field.dependsOn) {
        return true;
      }

      const dependencyValue = watchedValues[field.dependsOn as keyof T];

      return field.showWhen ? field.showWhen(dependencyValue) : false;
    });
  };

  const visibleCurrentFields = getVisibleFields(currentFields);

  /* ==========================================================
     CLEAR HIDDEN CONDITIONAL FIELDS
  ========================================================== */

  const dependencyFieldNames = Array.from(
    new Set(fields.filter((field) => field.dependsOn).map((field) => field.dependsOn as string)),
  );

  useEffect(
    () => {
      fields.forEach((field) => {
        if (!field.dependsOn) {
          return;
        }

        const dependencyValue = watchedValues[field.dependsOn as keyof T];

        const isVisible = field.showWhen ? field.showWhen(dependencyValue) : false;

        if (!isVisible) {
          const currentValue = watchedValues[field.name as keyof T];

          if (!isEmptyValue(currentValue)) {
            setValue(field.name as never, undefined as never, {
              shouldValidate: false,
            });
          }
        }
      });
    },
    dependencyFieldNames.map((name) => watchedValues[name as keyof T]),
  );

  /* ==========================================================
     FILE UPLOAD
  ========================================================== */

  const handleFileUpload = (fieldName: string, files: FileList | null) => {
    if (!files) {
      return;
    }

    const fileArray = Array.from(files);

    setUploadedImages((prev) => [...prev, ...fileArray]);

    const currentFiles = (watchedValues[fieldName as keyof T] as any[]) || [];

    setValue(fieldName as never, [...currentFiles, ...fileArray] as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /* ==========================================================
     REMOVE NEW IMAGE
  ========================================================== */

  const removeImage = (fieldName: string, index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));

    const currentFiles = (watchedValues[fieldName as keyof T] as any[]) || [];

    const existingFiles = currentFiles.filter((file) => typeof file === "string");

    const newFiles = currentFiles.filter((file) => typeof file !== "string");

    const updatedFiles = newFiles.filter((_, i) => i !== index);

    setValue(fieldName as never, [...existingFiles, ...updatedFiles] as never, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  /* ==========================================================
     EXISTING IMAGES
  ========================================================== */

  const getExistingImagePaths = (fieldName: string): string[] => {
    const value = watchedValues[fieldName as keyof T];

    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item: any) => typeof item === "string");
  };

  /* ==========================================================
     REMOVE EXISTING IMAGE
  ========================================================== */

  const removeExistingImage = (fieldName: string, path: string) => {
    const value = (watchedValues[fieldName as keyof T] as any[]) || [];

    const updated = value.filter((item) => item !== path);

    setValue(fieldName as never, updated as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /* ==========================================================
     SANITIZE PAYLOAD
  ========================================================== */

  const sanitizeCarPayload = (input: T): T => {
    const payload: any = {
      ...(input as any),
    };

    /* Exchange */

    if (payload.transactionType !== "Exchange with Bargain") {
      delete payload.exchangeCarDetails;
      delete payload.exchangeAdditionalAmount;
      delete payload.exchangeType;
      delete payload.exchangeMoneyAmount;
    } else {
      if (payload.exchangeType !== "Car Only" && payload.exchangeType !== "Car + Money") {
        payload.exchangeType = "Car Only";
      }

      if (payload.exchangeType !== "Car + Money") {
        delete payload.exchangeMoneyAmount;
      }
    }

    /* CP */

    if (payload.carType !== "CP (Custom Paid)") {
      delete payload.registrationNumber;
      delete payload.registrationCity;
    }

    /* NCP */

    if (payload.carType !== "NCP (Non-Custom Paid)") {
      delete payload.localNumber;
    }

    /* Numeric fields */

    const numericFields = [
      "year",
      "mileage",
      "engineCC",
      "salePrice",
      "purchasePrice",
      "expectedPrice",
      "exchangeAdditionalAmount",
      "exchangeMoneyAmount",
    ];

    numericFields.forEach((field) => {
      if (payload[field] === "" || payload[field] === null || payload[field] === undefined) {
        delete payload[field];
      }
    });

    return payload as T;
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const onSubmit = async (data: T) => {
    if (!submitClickedRef.current) {
      return;
    }

    submitClickedRef.current = false;

    const formData = sanitizeCarPayload(data);

    const existingImagePaths = Array.isArray(data.images)
      ? (data.images as any[]).filter((image) => typeof image === "string")
      : [];

    if (uploadedImages.length > 0 || existingImagePaths.length > 0) {
      formData.images = [...existingImagePaths, ...uploadedImages] as any;
    }

    /* Parent Add/Edit submit */

    if (onSubmitProp) {
      setInternalSubmitting(true);

      try {
        await onSubmitProp(formData);

        setIsSuccess(true);

        setTimeout(() => {
          navigate({
            to: backTo,
          });
        }, 800);
      } catch (error) {
        console.error("Error in custom onSubmit:", error);
      } finally {
        setInternalSubmitting(false);
      }

      return;
    }

    /* Default create — Cars only. Any other entity MUST pass its own
       onSubmit prop; silently falling through to carService.create() with
       non-car data was a real bug. */

    if (entityLabel !== "Car") {
      console.error(
        `EntityForm: no onSubmit handler was provided for entityLabel="${entityLabel}". ` +
          `Pass an explicit onSubmit prop — the built-in default submit only knows how to create Cars.`,
      );

      toast.error("This form isn't fully wired up yet", {
        description: `No submit handler was provided for ${entityLabel}.`,
      });

      return;
    }

    setInternalSubmitting(true);

    try {
      console.log("Sending data to API:", formData);

      const response = await carService.create(formData);

      console.log("API Response:", response);

      toast.success(successMessage, {
        description: `${entityLabel} has been added to your records.`,
        duration: 3000,
      });

      setIsSuccess(true);

      setTimeout(() => {
        navigate({
          to: backTo,
        });
      }, 800);
    } catch (error: any) {
      console.error("Error saving:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        "Failed to save. Please try again.";

      toast.error(`Failed to save ${entityLabel.toLowerCase()}`, {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setInternalSubmitting(false);
    }
  };

  /* ==========================================================
     INVALID
  ========================================================== */

  const onInvalid = (formErrors: any) => {
    console.error("Form validation failed:", formErrors);

    const firstKey = Object.keys(formErrors)[0];

    const firstMessage = formErrors[firstKey]?.message;

    toast.error("Please check the form", {
      description: firstMessage || `Issue with field: ${firstKey}`,
      duration: 4000,
    });
  };

  /* ==========================================================
     NEXT
  ========================================================== */

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      return;
    }

    const visibleFields = getVisibleFields(fields.filter((field) => field.step === currentStep));

    const currentFieldNames = visibleFields
      .filter((field) => field.type !== "file")
      .map((field) => field.name);

    const validStep = await trigger(currentFieldNames as never);

    if (validStep) {
      setCurrentStep((previous) => Math.min(previous + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1));
  };

  const handleGoToStep = (step: number) => {
    if (isSuccess) {
      return;
    }

    setCurrentStep(step);
  };

  /* ==========================================================
     ENTER KEY
  ========================================================== */

  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.tagName === "TEXTAREA") {
      return;
    }

    if (target.getAttribute("type") === "submit") {
      return;
    }

    event.preventDefault();
  };

  /* ==========================================================
     RENDER FIELD
  ========================================================== */

  const renderField = (fieldConfig: FieldConfig) => {
    if (fieldConfig.type === "file") {
      return (
        <FormField
          key={fieldConfig.name}
          control={form.control}
          name={fieldConfig.name as never}
          render={() => {
            const existingPaths = getExistingImagePaths(fieldConfig.name);

            return (
              <FormItem className="sm:col-span-2">
                <FormLabel>
                  {fieldConfig.label}

                  {!fieldConfig.optional && <span className="ml-1 text-destructive">*</span>}
                </FormLabel>

                <FormControl>
                  <div className="space-y-4">
                    {/* Upload */}

                    <div
                      className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => handleFileUpload(fieldConfig.name, event.target.files)}
                      />

                      <Upload className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />

                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, JPEG up to 10MB
                      </p>
                    </div>

                    {/* Existing images */}

                    {existingPaths.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-muted-foreground">Existing photos</p>

                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                          {existingPaths.map((path, index) => (
                            <div key={`existing-${index}`} className="group relative">
                              <img
                                src={getImageUrl(path)}
                                alt={`Existing ${index + 1}`}
                                className="h-24 w-full rounded-lg border object-cover"
                              />

                              <button
                                type="button"
                                onClick={() => removeExistingImage(fieldConfig.name, path)}
                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New images */}

                    {uploadedImages.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-muted-foreground">New photos</p>

                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="group relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Upload ${index + 1}`}
                                className="h-24 w-full rounded-lg border object-cover"
                              />

                              <button
                                type="button"
                                onClick={() => removeImage(fieldConfig.name, index)}
                                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white"
                              >
                                <X className="h-4 w-4" />
                              </button>

                              <p className="mt-1 truncate text-xs">{file.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    }

    const backendOptional =
      [
        "salePrice",
        "purchasePrice",
        "expectedPrice",
        "exchangeCarDetails",
        "exchangeAdditionalAmount",
        "exchangeMoneyAmount",
        "variant",
        "customColor",
        "description",
        "notes",
        "images",
        "dealerId",
        "dealerName",
      ].includes(fieldConfig.name) ||
      (fieldConfig.name === "registrationNumber" && watchedValues.carType !== "CP (Custom Paid)") ||
      (fieldConfig.name === "registrationCity" && watchedValues.carType !== "CP (Custom Paid)") ||
      (fieldConfig.name === "localNumber" && watchedValues.carType !== "NCP (Non-Custom Paid)");

    const isRequired =
      !backendOptional && (fieldConfig.requiredWhenVisible || !fieldConfig.optional);

    return (
      <FormField
        key={fieldConfig.name}
        control={form.control}
        name={fieldConfig.name as never}
        render={({ field }) => (
          <FormItem className={cn(fieldConfig.full && "sm:col-span-2")}>
            <FormLabel>
              {fieldConfig.label}

              {isRequired && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>

            <FormControl>
              {fieldConfig.type === "select" ? (
                <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue
                      placeholder={fieldConfig.placeholder ?? `Choose ${fieldConfig.label}`}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {(fieldConfig.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : fieldConfig.type === "combobox" ? (
                <ComboboxField
                  value={field.value as string}
                  onChange={field.onChange}
                  onOptionSelect={(selectedValue) => {
                    fieldConfig.onOptionSelect?.(selectedValue, (name, value) => {
                      setValue(name as never, value as never, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    });
                  }}
                  onClear={
                    fieldConfig.onClear
                      ? () => {
                          fieldConfig.onClear?.((name, value) => {
                            setValue(name as never, value as never, {
                              shouldValidate: true,
                              shouldDirty: true,
                              shouldTouch: true,
                            });
                          });
                        }
                      : undefined
                  }
                  options={fieldConfig.options || []}
                  placeholder={fieldConfig.placeholder}
                  label={fieldConfig.label}
                />
              ) : fieldConfig.type === "textarea" ? (
                <Textarea
                  {...field}
                  rows={6}
                  placeholder={fieldConfig.placeholder}
                  className="resize-none rounded-xl"
                />
              ) : (
                <Input
                  {...field}
                  type={
                    fieldConfig.type === "number"
                      ? "number"
                      : fieldConfig.type === "date"
                        ? "date"
                        : "text"
                  }
                  placeholder={fieldConfig.placeholder}
                  className="h-11 rounded-xl"
                />
              )}
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  /* ==========================================================
     VALIDATION HELPERS
  ========================================================== */

  const checkAllFieldsFilled = () => {
    const allVisibleFields = getVisibleFields(fields);

    const requiredFields = allVisibleFields.filter((field) => {
      if (field.requiredWhenVisible) {
        return true;
      }

      return !field.optional;
    });

    for (const field of requiredFields) {
      if (field.type === "file") {
        continue;
      }

      const value = watchedValues[field.name as keyof T];

      if (isEmptyValue(value)) {
        return false;
      }
    }

    return true;
  };

  const isMoneyAmountValid = () => {
    const exchangeType = watchedValues.exchangeType as string;

    const moneyAmount = watchedValues.exchangeMoneyAmount as number;

    if (exchangeType === "Car + Money") {
      return typeof moneyAmount === "number" && moneyAmount > 0;
    }

    return true;
  };

  /* ==========================================================
     REVIEW HELPERS
  ========================================================== */

  const getReviewValue = (name: string) => {
    return watchedValues[name as keyof T];
  };

  const getReviewField = (name: string) => {
    return fields.find((field) => field.name === name);
  };

  const hasReviewValue = (name: string) => {
    return !isEmptyValue(getReviewValue(name));
  };

  const renderReviewValue = (name: string) => {
    const value = getReviewValue(name);

    const field = getReviewField(name);

    if (isEmptyValue(value)) {
      return "Not provided";
    }

    if (!field) {
      return String(value);
    }

    return formatValue(value, field);
  };

  /* ==========================================================
     REVIEW INFO ITEM
  ========================================================== */

  const ReviewItem = ({
    label,
    name,
    full = false,
  }: {
    label: string;
    name: string;
    full?: boolean;
  }) => {
    const value = getReviewValue(name);

    return (
      <div className={cn("rounded-xl border bg-muted/20 p-4", full && "sm:col-span-2")}>
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>

        <p
          className={cn(
            "break-words text-sm font-semibold",
            isEmptyValue(value) && "font-normal text-muted-foreground",
          )}
        >
          {renderReviewValue(name)}
        </p>
      </div>
    );
  };

  /* ==========================================================
     REVIEW SECTION
  ========================================================== */

  const ReviewSection = ({
    icon,
    title,
    step,
    children,
  }: {
    icon: string;
    title: string;
    step: number;
    children: React.ReactNode;
  }) => {
    return (
      <Card className="overflow-hidden border-2">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg">
                {icon}
              </div>

              <div>
                <h4 className="font-semibold">{title}</h4>

                <p className="text-xs text-muted-foreground">Step {step}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleGoToStep(step)}
              disabled={isSuccess}
              className="gap-1"
            >
              <Edit className="h-3 w-3" />
              Edit
            </Button>
          </div>

          <div className="p-5">{children}</div>
        </CardContent>
      </Card>
    );
  };

  /* ==========================================================
     REVIEW IMAGES
  ========================================================== */

  const renderReviewImages = () => {
    const existingPaths = getExistingImagePaths("images");

    const totalImages = existingPaths.length + uploadedImages.length;

    if (totalImages === 0) {
      return (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

          <p className="text-sm font-medium">No car photos uploaded</p>

          <p className="mt-1 text-xs text-muted-foreground">You can add photos before saving.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Existing */}

        {existingPaths.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">Existing Photos</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {existingPaths.map((path, index) => (
                <div
                  key={`review-existing-${index}`}
                  className="group relative overflow-hidden rounded-xl border bg-muted"
                >
                  <img
                    src={getImageUrl(path)}
                    alt={`Car photo ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />

                  {!isSuccess && (
                    <button
                      type="button"
                      onClick={() => removeExistingImage("images", path)}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <span className="text-xs text-white">Existing photo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New */}

        {uploadedImages.length > 0 && (
          <div>
            <p className="mb-3 text-xs font-medium text-muted-foreground">New Photos</p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {uploadedImages.map((file, index) => (
                <div
                  key={`review-new-${index}`}
                  className="group relative overflow-hidden rounded-xl border bg-muted"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New car photo ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />

                  {!isSuccess && (
                    <button
                      type="button"
                      onClick={() => removeImage("images", index)}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                    <span className="block truncate text-xs text-white">{file.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-primary/5 p-3 text-sm">
          <strong>{totalImages}</strong> {totalImages === 1 ? "photo" : "photos"} selected
        </div>
      </div>
    );
  };

  /* ==========================================================
     REVIEW
  ========================================================== */

  const renderReview = () => {
    const allFilled = isValid && checkAllFieldsFilled();

    const moneyValid = isMoneyAmountValid();

    const hasMoneyError = !moneyValid;

    return (
      <div className="space-y-6">
        {/* Header */}

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Eye className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-bold">Review Car Information</h3>

            <p className="text-sm text-muted-foreground">Check all car details before saving.</p>
          </div>

          {isSuccess && (
            <span className="ml-auto rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
              ✓ Saved Successfully
            </span>
          )}
        </div>

        {/* =====================================================
            CAR OVERVIEW
        ===================================================== */}

        <ReviewSection icon="🚗" title="Car Overview" step={2}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReviewItem label="Company" name="company" />

            <ReviewItem label="Model" name="model" />

            {hasReviewValue("variant") && <ReviewItem label="Variant" name="variant" />}

            <ReviewItem label="Year" name="year" />

            <ReviewItem label="Color" name="color" />

            {hasReviewValue("customColor") && (
              <ReviewItem label="Custom Color" name="customColor" />
            )}

            <ReviewItem label="Condition" name="condition" />

            <ReviewItem label="Car Type" name="carType" />
          </div>
        </ReviewSection>

        {/* =====================================================
            VEHICLE DETAILS
        ===================================================== */}

        <ReviewSection icon="🔧" title="Vehicle Details" step={2}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReviewItem label="Chassis Number" name="chassisNumber" />

            <ReviewItem label="Engine Number" name="engineNumber" />

            <ReviewItem label="Engine CC" name="engineCC" />

            <ReviewItem label="Mileage" name="mileage" />

            <ReviewItem label="Fuel Type" name="fuelType" />

            <ReviewItem label="Transmission" name="transmission" />
          </div>
        </ReviewSection>

        {/* =====================================================
            REGISTRATION
        ===================================================== */}

        <ReviewSection icon="📄" title="Registration Details" step={2}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReviewItem label="Car Type" name="carType" />

            {hasReviewValue("registrationCity") && (
              <ReviewItem label="Registration City" name="registrationCity" />
            )}

            {hasReviewValue("registrationNumber") && (
              <ReviewItem label="Registration Number" name="registrationNumber" />
            )}

            {hasReviewValue("localNumber") && (
              <ReviewItem label="Local Number" name="localNumber" />
            )}
          </div>
        </ReviewSection>

        {/* =====================================================
            USER / DEALER
        ===================================================== */}

        <ReviewSection icon="👤" title="Dealer / Owner Information" step={1}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReviewItem label="Full Name" name="userName" />

            <ReviewItem label="Phone Number" name="userPhone" />

            <ReviewItem label="CNIC" name="userCnic" />

            {hasReviewValue("dealerName") && <ReviewItem label="Dealer Name" name="dealerName" />}

            <ReviewItem label="Address" name="userAddress" full />
          </div>
        </ReviewSection>

        {/* =====================================================
            PRICING
        ===================================================== */}

        <ReviewSection icon="💰" title="Pricing & Transaction" step={3}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {hasReviewValue("salePrice") && <ReviewItem label="Sale Price" name="salePrice" />}

            <ReviewItem label="Transaction Type" name="transactionType" />

            {watchedValues.transactionType === "Exchange with Bargain" && (
              <>
                <ReviewItem label="Exchange Type" name="exchangeType" />

                {hasReviewValue("exchangeAdditionalAmount") && (
                  <ReviewItem label="Additional Amount" name="exchangeAdditionalAmount" />
                )}

                {watchedValues.exchangeType === "Car + Money" && (
                  <ReviewItem label="Money Amount" name="exchangeMoneyAmount" />
                )}

                {hasReviewValue("exchangeCarDetails") && (
                  <ReviewItem label="Exchange Car Details" name="exchangeCarDetails" full />
                )}
              </>
            )}
          </div>

          {hasMoneyError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                ⚠️ Money amount is required when Car + Money is selected.
              </p>
            </div>
          )}
        </ReviewSection>

        {/* =====================================================
            INVENTORY
        ===================================================== */}

        <ReviewSection icon="📦" title="Inventory Information" step={4}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ReviewItem label="Status" name="status" />

            <ReviewItem label="Date Added" name="dateAdded" />
          </div>
        </ReviewSection>

        {/* =====================================================
            PHOTOS
        ===================================================== */}

        <ReviewSection icon="🖼️" title="Car Photos" step={4}>
          {renderReviewImages()}
        </ReviewSection>

        {/* =====================================================
            DESCRIPTION / NOTES
        ===================================================== */}

        {(hasReviewValue("description") || hasReviewValue("notes")) && (
          <ReviewSection icon="📝" title="Additional Information" step={4}>
            <div className="space-y-4">
              {hasReviewValue("description") && (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Description</p>

                  <p className="whitespace-pre-wrap text-sm">{getReviewValue("description")}</p>
                </div>
              )}

              {hasReviewValue("notes") && (
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Notes</p>

                  <p className="whitespace-pre-wrap text-sm">{getReviewValue("notes")}</p>
                </div>
              )}
            </div>
          </ReviewSection>
        )}

        {/* =====================================================
            STATUS
        ===================================================== */}

        {isSuccess ? (
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />

                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  ✅ {entityLabel} has been successfully saved! Redirecting...
                </span>
              </div>
            </CardContent>
          </Card>
        ) : hasMoneyError ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                ⚠️ Please enter a valid money amount before saving.
              </p>
            </CardContent>
          </Card>
        ) : allFilled ? (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-blue-600" />

                <span className="text-sm text-blue-700 dark:text-blue-300">
                  This is a preview only. Nothing has been saved yet. Click{" "}
                  <strong>"{submitLabel}"</strong> below to save.
                </span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                ⚠️ Some required fields are missing. Click Edit on the relevant section to complete
                them.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  /* ==========================================================
     CURRENT FIELDS
  ========================================================== */

  const visibleFields = getVisibleFields(fields.filter((field) => field.step === currentStep));

  const canSubmit = isValid;

  // Review is opt-in now. When enableReview is false, the last step just
  // renders its fields + a Submit button like every other step — no
  // separate summary page.
  const showReview = enableReview && currentStep === totalSteps && totalSteps > 1;

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        onKeyDown={handleFormKeyDown}
        className="space-y-6"
      >
        {/* ====================================================
            PROGRESS
        ==================================================== */}

        {totalSteps > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const stepNumber = step.step;

                const isComplete = stepNumber < currentStep;

                const isCurrent = stepNumber === currentStep;

                return (
                  <div key={stepNumber} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (stepNumber <= currentStep && !isSuccess) {
                            setCurrentStep(stepNumber);
                          }
                        }}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                          isComplete &&
                            "cursor-pointer border-primary bg-primary text-primary-foreground hover:ring-2 hover:ring-primary/30",
                          isCurrent &&
                            "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                          !isComplete &&
                            !isCurrent &&
                            "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60",
                          (stepNumber > currentStep || isSuccess) &&
                            "cursor-not-allowed opacity-50",
                        )}
                        disabled={stepNumber > currentStep || isSuccess}
                      >
                        {isComplete ? <Check className="h-5 w-5" /> : step.icon}
                      </button>

                      <span className="mt-2 hidden text-center text-xs font-medium sm:block">
                        {step.title}
                      </span>
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "mx-2 h-[2px] flex-1",
                          stepNumber < currentStep ? "bg-primary" : "bg-muted-foreground/20",
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">
                {steps.find((step) => step.step === currentStep)?.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {steps.find((step) => step.step === currentStep)?.description}
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            FORM / REVIEW
        ==================================================== */}

        {showReview ? (
          renderReview()
        ) : (
          <div className="card-soft grid gap-5 p-5 sm:grid-cols-2 md:p-6">
            {visibleFields.map(renderField)}
          </div>
        )}

        {extra}

        {/* ====================================================
            BUTTONS
        ==================================================== */}

        <div className="flex items-center justify-between gap-3">
          {totalSteps > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isSuccess}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {totalSteps > 1 && (
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            )}

            {isSuccess && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600">
                ✓ Saved
              </span>
            )}
          </div>

          {/* NEXT */}

          {currentStep < totalSteps && totalSteps > 1 ? (
            <Button type="button" className="rounded-xl" onClick={handleNext} disabled={isSuccess}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            /* SAVE / UPDATE */
            <Button
              type="submit"
              className="rounded-xl"
              onClick={() => {
                submitClickedRef.current = true;
              }}
              disabled={!canSubmit || isSubmitting || isSuccess}
              variant={isSuccess ? "outline" : "default"}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">⏳</span>
                  Saving...
                </>
              ) : isSuccess ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          )}
        </div>

        {/* ====================================================
            CANCEL
        ==================================================== */}

        {!isSuccess && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-muted-foreground"
              onClick={() => {
                if (confirm("Are you sure you want to cancel? All entered data will be lost.")) {
                  navigate({
                    to: backTo,
                  });
                }
              }}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {isSuccess && (
          <div className="mt-4 flex justify-center">
            <p className="text-sm text-muted-foreground">
              ✅ {entityLabel} saved successfully. Redirecting...
            </p>
          </div>
        )}
      </form>
    </Form>
  );
}