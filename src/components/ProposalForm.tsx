"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLeaseStore } from "@/store/store";
import type { EscalationType, LeaseProposal } from "@/lib/types";
import { getCurrencySymbol } from "@/lib/format";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

const proposalSchema = z.object({
    name: z.string().min(1, "Name required"),
    termYears: z.coerce.number().min(0.5, "Min 6 months").max(30, "Max 30 years"),
    startDate: z.string().min(1, "Start date required"),
    baseRentMonthly: z.coerce.number().min(0, "Must be ≥ 0"),
    escalationType: z.enum(["percentage", "fixed", "none"]),
    escalationValue: z.coerce.number().min(0, "Must be ≥ 0"),
    freeRentMonths: z.coerce.number().int().min(0, "Must be ≥ 0"),
    tiAllowance: z.coerce.number().min(0, "Must be ≥ 0"),
    squareFootage: z.coerce.number().min(0, "Must be ≥ 0"),
    nnnMonthly: z.coerce.number().min(0, "Must be ≥ 0"),
});

type ProposalFormValues = z.output<typeof proposalSchema>;

// ─── Color palette per card index ────────────────────────────────────────────

const ACCENT_COLORS = [
    "from-blue-500/20 to-blue-600/5 border-blue-500/30",
    "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
    "from-violet-500/20 to-violet-600/5 border-violet-500/30",
    "from-amber-500/20 to-amber-600/5 border-amber-500/30",
];

const ACCENT_DOT_COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
];

// ─── Component ───────────────────────────────────────────────────────────────

interface ProposalFormProps {
    proposal: LeaseProposal;
    index: number;
    canRemove: boolean;
}

export default function ProposalForm({
    proposal,
    index,
    canRemove,
}: ProposalFormProps) {
    const { updateProposal, removeProposal, currency } = useLeaseStore();

    const {
        register,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalSchema) as Resolver<ProposalFormValues>,
        defaultValues: {
            name: proposal.name,
            termYears: proposal.termYears,
            startDate: proposal.startDate,
            baseRentMonthly: proposal.baseRentMonthly,
            escalationType: proposal.escalationType,
            escalationValue: proposal.escalationValue,
            freeRentMonths: proposal.freeRentMonths,
            tiAllowance: proposal.tiAllowance,
            squareFootage: proposal.squareFootage,
            nnnMonthly: proposal.nnnMonthly,
        },
        mode: "onChange",
    });

    // Sync form changes → Zustand store (debounced via watch)
    const values = watch();

    useEffect(() => {
        const parsed = proposalSchema.safeParse(values);
        if (parsed.success) {
            updateProposal(proposal.id, parsed.data);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        values.name,
        values.termYears,
        values.startDate,
        values.baseRentMonthly,
        values.escalationType,
        values.escalationValue,
        values.freeRentMonths,
        values.tiAllowance,
        values.squareFootage,
        values.nnnMonthly,
    ]);

    const escalationType = watch("escalationType");
    const sym = getCurrencySymbol(currency);

    return (
        <Card
            className={`relative overflow-hidden bg-gradient-to-br ${ACCENT_COLORS[index % 4]} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/20`}
        >
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={`h-3 w-3 rounded-full ${ACCENT_DOT_COLORS[index % 4]} shadow-sm`}
                        />
                        <CardTitle className="text-base font-semibold">
                            <Input
                                {...register("name")}
                                className="h-7 border-none bg-transparent px-1 text-base font-semibold shadow-none focus-visible:ring-1"
                                aria-label="Proposal name"
                            />
                        </CardTitle>
                    </div>
                    {canRemove && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeProposal(proposal.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            aria-label="Remove proposal"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="grid gap-4">
                {/* Row 1: Term + Start Date */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor={`term-${proposal.id}`} className="text-xs text-muted-foreground">
                            Lease Term (Years)
                        </Label>
                        <Input
                            id={`term-${proposal.id}`}
                            type="number"
                            step="0.5"
                            {...register("termYears")}
                            className="h-9"
                        />
                        {errors.termYears && (
                            <p className="text-xs text-destructive">{errors.termYears.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`start-${proposal.id}`} className="text-xs text-muted-foreground">
                            Start Date
                        </Label>
                        <Input
                            id={`start-${proposal.id}`}
                            type="date"
                            {...register("startDate")}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Row 2: Base Rent + Sq Ft */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor={`rent-${proposal.id}`} className="text-xs text-muted-foreground">
                            Base Rent ({sym}/mo)
                        </Label>
                        <Input
                            id={`rent-${proposal.id}`}
                            type="number"
                            step="100"
                            {...register("baseRentMonthly")}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`sqft-${proposal.id}`} className="text-xs text-muted-foreground">
                            Square Footage
                        </Label>
                        <Input
                            id={`sqft-${proposal.id}`}
                            type="number"
                            {...register("squareFootage")}
                            className="h-9"
                        />
                    </div>
                </div>

                {/* Row 3: NNN / OpEx */}
                <div className="space-y-1.5">
                    <Label htmlFor={`nnn-${proposal.id}`} className="text-xs text-muted-foreground">
                        NNN / OpEx ({sym}/mo)
                    </Label>
                    <Input
                        id={`nnn-${proposal.id}`}
                        type="number"
                        step="50"
                        {...register("nnnMonthly")}
                        className="h-9"
                    />
                </div>

                {/* Row 4: Escalation */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Escalation Type</Label>
                        <Select
                            defaultValue={proposal.escalationType}
                            onValueChange={(val: EscalationType) =>
                                setValue("escalationType", val, { shouldValidate: true })
                            }
                        >
                            <SelectTrigger className="h-9" aria-label="Escalation type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="percentage">% Annual</SelectItem>
                                <SelectItem value="fixed">{sym} Fixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {escalationType !== "none" && (
                        <div className="space-y-1.5">
                            <Label htmlFor={`esc-val-${proposal.id}`} className="text-xs text-muted-foreground">
                                {escalationType === "percentage" ? "Increase (%)" : `Increase (${sym})`}
                            </Label>
                            <Input
                                id={`esc-val-${proposal.id}`}
                                type="number"
                                step={escalationType === "percentage" ? "0.5" : "50"}
                                {...register("escalationValue")}
                                className="h-9"
                            />
                        </div>
                    )}
                </div>

                {/* Row 5: Free Rent + TI */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor={`free-${proposal.id}`} className="text-xs text-muted-foreground">
                            Free Rent (Months)
                        </Label>
                        <Input
                            id={`free-${proposal.id}`}
                            type="number"
                            {...register("freeRentMonths")}
                            className="h-9"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor={`ti-${proposal.id}`} className="text-xs text-muted-foreground">
                            TI Allowance ({sym})
                        </Label>
                        <Input
                            id={`ti-${proposal.id}`}
                            type="number"
                            step="1000"
                            {...register("tiAllowance")}
                            className="h-9"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
