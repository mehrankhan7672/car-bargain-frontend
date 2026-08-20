// routes/cars.$id.edit.tsx

import { useState, useEffect } from "react";
import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm, type StepConfig } from "@/components/shared/EntityForm";

import { EmptyState } from "@/components/shared/EmptyState";
import { carFields } from "@/data/field-configs";
import { carService } from "@/services/carService";
import { dealerService } from "@/services/dealerService";

export const Route = createFileRoute("/cars/$id/edit")({
  component: EditCar,
});

// ============================================================
// STEPS
// ============================================================

const carSteps: StepConfig[] = [
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
    description: "Set sale price and exchange details",
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

// ============================================================
// DEALER INTERFACE
// ============================================================

interface Dealer {
  _id: string;
  id: string;
  name: string;

  phone?: string;
  cnic?: string;
  address?: string;

  userPhone?: string;
  userCnic?: string;
  userAddress?: string;
}

// ============================================================
// EXCHANGE CAR INTERFACE
// ============================================================

interface ExchangeCar {
  _id: string;

  userName?: string;

  company?: string;
  model?: string;
  variant?: string;

  year?: number;

  localNumber?: string;
  registrationNumber?: string;
  registrationCity?: string;

  color?: string;
  condition?: string;
  carType?: string;

  salePrice?: number;

  status?: string;
}

// ============================================================
// COMPONENT
// ============================================================

function EditCar() {
  const { id } = useParams({
    from: "/cars/$id/edit",
  });

  const navigate = useNavigate();

  const [car, setCar] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  const [dealers, setDealers] = useState<Dealer[]>([]);

  const [exchangeCars, setExchangeCars] = useState<ExchangeCar[]>([]);

  const [exchangeCarsLoading, setExchangeCarsLoading] = useState(true);

  // ============================================================
  // LOAD CAR + DEALERS + EXCHANGE CARS
  // ============================================================

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setExchangeCarsLoading(true);

      const [carResponse, dealersResponse, carsResponse] = await Promise.all([
        carService.getById(id),

        dealerService.getAll({
          limit: 100,
        }),

        carService.getAll({
          limit: 100,
        }),
      ]);

      // ========================================================
      // CURRENT CAR
      // ========================================================

      const currentCar = carResponse.data;

      console.log("Current car loaded:", currentCar);

      setCar(currentCar);

      // ========================================================
      // DEALERS
      // ========================================================

      const dealerList = dealersResponse.data.map((dealer: any) => ({
        _id: dealer._id || dealer.id,

        id: dealer._id || dealer.id,

        name: dealer.name,

        phone: dealer.phone ?? dealer.userPhone ?? "",

        cnic: dealer.cnic ?? dealer.userCnic ?? "",

        address: dealer.address ?? dealer.userAddress ?? "",
      }));

      console.log("Dealers loaded for edit:", dealerList);

      setDealers(dealerList);

      // ========================================================
      // EXCHANGE CARS
      // ========================================================

      console.log("All cars from API:", carsResponse.data);

      // --------------------------------------------------------
      // ONLY AVAILABLE CARS
      //
      // Reserved ❌
      // Sold ❌
      // Available ✅
      // --------------------------------------------------------

      const availableCars = (carsResponse.data || []).filter((exchangeCar: ExchangeCar) => {
        const exchangeCarId = String(exchangeCar._id);

        // Don't allow the car currently being edited
        // to be selected as its own exchange car.
        if (exchangeCarId === String(id)) {
          return false;
        }

        return exchangeCar.status === "Available";
      });

      console.log("Available cars for exchange:", availableCars);

      setExchangeCars(availableCars);
    } catch (error) {
      console.error("Error fetching data:", error);

      toast.error("Failed to load data");

      setExchangeCars([]);
    } finally {
      setLoading(false);
      setExchangeCarsLoading(false);
    }
  };

  // ============================================================
  // FORMAT EXCHANGE CAR
  // ============================================================
  //
  // Same formatting as Add Car.
  //
  // Example:
  //
  // Mini | Iure cumque vel nihi | 1970 |
  // No Variant | Lime | Used |
  // NCP (Non-Custom Paid) |
  // Local: fdf454545 |
  // PKR 120,000
  //
  // ============================================================

  const formatExchangeCar = (exchangeCar: ExchangeCar) => {
    const company = exchangeCar.company || "Unknown Company";

    const model = exchangeCar.model || "Unknown Model";

    const variant = exchangeCar.variant || "No Variant";

    const year = exchangeCar.year || "No Year";

    const color = exchangeCar.color || "No Color";

    const condition = exchangeCar.condition || "No Condition";

    const carType = exchangeCar.carType || "No Car Type";

    // --------------------------------------------------------
    // REGISTRATION
    // --------------------------------------------------------

    let registration = "No Registration";

    if (exchangeCar.registrationNumber) {
      registration = `Registration: ${exchangeCar.registrationNumber}`;

      if (exchangeCar.registrationCity) {
        registration += ` (${exchangeCar.registrationCity})`;
      }
    } else if (exchangeCar.localNumber) {
      registration = `Local: ${exchangeCar.localNumber}`;
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    const price =
      exchangeCar.salePrice !== undefined && exchangeCar.salePrice !== null
        ? `PKR ${Number(exchangeCar.salePrice).toLocaleString()}`
        : "Price not available";

    // --------------------------------------------------------
    // FINAL VALUE
    // --------------------------------------------------------

    return [company, model, variant, year, color, condition, carType, registration, price].join(
      " | ",
    );
  };

  // ============================================================
  // UPDATED CAR FIELDS
  // ============================================================

  const updatedFields = carFields.map((field) => {
    // ========================================================
    // USER NAME / DEALER
    // ========================================================

    if (field.name === "userName") {
      const dealerNames = dealers.map((dealer) => dealer.name);

      // ------------------------------------------------------
      // CURRENT SAVED NAME
      // ------------------------------------------------------

      const currentValue = String(car?.userName ?? car?.dealerName ?? "").trim();

      // ------------------------------------------------------
      // KEEP CURRENT NAME IN OPTIONS
      // ------------------------------------------------------

      const options =
        currentValue &&
        !dealerNames.some((name) => name.trim().toLowerCase() === currentValue.toLowerCase())
          ? [currentValue, ...dealerNames]
          : dealerNames;

      return {
        ...field,

        options,

        // ====================================================
        // DEALER SELECT
        // ====================================================

        onOptionSelect: (
          selectedName: string,
          setFieldValue: (name: string, value: any) => void,
        ) => {
          const selectedDealer = dealers.find(
            (dealer) => dealer.name.trim().toLowerCase() === selectedName.trim().toLowerCase(),
          );

          if (!selectedDealer) {
            return;
          }

          console.log("Selected dealer:", selectedDealer);

          // --------------------------------------------------
          // DEALER ID
          // --------------------------------------------------

          setFieldValue("dealerId", selectedDealer._id || selectedDealer.id);

          // --------------------------------------------------
          // DEALER NAME
          // --------------------------------------------------

          setFieldValue("dealerName", selectedDealer.name);

          // --------------------------------------------------
          // PHONE
          // --------------------------------------------------

          setFieldValue("userPhone", selectedDealer.phone ?? selectedDealer.userPhone ?? "");

          // --------------------------------------------------
          // CNIC
          // --------------------------------------------------

          setFieldValue("userCnic", selectedDealer.cnic ?? selectedDealer.userCnic ?? "");

          // --------------------------------------------------
          // ADDRESS
          // --------------------------------------------------

          setFieldValue("userAddress", selectedDealer.address ?? selectedDealer.userAddress ?? "");
        },

        // ====================================================
        // CLEAR DEALER
        // ====================================================

        onClear: (setFieldValue: (name: string, value: any) => void) => {
          console.log("Clearing selected dealer");

          setFieldValue("userName", "");

          setFieldValue("dealerId", "");

          setFieldValue("dealerName", "");

          setFieldValue("userPhone", "");

          setFieldValue("userCnic", "");

          setFieldValue("userAddress", "");
        },

        placeholder: loading ? "Loading dealers..." : "Type name or select from dealers...",
      };
    }

    // ========================================================
    // EXCHANGE CAR DETAILS
    // ========================================================

    if (field.name === "exchangeCarDetails") {
      const currentExchangeCar = String(car?.exchangeCarDetails ?? "").trim();

      // ------------------------------------------------------
      // AVAILABLE CAR OPTIONS
      // ------------------------------------------------------

      const exchangeCarOptions = exchangeCars.map((exchangeCar) => formatExchangeCar(exchangeCar));

      // ------------------------------------------------------
      // KEEP SAVED EXCHANGE CAR VISIBLE
      //
      // If the previously selected exchange car is no longer
      // Available, we still show it in the edit dropdown.
      // ------------------------------------------------------

      const currentExchangeCarExists = exchangeCarOptions.some(
        (option) => option.trim().toLowerCase() === currentExchangeCar.toLowerCase(),
      );

      const options =
        currentExchangeCar && !currentExchangeCarExists
          ? [currentExchangeCar, ...exchangeCarOptions]
          : exchangeCarOptions;

      return {
        ...field,

        // ----------------------------------------------------
        // ONLY AVAILABLE CARS
        // ----------------------------------------------------

        options,

        // ----------------------------------------------------
        // SELECT EXCHANGE CAR
        //
        // FIX: this previously only set exchangeCarDetails (the display
        // string) and never touched exchangeCarId — exactly the same bug
        // that was fixed in cars.new.tsx. The backend's
        // validateExchangeCarId() requires a real exchangeCarId whenever
        // transactionType is "Exchange with Bargain", so saving an edited
        // car with a newly-picked exchange car always failed with
        // "Exchange car ID is required for an exchange transaction".
        //
        // Fix: reverse-lookup the actual ExchangeCar object behind the
        // selected formatted label, then set both exchangeCarDetails (for
        // display) and exchangeCarId (for the backend) together.
        // ----------------------------------------------------

        onOptionSelect: (
          selectedValue: string,
          setFieldValue: (name: string, value: any) => void,
        ) => {
          const selectedCar = exchangeCars.find(
            (exchangeCar) => formatExchangeCar(exchangeCar) === selectedValue,
          );

          if (!selectedCar) {
            console.warn("Selected exchange car not found in current list:", selectedValue);
            setFieldValue("exchangeCarDetails", selectedValue);
            setFieldValue("exchangeCarId", "");
            return;
          }

          console.log("Selected exchange car:", selectedCar);

          setFieldValue("exchangeCarDetails", selectedValue);
          setFieldValue("exchangeCarId", selectedCar._id);
        },

        // ----------------------------------------------------
        // CLEAR EXCHANGE CAR
        //
        // FIX: new — clearing the picker must also clear exchangeCarId,
        // otherwise a stale ID from the previously saved exchange car (or
        // an earlier selection in this same editing session) could still
        // get submitted even after the visible field was cleared.
        // ----------------------------------------------------

        onClear: (setFieldValue: (name: string, value: any) => void) => {
          setFieldValue("exchangeCarDetails", "");
          setFieldValue("exchangeCarId", "");
        },

        // ----------------------------------------------------
        // PLACEHOLDER
        // ----------------------------------------------------

        placeholder: exchangeCarsLoading
          ? "Loading available cars..."
          : exchangeCars.length === 0
            ? "No available cars"
            : "Select available car...",
      };
    }

    return field;
  });

  // ============================================================
  // SANITIZE PAYLOAD
  // ============================================================

  const sanitizeCarPayload = (input: any) => {
    const payload = {
      ...input,
    };

    // ==========================================================
    // TRANSACTION TYPE
    // ==========================================================

    if (payload.transactionType !== "Exchange with Bargain") {
      delete payload.exchangeCarDetails;

      delete payload.exchangeAdditionalAmount;

      delete payload.exchangeType;

      delete payload.exchangeMoneyAmount;

      // FIX: exchangeCarId wasn't cleaned up here before — switching an
      // edited car back to "Direct Purchase" could still submit a leftover
      // exchangeCarId from before, alongside the other exchange fields
      // that were already (correctly) being deleted.
      delete payload.exchangeCarId;
    } else {
      // Make sure exchangeType is always valid

      if (payload.exchangeType !== "Car Only" && payload.exchangeType !== "Car + Money") {
        payload.exchangeType = "Car Only";
      }

      // Money only exists for Car + Money

      if (payload.exchangeType !== "Car + Money") {
        delete payload.exchangeMoneyAmount;
      }
    }

    // ==========================================================
    // CAR TYPE
    // ==========================================================

    if (payload.carType !== "CP (Custom Paid)") {
      delete payload.registrationNumber;

      delete payload.registrationCity;
    }

    if (payload.carType !== "NCP (Non-Custom Paid)") {
      delete payload.localNumber;
    }

    // ==========================================================
    // NUMERIC FIELDS
    // ==========================================================

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

    return payload;
  };

  // ============================================================
  // SUBMIT UPDATE
  // ============================================================

  const handleSubmit = async (data: any) => {
    try {
      const normalizedUserName = String(data.userName ?? "")
        .trim()
        .toLowerCase();

      // --------------------------------------------------------
      // FIND SELECTED DEALER
      // --------------------------------------------------------

      const selectedDealer = dealers.find(
        (dealer) =>
          dealer.name.trim().toLowerCase() === normalizedUserName ||
          dealer._id === data.dealerId ||
          dealer.id === data.dealerId,
      );

      // --------------------------------------------------------
      // PREPARE PAYLOAD
      // --------------------------------------------------------

      const submitData = sanitizeCarPayload({
        ...data,

        dealerId: selectedDealer?._id || data.dealerId || null,

        dealerName: selectedDealer?.name || data.dealerName || data.userName,

        // ----------------------------------------------------
        // NUMBERS
        // ----------------------------------------------------

        year:
          data.year !== "" && data.year !== undefined && data.year !== null
            ? Number(data.year)
            : undefined,

        mileage:
          data.mileage !== "" && data.mileage !== undefined && data.mileage !== null
            ? Number(data.mileage)
            : undefined,

        engineCC:
          data.engineCC !== "" && data.engineCC !== undefined && data.engineCC !== null
            ? Number(data.engineCC)
            : undefined,

        salePrice:
          data.salePrice !== "" && data.salePrice !== undefined && data.salePrice !== null
            ? Number(data.salePrice)
            : undefined,

        exchangeAdditionalAmount:
          data.exchangeAdditionalAmount !== "" &&
          data.exchangeAdditionalAmount !== undefined &&
          data.exchangeAdditionalAmount !== null
            ? Number(data.exchangeAdditionalAmount)
            : undefined,

        exchangeMoneyAmount:
          data.exchangeMoneyAmount !== "" &&
          data.exchangeMoneyAmount !== undefined &&
          data.exchangeMoneyAmount !== null
            ? Number(data.exchangeMoneyAmount)
            : undefined,
      });

      console.log("Updating car with data:", submitData);

      // ========================================================
      // API UPDATE
      // ========================================================

      await carService.update(id, submitData);

      toast.success("Car updated successfully", {
        description: `${submitData.company} ${submitData.model} has been updated.`,
      });

      navigate({
        to: "/cars",
      });
    } catch (error: any) {
      console.error("Error updating car:", error);

      // ========================================================
      // BACKEND VALIDATION ERRORS
      // ========================================================

      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        const messages = Array.isArray(backendErrors)
          ? backendErrors
          : Object.values(backendErrors).flat();

        toast.error("Validation error", {
          description:
            messages.length > 0 ? messages.join(", ") : "Please check your input and try again.",
          duration: 5000,
        });

        return;
      }

      // ========================================================
      // BACKEND MESSAGE
      // ========================================================

      if (error.response?.data?.message) {
        toast.error("Failed to update car", {
          description: error.response.data.message,
        });

        return;
      }

      // ========================================================
      // UNKNOWN ERROR
      // ========================================================

      toast.error("Failed to update car", {
        description: "Please check your input and try again.",
      });
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Edit Car" subtitle="Loading..." />

        <div className="flex justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // CAR NOT FOUND
  // ============================================================

  if (!car) {
    return <EmptyState title="Car not found" />;
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Edit Car" subtitle={car.model || "Edit vehicle details"} />

      <EntityForm
        fields={updatedFields}
        backTo="/cars"
        submitLabel="Update Car"
        successMessage="Car updated successfully"
        steps={carSteps}
        onSubmit={handleSubmit}
        defaultValues={{
          // ====================================================
          // USER INFORMATION
          // ====================================================

          userName: car.userName || car.dealerName || "",

          dealerId: car.dealerId?._id || car.dealerId?.id || car.dealerId || "",

          dealerName: car.dealerName || car.userName || "",

          userPhone: car.userPhone || "",

          userCnic: car.userCnic || "",

          userAddress: car.userAddress || "",

          // ====================================================
          // CAR INFORMATION
          // ====================================================

          company: car.company || "",

          model: car.model || "",

          variant: car.variant || "",

          year: car.year || "",

          carType: car.carType || "NCP (Non-Custom Paid)",

          registrationCity: car.registrationCity || "",

          registrationNumber: car.registrationNumber || "",

          localNumber: car.localNumber || "",

          chassisNumber: car.chassisNumber || "",

          engineNumber: car.engineNumber || "",

          color: car.color || "White",

          customColor: car.customColor || "",

          mileage: car.mileage || "",

          engineCC: car.engineCC || "",

          fuelType: car.fuelType || "Petrol",

          transmission: car.transmission || "Automatic",

          condition: car.condition || "Used",

          // ====================================================
          // PRICING
          // ====================================================

          salePrice: car.salePrice || "",

          transactionType: car.transactionType || "Direct Purchase",

          exchangeCarDetails: car.exchangeCarDetails || "",

          // FIX: new — this was completely missing before, so the form
          // never knew about the car's existing exchangeCarId at all.
          // getCarById returns exchangeCarId POPULATED as a full object
          // (see the JSON response with "exchangeCarId": { "_id": ...,
          // "company": ... }), not a plain string — so this must extract
          // just the ID (car.exchangeCarId._id) for populated data, while
          // still falling back correctly for older records where it might
          // already be a plain string/ObjectId or entirely absent.
          exchangeCarId: car.exchangeCarId?._id || car.exchangeCarId?.id || car.exchangeCarId || "",

          exchangeAdditionalAmount: car.exchangeAdditionalAmount || "",

          exchangeType: car.exchangeType === "Car + Money" ? "Car + Money" : "Car Only",

          exchangeMoneyAmount: car.exchangeMoneyAmount || "",

          // ====================================================
          // INVENTORY
          // ====================================================

          status: car.status || "Available",

          dateAdded: car.dateAdded || new Date().toISOString().split("T")[0],

          images: car.images || [],

          description: car.description || "",

          notes: car.notes || "",
        }}
      />
    </div>
  );
}
