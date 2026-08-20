import { useEffect, useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExchangeForm, type ExchangeFormValues } from "@/components/shared/ExchangeForm";
import { exchangeService } from "@/services/exchangeService";

export const Route = createFileRoute("/exchanges/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Exchange — Car Bargain Manager" },
      {
        name: "description",
        content: "Update the vehicles, values and adjustments of an exchange deal.",
      },
      { property: "og:title", content: "Edit Exchange — Car Bargain Manager" },
      { property: "og:description", content: "Change saved exchange details." },
    ],
  }),
  component: EditExchange,
});

function EditExchange() {
  const { id } = useParams({ from: "/exchanges/$id/edit" });
  const [ex, setEx] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    exchangeService
      .getById(id)
      .then((res) => setEx(res?.data))
      .catch((err) => {
        console.error("Failed to load exchange:", err);
        toast.error("Failed to load exchange");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return null;
  if (!ex) return <EmptyState title="Exchange not found" />;

  // Build default values, including all payment and source fields
  const defaultValues: Partial<ExchangeFormValues> = {
    // Showroom car: preserve source, vehicle fields, and owner (dealer or Customer 1)
    showroomCar: {
      source: ex.showroomCar?.source || "stock",
      carId: ex.showroomCar?.carId?._id || ex.showroomCar?.carId || "",
      company: ex.showroomCar?.company || "",
      model: ex.showroomCar?.model || "",
      year: ex.showroomCar?.year || "",
      registrationNumber: ex.showroomCar?.registrationNumber || "",
      carType: ex.showroomCar?.carType || "NCP (Non-Custom Paid)",
      registrationCity: ex.showroomCar?.registrationCity || "",
      localNumber: ex.showroomCar?.localNumber || "",
      chassisNumber: ex.showroomCar?.chassisNumber || "",
      mileage: ex.showroomCar?.mileage || "",
      condition: ex.showroomCar?.condition || "Used",
      actualValue: ex.showroomCar?.actualValue || "",
      salePrice: ex.showroomCar?.salePrice || "",
      value: ex.showroomCar?.value || "",
      dealerName: ex.showroomCar?.dealerName || "",
      owner: {
        name: ex.showroomCar?.owner?.name || "",
        cnic: ex.showroomCar?.owner?.cnic || "",
        phone: ex.showroomCar?.owner?.phone || "",
        address: ex.showroomCar?.owner?.address || "",
      },
    },

    // Customer car: vehicle fields + owner (the customer, or Customer 2 in manual mode)
    customerCar: {
      company: ex.customerCar?.company || "",
      model: ex.customerCar?.model || "",
      year: ex.customerCar?.year || "",
      carType: ex.customerCar?.carType || "NCP (Non-Custom Paid)",
      registrationNumber: ex.customerCar?.registrationNumber || "",
      registrationCity: ex.customerCar?.registrationCity || "",
      localNumber: ex.customerCar?.localNumber || "",
      chassisNumber: ex.customerCar?.chassisNumber || "",
      mileage: ex.customerCar?.mileage || "",
      condition: ex.customerCar?.condition || "Used",
      actualValue: ex.customerCar?.actualValue || "",
      value: ex.customerCar?.value || "",
      owner: {
        name: ex.customerCar?.owner?.name || "",
        cnic: ex.customerCar?.owner?.cnic || "",
        phone: ex.customerCar?.owner?.phone || "",
        address: ex.customerCar?.owner?.address || "",
      },
    },

    // Payment tracking fields
    amountReceivedFromCustomer: ex.amountReceivedFromCustomer || "",
    amountPaidToCustomer: ex.amountPaidToCustomer || "",

    adjustments: ex.adjustments || [],
    notes: ex.notes || "",
    date: ex.date ? new Date(ex.date).toISOString().slice(0, 10) : "",
    status: ex.status || "Pending",
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Edit Exchange"
        subtitle={`${ex.dealNumber} · ${ex.customerCar?.owner?.name || ""}`}
      />
      <ExchangeForm mode="edit" exchangeId={ex._id} defaultValues={defaultValues} />
    </div>
  );
}
