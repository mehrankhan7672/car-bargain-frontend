import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { carFields } from "@/data/field-configs";
import { cars } from "@/data/dummy";

export const Route = createFileRoute("/cars/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit Car — Car Bargain Manager" },
      { name: "description", content: "Update vehicle price, condition, status and photos." },
      { property: "og:title", content: "Edit Car — Car Bargain Manager" },
      { property: "og:description", content: "Change the saved details of a showroom vehicle." },
    ],
  }),
  component: EditCar,
});

function EditCar() {
  const { id } = useParams({ from: "/cars/$id/edit" });
  const car = cars.find((c) => c.id === id);

  if (!car) return <EmptyState title="Car not found" description="This vehicle no longer exists." />;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Car" subtitle={`${car.name} ${car.model} · ${car.regNo}`} />
      <EntityForm
        fields={carFields}
        backTo="/cars"
        submitLabel="Update Car"
        successMessage="Car updated"
        defaultValues={{
          name: car.name,
          model: car.model,
          year: String(car.year),
          regNo: car.regNo,
          color: car.color,
          price: String(car.price),
          condition: car.condition,
          status: car.status,
          images: car.images.join("\n"),
        }}
      />
    </div>
  );
}
