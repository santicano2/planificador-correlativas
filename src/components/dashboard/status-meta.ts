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
  pending: "bg-ink/10 text-ink",
  in_progress: "bg-gold/25 text-ink",
  regularized: "bg-sage/55 text-forest-deep",
  approved: "bg-forest text-paper",
};

export const STATUS_BORDER_CLASSES: Record<SubjectStatus, string> = {
  pending: "border-l-ink/15",
  in_progress: "border-l-gold",
  regularized: "border-l-sage",
  approved: "border-l-forest",
};

export const STATUS_DOT_CLASSES: Record<SubjectStatus, string> = {
  pending: "bg-ink/25",
  in_progress: "bg-gold",
  regularized: "bg-sage",
  approved: "bg-forest",
};
