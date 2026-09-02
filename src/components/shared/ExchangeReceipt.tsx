// src/components/shared/ExchangeReceipt.tsx
import React from "react";

const formatPKR = (amount?: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);

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

const Field: React.FC<{ label: string; value?: React.ReactNode; grow?: number }> = ({
  label,
  value,
  grow = 1,
}) => (
  <div className="flex items-baseline gap-1.5 min-w-0" style={{ flex: grow }}>
    <span className="text-[#131b52] font-semibold text-[13px] whitespace-nowrap">{label}</span>
    <span className="flex-1 border-b border-dotted border-gray-600 text-center text-[13px] font-medium text-gray-900 min-h-[18px] px-1 truncate">
      {value ?? ""}
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

const CnicGrid: React.FC<{ value?: string }> = ({ value }) => {
  const digits = (value || "").replace(/\D/g, "").slice(0, 13).split("");
  return (
    <div className="flex flex-row-reverse">
      {Array.from({ length: 13 }).map((_, i) => (
        <div
          key={i}
          className={`w-5 h-6 border border-[#1f2c7a] -ml-px flex items-center justify-center text-[11px] font-sans font-semibold ${
            i === 5 || i === 12 ? "border-l-2 border-l-red-600" : ""
          }`}
        >
          {digits[i] || ""}
        </div>
      ))}
    </div>
  );
};

const SignerBlock: React.FC<{ role: string; name?: string; cnic?: string; phone?: string }> = ({
  role,
  name,
  cnic,
  phone,
}) => (
  <div className="mb-4">
    <div className="flex items-baseline justify-between text-[12px] mb-1 px-1">
      <span className="flex items-baseline gap-1">
        <span className="font-semibold text-[#1f2c7a]">العہد</span>
        <span className="border-b border-dotted border-gray-500 w-28 h-4 text-center">
          {name || ""}
        </span>
      </span>
      <span className="flex items-baseline gap-1">
        <span className="font-semibold text-[#1f2c7a]">موبائل نمبر</span>
        <span className="border-b border-dotted border-gray-500 w-24 h-4 text-center">
          {phone || ""}
        </span>
      </span>
    </div>
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] font-semibold whitespace-nowrap">{role}</span>
        <CnicGrid value={cnic} />
      </div>
      <div className="flex items-baseline gap-1 text-[12.5px]">
        <span className="font-semibold whitespace-nowrap">نام و دستخط</span>
        <span className="border-b border-dotted border-gray-500 w-36 h-4 text-center">
          {name || ""}
        </span>
      </div>
    </div>
  </div>
);

const TERMS = [
  "فریقین مکمل ہوش و حواس میں ہوں اور دونوں گاڑیوں کے تبادلے کے تمام اختیارات مکمل رکھتے ہوں۔",
  "آج سے پہلے کی تمام لائبیلٹیز اور متعلقہ کاغذات کا ذمہ دار اس گاڑی کا اصل مالک ہوگا۔",
  "گاڑی کے کاغذات میں کسی نقص کی صورت میں متعلقہ فریق خود ذمہ دار ہوگا۔",
  "فریقین سے اگر کسی گاڑی کے بدلے رقم کا فرق طے ہوا ہو تو وہ مقررہ وقت پر ادا کی جائے گی۔",
  "آج سے پہلے گاڑی سے متعلق کسی حادثہ، ٹیکس، چالان یا دیگر مسئلہ کی ذمہ داری اصل مالک کی ہوگی۔",
  "بارگین اس تبادلے میں کاغذی کارروائی کا ذمہ دار ہوگا، کمیشن کسی صورت واپس نہ ہوگا۔",
  "فریقین کسی بھی قسم کی رنگ، ٹیکس، رجسٹریشن یا نمبر کی تبدیلی کے بعد اعتراض کے حقدار نہ ہوں گے۔",
];

export type ExchangeReceiptProps = {
  ex: any;
  showroomOwner: any;
  customerOwner: any;
  isStockSource: boolean;
  dateStr: string;
};

export const ExchangeReceipt: React.FC<ExchangeReceiptProps> = ({
  ex,
  showroomOwner,
  customerOwner,
  isStockSource,
  dateStr,
}) => {
  const carA = ex.showroomCar || {};
  const carB = ex.customerCar || {};
  const regA = carA.carType === "CP (Custom Paid)" ? carA.registrationNumber : carA.localNumber;
  const regB = carB.carType === "CP (Custom Paid)" ? carB.registrationNumber : carB.localNumber;
  const valueA = isStockSource ? (carA.salePrice ?? carA.actualValue) : carA.value;
  const valueB = carB.value;

  const formatPower = (car: any) => {
    const power = car.powerCC || car.engineCC;
    return power ? `${power} CC` : undefined;
  };

  // Payment settlement details
  const finalDirection = ex.finalDirection || "none";
  const finalAmount = ex.finalAmount || 0;
  const amountReceived = Number(ex.amountReceivedFromCustomer) || 0;
  const amountPaid = Number(ex.amountPaidToCustomer) || 0;
  const dueAmount = Number(ex.dueAmount) || 0;
  const dueFromShowroom = Number(ex.dueFromShowroom) || 0;

  // Determine labels and values for the "بیشگی رقم" and "بیعانہ" fields
  let advanceLabel = "بیشگی رقم روپے وصول ہوئے";
  let advanceValue = 0;
  let balanceLabel = "بیعانہ";
  let balanceValue = 0;

  if (finalDirection === "customer_pays_showroom") {
    advanceLabel = "مشتری سے وصول شدہ رقم";
    advanceValue = amountReceived;
    balanceLabel = "مشتری پر بقایا";
    balanceValue = dueAmount;
  } else if (finalDirection === "showroom_pays_customer") {
    advanceLabel = "مشتری کو ادا شدہ رقم";
    advanceValue = amountPaid;
    balanceLabel = "مشتری کو بقایا";
    balanceValue = dueFromShowroom;
  } else {
    // No money involved – keep original labels and show zeros
    advanceValue = 0;
    balanceValue = 0;
  }

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
            ETNC # 582
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

      {/* ===== FORM FIELDS ===== */}
      <div className="px-5 mt-3">
        <Row top>
          <Field label="نمبر" value={ex.dealNumber} />
          <div
            className="bg-[#c81e1e] text-white text-[13px] font-bold px-4 py-1 rounded-full"
            style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
          >
            رسیدنامہ
          </div>
          <Field label="تاریخ" value={dateStr} />
        </Row>

        {/* ---- Party 1 / first vehicle ---- */}
        <Row>
          <Field label="فروخت کنندہ نام فریق اول" value={showroomOwner?.name} grow={2} />
          <Field label="ولد" value={showroomOwner?.fatherName} />
        </Row>
        <Row>
          <Field label="سکنہ / تحصیل / ضلع" value={showroomOwner?.address} grow={3} />
        </Row>
        <Row>
          <Field label="گاڑی قسم" value={carA.company} />
          <Field label="رجسٹریشن نمبر" value={regA} />
          <Field label="ماڈل" value={carA.model} />
          <Field label="انجن نمبر" value={carA.engineNumber} />
        </Row>
        <Row>
          <Field label="چیسس نمبر" value={carA.chassisNumber} grow={2} />
          <Field label="رنگ" value={carA.color} />
          <Field label="پاور" value={formatPower(carA)} />
        </Row>
        <Row>
          <Field label="کاغذات کی حالت" value={carA.carType} />
          {carA.carType === "CP (Custom Paid)" && (
            <Field label="رجسٹریشن شہر" value={carA.registrationCity} />
          )}
          <Field label="مائلیج" value={carA.mileage ? `${carA.mileage} km` : undefined} />
          <Field label="حالتِ گاڑی" value={carA.condition} />
        </Row>
        <Row>
          <Field label="قیمت مبلغ" value={formatPKR(valueA)} grow={2} />
          <Field
            label="نصف مبلغ پاکستانی روپے میں، مقرر ہوئے"
            value={formatPKR(valueA ? valueA / 2 : undefined)}
            grow={2}
          />
        </Row>

        {/* ---- Party 2 / second vehicle ---- */}
        <Row>
          <Field label="خریدار نام فریق دوم" value={customerOwner?.name} grow={2} />
          <Field label="ولد" value={customerOwner?.fatherName} />
        </Row>
        <Row>
          <Field label="سکنہ / تحصیل / ضلع" value={customerOwner?.address} grow={3} />
        </Row>
        <Row>
          <Field label="گاڑی قسم" value={carB.company} />
          <Field label="رجسٹریشن نمبر" value={regB} />
          <Field label="ماڈل" value={carB.model} />
          <Field label="انجن نمبر" value={carB.engineNumber} />
        </Row>
        <Row>
          <Field label="چیسس نمبر" value={carB.chassisNumber} grow={2} />
          <Field label="رنگ" value={carB.color} />
          <Field label="پاور" value={formatPower(carB)} />
        </Row>
        <Row>
          <Field label="کاغذات کی حالت" value={carB.carType} />
          {carB.carType === "CP (Custom Paid)" && (
            <Field label="رجسٹریشن شہر" value={carB.registrationCity} />
          )}
          <Field label="مائلیج" value={carB.mileage ? `${carB.mileage} km` : undefined} />
          <Field label="حالتِ گاڑی" value={carB.condition} />
        </Row>
        <Row>
          <Field label="قیمت مبلغ" value={formatPKR(valueB)} grow={2} />
          <Field
            label="نصف مبلغ پاکستانی روپے میں، مقرر ہوئے"
            value={formatPKR(valueB ? valueB / 2 : undefined)}
            grow={2}
          />
        </Row>

        {/* ---- Payment row (dynamic labels) ---- */}
        <Row>
          <Field label={advanceLabel} value={formatPKR(advanceValue)} grow={2} />
          <Field label={balanceLabel} value={formatPKR(balanceValue)} grow={2} />
        </Row>

        {ex.notes && (
          <Row>
            <Field label="نوٹس / ریمارکس" value={ex.notes} grow={4} />
          </Row>
        )}
      </div>

      {/* ===== NOTE / TERMS ===== */}
      <div className="px-5 mt-4">
        <div className="border border-[#e3b93a] rounded-lg bg-[#fdf6dc] px-3.5 py-2.5">
          <div
            className="text-[#c81e1e] text-center text-[14px] font-bold pb-1.5 mb-1.5 border-b border-yellow-200"
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

        <div
          className="mt-3 pt-2 border-t border-gray-200 text-center text-[#c81e1e] font-bold text-[14px]"
          style={{ fontFamily: "'Noto Nastaliq Urdu',serif" }}
        >
          مندرجہ بالا شرائط کو خوب پڑھیں، سمجھیں اور درست مان کر دستخط اور انگوٹھے کا نشان لگائیں۔
          شکریہ
        </div>
      </div>

      {/* ===== SIGNATURES ===== */}
      <div className="px-5 py-4">
        <SignerBlock
          role="فروخت کنندہ کا شناختی کارڈ نمبر"
          name={showroomOwner?.name}
          cnic={showroomOwner?.cnic}
          phone={showroomOwner?.phone}
        />
        <SignerBlock
          role="خریدار کنندہ کا شناختی کارڈ نمبر"
          name={customerOwner?.name}
          cnic={customerOwner?.cnic}
          phone={customerOwner?.phone}
        />
        <SignerBlock role="گواہ شدہ کا شناختی کارڈ نمبر" />
        <SignerBlock role="گواہ شدہ کا شناختی کارڈ نمبر" />

        <div className="flex items-baseline gap-1 text-[13px] mt-1">
          <span className="font-semibold text-[#131b52]">دستخط کاتبِ الرسید</span>
          <span className="flex-1 border-b border-dotted border-gray-500 h-4" />
        </div>
      </div>
    </div>
  );
};

export default ExchangeReceipt;
