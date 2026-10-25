import { describe, expect, it } from "vitest";

import type { StudyProgress } from "../study-plan/types";
import {
  clearStudyProgress,
  loadStudyProgress,
  saveStudyProgress,
  STUDY_PROGRESS_STORAGE_KEY,
} from "./study-progress-storage";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const progress: StudyProgress = {
  intro: "approved",
  algorithms: "in_progress",
  databases: "regularized",
};

describe("study progress storage", () => {
  it("saves and loads subject progress", () => {
    const storage = new MemoryStorage();

    saveStudyProgress(progress, storage);

    expect(loadStudyProgress(storage)).toEqual(progress);
  });

  it("returns an empty object when there is no stored progress", () => {
    expect(loadStudyProgress(new MemoryStorage())).toEqual({});
  });

  it("returns an empty object for invalid JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(STUDY_PROGRESS_STORAGE_KEY, "{not-json");

    expect(loadStudyProgress(storage)).toEqual({});
  });

  it("returns an empty object for unknown statuses", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STUDY_PROGRESS_STORAGE_KEY,
      JSON.stringify({ intro: "finished" }),
    );

    expect(loadStudyProgress(storage)).toEqual({});
  });

  it("clears stored progress", () => {
    const storage = new MemoryStorage();
    saveStudyProgress(progress, storage);

    clearStudyProgress(storage);

    expect(loadStudyProgress(storage)).toEqual({});
  });
});
