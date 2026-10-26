import { cn } from "@/lib/utils";

type StatusType = "paid" | "partial" | "pending" | "overdue" | "active" | "inactive" | "prospect" |
  "planning" | "in-progress" | "review" | "completed" | "on-hold" | "on-leave" | "low" | "medium" | "high" | "critical" |
  "handed-over" | "revoked";

interface StatusBadgeProps {
  status: string; // Changed to string to be more flexible with backend values
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "badge-info" },
  paid: { label: "Paid", className: "badge-success" },
  partial: { label: "Partial", className: "badge-warning" },
  pending: { label: "Due", className: "badge-warning" },
  overdue: { label: "Overdue", className: "badge-destructive" },
  active: { label: "Active", className: "badge-success" },
  inactive: { label: "Inactive", className: "badge-destructive" },
  prospect: { label: "Prospect", className: "badge-info" },
  planning: { label: "Planning", className: "badge-info" },
  "in-progress": { label: "In Progress", className: "badge-warning" },
  "handed-over": { label: "Handed Over", className: "badge-success" },
  revoked: { label: "Revoked", className: "badge-destructive" },
  review: { label: "Review", className: "badge-info" },
  completed: { label: "Completed", className: "badge-success" },
  "on-hold": { label: "On Hold", className: "badge-destructive" },
  "on-leave": { label: "On Leave", className: "badge-warning" },
  low: { label: "Low", className: "badge-success" },
  medium: { label: "Medium", className: "badge-warning" },
  high: { label: "High", className: "badge-destructive" },
  critical: { label: "Critical", className: "badge-destructive" },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  // Normalize status: handle "In Progress" -> "in-progress", "Handed Over" -> "handed-over"
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  const config = statusConfig[normalizedStatus] || { label: status, className: "badge-info" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
