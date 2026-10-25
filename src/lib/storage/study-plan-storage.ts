import { z } from "zod";

import type { StudyPlan } from "../study-plan/types";

export const STUDY_PLAN_STORAGE_KEY = "planificador-correlativas:study-plan:v1";

const subjectSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).optional(),
  name: z.string().min(1),
  year: z.number().int().min(1),
  term: z.enum(["1", "2", "annual"]).optional(),
  requiresRegularized: z.array(z.string().min(1)),
  requiresApproved: z.array(z.string().min(1)),
});

export const studyPlanSchema = z.object({
  career: z.string(),
  university: z.string(),
  planYear: z.number().int().optional(),
  subjects: z.array(subjectSchema),
});

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveStudyPlan(
  plan: StudyPlan,
  storage: StorageLike = window.localStorage,
): void {
  storage.setItem(STUDY_PLAN_STORAGE_KEY, JSON.stringify(plan));
}

export function loadStudyPlan(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): StudyPlan | null {
  const raw = storage.getItem(STUDY_PLAN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = studyPlanSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearStudyPlan(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  storage.removeItem(STUDY_PLAN_STORAGE_KEY);
}
