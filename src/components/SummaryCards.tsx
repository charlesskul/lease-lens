"use client";

import MetricCard from "@/components/MetricCard";
import type { ComparisonMetrics } from "@/lib/types";
import type { CurrencyCode } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import {
    DollarSign,
    TrendingDown,
    Calculator,
    BarChart3,
} from "lucide-react";

interface SummaryCardsProps {
    metrics: ComparisonMetrics[];
    currency: CurrencyCode;
}

export default function SummaryCards({ metrics, currency }: SummaryCardsProps) {
    if (metrics.length === 0) return null;

    // Determine winners (lowest values)
    const lowestNpv = Math.min(...metrics.map((m) => m.npv));
    const lowestEmr = Math.min(...metrics.map((m) => m.effectiveMonthlyRent));

    return (
        <div className="space-y-6">
            {metrics.map((m, i) => {
                const isNpvWinner = metrics.length > 1 && m.npv === lowestNpv;
                const isEmrWinner =
                    metrics.length > 1 && m.effectiveMonthlyRent === lowestEmr;

                return (
                    <div key={m.proposalId}>
                        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            {m.proposalName}
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <MetricCard
                                label="Total Cash Out"
                                value={formatCurrency(m.totalCashOut, currency)}
                                icon={DollarSign}
                                accentColor={
                                    [
                                        "text-blue-400",
                                        "text-emerald-400",
                                        "text-violet-400",
                                        "text-amber-400",
                                    ][i % 4]
                                }
                            />
                            <MetricCard
                                label="Avg Monthly Rent"
                                value={formatCurrency(m.averageMonthlyRent, currency)}
                                icon={BarChart3}
                                accentColor={
                                    [
                                        "text-blue-400",
                                        "text-emerald-400",
                                        "text-violet-400",
                                        "text-amber-400",
                                    ][i % 4]
                                }
                            />
                            <MetricCard
                                label="Net Present Value"
                                value={formatCurrency(m.npv, currency)}
                                icon={TrendingDown}
                                isWinner={isNpvWinner}
                                subtitle="Discounted total cost"
                                accentColor={
                                    [
                                        "text-blue-400",
                                        "text-emerald-400",
                                        "text-violet-400",
                                        "text-amber-400",
                                    ][i % 4]
                                }
                            />
                            <MetricCard
                                label="Effective Monthly"
                                value={formatCurrency(m.effectiveMonthlyRent, currency)}
                                icon={Calculator}
                                isWinner={isEmrWinner}
                                subtitle="True monthly cost"
                                accentColor={
                                    [
                                        "text-blue-400",
                                        "text-emerald-400",
                                        "text-violet-400",
                                        "text-amber-400",
                                    ][i % 4]
                                }
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
