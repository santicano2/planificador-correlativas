import type {
  RequiredStatus,
  StudyPlan,
  Subject,
} from "./types";

export type PlanValidationIssue =
  | { type: "duplicate_subject_id"; subjectId: string }
  | {
      type: "missing_correlative";
      subjectId: string;
      missingId: string;
      requiredStatus: RequiredStatus;
    }
  | { type: "dependency_cycle"; subjectIds: string[] };

export interface PlanValidationResult {
  valid: boolean;
  issues: PlanValidationIssue[];
}

type VisitState = "visiting" | "visited";

const REQUIREMENT_LISTS: ReadonlyArray<
  [keyof Pick<Subject, "requiresRegularized" | "requiresApproved">, RequiredStatus]
> = [
  ["requiresRegularized", "regularized"],
  ["requiresApproved", "approved"],
];

export function validateStudyPlan(plan: StudyPlan): PlanValidationResult {
  const issues: PlanValidationIssue[] = [];
  const subjectsById = new Map<string, Subject>();
  const duplicateIds = new Set<string>();

  for (const subject of plan.subjects) {
    if (subjectsById.has(subject.id)) {
      duplicateIds.add(subject.id);
      continue;
    }

    subjectsById.set(subject.id, subject);
  }

  for (const subjectId of duplicateIds) {
    issues.push({ type: "duplicate_subject_id", subjectId });
  }

  const reportedMissing = new Set<string>();

  for (const subject of plan.subjects) {
    for (const [field, requiredStatus] of REQUIREMENT_LISTS) {
      for (const missingId of subject[field]) {
        if (subjectsById.has(missingId)) {
          continue;
        }

        const key = `${subject.id}\0${missingId}\0${requiredStatus}`;
        if (reportedMissing.has(key)) {
          continue;
        }

        reportedMissing.add(key);
        issues.push({
          type: "missing_correlative",
          subjectId: subject.id,
          missingId,
          requiredStatus,
        });
      }
    }
  }

  const graph = new Map<string, string[]>();

  for (const subject of subjectsById.values()) {
    const dependencies = new Set([
      ...subject.requiresRegularized,
      ...subject.requiresApproved,
    ]);

    graph.set(
      subject.id,
      [...dependencies].filter((id) => subjectsById.has(id)),
    );
  }

  const states = new Map<string, VisitState>();
  const stack: string[] = [];
  const reportedCycles = new Set<string>();

  const reportCycle = (cycleStartId: string): void => {
    const startIndex = stack.indexOf(cycleStartId);
    const cycle = stack.slice(startIndex);
    const cycleKey = [...cycle].sort().join("\0");

    if (reportedCycles.has(cycleKey)) {
      return;
    }

    reportedCycles.add(cycleKey);
    issues.push({ type: "dependency_cycle", subjectIds: cycle });
  };

  const visit = (subjectId: string): void => {
    states.set(subjectId, "visiting");
    stack.push(subjectId);

    for (const dependencyId of graph.get(subjectId) ?? []) {
      const dependencyState = states.get(dependencyId);

      if (dependencyState === "visiting") {
        reportCycle(dependencyId);
      } else if (dependencyState !== "visited") {
        visit(dependencyId);
      }
    }

    stack.pop();
    states.set(subjectId, "visited");
  };

  for (const subjectId of subjectsById.keys()) {
    if (!states.has(subjectId)) {
      visit(subjectId);
    }
  }

  return { valid: issues.length === 0, issues };
}
