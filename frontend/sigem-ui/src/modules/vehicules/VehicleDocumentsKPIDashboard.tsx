import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ShieldAlert,
    PieChart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { StatCard } from "../assets/_components/stats-card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import { BarChart, CartesianGrid, XAxis, YAxis, Bar, Cell } from "recharts";

import { useVehicleDocumentsMonitoring } from "./hooks/use-vehicle-documents";

import { VehicleDocument, VehicleDocumentType } from "./types/vehicle-document.types";

// --- Config MG (modifiable) ---
const REQUIRED_DOCS: VehicleDocumentType[] = [
    "INSURANCE",
    "TECH_INSPECTION",
    "REGISTRATION",
    "TAX_STICKER",
];

const DOC_LABELS: Record<string, string> = {
    INSURANCE: "Assurance",
    TECH_INSPECTION: "Visite technique",
    REGISTRATION: "Carte grise",
    TAX_STICKER: "Vignette",
    PARKING_CARD: "Carte parking",
    EXTINGUISHER_CARD: "Carte extincteur",
    OTHER: "Autre",
};

const DOC_COLORS: Record<string, string> = {
    INSURANCE: "#3b82f6",
    TECH_INSPECTION: "#10b981",
    REGISTRATION: "#f59e0b",
    TAX_STICKER: "#ef4444",
    PARKING_CARD: "#8b5cf6",
    EXTINGUISHER_CARD: "#6b7280",
    OTHER: "#6b7280",
};

const MotionDiv = motion.div;

export const VehicleDocumentsKPIDashboard = ({
    soonDays = 30,
}: {
    soonDays?: number;
}) => {
    const { data, isLoading, isError } = useVehicleDocumentsMonitoring();
    const docs: VehicleDocument[] = (data as any)?.items ?? (data as any) ?? [];

    const computed = useMemo(() => {
        const now = new Date();
        const soonLimit = new Date(now);
        soonLimit.setDate(soonLimit.getDate() + soonDays);

        const safeDate = (d?: string | null) => (d ? new Date(d) : null);

        const expired = docs.filter((d) => safeDate(d.expiresAt)! < now);
        const expiringSoon = docs.filter((d) => {
            const exp = safeDate(d.expiresAt);
            if (!exp) return false;
            return exp >= now && exp <= soonLimit;
        });

        const vehiclesWithDocs = new Set(docs.map((d) => d.vehicleId?.id)).size;
        const vehiclesWithExpired = new Set(expired.map((d) => d.vehicleId?.id)).size;

        const activeDocsCount = Math.max(docs.length - expired.length, 0);

        // group by vehicle
        const docsByVehicle = docs.reduce<Record<string, VehicleDocument[]>>((acc, d) => {
            const vid = d.vehicleId?.id;
            if (!vid) return acc;
            (acc[vid] ||= []).push(d);
            return acc;
        }, {});

        const vehiclesMissingRequired = Object.values(docsByVehicle).filter((vDocs) => {
            const types = new Set(vDocs.map((x) => x.type));
            return REQUIRED_DOCS.some((t) => !types.has(t));
        }).length;

        const compliance =
            vehiclesWithDocs > 0
                ? Math.round(((vehiclesWithDocs - vehiclesWithExpired) / vehiclesWithDocs) * 100)
                : 0;

        const noReminder = docs.filter((d) => (d.reminderDaysBefore?.length ?? 0) === 0).length;

        // by type
        const byType = docs.reduce<Record<string, number>>((acc, d) => {
            const key = d.type ?? "OTHER";
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const typeChartData = Object.entries(byType)
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count);

        // Top urgences (priorité: expirés puis soon) triés par date d’expiration
        const topUrgentDocs = [...expired, ...expiringSoon]
            .sort((a, b) => {
                const da = safeDate(a.expiresAt)?.getTime() ?? 0;
                const db = safeDate(b.expiresAt)?.getTime() ?? 0;
                return da - db;
            })
            .slice(0, 6);

        return {
            now,
            soonLimit,
            expired,
            expiringSoon,
            vehiclesWithDocs,
            vehiclesWithExpired,
            vehiclesMissingRequired,
            compliance,
            activeDocsCount,
            noReminder,
            typeChartData,
            byType,
            topUrgentDocs,
        };
    }, [docs, soonDays]);

    const typeChartConfig = useMemo(() => {
        const cfg: ChartConfig = {};
        for (const k of Object.keys(computed.byType)) {
            cfg[k] = { label: DOC_LABELS[k] ?? k, color: DOC_COLORS[k] ?? "hsl(var(--primary))" };
        }
        return cfg;
    }, [computed.byType]);

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">Chargement des documents…</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">
                    Impossible de charger le monitoring des documents.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    label="Documents actifs"
                    value={computed.activeDocsCount}
                    subtitle={`${docs.length} au total`}
                    delay={0}
                />

                <StatCard
                    icon={ShieldAlert}
                    label="Documents expirés"
                    value={computed.expired.length}
                    subtitle={`${computed.vehiclesWithExpired} véhicule(s) à risque`}
                    color={computed.expired.length > 0 ? "text-red-600" : "text-green-600"}
                    delay={0.1}
                />

                <StatCard
                    icon={Clock}
                    label={`Expire sous ${soonDays}j`}
                    value={computed.expiringSoon.length}
                    subtitle="Échéances proches"
                    color={computed.expiringSoon.length > 0 ? "text-orange-600" : "text-green-600"}
                    delay={0.2}
                />

                <StatCard
                    icon={CheckCircle2}
                    label="Conformité documents"
                    value={`${computed.compliance}%`}
                    subtitle={`${computed.vehiclesWithDocs - computed.vehiclesWithExpired} sans expiré`}
                    color={
                        computed.compliance >= 85
                            ? "text-green-600"
                            : computed.compliance >= 65
                                ? "text-orange-600"
                                : "text-red-600"
                    }
                    delay={0.3}
                />
            </div>

            {/* TOP URGENCES + QUALITÉ CONFIG */}
            <MotionDiv
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                className="rounded-xl border bg-card p-5 shadow-sm"
            >
                <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Documents à traiter</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                            Incomplets: {computed.vehiclesMissingRequired}
                        </Badge>
                        <Badge
                            variant={computed.noReminder > 0 ? "destructive" : "secondary"}
                        >
                            Sans rappel: {computed.noReminder}
                        </Badge>
                    </div>
                </div>

                {computed.topUrgentDocs.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun document urgent 🎉
                    </p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {computed.topUrgentDocs.map((d) => {
                            const exp = new Date(d.expiresAt);
                            const isExpired = exp < computed.now;

                            const labelType = DOC_LABELS[d.type] ?? d.type;
                            const vehicleLabel = `${d.vehicleId?.plateNumber ?? "N/A"} · ${d.vehicleId?.brand ?? ""} ${d.vehicleId?.model ?? ""}`.trim();

                            return (
                                <div
                                    key={d.id}
                                    className={cn(
                                        "rounded-lg border p-3 flex items-start justify-between gap-3",
                                        isExpired ? "border-red-500/20 bg-red-500/5" : "border-amber-500/20 bg-amber-500/5"
                                    )}
                                >
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {labelType}
                                        </p>
                                        <p className="text-sm font-semibold truncate">{vehicleLabel}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Expire le{" "}
                                            <span className="font-medium">
                                                {exp.toLocaleDateString("fr-FR")}
                                            </span>
                                        </p>
                                    </div>

                                    <Badge variant={isExpired ? "destructive" : "secondary"}>
                                        {isExpired ? "Expiré" : "Bientôt"}
                                    </Badge>
                                </div>
                            );
                        })}
                    </div>
                )}
            </MotionDiv>

            {/* RÉPARTITION PAR TYPE */}
            <MotionDiv
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
                className="rounded-xl border bg-card p-5 shadow-sm"
            >
                <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Répartition des documents</h3>
                </div>

                {computed.typeChartData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aucun document enregistré pour le moment.
                    </p>
                ) : (
                    <div className="">
                        <ChartContainer config={typeChartConfig}>
                            <BarChart
                                // layout="vertical"
                                data={computed.typeChartData}
                                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    // type="category"
                                    dataKey={"type"}
                                    tick={{ fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />

                                <YAxis
                                    // dataKey="type"
                                    // type="number"
                                    // orientation="right"
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                    // width={110}
                                    tickFormatter={(v: string) => DOC_LABELS[v] ?? v}
                                    allowDecimals={false}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            formatter={(value: any) => [`${value} doc(s)`, "Total"]}
                                            labelFormatter={(label: any) =>
                                                DOC_LABELS[label] ? `Type : ${DOC_LABELS[label]}` : `Type : ${label}`
                                            }
                                            indicator="line"
                                        />
                                    }
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {computed.typeChartData.map((entry) => (
                                        <Cell
                                            key={entry.type}
                                            fill={DOC_COLORS[entry.type] ?? "hsl(var(--primary))"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </MotionDiv>
        </div>
    );
};
