import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface StatusOption {
  value: string;
  label: string;
}

export interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  options?: StatusOption[];
}

const defaultOptions: StatusOption[] = [
  { value: "New", label: "New" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "On Hold", label: "On Hold" },
];

export const getStatusConfig = (status: string) => {
  const s = (status || "").toLowerCase().trim();
  switch (s) {
    case "completed":
      return {
        label: "Completed",
        dotColor: "bg-emerald-500",
        pillClasses: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
      };
    case "in progress":
    case "in-progress":
      return {
        label: "In Progress",
        dotColor: "bg-amber-500",
        pillClasses: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20",
      };
    case "new":
      return {
        label: "New",
        dotColor: "bg-sky-500",
        pillClasses: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/20",
      };
    case "on hold":
    case "on-hold":
      return {
        label: "On Hold",
        dotColor: "bg-rose-500",
        pillClasses: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20",
      };
    case "handed over":
    case "handed-over":
      return {
        label: "Handed Over",
        dotColor: "bg-teal-500",
        pillClasses: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/20",
      };
    case "revoked":
      return {
        label: "Revoked",
        dotColor: "bg-red-500",
        pillClasses: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/20",
      };
    default:
      return {
        label: status || "Select",
        dotColor: "bg-muted-foreground",
        pillClasses: "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
      };
  }
};

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  options = defaultOptions,
}) => {
  const current = getStatusConfig(value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-7 w-auto min-w-[115px] max-w-[135px] rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-all shadow-none focus:ring-1 focus:ring-offset-0 gap-1.5",
          current.pillClasses,
          className
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", current.dotColor)} />
          <span className="truncate">{current.label}</span>
        </div>
      </SelectTrigger>
      <SelectContent align="start" className="w-[150px] p-1 rounded-xl shadow-2xl border-border bg-popover/95 backdrop-blur-md">
        {options.map((opt) => {
          const cfg = getStatusConfig(opt.value);
          const isSelected = opt.value.toLowerCase() === (value || "").toLowerCase();
          return (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="text-xs font-medium rounded-lg py-1.5 cursor-pointer focus:bg-accent/80 focus:text-accent-foreground"
            >
              <div className="flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full shrink-0", cfg.dotColor)} />
                <span className={cn("text-xs", isSelected ? "font-bold text-foreground" : "text-muted-foreground")}>
                  {opt.label}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default StatusSelect;
