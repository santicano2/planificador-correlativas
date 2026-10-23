import type { StudyPlan, Subject } from "./types";

export function makeSubject(
  overrides: Partial<Subject> & Pick<Subject, "id" | "name">,
): Subject {
  return {
    year: 1,
    requiresRegularized: [],
    requiresApproved: [],
    ...overrides,
  };
}

export function makePlan(subjects: Subject[]): StudyPlan {
  return {
    career: "Carrera de Prueba",
    university: "Universidad de Prueba",
    subjects,
  };
}
