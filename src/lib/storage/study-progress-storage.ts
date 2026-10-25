import { z } from "zod";

import type { StudyProgress } from "../study-plan/types";

export const STUDY_PROGRESS_STORAGE_KEY =
  "planificador-correlativas:study-progress:v1";

const statusSchema = z.enum([
  "pending",
  "in_progress",
  "regularized",
  "approved",
]);

const studyProgressSchema = z.record(z.string().min(1), statusSchema);

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function saveStudyProgress(
  progress: StudyProgress,
  storage: StorageLike = window.localStorage,
): void {
  storage.setItem(STUDY_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function loadStudyProgress(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): StudyProgress {
  const raw = storage.getItem(STUDY_PROGRESS_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    const parsed = studyProgressSchema.safeParse(JSON.parse(raw));

    return parsed.success ? parsed.data : {};
  } catch {
    return {};
  }
}

export function clearStudyProgress(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  storage.removeItem(STUDY_PROGRESS_STORAGE_KEY);
}
