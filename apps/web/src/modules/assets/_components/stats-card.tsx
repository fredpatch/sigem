import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  trend,
  color = "text-foreground",
  bgColor = "bg-card",
  delay = 0,
}: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`rounded-xl border ${bgColor} p-4 shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {label}
          </p>
        </div>
        <p className={`text-xl md:text-3xl font-bold tabular-nums ${color}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            trend > 0
              ? "bg-green-500/10 text-green-600"
              : "bg-red-500/10 text-red-600"
          }`}
        >
          {trend > 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span className="text-xs font-bold">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  </motion.div>
);
