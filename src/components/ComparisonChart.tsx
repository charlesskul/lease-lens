"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComparisonMetrics } from "@/lib/types";
import type { CurrencyCode } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

const CHART_COLORS = [
    "hsl(217, 91%, 60%)",   // Blue
    "hsl(160, 84%, 39%)",   // Emerald
    "hsl(263, 70%, 50%)",   // Violet
    "hsl(38, 92%, 50%)",    // Amber
];

interface ComparisonChartProps {
    metrics: ComparisonMetrics[];
    currency: CurrencyCode;
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadItem {
    color: string;
    name: string;
    value: number;
}

function CustomTooltip({
    active,
    payload,
    label,
    currency,
}: {
    active?: boolean;
    payload?: TooltipPayloadItem[];
    label?: string;
    currency?: CurrencyCode;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-lg border border-border/50 bg-popover/95 p-3 shadow-xl backdrop-blur-sm">
            <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
            {payload.map((entry: TooltipPayloadItem, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                    <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-muted-foreground">{entry.name}:</span>
                    <span className="font-semibold">{formatCurrency(entry.value, currency)}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ComparisonChart({ metrics, currency }: ComparisonChartProps) {
    // Build data for charts: merge all proposals into a single timeline array
    const { cumulativeData, monthlyData, tickInterval } = useMemo(() => {
        if (metrics.length === 0)
            return { cumulativeData: [], monthlyData: [], tickInterval: 12 };

        const maxMonths = Math.max(...metrics.map((m) => m.totalMonths));
        const cumulative: Record<string, string | number>[] = [];
        const monthly: Record<string, string | number>[] = [];

        for (let i = 0; i < maxMonths; i++) {
            const cumRow: Record<string, string | number> = {};
            const monthRow: Record<string, string | number> = {};

            // Use the first proposal's date label, or fall back to "Month X"
            cumRow.month =
                metrics[0]?.cashFlows[i]?.dateLabel ?? `Month ${i + 1}`;
            monthRow.month = cumRow.month;

            for (const m of metrics) {
                if (i < m.cashFlows.length) {
                    cumRow[m.proposalName] = m.cashFlows[i].cumulativeCashOut;
                    monthRow[m.proposalName] = m.cashFlows[i].netCashOut;
                }
            }

            cumulative.push(cumRow);
            monthly.push(monthRow);
        }

        const tick = maxMonths > 60 ? 12 : maxMonths > 24 ? 6 : 3;
        return {
            cumulativeData: cumulative,
            monthlyData: monthly,
            tickInterval: tick,
        };
    }, [metrics]);

    if (metrics.length === 0) {
        return (
            <Card className="border-dashed border-border/50">
                <CardContent className="flex h-80 items-center justify-center text-muted-foreground">
                    Add lease proposals to see visualizations
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                    Cost Comparison
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="cumulative" className="w-full">
                    <TabsList className="mb-4 grid w-full grid-cols-2 bg-muted/50">
                        <TabsTrigger value="cumulative" className="text-xs">
                            Cumulative Cost
                        </TabsTrigger>
                        <TabsTrigger value="monthly" className="text-xs">
                            Monthly Cash Flow
                        </TabsTrigger>
                    </TabsList>

                    {/* Cumulative Cost Line Chart */}
                    <TabsContent value="cumulative" className="mt-0">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={cumulativeData}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(0 0% 30%)"
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                                        interval={tickInterval - 1}
                                        angle={-30}
                                        textAnchor="end"
                                        height={50}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                                        tickFormatter={(val: number) => formatCurrency(val, currency)}
                                        width={80}
                                    />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                    />
                                    {metrics.map((m, i) => (
                                        <Line
                                            key={m.proposalId}
                                            type="monotone"
                                            dataKey={m.proposalName}
                                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 4, strokeWidth: 0 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>

                    {/* Monthly Cash Flow Bar Chart */}
                    <TabsContent value="monthly" className="mt-0">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyData}
                                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="hsl(0 0% 30%)"
                                        opacity={0.3}
                                    />
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                                        interval={tickInterval - 1}
                                        angle={-30}
                                        textAnchor="end"
                                        height={50}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: "hsl(0 0% 60%)" }}
                                        tickFormatter={(val: number) => formatCurrency(val, currency)}
                                        width={80}
                                    />
                                    <Tooltip content={<CustomTooltip currency={currency} />} />
                                    <Legend
                                        wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                                    />
                                    {metrics.map((m, i) => (
                                        <Bar
                                            key={m.proposalId}
                                            dataKey={m.proposalName}
                                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                                            opacity={0.8}
                                            radius={[2, 2, 0, 0]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
