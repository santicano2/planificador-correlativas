import { z } from "zod";

import { studyPlanSchema } from "../storage/study-plan-storage";
import { studyProgressSchema } from "../storage/study-progress-storage";
import {
  validateStudyPlan,
  type StudyPlan,
  type StudyProgress,
} from "../study-plan";

export const STUDY_PLAN_BACKUP_FORMAT = "planificador-correlativas";
export const STUDY_PLAN_BACKUP_VERSION = 1;

const backupPlanSchema = studyPlanSchema.refine(
  (plan) =>
    plan.career.trim() !== "" &&
    plan.university.trim() !== "" &&
    plan.subjects.length > 0,
  { message: "El plan del respaldo está incompleto." },
);

const backupSchema = z.object({
  format: z.literal(STUDY_PLAN_BACKUP_FORMAT),
  version: z.literal(STUDY_PLAN_BACKUP_VERSION),
  exportedAt: z.iso.datetime(),
  plan: backupPlanSchema,
  progress: studyProgressSchema,
});

export type StudyPlanBackup = z.infer<typeof backupSchema>;

export class StudyPlanBackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudyPlanBackupError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createStudyPlanBackup(
  plan: StudyPlan,
  progress: StudyProgress,
  exportedAt = new Date(),
): StudyPlanBackup {
  return {
    format: STUDY_PLAN_BACKUP_FORMAT,
    version: STUDY_PLAN_BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    plan,
    progress,
  };
}

export function serializeStudyPlanBackup(
  plan: StudyPlan,
  progress: StudyProgress,
  exportedAt = new Date(),
): string {
  return JSON.stringify(
    createStudyPlanBackup(plan, progress, exportedAt),
    null,
    2,
  );
}

export function parseStudyPlanBackup(raw: string): StudyPlanBackup {
  let candidate: unknown;

  try {
    candidate = JSON.parse(raw);
  } catch {
    throw new StudyPlanBackupError("El archivo no es un JSON válido.");
  }

  const parsed = backupSchema.safeParse(candidate);

  if (!parsed.success) {
    if (
      isRecord(candidate) &&
      candidate.format === STUDY_PLAN_BACKUP_FORMAT &&
      candidate.version !== STUDY_PLAN_BACKUP_VERSION
    ) {
      throw new StudyPlanBackupError(
        "El respaldo usa una versión no compatible.",
      );
    }

    throw new StudyPlanBackupError(
      "El archivo no es un respaldo válido de Planificador de Correlativas.",
    );
  }

  const validation = validateStudyPlan(parsed.data.plan);

  if (!validation.valid) {
    throw new StudyPlanBackupError(
      "El plan del respaldo tiene correlativas inválidas.",
    );
  }

  return parsed.data;
}

function slugifyFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createBackupFilename(
  plan: StudyPlan,
  date = new Date(),
): string {
  const career = slugifyFilename(plan.career) || "plan";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `planificador-${career}-${year}-${month}-${day}.json`;
}
