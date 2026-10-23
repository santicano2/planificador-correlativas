import { describe, expect, it } from "vitest";

import { getSubjectAvailability } from "./availability";
import { makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

describe("getSubjectAvailability", () => {
  it("returns available when the subject has no prerequisites", () => {
    const subject = makeSubject({
      id: "intro",
      name: "Introducción a la Carrera",
    });

    expect(getSubjectAvailability(subject, {})).toEqual({
      status: "available",
    });
  });

  it("returns available when a regularized requirement is regularized", () => {
    const subject = makeSubject({
      id: "algebra",
      name: "Álgebra",
      requiresRegularized: ["analysis"],
    });
    const progress: StudyProgress = { analysis: "regularized" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "available",
    });
  });

  it("returns available when a regularized requirement is approved", () => {
    const subject = makeSubject({
      id: "algebra",
      name: "Álgebra",
      requiresRegularized: ["analysis"],
    });
    const progress: StudyProgress = { analysis: "approved" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "available",
    });
  });

  it("blocks a regularized requirement when the prerequisite is in progress", () => {
    const subject = makeSubject({
      id: "algebra",
      name: "Álgebra",
      requiresRegularized: ["analysis"],
    });
    const progress: StudyProgress = { analysis: "in_progress" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "analysis",
          requiredStatus: "regularized",
          currentStatus: "in_progress",
        },
      ],
    });
  });

  it("blocks an approved requirement when the prerequisite is only regularized", () => {
    const subject = makeSubject({
      id: "physics-2",
      name: "Física II",
      requiresApproved: ["physics-1"],
    });
    const progress: StudyProgress = { "physics-1": "regularized" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "physics-1",
          requiredStatus: "approved",
          currentStatus: "regularized",
        },
      ],
    });
  });

  it("returns available when an approved requirement is approved", () => {
    const subject = makeSubject({
      id: "physics-2",
      name: "Física II",
      requiresApproved: ["physics-1"],
    });
    const progress: StudyProgress = { "physics-1": "approved" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "available",
    });
  });

  it("reports every missing prerequisite from both requirement lists", () => {
    const subject = makeSubject({
      id: "databases",
      name: "Bases de Datos",
      requiresRegularized: ["programming", "discrete-math"],
      requiresApproved: ["algorithms"],
    });
    const progress: StudyProgress = {
      programming: "regularized",
      "discrete-math": "pending",
      algorithms: "in_progress",
    };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "discrete-math",
          requiredStatus: "regularized",
          currentStatus: "pending",
        },
        {
          subjectId: "algorithms",
          requiredStatus: "approved",
          currentStatus: "in_progress",
        },
      ],
    });
  });

  it("treats an absent progress entry as pending", () => {
    const subject = makeSubject({
      id: "algebra",
      name: "Álgebra",
      requiresRegularized: ["analysis"],
    });

    expect(getSubjectAvailability(subject, {})).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "analysis",
          requiredStatus: "regularized",
          currentStatus: "pending",
        },
      ],
    });
  });

  it("keeps only the strictest requirement when a subject is listed twice", () => {
    const subject = makeSubject({
      id: "thesis",
      name: "Tesis",
      requiresRegularized: ["seminar"],
      requiresApproved: ["seminar"],
    });
    const progress: StudyProgress = { seminar: "regularized" };

    expect(getSubjectAvailability(subject, progress)).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "seminar",
          requiredStatus: "approved",
          currentStatus: "regularized",
        },
      ],
    });
  });
});
