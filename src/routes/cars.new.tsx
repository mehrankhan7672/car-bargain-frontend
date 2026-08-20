// routes/cars.new.tsx

import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { EntityForm, type StepConfig } from "@/components/shared/EntityForm";

import { carFields } from "@/data/field-configs";
import { dealerService } from "@/services/dealerService";
import { carService } from "@/services/carService";

export const Route = createFileRoute("/cars/new")({
  head: () => ({
    meta: [
      {
        title: "Add Car — Car Bargain Manager",
      },
      {
        name: "description",
        content: "Add a new vehicle to the showroom record with price, condition and photos.",
      },
      {
        property: "og:title",
        content: "Add Car — Car Bargain Manager",
      },
      {
        property: "og:description",
        content: "Enter car details and save it into your showroom stock.",
      },
    ],
  }),

  component: AddCar,
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
// CAR INTERFACE FOR EXCHANGE DROPDOWN
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

function AddCar() {
  const navigate = useNavigate();

  const [dealers, setDealers] = useState<Dealer[]>([]);

  const [exchangeCars, setExchangeCars] = useState<ExchangeCar[]>([]);

  const [loading, setLoading] = useState(true);

  const [exchangeCarsLoading, setExchangeCarsLoading] = useState(true);

  // ==========================================================
  // LOAD DEALERS + EXCHANGE CARS
  // ==========================================================

  useEffect(() => {
    fetchDealers();
    fetchExchangeCars();
  }, []);

  // ==========================================================
  // GET DEALERS
  // ==========================================================

  const fetchDealers = async () => {
    try {
      setLoading(true);

      const response = await dealerService.getAll({
        limit: 100,
      });

      const dealerList = response.data.map((dealer: any) => ({
        _id: dealer._id || dealer.id,

        id: dealer._id || dealer.id,

        name: dealer.name,

        phone: dealer.phone ?? dealer.userPhone ?? "",

        cnic: dealer.cnic ?? dealer.userCnic ?? "",

        address: dealer.address ?? dealer.userAddress ?? "",
      }));

      console.log("Dealers loaded:", dealerList);

      setDealers(dealerList);
    } catch (error) {
      console.error("Error fetching dealers:", error);

      setDealers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // GET AVAILABLE CARS FOR EXCHANGE
  // ==========================================================

  const fetchExchangeCars = async () => {
    try {
      setExchangeCarsLoading(true);

      const response = await carService.getAll({
        limit: 100,
      });

      console.log("All cars from API:", response.data);

      // ------------------------------------------------------
      // ONLY AVAILABLE CARS
      //
      // Reserved ❌
      // Sold ❌
      // Available ✅
      // ------------------------------------------------------

      const availableCars = (response.data || []).filter(
        (car: ExchangeCar) => car.status === "Available",
      );

      console.log("Available cars for exchange:", availableCars);

      setExchangeCars(availableCars);
    } catch (error) {
      console.error("Error fetching exchange cars:", error);

      setExchangeCars([]);
    } finally {
      setExchangeCarsLoading(false);
    }
  };

  // ==========================================================
  // FORMAT EXCHANGE CAR
  // ==========================================================
  //
  // Example:
  //
  // Mini | Iure cumque vel nihi | 1970 |
  // No Variant | Lime | Used |
  // NCP (Non-Custom Paid) |
  // Local: fdf454545 |
  // PKR 120,000
  //
  // ==========================================================

  const formatExchangeCar = (car: ExchangeCar) => {
    const company = car.company || "Unknown Company";

    const model = car.model || "Unknown Model";

    const variant = car.variant || "No Variant";

    const year = car.year || "No Year";

    const color = car.color || "No Color";

    const condition = car.condition || "No Condition";

    const carType = car.carType || "No Car Type";

    // --------------------------------------------------------
    // REGISTRATION
    // --------------------------------------------------------

    let registration = "No Registration";

    if (car.registrationNumber) {
      registration = `Registration: ${car.registrationNumber}`;

      if (car.registrationCity) {
        registration += ` (${car.registrationCity})`;
      }
    } else if (car.localNumber) {
      registration = `Local: ${car.localNumber}`;
    }

    // --------------------------------------------------------
    // PRICE
    // --------------------------------------------------------

    const price =
      car.salePrice !== undefined && car.salePrice !== null
        ? `PKR ${Number(car.salePrice).toLocaleString()}`
        : "Price not available";

    // --------------------------------------------------------
    // FINAL VALUE
    // --------------------------------------------------------

    return [company, model, variant, year, color, condition, carType, registration, price].join(
      " | ",
    );
  };

  // ==========================================================
  // DEALER FIELD + EXCHANGE CAR FIELD
  // ==========================================================

  const updatedCarFields = carFields.map((field) => {
    // ========================================================
    // USER NAME / DEALER
    // ========================================================

    if (field.name === "userName") {
      return {
        ...field,

        options: dealers.map((dealer) => dealer.name),

        // ----------------------------------------------------
        // DEALER SELECTED
        // ----------------------------------------------------

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

          setFieldValue("dealerId", selectedDealer._id || selectedDealer.id);

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

        // ----------------------------------------------------
        // CLEAR BUTTON
        // ----------------------------------------------------

        onClear: (setFieldValue: (name: string, value: any) => void) => {
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
      return {
        ...field,

        // ----------------------------------------------------
        // ONLY AVAILABLE CARS
        // ----------------------------------------------------

        options: exchangeCars.map((car) => formatExchangeCar(car)),

        // ----------------------------------------------------
        // SELECT AVAILABLE CAR
        //
        // FIX: this previously only wrote the formatted display string
        // into `exchangeCarDetails` and never touched `exchangeCarId` at
        // all. The backend's validateExchangeCarId() requires a real,
        // valid exchangeCarId whenever transactionType is
        // "Exchange with Bargain" — so submitting always failed backend
        // validation with "Exchange car ID is required for an exchange
        // transaction", no matter what the user picked here.
        //
        // Fix: look up the actual car object behind the selected label
        // (formatExchangeCar is deterministic, so this is a safe reverse
        // lookup), then set BOTH fields — the real _id for the backend,
        // and the readable label for exchangeCarDetails/display.
        // ----------------------------------------------------

        onOptionSelect: (
          selectedValue: string,
          setFieldValue: (name: string, value: any) => void,
        ) => {
          const selectedCar = exchangeCars.find((car) => formatExchangeCar(car) === selectedValue);

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
        // CLEAR BUTTON
        //
        // FIX: new — clearing the exchange car picker must also clear
        // exchangeCarId, otherwise a stale ID from a previous selection
        // could get submitted even after the visible field was cleared.
        // ----------------------------------------------------

        onClear: (setFieldValue: (name: string, value: any) => void) => {
          setFieldValue("exchangeCarDetails", "");
          setFieldValue("exchangeCarId", "");
        },

        placeholder: exchangeCarsLoading
          ? "Loading available cars..."
          : exchangeCars.length === 0
            ? "No available cars"
            : "Select available car...",
      };
    }

    return field;
  });

  // ==========================================================
  // SANITIZE PAYLOAD
  // ==========================================================

  const sanitizeCarPayload = (input: any) => {
    const payload = {
      ...input,
    };

    // ========================================================
    // TRANSACTION TYPE
    // ========================================================

    if (payload.transactionType !== "Exchange with Bargain") {
      delete payload.exchangeCarDetails;
      delete payload.exchangeAdditionalAmount;
      delete payload.exchangeType;
      delete payload.exchangeMoneyAmount;
      // FIX: exchangeCarId wasn't being cleaned up here before — a leftover
      // ID from an earlier "Exchange with Bargain" selection could still
      // get sent even after switching back to "Direct Purchase".
      delete payload.exchangeCarId;
    } else {
      if (payload.exchangeType !== "Car Only" && payload.exchangeType !== "Car + Money") {
        payload.exchangeType = "Car Only";
      }

      if (payload.exchangeType !== "Car + Money") {
        delete payload.exchangeMoneyAmount;
      }
    }

    // ========================================================
    // CAR TYPE
    // ========================================================

    if (payload.carType !== "CP (Custom Paid)") {
      delete payload.registrationNumber;
      delete payload.registrationCity;
    }

    if (payload.carType !== "NCP (Non-Custom Paid)") {
      delete payload.localNumber;
    }

    // ========================================================
    // NUMERIC FIELDS
    // ========================================================

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

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (data: any) => {
    try {
      // --------------------------------------------------------
      // FIND DEALER
      // --------------------------------------------------------

      const normalizedUserName = data.userName?.trim().toLowerCase();

      const selectedDealer = dealers.find(
        (dealer) => dealer.name.trim().toLowerCase() === normalizedUserName,
      );

      // --------------------------------------------------------
      // PREPARE DATA
      //
      // FIX: exchangeCarId flows through automatically via the ...data
      // spread below, since it's now tracked in defaultValues and gets
      // populated by the onOptionSelect handler above. No extra line
      // needed here — just making sure sanitizeCarPayload (fixed above)
      // doesn't silently drop it or leave a stale value behind.
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

      console.log("Sending car data to backend:", submitData);

      // ========================================================
      // CREATE
      // ========================================================

      const response = await carService.create(submitData);

      console.log("Car created successfully:", response);

      toast.success("Car added successfully", {
        description: `${submitData.company} ${submitData.model} has been added to your inventory.`,
      });

      navigate({
        to: "/cars",
      });
    } catch (error: any) {
      console.error("Error submitting car:", error);

      // ========================================================
      // BACKEND VALIDATION ERRORS
      // ========================================================

      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;

        const errorMessages = Array.isArray(backendErrors)
          ? backendErrors
          : Object.values(backendErrors).flat();

        toast.error(errorMessages[0] || "Validation error", {
          description: errorMessages.slice(1).join(", "),
          duration: 5000,
        });

        return;
      }

      // ========================================================
      // BACKEND MESSAGE
      // ========================================================

      if (error.response?.data?.message) {
        toast.error("Failed to add car", {
          description: error.response.data.message,
        });

        return;
      }

      // ========================================================
      // UNKNOWN ERROR
      // ========================================================

      toast.error("Failed to add car", {
        description: "Please check your input and try again.",
      });
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader title="Add Car" subtitle="Fill the details of the new vehicle" />

      <EntityForm
        fields={updatedCarFields}
        backTo="/cars"
        submitLabel="Save Car"
        successMessage="Car added successfully"
        steps={carSteps}
        onSubmit={handleSubmit}
        defaultValues={{
          // ====================================================
          // STEP 1
          // ====================================================

          userName: "",
          dealerId: "",
          dealerName: "",
          userPhone: "",
          userCnic: "",
          userAddress: "",

          // ====================================================
          // STEP 2
          // ====================================================

          company: "",
          model: "",
          variant: "",
          year: "",

          carType: "NCP (Non-Custom Paid)",

          registrationCity: "",
          registrationNumber: "",
          localNumber: "",

          chassisNumber: "",
          engineNumber: "",

          color: "White",
          customColor: "",

          mileage: "",
          engineCC: "",

          fuelType: "Petrol",
          transmission: "Automatic",
          condition: "Used",

          // ====================================================
          // STEP 3
          // ====================================================

          salePrice: "",

          transactionType: "Direct Purchase",

          exchangeCarDetails: "",
          // FIX: new — must be tracked by the form from the start so
          // setFieldValue("exchangeCarId", ...) in onOptionSelect actually
          // sticks and gets included in the final submitted data.
          exchangeCarId: "",
          exchangeAdditionalAmount: "",

          exchangeType: "Car Only",

          exchangeMoneyAmount: "",

          // ====================================================
          // STEP 4
          // ====================================================

          status: "Available",

          dateAdded: new Date().toISOString().split("T")[0],

          images: [],

          description: "",

          notes: "",
        }}
      />
    </div>
  );
}
