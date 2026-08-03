export const business = {
  name: "Al-Karam Motors",
  tagline: "Car Bargain Manager",
  logoText: "AK",
  phone: "+92 300 1234567",
  email: "info@alkarammotors.pk",
  address: "Main Ferozepur Road, Lahore, Pakistan",
  ntn: "NTN 4820193-6",
};

export type CarStatus = "Available" | "Sold" | "Exchanged";

export type Car = {
  id: string;
  name: string;
  model: string;
  year: number;
  regNo: string;
  color: string;
  price: number;
  condition: "New" | "Excellent" | "Good" | "Fair";
  status: CarStatus;
  images: string[];
  sale?: {
    customerName: string;
    cnic: string;
    phone: string;
    address: string;
    salePrice: number;
    saleDate: string;
  };
};

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/500`;

export const cars: Car[] = [
  {
    id: "CAR-1001",
    name: "Toyota Corolla",
    model: "Altis Grande",
    year: 2021,
    regNo: "LEB-2145",
    color: "Pearl White",
    price: 6850000,
    condition: "Excellent",
    status: "Available",
    images: [img("corolla1"), img("corolla2"), img("corolla3")],
  },
  {
    id: "CAR-1002",
    name: "Honda Civic",
    model: "Oriel 1.8",
    year: 2020,
    regNo: "AKL-778",
    color: "Sonic Grey",
    price: 7450000,
    condition: "Good",
    status: "Sold",
    images: [img("civic1"), img("civic2")],
    sale: {
      customerName: "Muhammad Bilal",
      cnic: "35202-1234567-1",
      phone: "+92 321 4455667",
      address: "House 22, Johar Town, Lahore",
      salePrice: 7380000,
      saleDate: "2026-05-14",
    },
  },
  {
    id: "CAR-1003",
    name: "Suzuki Alto",
    model: "VXL AGS",
    year: 2022,
    regNo: "LEA-9081",
    color: "Graphite Grey",
    price: 2950000,
    condition: "Excellent",
    status: "Available",
    images: [img("alto1"), img("alto2")],
  },
  {
    id: "CAR-1004",
    name: "Toyota Fortuner",
    model: "Sigma 4",
    year: 2019,
    regNo: "BEA-1122",
    color: "Attitude Black",
    price: 14500000,
    condition: "Good",
    status: "Exchanged",
    images: [img("fortuner1"), img("fortuner2")],
  },
  {
    id: "CAR-1005",
    name: "Kia Sportage",
    model: "Alpha",
    year: 2021,
    regNo: "LZH-4410",
    color: "Snow White",
    price: 8100000,
    condition: "Excellent",
    status: "Available",
    images: [img("sportage1"), img("sportage2")],
  },
  {
    id: "CAR-1006",
    name: "Honda City",
    model: "Aspire 1.5",
    year: 2018,
    regNo: "LEC-3320",
    color: "Silver",
    price: 4250000,
    condition: "Fair",
    status: "Sold",
    images: [img("city1")],
    sale: {
      customerName: "Ayesha Khan",
      cnic: "35201-7654321-8",
      phone: "+92 333 1122334",
      address: "Flat 5B, Gulberg III, Lahore",
      salePrice: 4180000,
      saleDate: "2026-06-02",
    },
  },
  {
    id: "CAR-1007",
    name: "Suzuki Cultus",
    model: "VXL",
    year: 2020,
    regNo: "LEB-6677",
    color: "Solid White",
    price: 3600000,
    condition: "Good",
    status: "Available",
    images: [img("cultus1")],
  },
  {
    id: "CAR-1008",
    name: "Toyota Yaris",
    model: "ATIV X CVT",
    year: 2022,
    regNo: "LZN-8890",
    color: "Attitude Black",
    price: 5400000,
    condition: "New",
    status: "Available",
    images: [img("yaris1"), img("yaris2")],
  },
  {
    id: "CAR-1009",
    name: "Hyundai Tucson",
    model: "FWD GLS",
    year: 2021,
    regNo: "LEH-2255",
    color: "Phantom Black",
    price: 9250000,
    condition: "Excellent",
    status: "Exchanged",
    images: [img("tucson1")],
  },
  {
    id: "CAR-1010",
    name: "Daihatsu Mira",
    model: "X Limited",
    year: 2017,
    regNo: "LEF-1290",
    color: "Blue",
    price: 2450000,
    condition: "Fair",
    status: "Available",
    images: [img("mira1")],
  },
  {
    id: "CAR-1011",
    name: "MG HS",
    model: "Essence",
    year: 2022,
    regNo: "LZM-5533",
    color: "Red",
    price: 9800000,
    condition: "Excellent",
    status: "Available",
    images: [img("mghs1")],
  },
  {
    id: "CAR-1012",
    name: "Suzuki Wagon R",
    model: "VXL",
    year: 2019,
    regNo: "LEB-4402",
    color: "Silky Silver",
    price: 3150000,
    condition: "Good",
    status: "Sold",
    images: [img("wagonr1")],
    sale: {
      customerName: "Usman Tariq",
      cnic: "35202-9988776-3",
      phone: "+92 300 7788990",
      address: "Street 9, Model Town, Lahore",
      salePrice: 3120000,
      saleDate: "2026-06-21",
    },
  },
];

export type Dealer = {
  id: string;
  name: string;
  phone: string;
  cnic: string;
  address: string;
  notes: string;
};

export const dealers: Dealer[] = [
  {
    id: "DLR-01",
    name: "Rashid Auto Traders",
    phone: "+92 301 2223344",
    cnic: "35202-1111222-3",
    address: "Bilal Gunj Auto Market, Lahore",
    notes: "Prefers cash deals, quick payments.",
  },
  {
    id: "DLR-02",
    name: "Malik Motors",
    phone: "+92 322 5566778",
    cnic: "35201-3334445-6",
    address: "Ravi Road, Lahore",
    notes: "Good stock of small cars.",
  },
  {
    id: "DLR-03",
    name: "Chaudhry Car Point",
    phone: "+92 345 9988771",
    cnic: "34101-5556667-1",
    address: "GT Road, Gujranwala",
    notes: "Works on 1% commission.",
  },
  {
    id: "DLR-04",
    name: "Shahzad Auto Deals",
    phone: "+92 312 4455667",
    cnic: "35202-7778889-5",
    address: "Township, Lahore",
    notes: "Specialist in SUVs.",
  },
  {
    id: "DLR-05",
    name: "New Star Motors",
    phone: "+92 336 1212121",
    cnic: "38403-2223334-9",
    address: "Blue Area, Islamabad",
    notes: "Deals in imported cars.",
  },
];

export type Exchange = {
  id: string;
  customerName: string;
  cnic: string;
  phone: string;
  address: string;
  customerVehicle: string;
  dealer1: string;
  dealer2: string;
  newVehicle: string;
  cashAdjustment: number;
  finalAmount: number;
  date: string;
  status: "Completed" | "Pending";
};

export const exchanges: Exchange[] = [
  {
    id: "EXC-501",
    customerName: "Imran Sheikh",
    cnic: "35202-4455667-1",
    phone: "+92 300 1231234",
    address: "DHA Phase 5, Lahore",
    customerVehicle: "Honda City 2016 (LEB-1234)",
    dealer1: "Rashid Auto Traders",
    dealer2: "Malik Motors",
    newVehicle: "Toyota Fortuner Sigma 4 (BEA-1122)",
    cashAdjustment: 3200000,
    finalAmount: 14500000,
    date: "2026-06-11",
    status: "Completed",
  },
  {
    id: "EXC-502",
    customerName: "Nadia Aslam",
    cnic: "35201-6677889-4",
    phone: "+92 321 7654321",
    address: "Faisal Town, Lahore",
    customerVehicle: "Suzuki Cultus 2018 (LEA-5566)",
    dealer1: "Chaudhry Car Point",
    dealer2: "New Star Motors",
    newVehicle: "Hyundai Tucson FWD GLS (LEH-2255)",
    cashAdjustment: 5400000,
    finalAmount: 9250000,
    date: "2026-07-02",
    status: "Completed",
  },
  {
    id: "EXC-503",
    customerName: "Kamran Yousaf",
    cnic: "35202-1010101-2",
    phone: "+92 333 4567890",
    address: "Wapda Town, Lahore",
    customerVehicle: "Toyota Corolla 2014 (LEC-8899)",
    dealer1: "Malik Motors",
    dealer2: "Shahzad Auto Deals",
    newVehicle: "Kia Sportage Alpha (LZH-4410)",
    cashAdjustment: 4100000,
    finalAmount: 8100000,
    date: "2026-07-19",
    status: "Pending",
  },
  {
    id: "EXC-504",
    customerName: "Hassan Raza",
    cnic: "35404-3232323-7",
    phone: "+92 345 1112223",
    address: "Sargodha Road, Faisalabad",
    customerVehicle: "Suzuki Mehran 2012 (FDR-2211)",
    dealer1: "New Star Motors",
    dealer2: "Rashid Auto Traders",
    newVehicle: "Suzuki Alto VXL AGS (LEA-9081)",
    cashAdjustment: 1750000,
    finalAmount: 2950000,
    date: "2026-07-25",
    status: "Pending",
  },
];

export type Expense = {
  id: string;
  title: string;
  category: "Repair" | "Fuel" | "Office" | "Salary" | "Marketing" | "Other";
  amount: number;
  date: string;
  notes: string;
};

export const expenses: Expense[] = [
  { id: "EXP-01", title: "Engine tuning - Corolla", category: "Repair", amount: 45000, date: "2026-07-02", notes: "Workshop bill paid in cash." },
  { id: "EXP-02", title: "Showroom electricity bill", category: "Office", amount: 68000, date: "2026-07-05", notes: "Monthly bill." },
  { id: "EXP-03", title: "Facebook ads", category: "Marketing", amount: 25000, date: "2026-07-08", notes: "Weekly car listing boost." },
  { id: "EXP-04", title: "Petrol for test drives", category: "Fuel", amount: 18500, date: "2026-07-11", notes: "" },
  { id: "EXP-05", title: "Denting & painting - Civic", category: "Repair", amount: 92000, date: "2026-07-14", notes: "Front bumper work." },
  { id: "EXP-06", title: "Staff salaries July", category: "Salary", amount: 480000, date: "2026-07-31", notes: "5 employees." },
  { id: "EXP-07", title: "Office stationery", category: "Office", amount: 9500, date: "2026-08-01", notes: "" },
  { id: "EXP-08", title: "Car wash service", category: "Other", amount: 12000, date: "2026-08-02", notes: "Monthly package." },
];

export type Employee = {
  id: string;
  name: string;
  role: "Manager" | "Salesman" | "Accountant" | "Driver" | "Mechanic";
  phone: string;
  joiningDate: string;
  salary: number;
};

export const employees: Employee[] = [
  { id: "EMP-01", name: "Ahmed Raza", role: "Manager", phone: "+92 300 1112223", joiningDate: "2023-01-15", salary: 120000 },
  { id: "EMP-02", name: "Fahad Iqbal", role: "Salesman", phone: "+92 321 3334445", joiningDate: "2024-03-01", salary: 65000 },
  { id: "EMP-03", name: "Sana Malik", role: "Accountant", phone: "+92 333 5556667", joiningDate: "2023-09-10", salary: 85000 },
  { id: "EMP-04", name: "Zubair Ali", role: "Driver", phone: "+92 345 7778889", joiningDate: "2025-02-20", salary: 45000 },
  { id: "EMP-05", name: "Naveed Akhtar", role: "Mechanic", phone: "+92 312 9990001", joiningDate: "2022-11-05", salary: 70000 },
];

export type Salary = {
  id: string;
  employee: string;
  month: string;
  amount: number;
  paidOn: string;
  method: "Cash" | "Bank Transfer" | "Cheque";
};

export const salaries: Salary[] = [
  { id: "SAL-101", employee: "Ahmed Raza", month: "July 2026", amount: 120000, paidOn: "2026-07-31", method: "Bank Transfer" },
  { id: "SAL-102", employee: "Fahad Iqbal", month: "July 2026", amount: 65000, paidOn: "2026-07-31", method: "Cash" },
  { id: "SAL-103", employee: "Sana Malik", month: "July 2026", amount: 85000, paidOn: "2026-07-31", method: "Bank Transfer" },
  { id: "SAL-104", employee: "Zubair Ali", month: "July 2026", amount: 45000, paidOn: "2026-08-01", method: "Cash" },
  { id: "SAL-105", employee: "Naveed Akhtar", month: "June 2026", amount: 70000, paidOn: "2026-06-30", method: "Cheque" },
  { id: "SAL-106", employee: "Ahmed Raza", month: "June 2026", amount: 120000, paidOn: "2026-06-30", method: "Bank Transfer" },
];

export const monthlySales = [
  { month: "Feb", sales: 4, amount: 18.2 },
  { month: "Mar", sales: 6, amount: 27.4 },
  { month: "Apr", sales: 3, amount: 14.1 },
  { month: "May", sales: 8, amount: 39.6 },
  { month: "Jun", sales: 7, amount: 33.8 },
  { month: "Jul", sales: 10, amount: 47.5 },
];

export const expenseTrend = [
  { month: "Feb", amount: 420 },
  { month: "Mar", amount: 510 },
  { month: "Apr", amount: 380 },
  { month: "May", amount: 640 },
  { month: "Jun", amount: 590 },
  { month: "Jul", amount: 750 },
];

export const recentActivity = [
  { id: 1, text: "Honda Civic Oriel sold to Muhammad Bilal", meta: "PKR 73,80,000", time: "2 hours ago", type: "sale" as const },
  { id: 2, text: "New exchange started with Kamran Yousaf", meta: "Kia Sportage Alpha", time: "5 hours ago", type: "exchange" as const },
  { id: 3, text: "Expense added: Denting & painting - Civic", meta: "PKR 92,000", time: "Yesterday", type: "expense" as const },
  { id: 4, text: "Salary paid to Fahad Iqbal", meta: "July 2026", time: "2 days ago", type: "salary" as const },
  { id: 5, text: "New car added: MG HS Essence", meta: "PKR 98,00,000", time: "3 days ago", type: "car" as const },
];

export const formatPKR = (value: number) =>
  "PKR " + new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);
