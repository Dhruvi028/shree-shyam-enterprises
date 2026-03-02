import { LucideIcon } from "lucide-react";
import { AppCard } from "./AppCard";
import { formatINR } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function SummaryCard({
  title,
  amount,
  icon: Icon,
  trend,
}: SummaryCardProps) {
  return (
    <AppCard className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm font-medium">{title}</span>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {formatINR(amount)}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${trend.isPositive ? "text-primary" : "text-red-600"}`}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}% from last month
          </span>
        )}
      </div>
    </AppCard>
  );
}
