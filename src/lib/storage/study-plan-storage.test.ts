import { describe, expect, it } from "vitest";

import type { StudyPlan } from "../study-plan/types";
import {
  clearStudyPlan,
  loadStudyPlan,
  saveStudyPlan,
  STUDY_PLAN_STORAGE_KEY,
} from "./study-plan-storage";

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

const plan: StudyPlan = {
  career: "Licenciatura en Sistemas",
  university: "Universidad Nacional de La Plata",
  planYear: 2014,
  subjects: [
    {
      id: "1",
      code: "1",
      name: "Programación de Computadoras",
      year: 1,
      term: "annual",
      requiresRegularized: [],
      requiresApproved: [],
    },
  ],
};

describe("study plan storage", () => {
  it("saves and loads a plan", () => {
    const storage = new MemoryStorage();

    saveStudyPlan(plan, storage);

    expect(loadStudyPlan(storage)).toEqual(plan);
  });

  it("returns null when there is no stored plan", () => {
    expect(loadStudyPlan(new MemoryStorage())).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(STUDY_PLAN_STORAGE_KEY, "{not-json");

    expect(loadStudyPlan(storage)).toBeNull();
  });

  it("returns null for data that does not match the schema", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      STUDY_PLAN_STORAGE_KEY,
      JSON.stringify({ career: 1, subjects: [{ name: "" }] }),
    );

    expect(loadStudyPlan(storage)).toBeNull();
  });

  it("clears the stored plan", () => {
    const storage = new MemoryStorage();
    saveStudyPlan(plan, storage);

    clearStudyPlan(storage);

    expect(loadStudyPlan(storage)).toBeNull();
  });
});
