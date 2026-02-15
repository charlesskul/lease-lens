"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    isWinner?: boolean;
    subtitle?: string;
    accentColor?: string;
}

export default function MetricCard({
    label,
    value,
    icon: Icon,
    isWinner = false,
    subtitle,
    accentColor = "text-blue-400",
}: MetricCardProps) {
    return (
        <Card
            className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isWinner
                    ? "border-emerald-500/50 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                    : "border-border/50 bg-card/50 backdrop-blur-sm"
                }`}
        >
            {isWinner && (
                <Badge className="absolute right-3 top-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                    Best Value
                </Badge>
            )}
            <CardContent className="p-5">
                <div className="flex items-start gap-3">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 ${accentColor}`}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {label}
                        </p>
                        <p className="mt-1 text-xl font-bold tracking-tight truncate">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
