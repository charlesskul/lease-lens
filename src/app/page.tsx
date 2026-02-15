"use client";

import { useMemo, useState } from "react";
import { useLeaseStore } from "@/store/store";
import { calculateMetrics } from "@/lib/calculations";
import { CURRENCIES, type CurrencyCode } from "@/lib/types";
import ProposalForm from "@/components/ProposalForm";
import SummaryCards from "@/components/SummaryCards";
import ComparisonChart from "@/components/ComparisonChart";
import { downloadLeaseReport } from "@/components/LeaseReportPDF";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FileDown,
  Loader2,
  Eye,
  Settings2,
  Coins,
} from "lucide-react";

export default function Dashboard() {
  const { proposals, discountRate, currency, addProposal, setDiscountRate, setCurrency } =
    useLeaseStore();
  const [isExporting, setIsExporting] = useState(false);

  // Re-calculate metrics whenever proposals or discount rate change
  const metrics = useMemo(
    () => proposals.map((p) => calculateMetrics(p, discountRate)),
    [proposals, discountRate]
  );

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await downloadLeaseReport(metrics, discountRate, currency);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Lease Lens</h1>
              <p className="text-xs text-muted-foreground">
                Commercial Lease Decision Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Selector */}
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <Label className="text-xs text-muted-foreground whitespace-nowrap">
                Currency
              </Label>
              <Select
                value={currency}
                onValueChange={(val: string) => setCurrency(val as CurrencyCode)}
              >
                <SelectTrigger className="h-8 w-28 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CURRENCIES).map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Global Discount Rate */}
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Label
                htmlFor="discount-rate"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                Discount Rate
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  id="discount-rate"
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value))}
                  className="h-8 w-20 text-center text-sm"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting || metrics.length === 0}
              className="gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────────── */}
      <main className="mx-auto max-w-[1600px] px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[420px_1fr] xl:grid-cols-[480px_1fr]">
          {/* ─── Left Column: Inputs ──────────────────────────────── */}
          <aside className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Lease Proposals
              </h2>
              {proposals.length < 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addProposal}
                  className="gap-1.5 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Proposal
                </Button>
              )}
            </div>

            {proposals.map((p, i) => (
              <ProposalForm
                key={p.id}
                proposal={p}
                index={i}
                canRemove={proposals.length > 1}
              />
            ))}
          </aside>

          {/* ─── Right Column: Visuals ────────────────────────────── */}
          <section className="space-y-8">
            {/* Summary Metrics */}
            <div>
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Comparison Summary
              </h2>
              <SummaryCards metrics={metrics} currency={currency} />
            </div>

            {/* Charts */}
            <div>
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Visual Analysis
              </h2>
              <ComparisonChart metrics={metrics} currency={currency} />
            </div>
          </section>
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 py-6 text-center text-xs text-muted-foreground">
        <p>
          Lease Lens — A decision-intelligence tool for commercial lease
          analysis.
        </p>
        <p className="mt-1 opacity-60">
          Built with Next.js, TypeScript, and financial precision.
        </p>
      </footer>
    </div>
  );
}
