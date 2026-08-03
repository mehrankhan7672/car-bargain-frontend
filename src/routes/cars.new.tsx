import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm } from "@/components/shared/EntityForm";
import { carFields } from "@/data/field-configs";

export const Route = createFileRoute("/cars/new")({
  head: () => ({
    meta: [
      { title: "Add Car — Car Bargain Manager" },
      { name: "description", content: "Add a new vehicle to the showroom record with price, condition and photos." },
      { property: "og:title", content: "Add Car — Car Bargain Manager" },
      { property: "og:description", content: "Enter car details and save it into your showroom stock." },
    ],
  }),
  component: AddCar,
});

function AddCar() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Car" subtitle="Fill the details of the new vehicle" />
      <EntityForm
        fields={carFields}
        backTo="/cars"
        submitLabel="Save Car"
        successMessage="Car added"
        defaultValues={{
          name: "",
          model: "",
          year: "",
          regNo: "",
          color: "",
          price: "",
          condition: "",
          status: "Available",
          images: "",
        }}
      />
    </div>
  );
}
