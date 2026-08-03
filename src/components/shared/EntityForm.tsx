import { useForm, type DefaultValues, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: string[];
  placeholder?: string;
  optional?: boolean;
  full?: boolean;
};

export function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of fields) {
    if (f.type === "number") {
      const base = z.coerce.number({ invalid_type_error: `${f.label} must be a number` });
      shape[f.name] = f.optional ? base.optional() : base.min(1, `${f.label} is required`);
    } else {
      const base = z.string();
      shape[f.name] = f.optional ? base.optional() : base.min(1, `${f.label} is required`);
    }
  }
  return z.object(shape);
}

export function EntityForm<T extends FieldValues>({
  fields,
  defaultValues,
  submitLabel = "Save",
  successMessage = "Saved successfully",
  backTo,
  extra,
}: {
  fields: FieldConfig[];
  defaultValues: DefaultValues<T>;
  submitLabel?: string;
  successMessage?: string;
  backTo: string;
  extra?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const schema = buildSchema(fields);
  const form = useForm<T>({
    resolver: zodResolver(schema) as never,
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = () => {
    toast.success(successMessage, { description: "Demo mode — data is not saved permanently." });
    navigate({ to: backTo });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="card-soft grid gap-5 p-5 sm:grid-cols-2 md:p-6">
          {fields.map((f) => (
            <FormField
              key={f.name}
              control={form.control}
              name={f.name as never}
              render={({ field }) => (
                <FormItem className={f.full ? "sm:col-span-2" : undefined}>
                  <FormLabel>{f.label}</FormLabel>
                  <FormControl>
                    {f.type === "select" ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <SelectTrigger className="h-11 rounded-xl">
                          <SelectValue placeholder={f.placeholder ?? `Choose ${f.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(f.options ?? []).map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : f.type === "textarea" ? (
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder={f.placeholder}
                        className="rounded-xl"
                      />
                    ) : (
                      <Input
                        {...field}
                        type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                        placeholder={f.placeholder}
                        className="h-11 rounded-xl"
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        {extra}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" className="rounded-xl">
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate({ to: backTo })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
