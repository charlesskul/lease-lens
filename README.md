# 🔍 Lease Lens — Commercial Lease Decision Intelligence

> **Compare commercial lease proposals and find the best deal — backed by real financial math.**

Lease Lens is a web-based tool that helps **tenants, brokers, and financial analysts** evaluate up to 4 commercial lease proposals side-by-side. Instead of comparing headline rent alone, it uses **Net Present Value (NPV)** and **Effective Monthly Rent** calculations to reveal the true cost of each lease — accounting for free rent periods, escalations, tenant improvement allowances, and operating expenses.

All calculations run **100% client-side** in the browser. No data is ever sent to a server.

---

## 📋 Table of Contents

- [Features](#-features)
- [How to Use](#-how-to-use)
- [How It Works — The Math Explained](#-how-it-works--the-math-explained)
- [Supported Currencies](#-supported-currencies)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Running Tests](#-running-tests)
- [License](#-license)

---

## ✨ Features

- **Compare up to 4 Lease Proposals** — Enter lease details side-by-side with color-coded forms.
- **NPV Analysis** — See the true present-day cost of each lease after discounting future payments.
- **Effective Monthly Rent** — Converts NPV into a flat monthly cost for easy apples-to-apples comparison.
- **Rent Escalation** — Supports annual percentage increases, fixed dollar increases, or flat rent.
- **Free Rent / Abatement** — Model rent-free months at the start of a lease.
- **TI Allowance** — Factor in lump-sum tenant improvement allowances that reduce your net cost.
- **NNN / Operating Expenses** — Include monthly triple-net charges in the total cost analysis.
- **Multi-Currency Support** — Switch between **USD ($)** and **PHP (₱)** with one click.
- **Interactive Charts** — Visualize cumulative costs and monthly cash flows with line and bar charts.
- **PDF Export** — Generate a professional comparison report with full amortization schedules.
- **Winner Detection** — Automatically highlights the cheapest proposal based on NPV and Effective Monthly Rent.

---

## 🖥️ How to Use

1. **Enter Lease Details** — Fill out the forms on the left panel for each proposal:
   - **Proposal Name** — Give each lease a label (e.g., "Main Street Office").
   - **Lease Term** — How many years the lease runs.
   - **Start Date** — When the lease begins.
   - **Base Rent** — The monthly rent before any escalation.
   - **Square Footage** — The size of the space (for reference).
   - **NNN / OpEx** — Monthly operating expenses (paid even during free-rent months).
   - **Escalation** — Choose "None", "% Annual" (e.g., 3% per year), or "Fixed" (e.g., $200/year increase).
   - **Free Rent Months** — How many months at the start you pay zero rent.
   - **TI Allowance** — A lump sum the landlord gives you upfront for build-out.

2. **Set Global Parameters** (in the header):
   - **Currency** — Pick USD or PHP; all labels and values update immediately.
   - **Discount Rate** — The annual rate used to discount future cash flows (typically 5–10%).

3. **Read the Results** (right panel):
   - **Summary Cards** — Shows Total Cash Out, Average Monthly Rent, NPV, and Effective Monthly Rent for each proposal. The cheapest is labeled "Best Value."
   - **Charts** — Toggle between cumulative cost over time and monthly cash flow views.

4. **Export PDF** — Click the "Export PDF" button to download a professional report.

---

## 🧮 How It Works — The Math Explained

### Step 1: Building the Monthly Cash Flow Schedule

For each proposal, the system generates a **month-by-month payment timeline** spanning the full lease term.

**How rent changes each year (Escalation):**

| Type | What Happens |
|---|---|
| None | Rent stays the same every year |
| Percentage (e.g., 3%) | Year 2 = Year 1 rent × 1.03, Year 3 = Year 2 rent × 1.03, etc. |
| Fixed (e.g., $200) | Year 2 = Year 1 rent + $200, Year 3 = Year 2 rent + $200, etc. |

**How free rent works (Abatement):**
- During free-rent months (e.g., months 1–6), your rent is $0.
- However, NNN/OpEx charges are **still due** during free-rent months.

**How TI Allowance works:**
- The tenant improvement allowance is applied as a **one-time deduction** in Month 1.
- This reduces your net cash outflow in the first month.

**Net Cash Out per month:**
```
net_cash_out = actual_rent + NNN_monthly − TI_allowance (Month 1 only)
```

**Cumulative Cash Out:**
- A running total of all net cash out from Month 1 to the current month.

---

### Step 2: Net Present Value (NPV) — "What's the true cost in today's money?"

Money paid in the future is worth less than money paid today (because you could invest that money and earn returns). NPV converts all future payments into **today's equivalent value**.

**The formula:**
```
              Month 1 payment     Month 2 payment            Month N payment
NPV   =     ─────────────────  + ─────────────────  + ... + ─────────────────
               (1 + r)^1           (1 + r)^2                  (1 + r)^N
```

Where:
- **r** = monthly discount rate (converted from the annual rate you set)
- **N** = total number of months in the lease

**How the annual discount rate converts to monthly:**
```
monthly_rate = (1 + annual_rate / 100) ^ (1/12) − 1

Example: 5% annual rate → 0.4074% monthly rate
```

**Why NPV matters — a real example:**

| | Proposal A | Proposal B |
|---|---|---|
| Rent | $5,000/month | $5,500/month |
| Free Rent | 6 months | 0 months |
| Total Cash (simple) | $270,000 | $330,000 |
| **NPV (@ 5%)** | **$236,092** | **$292,362** |

Without NPV, Proposal A looks $60K cheaper. With NPV, it's actually $56K cheaper — because those 6 free months at the start of the lease are worth more in present-value terms than 6 free months at the end would be.

---

### Step 3: Effective Monthly Rent (EMR) — "What would I pay if the lease were flat?"

EMR takes the NPV and converts it into a **single flat monthly amount** that would be economically equivalent to the entire lease. This makes wildly different lease structures directly comparable.

**The formula:**
```
                    NPV × r
EMR  =  ─────────────────────────────
         1 − (1 + r) ^ (−N)
```

This is the standard financial **PMT** (payment) formula — the same formula banks use to calculate mortgage payments.

**Example:**
- A 5-year lease at $5,000/month with 6 months free rent has an EMR of **≈ $4,443/month**.
- This tells you the "true" monthly cost is 11% lower than the headline rent.

---

### Step 4: Winner Detection

When comparing multiple proposals, Lease Lens marks the proposal with the **lowest NPV** and **lowest EMR** as "Best Value" — these are the proposals that cost you the least overall when you account for time value of money.

---

## 💱 Supported Currencies

| Currency | Symbol | Locale |
|---|---|---|
| US Dollar (USD) | $ | en-US |
| Philippine Peso (PHP) | ₱ | en-PH |

**Adding more currencies** is simple — just add an entry in `src/lib/types.ts`:

```typescript
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    USD: { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
    PHP: { code: "PHP", symbol: "₱", locale: "en-PH", name: "Philippine Peso" },
    // Add your currency here:
    EUR: { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
};
```

Then add `"EUR"` to the `CurrencyCode` type union in the same file.

---

## 🏗️ Project Structure

```
lease-lens/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Main dashboard — header, controls, layout
│   │   ├── layout.tsx          # Root HTML layout with metadata
│   │   └── globals.css         # Design tokens and global styles
│   │
│   ├── components/
│   │   ├── ProposalForm.tsx    # Lease proposal input form (one per proposal)
│   │   ├── SummaryCards.tsx    # Comparison metrics display (NPV, EMR, totals)
│   │   ├── MetricCard.tsx      # Single metric card with "Best Value" badge
│   │   ├── ComparisonChart.tsx # Recharts line and bar charts
│   │   ├── LeaseReportPDF.tsx  # PDF report generator (react-pdf)
│   │   └── ui/                 # Reusable UI primitives (Button, Card, Select, etc.)
│   │
│   ├── lib/
│   │   ├── types.ts            # All TypeScript types + currency configuration
│   │   ├── calculations.ts    # Financial math engine (NPV, EMR, timeline)
│   │   ├── format.ts           # Currency and percentage formatting utilities
│   │   ├── utils.ts            # General helpers
│   │   └── __tests__/
│   │       └── calculations.test.ts  # 31 verification tests for the math engine
│   │
│   └── store/
│       └── store.ts            # Zustand global state (proposals, discount rate, currency)
│
├── package.json
├── tsconfig.json
└── README.md                   # You are here
```

**How data flows through the app:**

```
User Input (Forms)
      │
      ▼
Zustand Store (proposals, discountRate, currency)
      │
      ▼
calculations.ts (pure math — NPV, EMR, timeline)
      │
      ▼
┌─────────────────────────────────────────┐
│  SummaryCards    ComparisonChart    PDF  │
│  (metric cards)  (line + bar)    Export  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Technology | What It Does |
|---|---|
| **Next.js 16** | React framework powering the app |
| **TypeScript** | Strict type safety across the entire codebase |
| **Zustand** | Lightweight state management (proposals, settings) |
| **Recharts** | Interactive SVG charts for visual analysis |
| **React Hook Form + Zod** | Form handling with schema-based validation |
| **@react-pdf/renderer** | Generates downloadable PDF reports in the browser |
| **shadcn/ui** | Pre-built accessible UI components |
| **Tailwind CSS 4** | Utility-first CSS framework for styling |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **npm** installed on your machine.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/charlesskul/lease-lens.git
cd lease-lens

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🧪 Running Tests

The math engine has **31 verification tests** covering:

- Annual-to-monthly discount rate conversion
- Flat lease timeline generation
- Percentage and fixed escalation logic
- Free rent (abatement) periods
- TI allowance deductions
- NNN/OpEx charges
- NPV calculation accuracy
- Effective Monthly Rent round-trip verification
- Full comparative metrics (abated vs. flat lease)

Run them with:

```bash
npx tsx src/lib/__tests__/calculations.test.ts
```

All 31 tests should pass:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Results: 31 passed, 0 failed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <b>Lease Lens</b> — See the true cost of every lease.<br>
  Built with Next.js, TypeScript, and financial precision.
</p>
