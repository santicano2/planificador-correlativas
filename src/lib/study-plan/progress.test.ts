import { describe, expect, it } from "vitest";

import { getProgressSummary } from "./progress";
import { makePlan, makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

describe("getProgressSummary", () => {
  it("returns zero progress for an empty plan", () => {
    expect(getProgressSummary(makePlan([]), {})).toEqual({
      total: 0,
      approved: 0,
      remaining: 0,
      percentage: 0,
      byStatus: {
        pending: 0,
        in_progress: 0,
        regularized: 0,
        approved: 0,
      },
    });
  });

  it("counts every status and calculates approved progress", () => {
    const plan = makePlan([
      makeSubject({ id: "a", name: "Materia A" }),
      makeSubject({ id: "b", name: "Materia B" }),
      makeSubject({ id: "c", name: "Materia C" }),
      makeSubject({ id: "d", name: "Materia D" }),
      makeSubject({ id: "e", name: "Materia E" }),
    ]);
    const progress: StudyProgress = {
      a: "approved",
      b: "approved",
      c: "regularized",
      d: "in_progress",
    };

    expect(getProgressSummary(plan, progress)).toEqual({
      total: 5,
      approved: 2,
      remaining: 3,
      percentage: 40,
      byStatus: {
        pending: 1,
        in_progress: 1,
        regularized: 1,
        approved: 2,
      },
    });
  });

  it("treats an absent progress entry as pending", () => {
    const plan = makePlan([makeSubject({ id: "a", name: "Materia A" })]);

    expect(getProgressSummary(plan, {})).toEqual({
      total: 1,
      approved: 0,
      remaining: 1,
      percentage: 0,
      byStatus: {
        pending: 1,
        in_progress: 0,
        regularized: 0,
        approved: 0,
      },
    });
  });

  it("ignores progress entries that are not part of the plan", () => {
    const plan = makePlan([makeSubject({ id: "a", name: "Materia A" })]);
    const progress: StudyProgress = {
      a: "approved",
      unknown: "approved",
    };

    expect(getProgressSummary(plan, progress)).toEqual({
      total: 1,
      approved: 1,
      remaining: 0,
      percentage: 100,
      byStatus: {
        pending: 0,
        in_progress: 0,
        regularized: 0,
        approved: 1,
      },
    });
  });

  it("rounds the percentage to the nearest integer", () => {
    const plan = makePlan([
      makeSubject({ id: "a", name: "Materia A" }),
      makeSubject({ id: "b", name: "Materia B" }),
      makeSubject({ id: "c", name: "Materia C" }),
    ]);

    expect(
      getProgressSummary(plan, { a: "approved" }).percentage,
    ).toBe(33);
    expect(
      getProgressSummary(plan, { a: "approved", b: "approved" }).percentage,
    ).toBe(67);
  });
});
