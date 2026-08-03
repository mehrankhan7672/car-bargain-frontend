import type { FieldConfig } from "@/components/shared/EntityForm";
import { dealers } from "./dummy";

export const carFields: FieldConfig[] = [
  { name: "name", label: "Car Name", placeholder: "Toyota Corolla" },
  { name: "model", label: "Model", placeholder: "Altis Grande" },
  { name: "year", label: "Year", type: "number", placeholder: "2021" },
  { name: "regNo", label: "Registration Number", placeholder: "LEB-2145" },
  { name: "color", label: "Color", placeholder: "Pearl White" },
  { name: "price", label: "Price (PKR)", type: "number", placeholder: "6850000" },
  { name: "condition", label: "Condition", type: "select", options: ["New", "Excellent", "Good", "Fair"] },
  { name: "status", label: "Status", type: "select", options: ["Available", "Sold", "Exchanged"] },
  {
    name: "images",
    label: "Image Links (one per line)",
    type: "textarea",
    optional: true,
    full: true,
    placeholder: "https://example.com/car-front.jpg",
  },
];

export const exchangeFields: FieldConfig[] = [
  { name: "customerName", label: "Customer Name", placeholder: "Imran Sheikh" },
  { name: "cnic", label: "Customer CNIC", placeholder: "35202-4455667-1" },
  { name: "phone", label: "Phone Number", placeholder: "+92 300 1231234" },
  { name: "address", label: "Address", placeholder: "DHA Phase 5, Lahore" },
  { name: "customerVehicle", label: "Customer Vehicle", placeholder: "Honda City 2016 (LEB-1234)" },
  { name: "newVehicle", label: "New Vehicle", placeholder: "Toyota Fortuner (BEA-1122)" },
  { name: "dealer1", label: "Dealer 1", type: "select", options: dealers.map((d) => d.name) },
  { name: "dealer2", label: "Dealer 2", type: "select", options: dealers.map((d) => d.name) },
  { name: "cashAdjustment", label: "Cash Adjustment (PKR)", type: "number", placeholder: "3200000" },
  { name: "finalAmount", label: "Final Amount (PKR)", type: "number", placeholder: "14500000" },
  { name: "date", label: "Exchange Date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["Completed", "Pending"] },
];

export const dealerFields: FieldConfig[] = [
  { name: "name", label: "Dealer Name", placeholder: "Rashid Auto Traders" },
  { name: "phone", label: "Contact Number", placeholder: "+92 301 2223344" },
  { name: "cnic", label: "CNIC", placeholder: "35202-1111222-3" },
  { name: "address", label: "Address", placeholder: "Bilal Gunj Auto Market, Lahore" },
  { name: "notes", label: "Notes", type: "textarea", optional: true, full: true, placeholder: "Any useful detail about this dealer" },
];

export const expenseFields: FieldConfig[] = [
  { name: "title", label: "Expense Title", placeholder: "Engine tuning - Corolla" },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Repair", "Fuel", "Office", "Salary", "Marketing", "Other"],
  },
  { name: "amount", label: "Amount (PKR)", type: "number", placeholder: "45000" },
  { name: "date", label: "Date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea", optional: true, full: true, placeholder: "Extra detail" },
];

export const employeeFields: FieldConfig[] = [
  { name: "name", label: "Employee Name", placeholder: "Ahmed Raza" },
  {
    name: "role",
    label: "Role",
    type: "select",
    options: ["Manager", "Salesman", "Accountant", "Driver", "Mechanic"],
  },
  { name: "phone", label: "Phone Number", placeholder: "+92 300 1112223" },
  { name: "joiningDate", label: "Joining Date", type: "date" },
  { name: "salary", label: "Monthly Salary (PKR)", type: "number", placeholder: "65000" },
];
