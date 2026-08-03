# Bargain Manager UI

Build ONLY the Frontend (UI/UX) of a modern car dealership management web application called **"Car Bargain Manager"** using **React Vite**.

**Important Requirements**

- Build **Frontend Only**.

- **Do NOT create any backend** (Node.js, Express, MongoDB, APIs, authentication logic, JWT, or database models).

- Use **dummy JSON data** for all tables, charts, forms, and pages.

- Create a **production-ready UI** with reusable React components.

- The interface language should be **English**, but all labels should be simple and easy for Urdu-speaking staff to understand.

- This is a **single-business application** (not multi-tenant). Only one dealership/business uses the system.

- The business logo and business name should appear throughout the application (Sidebar, Dashboard Header, Invoices, Receipts) using placeholder data.

---

## 1. Authentication

Create UI pages only.

- Sign In

- Sign Up

- Forgot Password

Use modern forms with validation UI only.

No authentication logic or API integration.

---

## 2. Dashboard (Home Page)

Business logo + business name shown at the top.

Dashboard overview cards:

- Total Cars

- Cars Sold

- Total Exchanges

- Total Expenses

- Total Employees

- Total Dealers

Analytics

- Monthly Sales Graph

- Expense Trend Graph

- Car Status Pie Chart (Available / Sold / Exchanged)

Quick Search Bar

Recent Activity section

---

## 3. Car Management Module

Pages

- Car List

- Add Car

- Edit Car

- View Car

Fields

- Car Name

- Model

- Year

- Registration Number

- Color

- Price

- Condition

- Images

- Status

Status

- Available

- Sold

- Exchanged

Features

- Search

- Filters

- Pagination

- Responsive Table

- Image Gallery

- Status Badges

Sale Details UI

- Customer Name

- CNIC

- Phone

- Address

- Sale Price

- Sale Date

Invoice Preview

Printable invoice design with

- Business Logo

- Business Name

- Customer Details

- Vehicle Details

- Price

- Date

---

## 4. Exchange Module

Pages

- Exchange List

- Add Exchange

- Edit Exchange

- View Exchange

Fields

- Customer Details

- Customer Vehicle

- Dealer 1

- Dealer 2

- New Vehicle

- Cash Adjustment

- Final Amount

Features

- Search

- Filters

- Responsive Table

Receipt Preview

Printable exchange receipt with business branding.

---

## 5. Dealer Module

Pages

- Dealer List

- Add Dealer

- Edit Dealer

- View Dealer

Fields

- Dealer Name

- Contact Number

- CNIC

- Address

- Notes

Dealers should be selectable inside the Exchange page.

---

## 6. Billing Section

Create invoice UI only.

Include

- Business Logo

- Business Name

- Customer Details

- Vehicle Details

- Amount

- Date

Buttons

- Print

- Download PDF (UI only)

---

## 7. Expense Tracker

Pages

- Expense List

- Add Expense

- Edit Expense

- View Expense

Fields

- Expense Title

- Category

- Amount

- Date

- Notes

Features

- Search

- Filters

- Statistics Cards

---

## 8. Employee Module

Pages

- Employee List

- Add Employee

- Edit Employee

- View Employee

Fields

- Employee Name

- Role

- Phone Number

- Joining Date

- Salary

Salary Module

- Give Salary Modal

- Salary History Page

- Search by Employee

---

## 9. Settings

Create UI only.

Sections

- Profile

- Business Information

- Business Logo

- Business Name

- Email

- Phone

- Password

- Theme Toggle (Light/Dark)

---

## 10. General Requirements

Every module must include

- Search Bar

- Responsive Data Table

- Pagination

- Filter Options

- Empty State

- Loading Skeleton

- Confirmation Dialog before Delete

- Toast Notifications

- Modern Forms

- Responsive Layout

Modules

- Cars

- Exchanges

- Dealers

- Expenses

- Employees

- Salaries

---

## Frontend Stack

Use

- React Vite

- React Router DOM

- Tailwind CSS

- shadcn/ui

- React Hook Form

- Zod

- Framer Motion

- Recharts

- Lucide React

Use reusable components and organize the project with a clean folder structure.

---

## Design Style

Create a premium modern dashboard inspired by professional SaaS admin panels.

Use:

- Left Sidebar Navigation

- Top Navbar

- Dashboard Cards

- Modern Tables

- Responsive Forms

- Soft Shadows

- Rounded Corners

- Smooth Animations

- Mobile-Friendly Design

---

## Color Theme (Choose Option 2)

**Luxury Gold & Black**

Primary: **#1A1A1A**

Accent: **#C9A227**

Background: **#FAF9F6**

Success: **#10B981**

Danger: **#DC2626**

---

## Important

- Frontend UI only.

- No backend.

- No APIs.

- No database.

- No authentication implementation.

- No Express.

- No MongoDB.

- No JWT.

Everything should use dummy data while keeping the project structure ready for future backend integration.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/657b1e52-11ea-4179-bd70-d65871b3939c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
