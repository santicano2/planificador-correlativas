import type { StudyProgress, SubjectStatus } from "./types";

const STATUS_RANK: Record<SubjectStatus, number> = {
  pending: 0,
  in_progress: 1,
  regularized: 2,
  approved: 3,
};

export function isAtLeast(
  status: SubjectStatus,
  minimum: SubjectStatus,
): boolean {
  return STATUS_RANK[status] >= STATUS_RANK[minimum];
}

export function getEffectiveStatus(
  progress: StudyProgress,
  subjectId: string,
): SubjectStatus {
  return progress[subjectId] ?? "pending";
}
