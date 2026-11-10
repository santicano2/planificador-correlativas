import type { SubjectStatus } from "@/lib/study-plan";

export const STATUS_ORDER: SubjectStatus[] = [
  "pending",
  "in_progress",
  "regularized",
  "approved",
];

export const STATUS_LABELS: Record<SubjectStatus, string> = {
  pending: "Pendiente",
  in_progress: "Cursando",
  regularized: "Regularizada",
  approved: "Aprobada",
};

export const STATUS_SHORT_LABELS: Record<SubjectStatus, string> = {
  pending: "Pendiente",
  in_progress: "Cursando",
  regularized: "Regular",
  approved: "Aprobada",
};

export const STATUS_ACTIVE_CLASSES: Record<SubjectStatus, string> = {
  pending: "bg-status-pending-soft text-ink",
  in_progress: "bg-status-progress text-on-status",
  regularized: "bg-status-regularized text-on-status",
  approved: "bg-status-approved text-on-status",
};

export const STATUS_BORDER_CLASSES: Record<SubjectStatus, string> = {
  pending: "border-t-status-pending",
  in_progress: "border-t-status-progress",
  regularized: "border-t-status-regularized",
  approved: "border-t-status-approved",
};

export const STATUS_DOT_CLASSES: Record<SubjectStatus, string> = {
  pending: "bg-status-pending",
  in_progress: "bg-status-progress",
  regularized: "bg-status-regularized",
  approved: "bg-status-approved",
};

export const STATUS_TEXT_CLASSES: Record<SubjectStatus, string> = {
  pending: "text-status-pending",
  in_progress: "text-status-progress",
  regularized: "text-status-regularized",
  approved: "text-status-approved",
};
