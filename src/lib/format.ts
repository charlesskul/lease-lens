/**
 * Formatting utilities for currency and percentage display.
 * Supports multiple currencies via the CURRENCIES configuration.
 */

import { CURRENCIES, type CurrencyCode } from "./types";

// Cache formatters to avoid re-creating on every call
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: CurrencyCode, showCents: boolean): Intl.NumberFormat {
    const key = `${currency}-${showCents ? "cents" : "whole"}`;
    let fmt = formatterCache.get(key);
    if (!fmt) {
        const config = CURRENCIES[currency];
        fmt = new Intl.NumberFormat(config.locale, {
            style: "currency",
            currency: config.code,
            minimumFractionDigits: showCents ? 2 : 0,
            maximumFractionDigits: showCents ? 2 : 0,
        });
        formatterCache.set(key, fmt);
    }
    return fmt;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
});

/**
 * Format a number as currency.
 *
 * @example formatCurrency(12500, "USD")  → "$12,500"
 * @example formatCurrency(12500, "PHP")  → "₱12,500"
 */
export function formatCurrency(
    value: number,
    currency: CurrencyCode = "USD",
    showCents = false
): string {
    if (!isFinite(value)) return `${CURRENCIES[currency].symbol}0`;
    return getFormatter(currency, showCents).format(value);
}

/**
 * Get the currency symbol for display in labels.
 *
 * @example getCurrencySymbol("USD") → "$"
 * @example getCurrencySymbol("PHP") → "₱"
 */
export function getCurrencySymbol(currency: CurrencyCode): string {
    return CURRENCIES[currency].symbol;
}

/**
 * Format a decimal as a percentage.
 *
 * @example formatPercent(0.053) → "5.3%"
 */
export function formatPercent(value: number): string {
    if (!isFinite(value)) return "0%";
    return percentFormatter.format(value);
}

/**
 * Format a whole-number percentage input for display.
 *
 * @example formatPercentInput(5) → "5%"
 */
export function formatPercentInput(value: number): string {
    return `${value}%`;
}
