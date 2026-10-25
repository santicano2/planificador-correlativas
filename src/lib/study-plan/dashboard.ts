import {
  getSubjectAvailability,
  type MissingRequirement,
  type SubjectAvailability,
} from "./availability";
import { getProgressSummary, type ProgressSummary } from "./progress";
import { getEffectiveStatus } from "./status";
import type {
  StudyPlan,
  StudyProgress,
  Subject,
  SubjectStatus,
} from "./types";

export interface DashboardMissingRequirement extends MissingRequirement {
  subjectName: string;
}

export interface DashboardRow {
  subject: Subject;
  status: SubjectStatus;
  availability: SubjectAvailability;
  missing: DashboardMissingRequirement[];
}

export interface DashboardModel {
  rows: DashboardRow[];
  summary: ProgressSummary;
  availableCount: number;
  blockedCount: number;
}

function compareSubjects(a: Subject, b: Subject): number {
  return (
    a.year - b.year ||
    (a.code ?? "").localeCompare(b.code ?? "", "es", { numeric: true }) ||
    a.name.localeCompare(b.name, "es")
  );
}

export function buildDashboard(
  plan: StudyPlan,
  progress: StudyProgress,
): DashboardModel {
  const subjectsById = new Map(
    plan.subjects.map((subject) => [subject.id, subject]),
  );
  const rows = [...plan.subjects].sort(compareSubjects).map((subject) => {
    const status = getEffectiveStatus(progress, subject.id);
    const availability = getSubjectAvailability(subject, progress);
    const missing =
      availability.status === "blocked"
        ? availability.missing.map((requirement) => ({
            ...requirement,
            subjectName:
              subjectsById.get(requirement.subjectId)?.name ??
              requirement.subjectId,
          }))
        : [];

    return { subject, status, availability, missing };
  });

  let availableCount = 0;
  let blockedCount = 0;

  for (const row of rows) {
    if (row.status !== "pending") {
      continue;
    }

    if (row.availability.status === "available") {
      availableCount += 1;
    } else {
      blockedCount += 1;
    }
  }

  return {
    rows,
    summary: getProgressSummary(plan, progress),
    availableCount,
    blockedCount,
  };
}

export function pruneProgress(
  plan: StudyPlan,
  progress: StudyProgress,
): StudyProgress {
  const subjectIds = new Set(plan.subjects.map((subject) => subject.id));
  const next: StudyProgress = {};

  for (const [subjectId, status] of Object.entries(progress)) {
    if (subjectIds.has(subjectId)) {
      next[subjectId] = status;
    }
  }

  return next;
}
