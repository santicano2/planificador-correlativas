import { describe, expect, it } from "vitest";

import {
  buildDashboard,
  pruneProgress,
} from "./dashboard";
import { makePlan, makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

describe("buildDashboard", () => {
  const plan = makePlan([
    makeSubject({
      id: "databases",
      code: "3",
      name: "Bases de Datos",
      year: 2,
      requiresApproved: ["intro"],
    }),
    makeSubject({
      id: "intro",
      code: "1",
      name: "Introducción a la Programación",
      year: 1,
    }),
    makeSubject({
      id: "algorithms",
      code: "2",
      name: "Algoritmos",
      year: 2,
      requiresRegularized: ["intro"],
    }),
  ]);
  const progress: StudyProgress = {
    algorithms: "in_progress",
  };

  it("sorts subjects by year and code and resolves effective statuses", () => {
    const dashboard = buildDashboard(plan, progress);

    expect(dashboard.rows.map((row) => row.subject.id)).toEqual([
      "intro",
      "algorithms",
      "databases",
    ]);
    expect(dashboard.rows.map((row) => row.status)).toEqual([
      "pending",
      "in_progress",
      "pending",
    ]);
  });

  it("reports missing prerequisites with subject names", () => {
    const dashboard = buildDashboard(plan, progress);
    const databases = dashboard.rows.find(
      (row) => row.subject.id === "databases",
    );

    expect(databases?.availability).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "intro",
          requiredStatus: "approved",
          currentStatus: "pending",
        },
      ],
    });
    expect(databases?.missing).toEqual([
      {
        subjectId: "intro",
        subjectName: "Introducción a la Programación",
        requiredStatus: "approved",
        currentStatus: "pending",
      },
    ]);
  });

  it("counts only pending subjects as available or blocked", () => {
    const dashboard = buildDashboard(plan, progress);

    expect(dashboard.availableCount).toBe(1);
    expect(dashboard.blockedCount).toBe(1);
  });

  it("summarizes progress by status", () => {
    const dashboard = buildDashboard(plan, progress);

    expect(dashboard.summary).toEqual({
      total: 3,
      approved: 0,
      remaining: 3,
      percentage: 0,
      byStatus: {
        pending: 2,
        in_progress: 1,
        regularized: 0,
        approved: 0,
      },
    });
  });
});

describe("pruneProgress", () => {
  it("keeps progress only for subjects that exist in the plan", () => {
    const plan = makePlan([
      makeSubject({ id: "intro", name: "Introducción" }),
      makeSubject({ id: "algorithms", name: "Algoritmos" }),
    ]);
    const progress: StudyProgress = {
      intro: "approved",
      algorithms: "regularized",
      removed: "approved",
    };

    expect(pruneProgress(plan, progress)).toEqual({
      intro: "approved",
      algorithms: "regularized",
    });
  });

  it("does not mutate the original progress object", () => {
    const plan = makePlan([makeSubject({ id: "intro", name: "Introducción" })]);
    const progress: StudyProgress = {
      intro: "approved",
      removed: "approved",
    };

    pruneProgress(plan, progress);

    expect(progress).toEqual({
      intro: "approved",
      removed: "approved",
    });
  });
});
