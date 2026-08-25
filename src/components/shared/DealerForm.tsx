// src/components/shared/DealerForm.tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

export type DealerFormValues = {
  name: string;
  phone: string;
  cnic: string;
  address: string;
  notes: string;
  formLanguage: "en" | "ur";
};

const COPY = {
  en: {
    languageLabel: "Form Language",
    name: "Dealer Name",
    namePlaceholder: "Enter dealer name",
    phone: "Contact Number",
    phonePlaceholder: "03000000513",
    cnic: "CNIC",
    cnicPlaceholder: "1234232156786",
    address: "Address",
    addressPlaceholder: "Enter full address",
    notes: "Notes",
    notesPlaceholder: "Any additional notes about the dealer",
    optional: "(optional)",
    cancel: "Cancel",
    required: "This field is required",
  },
  ur: {
    languageLabel: "فارم کی زبان",
    name: "ڈیلر کا نام",
    namePlaceholder: "ڈیلر کا نام درج کریں",
    phone: "رابطہ نمبر",
    phonePlaceholder: "03000000513",
    cnic: "شناختی کارڈ نمبر",
    cnicPlaceholder: "1234232156786",
    address: "پتہ",
    addressPlaceholder: "مکمل پتہ درج کریں",
    notes: "نوٹس",
    notesPlaceholder: "ڈیلر کے بارے میں کوئی اضافی نوٹس",
    optional: "(اختیاری)",
    cancel: "منسوخ کریں",
    required: "یہ خانہ ضروری ہے",
  },
} as const;

export function DealerForm({
  mode,
  defaultValues,
  submitLabel,
  onSubmit,
}: {
  mode: "new" | "edit";
  defaultValues?: Partial<DealerFormValues>;
  submitLabel: string;
  onSubmit: (data: DealerFormValues) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<"en" | "ur">(defaultValues?.formLanguage || "en");
  const [name, setName] = useState(defaultValues?.name || "");
  const [phone, setPhone] = useState(defaultValues?.phone || "");
  const [cnic, setCnic] = useState(defaultValues?.cnic || "");
  const [address, setAddress] = useState(defaultValues?.address || "");
  const [notes, setNotes] = useState(defaultValues?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const t = COPY[language];
  const isUrdu = language === "ur";

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t.required;
    if (!phone.trim()) next.phone = t.required;
    if (!cnic.trim()) next.cnic = t.required;
    if (!address.trim()) next.address = t.required;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ name, phone, cnic, address, notes, formLanguage: language });
    } finally {
      setSubmitting(false);
    }
  };

  const textFieldDir = isUrdu ? "rtl" : "ltr";
  const textFieldAlign = isUrdu ? "text-right" : "text-left";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Language toggle */}
      <div className="card-soft flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.languageLabel}</span>
        </div>
        <div className="inline-flex rounded-xl border border-border p-1">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              !isUrdu ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("ur")}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              isUrdu ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            اردو
          </button>
        </div>
      </div>

      <div className="card-soft grid gap-5 p-5 sm:grid-cols-2 md:p-6" dir={isUrdu ? "rtl" : "ltr"}>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>
            {t.name} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            dir={textFieldDir}
            className={cn("h-11 rounded-xl", textFieldAlign)}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>
            {t.phone} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.phonePlaceholder}
            dir="ltr"
            className="h-11 rounded-xl text-left"
          />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>
            {t.cnic} <span className="text-destructive">*</span>
          </Label>
          <Input
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            placeholder={t.cnicPlaceholder}
            dir="ltr"
            className="h-11 rounded-xl text-left"
          />
          {errors.cnic && <p className="text-sm text-destructive">{errors.cnic}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>
            {t.address} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.addressPlaceholder}
            dir={textFieldDir}
            className={cn("resize-none rounded-xl", textFieldAlign)}
            rows={3}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>
            {t.notes} <span className="text-muted-foreground font-normal">{t.optional}</span>
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            dir={textFieldDir}
            className={cn("resize-none rounded-xl", textFieldAlign)}
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          className="rounded-xl text-muted-foreground"
          onClick={() => navigate({ to: "/dealers" })}
        >
          {t.cancel}
        </Button>
        <Button type="submit" className="rounded-xl" disabled={submitting}>
          {submitting ? "..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
