import { describe, expect, it } from "vitest";

import {
  clearStudyTermSelection,
  loadStudyTermSelection,
  saveStudyTermSelection,
  STUDY_TERM_SELECTION_STORAGE_KEY,
} from "./study-term-selection-storage";

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));

  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("study term selection storage", () => {
  it("round-trips a selection", () => {
    const storage = memoryStorage();

    saveStudyTermSelection({ subjectIds: ["intro", "databases"] }, storage);

    expect(loadStudyTermSelection(storage)).toEqual({
      subjectIds: ["intro", "databases"],
    });
  });

  it("deduplicates ids when saving", () => {
    const storage = memoryStorage();

    saveStudyTermSelection(
      { subjectIds: ["intro", "intro", "networks"] },
      storage,
    );

    expect(
      JSON.parse(storage.getItem(STUDY_TERM_SELECTION_STORAGE_KEY) ?? "null"),
    ).toEqual({ subjectIds: ["intro", "networks"] });
  });

  it("returns an empty selection for missing or invalid data", () => {
    expect(loadStudyTermSelection(memoryStorage())).toEqual({
      subjectIds: [],
    });

    const invalidJson = memoryStorage({
      [STUDY_TERM_SELECTION_STORAGE_KEY]: "{not-json",
    });
    expect(loadStudyTermSelection(invalidJson)).toEqual({ subjectIds: [] });

    const wrongShape = memoryStorage({
      [STUDY_TERM_SELECTION_STORAGE_KEY]: JSON.stringify({
        subjectIds: [1],
      }),
    });
    expect(loadStudyTermSelection(wrongShape)).toEqual({ subjectIds: [] });
  });

  it("clears the selection", () => {
    const storage = memoryStorage({
      [STUDY_TERM_SELECTION_STORAGE_KEY]: JSON.stringify({
        subjectIds: ["intro"],
      }),
    });

    clearStudyTermSelection(storage);

    expect(storage.getItem(STUDY_TERM_SELECTION_STORAGE_KEY)).toBeNull();
  });
});
