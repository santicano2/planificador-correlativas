import { getEffectiveStatus } from "./status";
import type { StudyPlan, StudyProgress, SubjectStatus } from "./types";

export interface ProgressSummary {
  total: number;
  approved: number;
  remaining: number;
  percentage: number;
  byStatus: Record<SubjectStatus, number>;
}

export function getProgressSummary(
  plan: StudyPlan,
  progress: StudyProgress,
): ProgressSummary {
  const byStatus: Record<SubjectStatus, number> = {
    pending: 0,
    in_progress: 0,
    regularized: 0,
    approved: 0,
  };

  for (const subject of plan.subjects) {
    const status = getEffectiveStatus(progress, subject.id);
    byStatus[status] += 1;
  }

  const total = plan.subjects.length;
  const approved = byStatus.approved;

  return {
    total,
    approved,
    remaining: total - approved,
    percentage: total === 0 ? 0 : Math.round((approved / total) * 100),
    byStatus,
  };
}
