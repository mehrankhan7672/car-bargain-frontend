import type { FieldConfig, StepConfig } from "@/components/shared/EntityForm";

// Sample dealers data - replace with actual API call
const dealers = [
  "Toyota Motors",
  "Honda Showroom",
  "BMW Premium",
  "Mercedes-Benz Dealership",
  "Audi Luxury",
  "Suzuki Motors",
  "Hyundai Cars",
  "Kia Motors",
  "Nissan Showroom",
  "Ford Dealership",
  "Chevrolet Motors",
  "Volkswagen Cars",
];

// Company options
const companyOptions = [
  "Toyota",
  "Honda",
  "Nissan",
  "Ford",
  "Chevrolet",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volkswagen",
  "Hyundai",
  "Kia",
  "Mazda",
  "Subaru",
  "Lexus",
  "Jeep",
  "Dodge",
  "Ram",
  "GMC",
  "Cadillac",
  "Porsche",
  "Land Rover",
  "Jaguar",
  "Volvo",
  "Mitsubishi",
  "Suzuki",
  "Renault",
  "Peugeot",
  "Citroën",
  "Fiat",
  "Alfa Romeo",
  "Maserati",
  "Ferrari",
  "Lamborghini",
  "Aston Martin",
  "Bentley",
  "Rolls-Royce",
  "Tesla",
  "Rivian",
  "Lucid",
  "Polestar",
  "BYD",
  "MG",
  "Chery",
  "Geely",
  "Great Wall",
  "Isuzu",
  "Mahindra",
  "Tata",
  "Mini",
  "Smart",
];

// Sample exchange car options
const exchangeCarOptions = [
  "Toyota Camry 2020",
  "Honda Civic 2021",
  "Nissan Altima 2022",
  "Ford Mustang 2020",
  "BMW 3 Series 2021",
];

export const carFields: FieldConfig[] = [
  // Step 1: User Information
  {
    name: "userName",
    label: "Full Name",
    type: "combobox",
    options: dealers,
    placeholder: "Type name or select from dealers...",
    step: 1,
  },
  {
    name: "userPhone",
    label: "Phone Number",
    placeholder: "e.g., 0300-1234567",
    step: 1,
  },
  {
    name: "userCnic",
    label: "CNIC Number",
    placeholder: "e.g., 1234567890123",
    step: 1,
  },
  {
    name: "userAddress",
    label: "Address",
    type: "textarea",
    placeholder: "Enter complete address",
    full: true,
    step: 1,
  },

  // Step 2: Car Information
  {
    name: "company",
    label: "Company",
    type: "select",
    options: companyOptions,
    placeholder: "Select company",
    step: 2,
  },
  {
    name: "model",
    label: "Model",
    placeholder: "e.g., Camry",
    step: 2,
  },
  {
    name: "variant",
    label: "Variant",
    placeholder: "e.g., LE",
    optional: true,
    step: 2,
  },
  {
    name: "year",
    label: "Year",
    type: "number",
    placeholder: "e.g., 2023",
    step: 2,
  },
  // FIX: these two option strings MUST exactly match the backend Mongoose
  // enum for carType ('CP (Custom Paid)' / 'NCP (Non-Custom Paid)').
  // The old value "Register" doesn't exist in the schema enum at all,
  // which is why saves were failing with:
  //   "`Register` is not a valid enum value for path `carType`."
  {
    name: "carType",
    label: "Car Type",
    type: "select",
    options: ["CP (Custom Paid)", "NCP (Non-Custom Paid)"],
    placeholder: "Select car type",
    step: 2,
  },
  // Show when "CP (Custom Paid)" is selected - REQUIRED
  {
    name: "registrationCity",
    label: "Registration City",
    placeholder: "e.g., Dubai",
    step: 2,
    dependsOn: "carType",
    showWhen: (value: string) => value === "CP (Custom Paid)",
    requiredWhenVisible: true,
  },
  {
    name: "registrationNumber",
    label: "Registration Number",
    placeholder: "e.g., ABC-123",
    step: 2,
    dependsOn: "carType",
    showWhen: (value: string) => value === "CP (Custom Paid)",
    requiredWhenVisible: true,
  },
  // Show when "NCP" is selected - OPTIONAL
  {
    name: "localNumber",
    label: "Local Number",
    placeholder: "e.g., LOC-123456",
    optional: true,
    step: 2,
    dependsOn: "carType",
    showWhen: (value: string) => value === "NCP (Non-Custom Paid)",
  },
  // Always required fields for NCP
  {
    name: "chassisNumber",
    label: "Chassis Number",
    placeholder: "e.g., 1HGCM82633A123456",
    step: 2,
  },
  {
    name: "engineNumber",
    label: "Engine Number",
    placeholder: "e.g., ENG-123456",
    step: 2,
  },
  {
    name: "color",
    label: "Color",
    type: "select",
    options: [
      "White",
      "Black",
      "Silver",
      "Gray",
      "Red",
      "Blue",
      "Green",
      "Yellow",
      "Orange",
      "Purple",
      "Brown",
      "Gold",
      "Beige",
      "Maroon",
      "Navy",
      "Teal",
      "Coral",
      "Lime",
    ],
    placeholder: "Select common color",
    step: 2,
  },
  {
    name: "customColor",
    label: "Custom Color",
    placeholder: "e.g., Pearl White, Metallic Blue",
    optional: true,
    step: 2,
  },
  {
    name: "mileage",
    label: "Mileage (KM)",
    type: "number",
    placeholder: "e.g., 15000",
    step: 2,
  },
  {
    name: "engineCC",
    label: "Engine CC",
    type: "number",
    placeholder: "e.g., 2000",
    step: 2,
  },
  {
    name: "fuelType",
    label: "Fuel Type",
    type: "select",
    options: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
    step: 2,
  },
  {
    name: "transmission",
    label: "Transmission",
    type: "select",
    options: ["Automatic", "Manual", "CVT", "DCT"],
    step: 2,
  },
  {
    name: "condition",
    label: "Condition",
    type: "select",
    options: ["New", "Used", "Certified Pre-Owned"],
    step: 2,
  },

  // Step 3: Pricing — purchasePrice removed, sale price only.
  {
    name: "salePrice",
    label: "Sale Price",
    type: "number",
    placeholder: "e.g., 55000",
    optional: true,
    step: 3,
  },
  {
    name: "transactionType",
    label: "Transaction Type",
    type: "select",
    options: ["Direct Purchase", "Exchange with Bargain"],
    placeholder: "Select transaction type",
    step: 3,
  },
  {
    name: "exchangeCarDetails",
    label: "Exchange Car Details",
    type: "combobox",
    options: exchangeCarOptions,
    placeholder: "Select exchange car",
    optional: true,
    step: 3,
    dependsOn: "transactionType",
    showWhen: (value: string) => value === "Exchange with Bargain",
  },
  {
    name: "exchangeAdditionalAmount",
    label: "Additional Amount on Exchange",
    type: "number",
    placeholder: "e.g., 5000",
    optional: true,
    step: 3,
    dependsOn: "transactionType",
    showWhen: (value: string) => value === "Exchange with Bargain",
  },
  {
    name: "exchangeType",
    label: "Exchange Type",
    type: "select",
    options: ["Car Only", "Car + Money"],
    placeholder: "Select exchange type",
    optional: true,
    step: 3,
    dependsOn: "transactionType",
    showWhen: (value: string) => value === "Exchange with Bargain",
  },
  {
    name: "exchangeMoneyAmount",
    label: "Money Amount in Exchange",
    type: "number",
    placeholder: "e.g., 10000",
    optional: false,
    step: 3,
    dependsOn: "exchangeType",
    showWhen: (value: string) => value === "Car + Money",
  },

  // Step 4: Inventory & Additional
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Available", "Reserved", "Sold"],
    step: 4,
  },
  {
    name: "dateAdded",
    label: "Date Added",
    type: "date",
    step: 4,
  },
  {
    name: "images",
    label: "Images",
    type: "file",
    placeholder: "Upload car images",
    full: true,
    optional: true,
    step: 4,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter a detailed description of the car...",
    full: true,
    optional: true,
    step: 4,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Add any additional notes...",
    full: true,
    optional: true,
    step: 4,
  },
];

export { companyOptions, exchangeCarOptions, dealers };

export const exchangeFields: FieldConfig[] = [
  { name: "customerName", label: "Customer Name", placeholder: "Imran Sheikh", step: 1 },
  { name: "cnic", label: "Customer CNIC", placeholder: "35202-4455667-1", step: 1 },
  { name: "phone", label: "Phone Number", placeholder: "+92 300 1231234", step: 1 },
  { name: "address", label: "Address", placeholder: "DHA Phase 5, Lahore", step: 1 },
  {
    name: "customerVehicle",
    label: "Customer Vehicle",
    placeholder: "Honda City 2016 (LEB-1234)",
    step: 1,
  },
  {
    name: "newVehicle",
    label: "New Vehicle",
    placeholder: "Toyota Fortuner (BEA-1122)",
    step: 1,
  },
  {
    name: "dealer1",
    label: "Dealer 1",
    type: "select",
    options: dealers.map((d) => d.name),
    step: 1,
  },
  {
    name: "dealer2",
    label: "Dealer 2",
    type: "select",
    options: dealers.map((d) => d.name),
    step: 1,
  },
  {
    name: "cashAdjustment",
    label: "Cash Adjustment (PKR)",
    type: "number",
    placeholder: "3200000",
    step: 1,
  },
  {
    name: "finalAmount",
    label: "Final Amount (PKR)",
    type: "number",
    placeholder: "14500000",
    step: 1,
  },
  { name: "date", label: "Exchange Date", type: "date", step: 1 },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Completed", "Pending"],
    step: 1,
  },
];

export const dealerFields: FieldConfig[] = [
  {
    name: "name",
    label: "Dealer Name",
    type: "text",
    placeholder: "Enter dealer name",
    step: 1,
    optional: false,
    full: true,
  },
  {
    name: "phone",
    label: "Contact Number",
    type: "text",
    placeholder: "03000000513",
    step: 1,
    optional: false,
  },
  {
    name: "cnic",
    label: "CNIC",
    type: "text",
    placeholder: "1234232156786",
    step: 1,
    optional: false,
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter full address",
    step: 1,
    optional: false,
    full: true,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Any additional notes about the dealer",
    step: 1,
    optional: true,
    full: true,
  },
];

export const expenseFields: FieldConfig[] = [
  { name: "title", label: "Expense Title", placeholder: "Engine tuning - Corolla", step: 1 },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Repair", "Fuel", "Office", "Salary", "Marketing", "Other"],
    step: 1,
  },
  { name: "amount", label: "Amount (PKR)", type: "number", placeholder: "45000", step: 1 },
  { name: "date", label: "Date", type: "date", step: 1 },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    optional: true,
    full: true,
    placeholder: "Extra detail",
    step: 1,
  },
];

export const employeeFields: FieldConfig[] = [
  { name: "name", label: "Employee Name", placeholder: "Ahmed Raza", step: 1 },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: ["Manager", "Salesman", "Accountant", "Driver", "Mechanic"],
    step: 1,
  },
  { name: "phone", label: "Phone Number", placeholder: "+92 300 1112223", step: 1 },
  { name: "joiningDate", label: "Joining Date", type: "date", step: 1 },
  {
    name: "salary",
    label: "Monthly Salary (PKR)",
    type: "number",
    placeholder: "65000",
    step: 1,
  },
];

// Reusable 2-step wizard (Details -> Review) for the simpler entity forms below.
// Each has its own icon/title/description so the wizard header no longer says
// "Car Information" on non-car pages.
export const exchangeSteps = [
  {
    step: 1,
    title: "Exchange Details",
    icon: "🔄",
    description: "Enter customer, vehicle and dealer details",
  },
  { step: 2, title: "Review", icon: "✓", description: "Review all information before saving" },
];

export const dealerSteps: StepConfig[] = [
  {
    step: 1,
    title: "Dealer Information",
    icon: "📝",
    description: "Enter dealer contact details",
  },
];

export const expenseSteps = [
  {
    step: 1,
    title: "Expense Details",
    icon: "💵",
    description: "Enter what this expense is for",
  },
  { step: 2, title: "Review", icon: "✓", description: "Review all information before saving" },
];

export const employeeSteps = [
  {
    step: 1,
    title: "Employee Details",
    icon: "👤",
    description: "Enter the employee's role and contact details",
  },
];
