import { describe, expect, it } from "vitest";

import type { StudyTermSelection } from "../study-plan/term";
import type { StudyPlan, StudyProgress } from "../study-plan/types";
import {
  createBackupFilename,
  createStudyPlanBackup,
  parseStudyPlanBackup,
  serializeStudyPlanBackup,
  StudyPlanBackupError,
  STUDY_PLAN_BACKUP_FORMAT,
  STUDY_PLAN_BACKUP_VERSION,
} from "./study-plan-backup";

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

const progress: StudyProgress = { "1": "approved" };
const termSelection: StudyTermSelection = { subjectIds: ["1"] };
const date = new Date("2026-10-25T12:00:00.000Z");

describe("study plan backup", () => {
  it("creates a versioned backup", () => {
    const backup = createStudyPlanBackup(
      plan,
      progress,
      termSelection,
      date,
    );

    expect(backup).toEqual({
      format: STUDY_PLAN_BACKUP_FORMAT,
      version: STUDY_PLAN_BACKUP_VERSION,
      exportedAt: "2026-10-25T12:00:00.000Z",
      plan,
      progress,
      termSelection,
    });
  });

  it("round-trips plan, progress and term selection through JSON", () => {
    const serialized = serializeStudyPlanBackup(
      plan,
      progress,
      termSelection,
      date,
    );

    expect(parseStudyPlanBackup(serialized)).toEqual(
      createStudyPlanBackup(plan, progress, termSelection, date),
    );
  });

  it("reads a version 1 backup with an empty term selection", () => {
    const raw = JSON.stringify({
      format: STUDY_PLAN_BACKUP_FORMAT,
      version: 1,
      exportedAt: "2026-10-25T12:00:00.000Z",
      plan,
      progress,
    });

    expect(parseStudyPlanBackup(raw)).toEqual(
      createStudyPlanBackup(plan, progress, { subjectIds: [] }, date),
    );
  });

  it("rejects invalid JSON", () => {
    expect(() => parseStudyPlanBackup("{not-json")).toThrow(
      StudyPlanBackupError,
    );
    expect(() => parseStudyPlanBackup("{not-json")).toThrow("JSON válido");
  });

  it("rejects a file from another app", () => {
    const raw = JSON.stringify({
      ...createStudyPlanBackup(plan, progress, termSelection, date),
      format: "otra-app",
    });

    expect(() => parseStudyPlanBackup(raw)).toThrow(
      "no es un respaldo válido",
    );
  });

  it("rejects an unsupported version", () => {
    const raw = JSON.stringify({
      ...createStudyPlanBackup(plan, progress, termSelection, date),
      version: 3,
    });

    expect(() => parseStudyPlanBackup(raw)).toThrow("versión no compatible");
  });

  it("rejects an incomplete plan", () => {
    const raw = JSON.stringify({
      ...createStudyPlanBackup(plan, progress, termSelection, date),
      plan: { ...plan, career: "" },
    });

    expect(() => parseStudyPlanBackup(raw)).toThrow(
      "no es un respaldo válido",
    );
  });

  it("rejects invalid correlatives", () => {
    const raw = JSON.stringify({
      ...createStudyPlanBackup(plan, progress, termSelection, date),
      plan: {
        ...plan,
        subjects: [
          {
            ...plan.subjects[0],
            requiresRegularized: ["missing"],
          },
        ],
      },
    });

    expect(() => parseStudyPlanBackup(raw)).toThrow(
      "correlativas inválidas",
    );
  });

  it("creates a safe backup filename", () => {
    expect(
      createBackupFilename(
        { ...plan, career: "Licenciatura en Sistemas / 2014" },
        date,
      ),
    ).toBe("planificador-licenciatura-en-sistemas-2014-2026-10-25.json");
  });
});
