import type { SubjectTerm } from "@/lib/study-plan";

export const TERM_LABELS: Record<SubjectTerm, string> = {
  "1": "1º cuatrimestre",
  "2": "2º cuatrimestre",
  annual: "Anual",
};

export const TERM_SHORT_LABELS: Record<SubjectTerm, string> = {
  "1": "1º cuat.",
  "2": "2º cuat.",
  annual: "Anual",
};
