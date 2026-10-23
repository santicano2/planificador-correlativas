import { describe, expect, it } from "vitest";

import { makePlan, makeSubject } from "./test-fixtures";
import { validateStudyPlan } from "./validation";

describe("validateStudyPlan", () => {
  it("accepts a plan with valid references and no cycles", () => {
    const plan = makePlan([
      makeSubject({ id: "analysis", name: "Análisis Matemático" }),
      makeSubject({
        id: "algebra",
        name: "Álgebra",
        requiresRegularized: ["analysis"],
      }),
      makeSubject({
        id: "physics",
        name: "Física",
        requiresApproved: ["analysis"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({ valid: true, issues: [] });
  });

  it("reports a missing regularized prerequisite", () => {
    const plan = makePlan([
      makeSubject({
        id: "algebra",
        name: "Álgebra",
        requiresRegularized: ["analysis"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({
      valid: false,
      issues: [
        {
          type: "missing_correlative",
          subjectId: "algebra",
          missingId: "analysis",
          requiredStatus: "regularized",
        },
      ],
    });
  });

  it("reports a missing approved prerequisite", () => {
    const plan = makePlan([
      makeSubject({
        id: "physics-2",
        name: "Física II",
        requiresApproved: ["physics-1"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({
      valid: false,
      issues: [
        {
          type: "missing_correlative",
          subjectId: "physics-2",
          missingId: "physics-1",
          requiredStatus: "approved",
        },
      ],
    });
  });

  it("reports duplicate subject ids once", () => {
    const plan = makePlan([
      makeSubject({ id: "analysis", name: "Análisis Matemático" }),
      makeSubject({ id: "analysis", name: "Análisis Matemático II" }),
      makeSubject({ id: "analysis", name: "Análisis Matemático III" }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({
      valid: false,
      issues: [{ type: "duplicate_subject_id", subjectId: "analysis" }],
    });
  });

  it("reports a subject that depends on itself as a cycle", () => {
    const plan = makePlan([
      makeSubject({
        id: "analysis",
        name: "Análisis Matemático",
        requiresRegularized: ["analysis"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({
      valid: false,
      issues: [{ type: "dependency_cycle", subjectIds: ["analysis"] }],
    });
  });

  it("reports a two-subject cycle only once", () => {
    const plan = makePlan([
      makeSubject({
        id: "analysis",
        name: "Análisis Matemático",
        requiresRegularized: ["algebra"],
      }),
      makeSubject({
        id: "algebra",
        name: "Álgebra",
        requiresApproved: ["analysis"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({
      valid: false,
      issues: [
        { type: "dependency_cycle", subjectIds: ["analysis", "algebra"] },
      ],
    });
  });

  it("reports a three-subject cycle", () => {
    const plan = makePlan([
      makeSubject({
        id: "a",
        name: "Materia A",
        requiresRegularized: ["b"],
      }),
      makeSubject({
        id: "b",
        name: "Materia B",
        requiresRegularized: ["c"],
      }),
      makeSubject({
        id: "c",
        name: "Materia C",
        requiresRegularized: ["a"],
      }),
    ]);

    expect(validateStudyPlan(plan).issues).toContainEqual({
      type: "dependency_cycle",
      subjectIds: ["a", "b", "c"],
    });
  });

  it("reports missing references and cycles together", () => {
    const plan = makePlan([
      makeSubject({
        id: "a",
        name: "Materia A",
        requiresRegularized: ["b", "missing"],
      }),
      makeSubject({
        id: "b",
        name: "Materia B",
        requiresApproved: ["a"],
      }),
    ]);

    const result = validateStudyPlan(plan);

    expect(result.valid).toBe(false);
    expect(result.issues).toEqual([
      {
        type: "missing_correlative",
        subjectId: "a",
        missingId: "missing",
        requiredStatus: "regularized",
      },
      { type: "dependency_cycle", subjectIds: ["a", "b"] },
    ]);
  });

  it("does not report a cycle when subjects share a prerequisite", () => {
    const plan = makePlan([
      makeSubject({ id: "analysis", name: "Análisis Matemático" }),
      makeSubject({
        id: "algebra",
        name: "Álgebra",
        requiresRegularized: ["analysis"],
      }),
      makeSubject({
        id: "physics",
        name: "Física",
        requiresRegularized: ["analysis"],
      }),
    ]);

    expect(validateStudyPlan(plan)).toEqual({ valid: true, issues: [] });
  });
});
