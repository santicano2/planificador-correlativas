import { getEffectiveStatus, isAtLeast } from "./status";
import type {
  RequiredStatus,
  StudyProgress,
  Subject,
  SubjectStatus,
} from "./types";

export interface MissingRequirement {
  subjectId: string;
  requiredStatus: RequiredStatus;
  currentStatus: SubjectStatus;
}

export type SubjectAvailability =
  | { status: "available" }
  | { status: "blocked"; missing: MissingRequirement[] };

export function getSubjectAvailability(
  subject: Subject,
  progress: StudyProgress,
): SubjectAvailability {
  const missing = new Map<string, MissingRequirement>();

  for (const subjectId of subject.requiresRegularized) {
    const currentStatus = getEffectiveStatus(progress, subjectId);

    if (!isAtLeast(currentStatus, "regularized")) {
      missing.set(subjectId, {
        subjectId,
        requiredStatus: "regularized",
        currentStatus,
      });
    }
  }

  for (const subjectId of subject.requiresApproved) {
    const currentStatus = getEffectiveStatus(progress, subjectId);

    if (!isAtLeast(currentStatus, "approved")) {
      missing.set(subjectId, {
        subjectId,
        requiredStatus: "approved",
        currentStatus,
      });
    }
  }

  if (missing.size === 0) {
    return { status: "available" };
  }

  return { status: "blocked", missing: [...missing.values()] };
}
