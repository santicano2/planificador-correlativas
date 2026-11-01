import { z } from "zod";

import type { StudyTermSelection } from "../study-plan/term";

export const STUDY_TERM_SELECTION_STORAGE_KEY =
  "planificador-correlativas:study-term-selection:v1";

export const studyTermSelectionSchema = z.object({
  subjectIds: z.array(z.string().min(1)),
});

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function saveStudyTermSelection(
  selection: StudyTermSelection,
  storage: StorageLike = window.localStorage,
): void {
  storage.setItem(
    STUDY_TERM_SELECTION_STORAGE_KEY,
    JSON.stringify({ subjectIds: uniqueIds(selection.subjectIds) }),
  );
}

export function loadStudyTermSelection(
  storage: Pick<Storage, "getItem"> = window.localStorage,
): StudyTermSelection {
  const raw = storage.getItem(STUDY_TERM_SELECTION_STORAGE_KEY);

  if (!raw) {
    return { subjectIds: [] };
  }

  try {
    const parsed = studyTermSelectionSchema.safeParse(JSON.parse(raw));

    return parsed.success
      ? { subjectIds: uniqueIds(parsed.data.subjectIds) }
      : { subjectIds: [] };
  } catch {
    return { subjectIds: [] };
  }
}

export function clearStudyTermSelection(
  storage: Pick<Storage, "removeItem"> = window.localStorage,
): void {
  storage.removeItem(STUDY_TERM_SELECTION_STORAGE_KEY);
}
