import { describe, expect, it } from "vitest";

import {
  buildTermPlan,
  pruneTermSelection,
  toggleTermSelection,
  type StudyTermSelection,
} from "./term";
import { makePlan, makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

const plan = makePlan([
  makeSubject({ id: "intro", code: "1", name: "Introducción", year: 1 }),
  makeSubject({
    id: "algorithms",
    code: "2",
    name: "Algoritmos",
    year: 2,
    requiresRegularized: ["intro"],
  }),
  makeSubject({
    id: "databases",
    code: "3",
    name: "Bases de Datos",
    year: 2,
    requiresApproved: ["intro"],
  }),
  makeSubject({ id: "networks", code: "4", name: "Redes", year: 3 }),
]);
const progress: StudyProgress = { algorithms: "in_progress" };
const selection: StudyTermSelection = {
  subjectIds: ["databases", "intro"],
};

describe("buildTermPlan", () => {
  it("only includes pending subjects and marks selected ones", () => {
    const term = buildTermPlan(plan, progress, selection);

    expect(term.rows.map((row) => row.subject.id)).toEqual([
      "intro",
      "databases",
      "networks",
    ]);
    expect(term.rows.map((row) => row.isSelected)).toEqual([true, true, false]);
  });

  it("summarizes selected availability and missing requirements", () => {
    const term = buildTermPlan(plan, progress, selection);

    expect(term.summary).toEqual({
      selectedCount: 2,
      selectedAvailableCount: 1,
      selectedBlockedCount: 1,
      pendingCount: 3,
    });

    const databases = term.rows.find(
      (row) => row.subject.id === "databases",
    );

    expect(databases?.missing).toEqual([
      {
        subjectId: "intro",
        subjectName: "Introducción",
        requiredStatus: "approved",
        currentStatus: "pending",
      },
    ]);
  });

  it("returns an empty summary when nothing is selected", () => {
    const term = buildTermPlan(plan, progress, { subjectIds: [] });

    expect(term.selectedRows).toEqual([]);
    expect(term.summary.selectedCount).toBe(0);
  });
});

describe("pruneTermSelection", () => {
  it("keeps only pending subjects that exist in the plan", () => {
    expect(
      pruneTermSelection(plan, progress, {
        subjectIds: ["intro", "algorithms", "missing", "networks"],
      }),
    ).toEqual({ subjectIds: ["intro", "networks"] });
  });

  it("deduplicates selected ids", () => {
    expect(
      pruneTermSelection(plan, progress, {
        subjectIds: ["intro", "intro"],
      }),
    ).toEqual({ subjectIds: ["intro"] });
  });
});

describe("toggleTermSelection", () => {
  it("adds and removes a subject without mutating the original", () => {
    const original: StudyTermSelection = { subjectIds: ["intro"] };

    expect(toggleTermSelection(original, "networks")).toEqual({
      subjectIds: ["intro", "networks"],
    });
    expect(toggleTermSelection(original, "intro")).toEqual({
      subjectIds: [],
    });
    expect(original).toEqual({ subjectIds: ["intro"] });
  });
});
