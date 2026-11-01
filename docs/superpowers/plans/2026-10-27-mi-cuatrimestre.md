# Mi cuatrimestre Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una tercera vista para elegir y guardar materias pendientes del próximo cuatrimestre, con resumen de disponibilidad y advertencias de correlativas.

**Architecture:** La selección vive en `localStorage` como una lista de ids, separada del progreso. Una función pura deriva filas, conteos y advertencias desde el plan, el progreso y la selección. La nueva vista consume ese modelo; el Tablero y el Grafo solo muestran un indicador. El respaldo sube a versión 2 y sigue leyendo respaldos v1.

**Tech Stack:** Next.js 16.4.3, React 19, TypeScript, Tailwind 4, Zod 4, Vitest 5.

---

### Task 1: Modelo puro del cuatrimestre

**Files:**
- Create: `src/lib/study-plan/term.ts`
- Create: `src/lib/study-plan/term.test.ts`
- Modify: `src/lib/study-plan/index.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/study-plan/term.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  buildTermPlan,
  pruneTermSelection,
  toggleTermSelection,
  type StudyTermSelection,
} from "./term";
import { makePlan, makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

const plan = makePlan([
  makeSubject({ id: "intro", code: "1", name: "Introducción", year: 1 }),
  makeSubject({
    id: "algorithms",
    code: "2",
    name: "Algoritmos",
    year: 2,
    requiresRegularized: ["intro"],
  }),
  makeSubject({
    id: "databases",
    code: "3",
    name: "Bases de Datos",
    year: 2,
    requiresApproved: ["intro"],
  }),
  makeSubject({ id: "networks", code: "4", name: "Redes", year: 3 }),
]);
const progress: StudyProgress = { algorithms: "in_progress" };
const selection: StudyTermSelection = {
  subjectIds: ["databases", "intro"],
};

describe("buildTermPlan", () => {
  it("only includes pending subjects and marks selected ones", () => {
    const term = buildTermPlan(plan, progress, selection);

    expect(term.rows.map((row) => row.subject.id)).toEqual([
      "intro",
      "databases",
      "networks",
    ]);
    expect(term.rows.map((row) => row.isSelected)).toEqual([true, true, false]);
  });

  it("summarizes selected availability and missing requirements", () => {
    const term = buildTermPlan(plan, progress, selection);

    expect(term.summary).toEqual({
      selectedCount: 2,
      selectedAvailableCount: 1,
      selectedBlockedCount: 1,
      pendingCount: 3,
    });

    const databases = term.rows.find(
      (row) => row.subject.id === "databases",
    );

    expect(databases?.missing).toEqual([
      {
        subjectId: "intro",
        subjectName: "Introducción",
        requiredStatus: "approved",
        currentStatus: "pending",
      },
    ]);
  });

  it("returns an empty summary when nothing is selected", () => {
    const term = buildTermPlan(plan, progress, { subjectIds: [] });

    expect(term.selectedRows).toEqual([]);
    expect(term.summary.selectedCount).toBe(0);
  });
});

describe("pruneTermSelection", () => {
  it("keeps only pending subjects that exist in the plan", () => {
    expect(
      pruneTermSelection(plan, progress, {
        subjectIds: ["intro", "algorithms", "missing", "networks"],
      }),
    ).toEqual({ subjectIds: ["intro", "networks"] });
  });

  it("deduplicates selected ids", () => {
    expect(
      pruneTermSelection(plan, progress, {
        subjectIds: ["intro", "intro"],
      }),
    ).toEqual({ subjectIds: ["intro"] });
  });
});

describe("toggleTermSelection", () => {
  it("adds and removes a subject without mutating the original", () => {
    const original: StudyTermSelection = { subjectIds: ["intro"] };

    expect(toggleTermSelection(original, "networks")).toEqual({
      subjectIds: ["intro", "networks"],
    });
    expect(toggleTermSelection(original, "intro")).toEqual({
      subjectIds: [],
    });
    expect(original).toEqual({ subjectIds: ["intro"] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/study-plan/term.test.ts`
Expected: FAIL because `./term` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/study-plan/term.ts`:

```ts
import { buildDashboard, type DashboardRow } from "./dashboard";
import type { StudyPlan, StudyProgress } from "./types";

export interface StudyTermSelection {
  subjectIds: string[];
}

export interface TermPlanRow extends DashboardRow {
  isSelected: boolean;
}

export interface TermPlanSummary {
  selectedCount: number;
  selectedAvailableCount: number;
  selectedBlockedCount: number;
  pendingCount: number;
}

export interface TermPlanModel {
  rows: TermPlanRow[];
  selectedRows: TermPlanRow[];
  summary: TermPlanSummary;
}

export const EMPTY_TERM_SELECTION: StudyTermSelection = { subjectIds: [] };

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function buildTermPlan(
  plan: StudyPlan,
  progress: StudyProgress,
  selection: StudyTermSelection,
): TermPlanModel {
  const selectedIds = new Set(selection.subjectIds);
  const rows = buildDashboard(plan, progress).rows
    .filter((row) => row.status === "pending")
    .map((row) => ({
      ...row,
      isSelected: selectedIds.has(row.subject.id),
    }));
  const selectedRows = rows.filter((row) => row.isSelected);

  let selectedAvailableCount = 0;
  let selectedBlockedCount = 0;

  for (const row of selectedRows) {
    if (row.availability.status === "available") {
      selectedAvailableCount += 1;
    } else {
      selectedBlockedCount += 1;
    }
  }

  return {
    rows,
    selectedRows,
    summary: {
      selectedCount: selectedRows.length,
      selectedAvailableCount,
      selectedBlockedCount,
      pendingCount: rows.length,
    },
  };
}

export function pruneTermSelection(
  plan: StudyPlan,
  progress: StudyProgress,
  selection: StudyTermSelection,
): StudyTermSelection {
  const pendingIds = new Set(
    buildDashboard(plan, progress)
      .rows.filter((row) => row.status === "pending")
      .map((row) => row.subject.id),
  );

  return {
    subjectIds: uniqueIds(selection.subjectIds).filter((subjectId) =>
      pendingIds.has(subjectId),
    ),
  };
}

export function toggleTermSelection(
  selection: StudyTermSelection,
  subjectId: string,
): StudyTermSelection {
  const ids = new Set(selection.subjectIds);

  if (ids.has(subjectId)) {
    ids.delete(subjectId);
  } else {
    ids.add(subjectId);
  }

  return { subjectIds: [...ids] };
}
```

- [ ] **Step 4: Export the new module**

Modify `src/lib/study-plan/index.ts` after the dashboard exports:

```ts
export {
  buildTermPlan,
  EMPTY_TERM_SELECTION,
  pruneTermSelection,
  toggleTermSelection,
} from "./term";
export type {
  StudyTermSelection,
  TermPlanModel,
  TermPlanRow,
  TermPlanSummary,
} from "./term";
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/study-plan/term.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/study-plan/term.ts src/lib/study-plan/term.test.ts src/lib/study-plan/index.ts
git commit -m "feat: add term plan domain model"
```

---

### Task 2: Persistencia local de la selección

**Files:**
- Create: `src/lib/storage/study-term-selection-storage.ts`
- Create: `src/lib/storage/study-term-selection-storage.test.ts`
- Create: `src/lib/storage/use-study-term-selection-storage.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/storage/study-term-selection-storage.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/storage/study-term-selection-storage.test.ts`
Expected: FAIL because `./study-term-selection-storage` does not exist.

- [ ] **Step 3: Write minimal storage implementation**

Create `src/lib/storage/study-term-selection-storage.ts`:

```ts
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
```

- [ ] **Step 4: Write the React hook**

Create `src/lib/storage/use-study-term-selection-storage.ts`:

```ts
"use client";

import { useSyncExternalStore } from "react";

import {
  EMPTY_TERM_SELECTION,
  type StudyTermSelection,
} from "../study-plan/term";
import {
  STUDY_TERM_SELECTION_STORAGE_KEY,
  clearStudyTermSelection,
  loadStudyTermSelection,
  saveStudyTermSelection,
} from "./study-term-selection-storage";

const listeners = new Set<() => void>();

let initialized = false;
let cachedRaw: string | null = null;
let cachedSelection: StudyTermSelection = EMPTY_TERM_SELECTION;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STUDY_TERM_SELECTION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): StudyTermSelection {
  const raw = readRaw();

  if (!initialized || raw !== cachedRaw) {
    initialized = true;
    cachedRaw = raw;
    cachedSelection = raw
      ? loadStudyTermSelection()
      : EMPTY_TERM_SELECTION;
  }

  return cachedSelection;
}

function getServerSnapshot(): StudyTermSelection {
  return EMPTY_TERM_SELECTION;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STUDY_TERM_SELECTION_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredStudyTermSelection(): StudyTermSelection {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveStoredStudyTermSelection(
  selection: StudyTermSelection,
): void {
  saveStudyTermSelection(selection);
  emit();
}

export function clearStoredStudyTermSelection(): void {
  clearStudyTermSelection();
  emit();
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/lib/storage/study-term-selection-storage.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage/study-term-selection-storage.ts src/lib/storage/study-term-selection-storage.test.ts src/lib/storage/use-study-term-selection-storage.ts
git commit -m "feat: persist term selection locally"
```

---

### Task 3: Respaldo versión 2 compatible con v1

**Files:**
- Modify: `src/lib/backup/study-plan-backup.ts`
- Modify: `src/lib/backup/study-plan-backup.test.ts`

- [ ] **Step 1: Update the failing tests**

Replace `src/lib/backup/study-plan-backup.test.ts` with:

```ts
import { describe, expect, it } from "vitest";

import type { StudyPlan, StudyProgress } from "../study-plan/types";
import type { StudyTermSelection } from "../study-plan/term";
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/backup/study-plan-backup.test.ts`
Expected: FAIL because the backup still uses version 1 and does not accept term selection.

- [ ] **Step 3: Write the versioned backup implementation**

Replace `src/lib/backup/study-plan-backup.ts` with:

```ts
import { z } from "zod";

import { studyPlanSchema } from "../storage/study-plan-storage";
import { studyProgressSchema } from "../storage/study-progress-storage";
import { studyTermSelectionSchema } from "../storage/study-term-selection-storage";
import {
  validateStudyPlan,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
} from "../study-plan";

export const STUDY_PLAN_BACKUP_FORMAT = "planificador-correlativas";
export const STUDY_PLAN_BACKUP_VERSION = 2;

const backupPlanSchema = studyPlanSchema.refine(
  (plan) =>
    plan.career.trim() !== "" &&
    plan.university.trim() !== "" &&
    plan.subjects.length > 0,
  { message: "El plan del respaldo está incompleto." },
);

const backupBaseSchema = z.object({
  format: z.literal(STUDY_PLAN_BACKUP_FORMAT),
  exportedAt: z.iso.datetime(),
  plan: backupPlanSchema,
  progress: studyProgressSchema,
});

const backupV1Schema = backupBaseSchema.extend({
  version: z.literal(1),
});

const backupV2Schema = backupBaseSchema.extend({
  version: z.literal(2),
  termSelection: studyTermSelectionSchema,
});

const backupSchema = z.discriminatedUnion("version", [
  backupV1Schema,
  backupV2Schema,
]);

export interface StudyPlanBackup {
  format: typeof STUDY_PLAN_BACKUP_FORMAT;
  version: typeof STUDY_PLAN_BACKUP_VERSION;
  exportedAt: string;
  plan: StudyPlan;
  progress: StudyProgress;
  termSelection: StudyTermSelection;
}

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
  termSelection: StudyTermSelection,
  exportedAt = new Date(),
): StudyPlanBackup {
  return {
    format: STUDY_PLAN_BACKUP_FORMAT,
    version: STUDY_PLAN_BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    plan,
    progress,
    termSelection,
  };
}

export function serializeStudyPlanBackup(
  plan: StudyPlan,
  progress: StudyProgress,
  termSelection: StudyTermSelection,
  exportedAt = new Date(),
): string {
  return JSON.stringify(
    createStudyPlanBackup(plan, progress, termSelection, exportedAt),
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
      candidate.version !== 1 &&
      candidate.version !== 2
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

  return {
    format: parsed.data.format,
    version: STUDY_PLAN_BACKUP_VERSION,
    exportedAt: parsed.data.exportedAt,
    plan: parsed.data.plan,
    progress: parsed.data.progress,
    termSelection:
      parsed.data.version === 2
        ? parsed.data.termSelection
        : { subjectIds: [] },
  };
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/backup/study-plan-backup.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/backup/study-plan-backup.ts src/lib/backup/study-plan-backup.test.ts
git commit -m "feat: include term selection in backups"
```

---

### Task 4: Vista Cuatrimestre

**Files:**
- Create: `src/components/dashboard/missing-format.ts`
- Create: `src/components/dashboard/missing-format.test.ts`
- Create: `src/components/dashboard/term-plan-view.tsx`
- Modify: `src/components/icons.tsx`

- [ ] **Step 1: Write the failing helper test**

Create `src/components/dashboard/missing-format.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatMissing } from "./missing-format";

describe("formatMissing", () => {
  it("formats regularized and approved requirements", () => {
    expect(
      formatMissing([
        {
          subjectId: "algebra",
          subjectName: "Álgebra",
          requiredStatus: "regularized",
          currentStatus: "pending",
        },
        {
          subjectId: "analysis",
          subjectName: "Análisis",
          requiredStatus: "approved",
          currentStatus: "regularized",
        },
      ]),
    ).toBe("falta regularizar Álgebra · falta aprobar Análisis");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/dashboard/missing-format.test.ts`
Expected: FAIL because `./missing-format` does not exist.

- [ ] **Step 3: Write the helper**

Create `src/components/dashboard/missing-format.ts`:

```ts
import type { DashboardMissingRequirement } from "@/lib/study-plan";

export function formatMissing(
  missing: DashboardMissingRequirement[],
): string {
  return missing
    .map(
      (requirement) =>
        `falta ${requirement.requiredStatus === "regularized" ? "regularizar" : "aprobar"} ${requirement.subjectName}`,
    )
    .join(" · ");
}
```

- [ ] **Step 4: Run helper test to verify it passes**

Run: `npx vitest run src/components/dashboard/missing-format.test.ts`
Expected: PASS.

- [ ] **Step 5: Add the calendar icon**

Add to `src/components/icons.tsx` after `BookIcon`:

```tsx
export function CalendarIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
      <path d="M8 15h2M14 15h2M8 18h2M14 18h2" />
    </svg>
  );
}
```

- [ ] **Step 6: Write the new view**

Create `src/components/dashboard/term-plan-view.tsx`:

```tsx
"use client";

import { useMemo, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  SearchIcon,
} from "@/components/icons";
import {
  buildTermPlan,
  toggleTermSelection,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
  type TermPlanRow,
} from "@/lib/study-plan";

import { formatMissing } from "./missing-format";
import { TERM_LABELS } from "./term-meta";

interface TermPlanViewProps {
  plan: StudyPlan;
  progress: StudyProgress;
  selection: StudyTermSelection;
  onSelectionChange: (selection: StudyTermSelection) => void;
}

type TermFilter = "all" | "available" | "blocked" | "selected";

export function TermPlanView({
  plan,
  progress,
  selection,
  onSelectionChange,
}: TermPlanViewProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TermFilter>("all");
  const [saveError, setSaveError] = useState<string | null>(null);

  const termPlan = useMemo(
    () => buildTermPlan(plan, progress, selection),
    [plan, progress, selection],
  );

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");

    return termPlan.rows.filter((row) => {
      if (filter === "selected" && !row.isSelected) {
        return false;
      }

      if (
        filter === "available" &&
        row.availability.status !== "available"
      ) {
        return false;
      }

      if (filter === "blocked" && row.availability.status !== "blocked") {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return `${row.subject.code ?? ""} ${row.subject.name}`
        .toLocaleLowerCase("es")
        .includes(normalized);
    });
  }, [filter, query, termPlan.rows]);

  const grouped = useMemo(() => {
    const groups = new Map<number, TermPlanRow[]>();

    for (const row of visibleRows) {
      const group = groups.get(row.subject.year) ?? [];
      group.push(row);
      groups.set(row.subject.year, group);
    }

    return groups;
  }, [visibleRows]);

  const hasFilters = query.trim() !== "" || filter !== "all";

  const updateSelection = (nextSelection: StudyTermSelection) => {
    setSaveError(null);

    try {
      onSelectionChange(nextSelection);
    } catch {
      setSaveError(
        "No pudimos guardar tu cuatrimestre en este navegador. Revisá el espacio disponible e intentá de nuevo.",
      );
    }
  };

  const toggle = (subjectId: string) => {
    updateSelection(toggleTermSelection(selection, subjectId));
  };

  const resetFilters = () => {
    setQuery("");
    setFilter("all");
  };

  if (termPlan.rows.length === 0) {
    return (
      <section className="mt-5 rounded-3xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
        <CheckIcon className="mx-auto size-6 text-forest" />
        <p className="mt-3 font-display text-xl font-semibold text-ink">
          No te quedan materias pendientes
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Cuando agregues materias o vuelvas a poner una en pendiente, van a
          aparecer acá.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-3xl border border-ink/12 bg-paper-light p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Próximo cuatrimestre
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {termPlan.summary.selectedCount === 0
                ? "Elegí tus materias"
                : `${termPlan.summary.selectedCount} ${
                    termPlan.summary.selectedCount === 1
                      ? "materia seleccionada"
                      : "materias seleccionadas"
                  }`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Armá tu próximo cuatrimestre. Podés sumar materias bloqueadas:
              te vamos a mostrar qué correlativas faltan.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="Disponibles"
              value={termPlan.summary.selectedAvailableCount}
              className="text-forest"
            />
            <Stat
              label="Bloqueadas"
              value={termPlan.summary.selectedBlockedCount}
              className="text-terracotta"
            />
            <Stat
              label="Pendientes"
              value={termPlan.summary.pendingCount}
              className="text-ink"
            />
          </div>
        </div>

        {termPlan.summary.selectedBlockedCount > 0 ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs leading-5 text-ink">
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-gold" />
            Tenés materias bloqueadas en tu cuatrimestre. Revisá las
            correlativas antes de anotarte.
          </p>
        ) : null}

        {termPlan.summary.selectedCount > 0 ? (
          <button
            type="button"
            onClick={() => updateSelection({ subjectIds: [] })}
            className="mt-3 text-xs font-semibold text-terracotta hover:underline"
          >
            Quitar todas
          </button>
        ) : null}
      </section>

      {saveError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-terracotta/40 bg-terracotta-soft/45 px-4 py-3 text-xs leading-5 text-ink"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-terracotta" />
          {saveError}
        </p>
      ) : null}

      <section className="rounded-2xl border border-ink/12 bg-paper-light p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por materia o código..."
              aria-label="Buscar materia para el cuatrimestre"
              className="w-full rounded-full border border-ink/15 bg-paper py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-soft/60"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as TermFilter)
            }
            aria-label="Filtrar materias del cuatrimestre"
            className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs text-ink"
          >
            <option value="all">Todas las pendientes</option>
            <option value="available">Disponibles</option>
            <option value="blocked">Bloqueadas</option>
            <option value="selected">Seleccionadas</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft">
            Mostrando {visibleRows.length} de {termPlan.rows.length} pendientes
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-forest hover:underline"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </section>

      {visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
          <SearchIcon className="mx-auto size-6 text-ink-soft/60" />
          <p className="mt-3 font-display text-xl font-semibold text-ink">
            No hay materias con esos filtros
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Probá con otra búsqueda o limpiá los filtros.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([year, rows]) => (
            <section
              key={year}
              className="overflow-hidden rounded-2xl border border-ink/12 bg-paper-light"
            >
              <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper-deep/40 px-4 py-2.5">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  {year}º año
                </h3>
                <span className="font-mono text-[10px] text-ink-soft">
                  {rows.length}{" "}
                  {rows.length === 1 ? "materia" : "materias"}
                </span>
              </header>
              <ul className="divide-y divide-ink/8">
                {rows.map((row) => (
                  <TermRow
                    key={row.subject.id}
                    row={row}
                    onToggle={toggle}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper px-3 py-2 text-center">
      <p className={`font-display text-2xl font-semibold ${className}`}>
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}

function TermRow({
  row,
  onToggle,
}: {
  row: TermPlanRow;
  onToggle: (subjectId: string) => void;
}) {
  const { subject, availability, missing, isSelected } = row;
  const prerequisiteCount =
    subject.requiresRegularized.length + subject.requiresApproved.length;
  const missingId = `term-missing-${subject.id}`;

  return (
    <li
      className={[
        "border-l-4 px-4 py-4 transition-colors",
        isSelected
          ? "border-forest bg-forest/5"
          : "border-transparent bg-paper-light hover:bg-paper/60",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(subject.id)}
          aria-describedby={missing.length > 0 ? missingId : undefined}
          className="mt-1 size-4 shrink-0 accent-forest"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="rounded-md bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink">
              {subject.code || "—"}
            </span>
            <span className="font-display text-lg font-semibold leading-tight text-ink">
              {subject.name}
            </span>
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-soft">
            <span>
              {subject.term
                ? TERM_LABELS[subject.term]
                : "Cuatrimestre sin definir"}
            </span>
            <span className="text-line">•</span>
            <span>
              {prerequisiteCount}{" "}
              {prerequisiteCount === 1 ? "correlativa" : "correlativas"}
            </span>
          </span>

          {availability.status === "available" ? (
            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-forest">
              <CheckIcon className="size-3.5" />
              Lista para cursar
            </span>
          ) : (
            <span
              id={missingId}
              className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-ink-soft"
            >
              <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
              {formatMissing(missing)}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}
```

- [ ] **Step 7: Run helper test and typecheck**

Run: `npx vitest run src/components/dashboard/missing-format.test.ts`
Expected: PASS.

Run: `npm run typecheck`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard/missing-format.ts src/components/dashboard/missing-format.test.ts src/components/dashboard/term-plan-view.tsx src/components/icons.tsx
git commit -m "feat: add term plan view"
```

---

### Task 5: Integrar vista, indicadores y respaldo

**Files:**
- Modify: `src/components/dashboard/study-dashboard.tsx`
- Modify: `src/components/dashboard/correlation-graph-view.tsx`
- Modify: `src/components/dashboard/correlation-graph.tsx`
- Modify: `src/components/dashboard/graph-detail-panel.tsx`
- Modify: `src/components/import/import-plan-flow.tsx`
- Modify: `src/components/backup/backup-actions.tsx`

- [ ] **Step 1: Update `StudyDashboard`**

In `src/components/dashboard/study-dashboard.tsx`:

Add `CalendarIcon` to the icon import and add `type StudyTermSelection` to the study-plan import. Import `TermPlanView` and `formatMissing`:

```ts
import {
  AlertIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  FileIcon,
  GraphIcon,
  LockIcon,
  PencilIcon,
  SearchIcon,
  SparkIcon,
  TrashIcon,
} from "@/components/icons";
import {
  buildDashboard,
  type DashboardRow,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
  type SubjectStatus,
} from "@/lib/study-plan";

import { CorrelationGraphView } from "./correlation-graph-view";
import { formatMissing } from "./missing-format";
import { ProgressOverview } from "./progress-overview";
import { StatusControl } from "./status-control";
import { TermPlanView } from "./term-plan-view";
```

Extend the props:

```ts
interface StudyDashboardProps {
  plan: StudyPlan;
  progress: StudyProgress;
  termSelection: StudyTermSelection;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
  onTermSelectionChange: (selection: StudyTermSelection) => void;
  onEdit: () => void;
  onRestore: (backup: StudyPlanBackup) => void;
  onImportAnother: () => void;
  onClear: () => void;
}

type DashboardView = "table" | "term" | "graph";
```

Destructure the new props and compute the selected ids:

```ts
export function StudyDashboard({
  plan,
  progress,
  termSelection,
  onStatusChange,
  onTermSelectionChange,
  onEdit,
  onRestore,
  onImportAnother,
  onClear,
}: StudyDashboardProps) {
```

```ts
  const selectedTermIds = useMemo(
    () => new Set(termSelection.subjectIds),
    [termSelection],
  );
```

Add the Cuatrimestre button between Tablero and Grafo:

```tsx
        <button
          type="button"
          aria-pressed={view === "term"}
          onClick={() => setView("term")}
          className={[
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            view === "term"
              ? "bg-forest text-paper"
              : "text-ink-soft hover:bg-ink/5 hover:text-ink",
          ].join(" ")}
        >
          <CalendarIcon className="size-3.5" />
          Cuatrimestre
        </button>
```

Replace the graph/table branch with:

```tsx
      {view === "graph" ? (
        <CorrelationGraphView
          plan={plan}
          progress={progress}
          termSelection={termSelection}
          onStatusChange={updateStatus}
        />
      ) : view === "term" ? (
        <TermPlanView
          plan={plan}
          progress={progress}
          selection={termSelection}
          onSelectionChange={onTermSelectionChange}
        />
      ) : (
        <>
```

Pass the selection to `BackupActions`:

```tsx
        <BackupActions
          variant="dashboard"
          currentPlan={plan}
          progress={progress}
          termSelection={termSelection}
          onRestore={onRestore}
        />
```

Pass the indicator to each row:

```tsx
                    <SubjectRow
                      key={row.subject.id}
                      row={row}
                      isInTermPlan={selectedTermIds.has(row.subject.id)}
                      onStatusChange={updateStatus}
                    />
```

Update `SubjectRow`:

```tsx
function SubjectRow({
  row,
  isInTermPlan,
  onStatusChange,
}: {
  row: DashboardRow;
  isInTermPlan: boolean;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
}) {
```

Add the badge after the subject name:

```tsx
            <h3 className="font-display text-lg font-semibold leading-tight text-ink">
              {subject.name}
            </h3>
            {isInTermPlan ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-forest">
                <CalendarIcon className="size-3" />
                En mi cuatrimestre
              </span>
            ) : null}
```

Delete the local `formatMissing` function at the bottom; the shared helper replaces it.

- [ ] **Step 2: Add indicators to the graph**

In `src/components/dashboard/correlation-graph-view.tsx`, add the type import and prop:

```ts
import {
  buildCorrelationGraph,
  layoutCorrelationGraph,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
  type SubjectStatus,
} from "@/lib/study-plan";

interface CorrelationGraphViewProps {
  plan: StudyPlan;
  progress: StudyProgress;
  termSelection: StudyTermSelection;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
}

export function CorrelationGraphView({
  plan,
  progress,
  termSelection,
  onStatusChange,
}: CorrelationGraphViewProps) {
```

Pass the selection to the graph and detail panel:

```tsx
        <CorrelationGraph
          graph={graph}
          layout={layout}
          termSelection={termSelection}
          selectedId={selectedNode ? selectedId : null}
          onSelect={setSelectedId}
          onClear={() => setSelectedId(null)}
        />
```

```tsx
        <GraphDetailPanel
          graph={graph}
          node={selectedNode}
          isInTermPlan={
            selectedNode
              ? termSelection.subjectIds.includes(selectedNode.subject.id)
              : false
          }
          onSelect={setSelectedId}
          onClear={() => setSelectedId(null)}
          onStatusChange={onStatusChange}
        />
```

In `src/components/dashboard/correlation-graph.tsx`, add `CalendarIcon` to the icon import and the type:

```ts
import { AlertIcon, CalendarIcon, LockIcon, SparkIcon } from "@/components/icons";
import {
  buildEdgePath,
  type CorrelationGraph,
  type CorrelationGraphLayout,
  type GraphNodeLayout,
  type StudyTermSelection,
} from "@/lib/study-plan";
```

Extend the props and compute the selected set:

```ts
interface CorrelationGraphProps {
  graph: CorrelationGraph;
  layout: CorrelationGraphLayout;
  termSelection: StudyTermSelection;
  selectedId: string | null;
  onSelect: (subjectId: string) => void;
  onClear: () => void;
}

export function CorrelationGraph({
  graph,
  layout,
  termSelection,
  selectedId,
  onSelect,
  onClear,
}: CorrelationGraphProps) {
  const termIds = new Set(termSelection.subjectIds);
```

Pass the indicator to `GraphNode`:

```tsx
            <GraphNode
              key={nodeLayout.node.subject.id}
              nodeLayout={nodeLayout}
              isSelected={nodeLayout.node.subject.id === selectedId}
              isRelated={relatedIds.has(nodeLayout.node.subject.id)}
              isDimmed={Boolean(selectedNode) && !relatedIds.has(nodeLayout.node.subject.id)}
              isInTermPlan={termIds.has(nodeLayout.node.subject.id)}
              onSelect={onSelect}
            />
```

Update `GraphNode`:

```tsx
function GraphNode({
  nodeLayout,
  isSelected,
  isRelated,
  isDimmed,
  isInTermPlan,
  onSelect,
}: {
  nodeLayout: GraphNodeLayout;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
  isInTermPlan: boolean;
  onSelect: (subjectId: string) => void;
}) {
```

Add it to the aria label:

```ts
  const ariaLabel = [
    subject.name,
    subject.code ? `código ${subject.code}` : null,
    STATUS_LABELS[status],
    availabilityLabel,
    isInTermPlan ? "en mi cuatrimestre" : null,
  ]
    .filter(Boolean)
    .join(", ");
```

Render the icon in the node header:

```tsx
        <span className="flex items-center gap-1">
          {isInTermPlan ? (
            <CalendarIcon className="size-3.5 text-forest" />
          ) : null}
          {isPending && isAvailable ? (
            <SparkIcon className="size-3.5 text-forest" />
          ) : null}
```

In `src/components/dashboard/graph-detail-panel.tsx`, import `CalendarIcon` and add the prop:

```ts
import {
  AlertIcon,
  CalendarIcon,
  LockIcon,
  SparkIcon,
  XIcon,
} from "@/components/icons";

interface GraphDetailPanelProps {
  graph: CorrelationGraph;
  node: CorrelationGraphNode | null;
  isInTermPlan: boolean;
  onSelect: (subjectId: string) => void;
  onClear: () => void;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
}

export function GraphDetailPanel({
  graph,
  node,
  isInTermPlan,
  onSelect,
  onClear,
  onStatusChange,
}: GraphDetailPanelProps) {
```

Render the badge below the term line:

```tsx
          <p className="mt-1 text-xs text-ink-soft">
            {subject.term
              ? TERM_LABELS[subject.term]
              : "Cuatrimestre sin definir"}
          </p>
          {isInTermPlan ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-forest">
              <CalendarIcon className="size-3" />
              En mi cuatrimestre
            </p>
          ) : null}
```

- [ ] **Step 3: Wire the state and pruning in `ImportPlanFlow`**

In `src/components/import/import-plan-flow.tsx`, add the imports:

```ts
import {
  clearStoredStudyTermSelection,
  saveStoredStudyTermSelection,
  useStoredStudyTermSelection,
} from "@/lib/storage/use-study-term-selection-storage";
import {
  pruneProgress,
  pruneTermSelection,
  type StudyPlan,
  type StudyTermSelection,
  type SubjectStatus,
} from "@/lib/study-plan";
```

Add a helper above the component:

```ts
function sameSubjectIds(a: string[], b: string[]): boolean {
  return (
    a.length === b.length &&
    a.every((subjectId, index) => subjectId === b[index])
  );
}
```

Read the stored selection:

```ts
  const progress = useStoredStudyProgress();
  const termSelection = useStoredStudyTermSelection();
  const planToShow = savedPlan ?? storedPlan;
```

Add the pruning effect after `planToShow`:

```ts
  useEffect(() => {
    if (!planToShow) {
      return;
    }

    const pruned = pruneTermSelection(
      planToShow,
      progress,
      termSelection,
    );

    if (!sameSubjectIds(pruned.subjectIds, termSelection.subjectIds)) {
      try {
        saveStoredStudyTermSelection(pruned);
      } catch {
        // Si el navegador bloquea el storage, la vista sigue funcionando.
      }
    }
  }, [planToShow, progress, termSelection]);
```

Update `handleSave`:

```ts
  const handleSave = (plan: StudyPlan) => {
    const nextProgress = pruneProgress(plan, progress);
    const nextTermSelection = pruneTermSelection(
      plan,
      nextProgress,
      termSelection,
    );

    saveStoredStudyPlan(plan);
    saveStoredStudyProgress(nextProgress);
    saveStoredStudyTermSelection(nextTermSelection);
    setSavedPlan(plan);
    setDraft(null);
    setSourceName(null);
    setView("saved");
  };
```

Update `handleClearStored`:

```ts
  const handleClearStored = () => {
    try {
      clearStoredStudyPlan();
      clearStoredStudyProgress();
      clearStoredStudyTermSelection();
    } catch {
      // Si el navegador bloquea el storage, igual limpiamos la vista.
    }
```

Update `handleStatusChange`:

```ts
  const handleStatusChange = (
    subjectId: string,
    status: SubjectStatus,
  ) => {
    const nextProgress = { ...progress };

    if (status === "pending") {
      delete nextProgress[subjectId];
    } else {
      nextProgress[subjectId] = status;
    }

    saveStoredStudyProgress(nextProgress);

    if (planToShow) {
      saveStoredStudyTermSelection(
        pruneTermSelection(planToShow, nextProgress, termSelection),
      );
    }
  };
```

Add the selection handler after `handleStatusChange`:

```ts
  const handleTermSelectionChange = (
    selection: StudyTermSelection,
  ) => {
    if (!planToShow) {
      return;
    }

    saveStoredStudyTermSelection(
      pruneTermSelection(planToShow, progress, selection),
    );
  };
```

Update `handleRestore`:

```ts
  const handleRestore = (backup: StudyPlanBackup) => {
    const nextProgress = pruneProgress(backup.plan, backup.progress);
    const nextTermSelection = pruneTermSelection(
      backup.plan,
      nextProgress,
      backup.termSelection,
    );

    saveStoredStudyPlan(backup.plan);
    saveStoredStudyProgress(nextProgress);
    saveStoredStudyTermSelection(nextTermSelection);
    setSavedPlan(backup.plan);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("saved");
  };
```

Pass the new props to the dashboard:

```tsx
        {view === "saved" && planToShow ? (
          <StudyDashboard
            plan={planToShow}
            progress={progress}
            termSelection={termSelection}
            onStatusChange={handleStatusChange}
            onTermSelectionChange={handleTermSelectionChange}
            onEdit={handleEdit}
            onRestore={handleRestore}
            onImportAnother={handleStartOver}
            onClear={handleClearStored}
          />
        ) : null}
```

- [ ] **Step 4: Update `BackupActions`**

In `src/components/backup/backup-actions.tsx`, import the type:

```ts
import type {
  StudyPlan,
  StudyProgress,
  StudyTermSelection,
} from "@/lib/study-plan";
```

Add the prop:

```ts
interface BackupActionsProps {
  variant: "dashboard" | "home";
  currentPlan?: StudyPlan | null;
  progress?: StudyProgress;
  termSelection?: StudyTermSelection;
  onRestore: (backup: StudyPlanBackup) => void;
}

export function BackupActions({
  variant,
  currentPlan,
  progress,
  termSelection,
  onRestore,
}: BackupActionsProps) {
```

Pass the selection to the serializer:

```ts
      const blob = new Blob(
        [
          serializeStudyPlanBackup(
            currentPlan,
            progress,
            termSelection ?? { subjectIds: [] },
          ),
        ],
        { type: "application/json" },
      );
```

Update the confirmation copy:

```tsx
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Vas a reemplazar <strong>{currentPlan?.career}</strong> por{" "}
            <strong>{pendingBackup.plan.career}</strong>. Se restaurarán{" "}
            {pendingBackup.plan.subjects.length} materias,{" "}
            {Object.keys(pendingBackup.progress).length} estados guardados y{" "}
            {pendingBackup.termSelection.subjectIds.length} materias en tu
            cuatrimestre.
          </p>
```

- [ ] **Step 5: Run checks**

Run: `npm run check`
Expected: PASS with all tests.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/study-dashboard.tsx src/components/dashboard/correlation-graph-view.tsx src/components/dashboard/correlation-graph.tsx src/components/dashboard/graph-detail-panel.tsx src/components/import/import-plan-flow.tsx src/components/backup/backup-actions.tsx
git commit -m "feat: integrate term planner into dashboard and graph"
```

---

### Task 6: Documentación y verificación manual

**Files:**
- Modify: `README.md`
- Modify: `docs/DEVELOPMENT.md`

- [ ] **Step 1: Update `README.md`**

In “Qué podés hacer”, add:

```md
- **Armar tu cuatrimestre** en una pestaña aparte, eligiendo materias pendientes aunque estén bloqueadas. La selección se guarda en tu navegador y te avisa qué correlativas faltan.
```

Update the step 4 description to mention the new tab:

```md
4. **Marcás tu avance.** El tablero te muestra qué podés cursar, qué está bloqueado y cuánto progresaste. La pestaña Cuatrimestre te deja elegir tus próximas materias y la pestaña Grafo te deja explorar las correlativas materia por materia.
```

- [ ] **Step 2: Update `docs/DEVELOPMENT.md`**

In the dashboard section, replace the selector sentence:

```md
El selector **Tablero / Cuatrimestre / Grafo** permite cambiar de vista sin salir del dashboard. El tablero es la vista inicial y conserva las acciones de edición, borrado y respaldo. La vista Cuatrimestre guarda una selección independiente del progreso y muestra disponibilidad y correlativas faltantes. La pestaña Grafo explora el plan completo.
```

In the backup section, update the version and content:

```md
El respaldo es un JSON versionado que incluye plan, progreso y la selección de cuatrimestre. La versión actual es 2; los respaldos versión 1 se siguen leyendo y restauran con una selección vacía.
```

Add a storage note after the progress storage paragraph:

```md
La selección de cuatrimestre se guarda con la clave `planificador-correlativas:study-term-selection:v1`. Solo contiene ids de materias pendientes: al cambiar un estado a cursando, regularizada o aprobada, o al editar el plan, la selección se poda automáticamente.
```

- [ ] **Step 3: Run the full verification**

Run: `npm run check`
Expected: PASS with all tests.

Run: `npm run build`
Expected: PASS.

- [ ] **Step 4: Manual smoke test**

Run `npm run dev` and verify:

1. Abrir un plan guardado.
2. Entrar a **Cuatrimestre**, seleccionar una materia disponible y una bloqueada.
3. Ver el resumen y la advertencia de correlativas.
4. Recargar y confirmar que la selección persiste.
5. Volver al **Tablero** y ver el indicador “En mi cuatrimestre”.
6. Abrir el **Grafo**, seleccionar una materia marcada y ver el indicador en el panel.
7. Cambiar una materia seleccionada a **Cursando** y confirmar que desaparece de la selección.
8. Editar el plan, borrar una materia seleccionada y confirmar que se poda.
9. Exportar el respaldo y verificar que el JSON tenga `"version": 2` y `termSelection`.
10. Restaurar el respaldo y confirmar que vuelve la selección.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/DEVELOPMENT.md
git commit -m "docs: document term planner"
```

---

## Self-review

- [ ] Cobertura: selección, resumen, advertencias, persistencia, poda, indicadores en Tablero/Grafo y respaldo v2 están en tareas.
- [ ] Sin placeholders: cada paso tiene archivo, código y comando.
- [ ] Consistencia de tipos: `StudyTermSelection` se usa igual en dominio, storage, respaldo, dashboard y vista.
