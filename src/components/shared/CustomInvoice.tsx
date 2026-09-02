// src/components/shared/CustomInvoice.tsx
import React from "react";

export type InvoiceData = {
  sale: any;
  car: any;
  buyer: any;
  seller: any;
  payment: any;
  saleDate: string;
  invoiceNumber?: string;
};

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const formatDate = (date: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const monthsAndDaysUntil = (target: string | Date): string => {
  const to = new Date(target);
  if (isNaN(to.getTime())) return "";
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  to.setHours(0, 0, 0, 0);

  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(to.getFullYear(), to.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) return "";
  return `${months} month${months === 1 ? "" : "s"} ${days} day${days === 1 ? "" : "s"}`;
};

// Single merged Urdu address line: سکنہ (resident of) / تحصیل (tehsil) / ضلع (district)
const mergedAddress = (person: any): string => {
  if (!person) return "—";
  if (person.address) return person.address;
  const parts = [person.village, person.tehsil, person.district || person.city].filter(Boolean);
  return parts.length ? parts.join("، ") : "—";
};

const CarIcon = () => (
  <svg viewBox="0 0 60 42" className="w-14 h-auto">
    <path
      d="M4 30 C4 20 10 14 18 12 L22 6 C24 3 27 2 30 2 C33 2 36 3 38 6 L42 12 C50 14 56 20 56 30"
      stroke="#131b52"
      strokeWidth="2.5"
      fill="#fff"
    />
    <rect x="2" y="28" width="56" height="9" rx="4" fill="#c81e1e" />
    <circle cx="16" cy="36" r="5" fill="#131b52" />
    <circle cx="44" cy="36" r="5" fill="#131b52" />
    <rect x="16" y="14" width="10" height="9" rx="2" fill="#1f2c7a" opacity=".7" />
    <rect x="34" y="14" width="10" height="9" rx="2" fill="#1f2c7a" opacity=".7" />
  </svg>
);

// One field: RTL label + dotted fill line
const Field: React.FC<{ label: string; value?: React.ReactNode; grow?: number }> = ({
  label,
  value,
  grow = 1,
}) => (
  <div className="flex items-baseline gap-1.5 min-w-0" style={{ flex: grow }}>
    <span className="text-[#131b52] font-semibold text-[13.5px] whitespace-nowrap">{label}</span>
    <span className="flex-1 border-b border-dotted border-gray-600 text-center text-[13px] font-medium text-gray-900 min-h-[18px] px-1 truncate">
      {value || ""}
    </span>
  </div>
);

const Row: React.FC<{ children: React.ReactNode; top?: boolean }> = ({ children, top }) => (
  <div
    className={`flex items-baseline gap-2 py-2 ${top ? "border-b border-black/70" : "border-b border-dashed border-gray-300"}`}
  >
    {children}
  </div>
);

const TERMS = [
  "فریقین مکمل ہوش و حواس میں ہوں اور بیچنے و خریدنے کے تمام اختیارات مکمل رکھتے ہوں۔",
  "آج سے پہلے کی تمام لائبیلٹیز اور متعلقہ کاغذات کا ذمہ دار فریق اول ہوگا۔",
  "ہر دو صورت میں قسط مسلسل بروقت ادا نہ ہونے پر فریق اول گاڑی قبضے میں لینے کا حقدار ہوگا۔",
  "گاڑی قبضے میں لینے کے دس دن بعد فریق اول اسے فروخت کرنے کا مجاز ہوگا۔",
  "فروخت کے نفع و نقصان کا ذمہ دار فریق اول ہوگا اور فریق دوم کی رقم اس میں سے منہا ہوگی۔",
  "گاڑی کی کہیں اور فروخت، اخفا یا نقصان کی صورت میں اس کا ذمہ دار فریق خود ہوگا۔",
  "جائز رقم مقررہ وقت پر فریق دوم سے وصول کرنے کا حق فریق اول کو حاصل ہوگا۔",
  "فریقین میں سے کوئی رقم واپسی چاہے تو باقاعدہ درخواست دائر کرے گا۔",
  "آج کے بعد ٹیکس، رجسٹریشن، فیس یا رنگ کی تبدیلی وغیرہ قابلِ قبول نہ ہوگی۔",
  "معاہدے کے بعد گاڑی و کاغذات کی ذمہ داری متعلقہ فریق کی ہوگی، کمیشن کسی صورت واپس نہ ہوگا۔",
];

export const CustomInvoice: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const { sale, car, buyer, seller, payment, saleDate, invoiceNumber } = data;

  const isFull = payment?.type === "Full Payment" || sale.paymentType === "Full Payment";
  const isInstalment = !isFull;

  const totalPrice = sale.carSnapshot?.salePrice ?? car.salePrice ?? 0;
  const advance = sale.advancePayment ?? payment?.advancePayment ?? 0;
  const additionalPayments = (sale.payments || []).reduce(
    (sum: number, p: any) => sum + p.amount,
    0,
  );
  const totalReceived = advance + additionalPayments;
  const remaining = Math.max(0, totalPrice - totalReceived);

  let deadlineDisplay = "-";
  let durationDisplay = "-";
  let monthlyDisplay = "-";
  if (isInstalment && (sale.instalmentDate || payment?.instalmentDate)) {
    const instDate = sale.instalmentDate || payment?.instalmentDate;
    deadlineDisplay = formatDate(instDate);
    durationDisplay = monthsAndDaysUntil(instDate) || "-";
    monthlyDisplay = (sale.monthlyInstalment ?? payment?.monthlyInstalment ?? 0).toString();
  }

  const isRegisteredCar = car.carType === "CP (Custom Paid)";
  const regNumber = isRegisteredCar ? car.registrationNumber : car.localNumber;

  return (
    <div
      dir="rtl"
      className="invoice-container bg-[#fdfbf3] max-w-3xl mx-auto shadow-lg border border-gray-300 overflow-hidden print:shadow-none"
      style={{ fontFamily: "'Noto Naskh Arabic','Noto Nastaliq Urdu',Arial,sans-serif" }}
    >
      {/* ===== HEADER ===== */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-4 bg-gradient-to-br from-[#131b52] via-[#1f2c7a] to-[#2a3aa0] text-white">
        <div>
          <div className="font-sans font-extrabold leading-tight">
            <div className="text-[#ffd94d] text-2xl tracking-wide">BARIKOT</div>
            <div className="text-white text-lg">CAR BARGAIN</div>
          </div>
          <div className="mt-2 inline-block bg-white text-[#131b52] rounded px-2.5 py-1 text-[11px] font-sans font-semibold leading-relaxed">
            Ishaq Khan: 0334-4446062
            <br />
            Akhtar Ali: 0346-8399479
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-[86px] h-[86px] rounded-full bg-gradient-to-br from-white to-[#dfe3f7] flex items-center justify-center shadow-inner">
            <CarIcon />
          </div>
          <div className="mt-1.5 bg-[#f2b705] text-[#131b52] text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full">
            ETNC # {invoiceNumber?.slice(-6) || "582"}
          </div>
        </div>

        <div
          className="text-[#ffd94d] font-bold text-right leading-snug"
          style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
        >
          <div className="text-3xl">بریکوٹ</div>
          <div className="text-2xl">کار زون</div>
        </div>
      </div>

      <div
        className="mx-5 -mt-2 mb-2 bg-[#1f2c7a] text-white text-center text-[15px] py-1.5 rounded-b-lg shadow"
        style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
      >
        نزد شنگردار سٹوپہ، شنگردار بریکوٹ سوات
      </div>

      <div className="text-center mt-3" style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}>
        <div className="text-[#131b52] text-xl">معاہدہ بیعِ گاڑی</div>
        <div className="text-[10px] tracking-[3px] text-gray-400 font-sans font-semibold">
          SALE / ADVANCE PAYMENT AGREEMENT
        </div>
      </div>

      {/* ===== FORM FIELDS ===== */}
      <div className="px-5 mt-2">
        <Row top>
          <Field label="نمبر" value={invoiceNumber?.slice(-6) || "582"} />
          <Field label="تاریخ" value={formatDate(saleDate)} />
        </Row>

        <Row>
          <Field label="فروخت کنندہ نام فریق اول" value={seller?.name || car.userName} grow={2} />
          <Field label="ولد" value={seller?.fatherName} />
        </Row>
        <Row>
          <Field label="سکنہ / تحصیل / ضلع" value={mergedAddress(seller)} grow={3} />
        </Row>

        <Row>
          <Field label="خریدار نام فریق دوم" value={buyer?.name || sale.buyerName} grow={2} />
          <Field label="ولد" value={buyer?.fatherName || sale.buyerFatherName} />
        </Row>
        <Row>
          <Field label="سکنہ / تحصیل / ضلع" value={mergedAddress(buyer)} grow={3} />
        </Row>

        <Row>
          <Field label="گاڑی قسم" value={car.company} />
          <Field label="ماڈل" value={car.model} />
          <Field label="رجسٹریشن نمبر" value={regNumber} />
          <Field label="انجن نمبر" value={car.engineNumber} />
        </Row>
        <Row>
          <Field label="چیسس نمبر" value={car.chassisNumber} grow={2} />
          <Field label="رنگ" value={car.color} />
          <Field label="پاور" value={car.engineCC ? `${car.engineCC} CC` : undefined} />
        </Row>

        <Row>
          <Field label="قیمت مبلغ" value={formatPKR(totalPrice)} grow={2} />
          <Field label="نصف مبلغ" value={formatPKR(totalPrice / 2)} grow={2} />
        </Row>
        <Row>
          <Field label="بیعانہ رقم وصول ہوئے" value={formatPKR(advance)} grow={2} />
          <Field label="باقی ماندہ مبلغ" value={formatPKR(remaining)} grow={2} />
        </Row>

        {isInstalment && (
          <Row>
            <Field label="مدت" value={durationDisplay} />
            <Field label="بعد مقررہ تاریخ" value={deadlineDisplay} />
            <Field label="ماہانہ قسط" value={monthlyDisplay} />
          </Row>
        )}
      </div>

      {/* ===== TOTALS + NOTE + TERMS ===== */}
      <div className="grid grid-cols-[170px_1fr] gap-3 px-5 mt-4">
        <div>
          <div className="border border-[#1f2c7a] rounded-lg overflow-hidden">
            <div
              className="bg-[#131b52] text-[#ffd94d] text-center text-[15px] py-1.5"
              style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
            >
              قیمت کی تفصیل
            </div>
            <div className="flex justify-between px-2.5 py-2 border-b border-dotted border-gray-300 text-[13px]">
              <span className="text-[#1f2c7a] font-semibold">کل قیمت</span>
              <span>{formatPKR(totalPrice)}</span>
            </div>
            <div className="flex justify-between px-2.5 py-2 border-b border-dotted border-gray-300 text-[13px]">
              <span className="text-[#1f2c7a] font-semibold">بیعانہ</span>
              <span>{formatPKR(totalReceived)}</span>
            </div>
            <div className="flex justify-between px-2.5 py-2 text-[13px]">
              <span className="text-[#1f2c7a] font-semibold">بقایا</span>
              <span>{formatPKR(remaining)}</span>
            </div>
          </div>
        </div>

        <div className="border border-[#d8d0ab] rounded-lg bg-[#fffef9] px-3.5 py-2.5">
          <div
            className="text-[#c81e1e] text-center text-[13.5px] pb-1.5 mb-1.5 border-b border-red-100"
            style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
          >
            نوٹ: بارگین کسی بھی قسم کی رقم یا کاغذات کی ذمہ داری قبول نہیں کرے گا۔
          </div>
          <div className="text-[12px] leading-[1.7] text-gray-800">
            {TERMS.map((t, i) => (
              <div key={i} className="mb-1 text-right">
                <bdi className="text-[#1f2c7a] font-bold font-sans text-[11.5px] ml-1">
                  ({i + 1})
                </bdi>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SIGNATURES ===== */}
      <div className="px-5 py-4">
        <div
          className="text-center text-[#c81e1e] font-bold text-[14px] pb-2 mb-3 border-b border-gray-200"
          style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
        >
          مندرجہ بالا شرائط کو خوب پڑھیں، سمجھیں اور درست مان کر دستخط اور انگوٹھے کا نشان لگائیں۔
          شکریہ
        </div>

        <div className="flex items-baseline justify-between text-[13px] mb-4">
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-[#131b52]">وقت</span>
            <span className="border-b border-dotted border-gray-500 w-16 h-4" />
            <span>/</span>
            <span className="border-b border-dotted border-gray-500 w-16 h-4" />
            <span>/</span>
            <span className="border-b border-dotted border-gray-500 w-16 h-4" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-semibold text-[#131b52]">دستخط کاتبِ رشیدہ</span>
            <span className="border-b border-dotted border-gray-500 w-32 h-4" />
          </div>
        </div>

        {/* Seller party block */}
        <div className="border border-[#1f2c7a] rounded-lg p-3.5 mb-4">
          <div
            className="text-center text-[#1f2c7a] text-[16px] mb-3"
            style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
          >
            العہد — فروخت کنندہ
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold whitespace-nowrap">
              فروخت کنندہ کا شناختی کارڈ نمبر
            </span>
            <div className="flex flex-row-reverse">
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-7 border border-[#1f2c7a] -ml-px ${i === 5 || i === 12 ? "border-l-2 border-l-red-600" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="text-right text-[#c81e1e] font-bold text-[13px] mb-3">
            :Ph <span className="inline-block border-b border-dotted border-red-300 w-40" />
          </div>
          <div className="flex items-baseline gap-1 text-[12.5px]">
            <span className="font-semibold">گواہ شدہ نمبر</span>
            <span className="border-b border-dotted border-gray-500 flex-1 h-4" />
            <span className="font-semibold">دستخط</span>
            <span className="border-b border-dotted border-gray-500 flex-1 h-4" />
          </div>
        </div>

        {/* Buyer party block */}
        <div className="border border-[#1f2c7a] rounded-lg p-3.5">
          <div
            className="text-center text-[#1f2c7a] text-[16px] mb-3"
            style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
          >
            العہد — خریدار
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-semibold whitespace-nowrap">
              خریدار کنندہ کا شناختی کارڈ نمبر
            </span>
            <div className="flex flex-row-reverse">
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-7 border border-[#1f2c7a] -ml-px ${i === 5 || i === 12 ? "border-l-2 border-l-red-600" : ""}`}
                />
              ))}
            </div>
          </div>
          <div className="text-right text-[#c81e1e] font-bold text-[13px] mb-3">
            :Ph <span className="inline-block border-b border-dotted border-red-300 w-40" />
          </div>
          <div className="flex items-baseline gap-1 text-[12.5px]">
            <span className="font-semibold">گواہ شدہ نمبر</span>
            <span className="border-b border-dotted border-gray-500 flex-1 h-4" />
            <span className="font-semibold">دستخط</span>
            <span className="border-b border-dotted border-gray-500 flex-1 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomInvoice;
