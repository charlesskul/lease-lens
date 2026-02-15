"use client";

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    pdf,
} from "@react-pdf/renderer";
import type { ComparisonMetrics, CashFlowMonth, CurrencyCode } from "@/lib/types";
import { CURRENCIES } from "@/lib/types";

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#1a1a2e",
        backgroundColor: "#ffffff",
    },
    header: {
        marginBottom: 24,
        borderBottom: "2px solid #3b82f6",
        paddingBottom: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: "Helvetica-Bold",
        color: "#1a1a2e",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: "#6b7280",
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: "Helvetica-Bold",
        color: "#1a1a2e",
        marginBottom: 10,
        marginTop: 20,
        paddingBottom: 4,
        borderBottom: "1px solid #e5e7eb",
    },
    metricsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 8,
    },
    metricBox: {
        flex: 1,
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        padding: 12,
    },
    metricBoxWinner: {
        flex: 1,
        border: "2px solid #10b981",
        borderRadius: 6,
        padding: 12,
        backgroundColor: "#f0fdf4",
    },
    metricLabel: {
        fontSize: 8,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    metricValue: {
        fontSize: 16,
        fontFamily: "Helvetica-Bold",
        color: "#1a1a2e",
    },
    winnerBadge: {
        fontSize: 7,
        color: "#10b981",
        fontFamily: "Helvetica-Bold",
        marginTop: 2,
    },
    table: {
        marginTop: 8,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1px solid #f3f4f6",
        paddingVertical: 4,
    },
    tableHeaderRow: {
        flexDirection: "row",
        borderBottom: "2px solid #e5e7eb",
        paddingVertical: 6,
        backgroundColor: "#f9fafb",
    },
    tableCell: {
        flex: 1,
        fontSize: 8,
        paddingHorizontal: 4,
    },
    tableCellHeader: {
        flex: 1,
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#374151",
        paddingHorizontal: 4,
    },
    tableCellRight: {
        flex: 1,
        fontSize: 8,
        paddingHorizontal: 4,
        textAlign: "right",
    },
    tableCellHeaderRight: {
        flex: 1,
        fontSize: 8,
        fontFamily: "Helvetica-Bold",
        color: "#374151",
        paddingHorizontal: 4,
        textAlign: "right",
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: "row",
        justifyContent: "space-between",
        fontSize: 8,
        color: "#9ca3af",
        borderTop: "1px solid #e5e7eb",
        paddingTop: 8,
    },
    proposalSection: {
        marginBottom: 16,
    },
    proposalName: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: "#1a1a2e",
        marginBottom: 8,
    },
    abatedRow: {
        flexDirection: "row",
        borderBottom: "1px solid #f3f4f6",
        paddingVertical: 4,
        backgroundColor: "#fef3c7",
    },
});

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtCurrency(n: number, currency: CurrencyCode = "USD"): string {
    const config = CURRENCIES[currency];
    return new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);
}

// ─── Cash Flow Table (abbreviated: show every 3rd month or key months) ──────

function CashFlowTable({ cashFlows, currency }: { cashFlows: CashFlowMonth[]; currency: CurrencyCode }) {
    // Show first 6, then every 6th, plus last month
    const visibleRows = cashFlows.filter((cf, i) => {
        if (i < 6) return true;
        if ((i + 1) % 6 === 0) return true;
        if (i === cashFlows.length - 1) return true;
        return false;
    });

    return (
        <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
                <Text style={styles.tableCellHeader}>Month</Text>
                <Text style={styles.tableCellHeader}>Date</Text>
                <Text style={styles.tableCellHeaderRight}>Scheduled</Text>
                <Text style={styles.tableCellHeaderRight}>Actual</Text>
                <Text style={styles.tableCellHeaderRight}>NNN</Text>
                <Text style={styles.tableCellHeaderRight}>Net Out</Text>
                <Text style={styles.tableCellHeaderRight}>Cumulative</Text>
            </View>
            {visibleRows.map((cf) => (
                <View
                    key={cf.month}
                    style={cf.isAbated ? styles.abatedRow : styles.tableRow}
                >
                    <Text style={styles.tableCell}>{cf.month}</Text>
                    <Text style={styles.tableCell}>{cf.dateLabel}</Text>
                    <Text style={styles.tableCellRight}>
                        {fmtCurrency(cf.scheduledRent, currency)}
                    </Text>
                    <Text style={styles.tableCellRight}>
                        {fmtCurrency(cf.actualRent, currency)}
                    </Text>
                    <Text style={styles.tableCellRight}>{fmtCurrency(cf.nnn, currency)}</Text>
                    <Text style={styles.tableCellRight}>
                        {fmtCurrency(cf.netCashOut, currency)}
                    </Text>
                    <Text style={styles.tableCellRight}>
                        {fmtCurrency(cf.cumulativeCashOut, currency)}
                    </Text>
                </View>
            ))}
        </View>
    );
}

// ─── PDF Document ────────────────────────────────────────────────────────────

interface LeaseReportPDFProps {
    metrics: ComparisonMetrics[];
    discountRate: number;
    currency: CurrencyCode;
}

function LeaseReportDocument({ metrics, discountRate, currency }: LeaseReportPDFProps) {
    const lowestNpv = Math.min(...metrics.map((m) => m.npv));
    const lowestEmr = Math.min(...metrics.map((m) => m.effectiveMonthlyRent));
    const currencyLabel = CURRENCIES[currency].name;
    const now = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Document>
            {/* Page 1: Summary */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>Lease Lens — Comparison Report</Text>
                    <Text style={styles.subtitle}>
                        Generated {now} • Discount Rate: {discountRate}% annually • Currency: {currencyLabel} ({currency})
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Executive Summary</Text>

                {metrics.map((m, i) => {
                    const isNpvWinner = metrics.length > 1 && m.npv === lowestNpv;
                    const isEmrWinner =
                        metrics.length > 1 && m.effectiveMonthlyRent === lowestEmr;

                    return (
                        <View key={m.proposalId} style={styles.proposalSection}>
                            <Text style={styles.proposalName}>
                                {i + 1}. {m.proposalName} ({m.totalMonths} months)
                            </Text>
                            <View style={styles.metricsRow}>
                                <View style={styles.metricBox}>
                                    <Text style={styles.metricLabel}>Total Cash Out</Text>
                                    <Text style={styles.metricValue}>
                                        {fmtCurrency(m.totalCashOut, currency)}
                                    </Text>
                                </View>
                                <View style={styles.metricBox}>
                                    <Text style={styles.metricLabel}>Avg Monthly</Text>
                                    <Text style={styles.metricValue}>
                                        {fmtCurrency(m.averageMonthlyRent, currency)}
                                    </Text>
                                </View>
                                <View
                                    style={isNpvWinner ? styles.metricBoxWinner : styles.metricBox}
                                >
                                    <Text style={styles.metricLabel}>NPV</Text>
                                    <Text style={styles.metricValue}>
                                        {fmtCurrency(m.npv, currency)}
                                    </Text>
                                    {isNpvWinner && (
                                        <Text style={styles.winnerBadge}>✓ Lowest NPV</Text>
                                    )}
                                </View>
                                <View
                                    style={
                                        isEmrWinner ? styles.metricBoxWinner : styles.metricBox
                                    }
                                >
                                    <Text style={styles.metricLabel}>Effective Monthly</Text>
                                    <Text style={styles.metricValue}>
                                        {fmtCurrency(m.effectiveMonthlyRent, currency)}
                                    </Text>
                                    {isEmrWinner && (
                                        <Text style={styles.winnerBadge}>✓ Best Value</Text>
                                    )}
                                </View>
                            </View>
                        </View>
                    );
                })}

                <View style={styles.footer}>
                    <Text>Lease Lens — Decision Intelligence Tool</Text>
                    <Text>Page 1</Text>
                </View>
            </Page>

            {/* Per-proposal detail pages */}
            {metrics.map((m, pageIdx) => (
                <Page key={m.proposalId} size="A4" style={styles.page}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{m.proposalName} — Cash Flow Detail</Text>
                        <Text style={styles.subtitle}>
                            {m.totalMonths} months • Discount Rate: {discountRate}% • {currency}
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Amortization Schedule</Text>
                    <CashFlowTable cashFlows={m.cashFlows} currency={currency} />

                    <View style={styles.footer}>
                        <Text>Lease Lens — Decision Intelligence Tool</Text>
                        <Text>Page {pageIdx + 2}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
}

// ─── PDF Download Utility ────────────────────────────────────────────────────

export async function downloadLeaseReport(
    metrics: ComparisonMetrics[],
    discountRate: number,
    currency: CurrencyCode = "USD"
): Promise<void> {
    const blob = await pdf(
        <LeaseReportDocument metrics={metrics} discountRate={discountRate} currency={currency} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lease-lens-report-${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
