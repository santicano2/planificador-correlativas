import type { ParsedStudyPlan, ParsedSubject } from "../pdf/types";
import type { StudyPlan, Subject } from "../study-plan/types";

export interface DraftSubject {
  id: string;
  code: string;
  name: string;
  year: number;
  term?: Subject["term"];
  requiresRegularized: string[];
  requiresApproved: string[];
  warnings: string[];
}

export interface DraftStudyPlan {
  career: string;
  university: string;
  planYear?: number;
  subjects: DraftSubject[];
  warnings: string[];
}

function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "").toLocaleUpperCase("es");
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueId(base: string, used: Set<string>): string {
  const fallback = base || "materia";

  if (!used.has(fallback)) {
    used.add(fallback);
    return fallback;
  }

  let suffix = 2;

  while (used.has(`${fallback}-${suffix}`)) {
    suffix += 1;
  }

  const id = `${fallback}-${suffix}`;
  used.add(id);
  return id;
}

function createIds(subjects: ParsedSubject[]): string[] {
  const used = new Set<string>();

  return subjects.map((subject) =>
    uniqueId(slugify(subject.code || subject.name), used),
  );
}

function mapPrerequisites(
  codes: string[],
  codeToId: Map<string, string>,
): string[] {
  return [
    ...new Set(
      codes.map((code) => codeToId.get(normalizeCode(code)) ?? normalizeCode(code)),
    ),
  ];
}

export function createDraftPlan(parsed: ParsedStudyPlan): DraftStudyPlan {
  const ids = createIds(parsed.subjects);
  const codeToId = new Map<string, string>();

  for (const [index, subject] of parsed.subjects.entries()) {
    const id = ids[index];

    if (id && subject.code) {
      const code = normalizeCode(subject.code);

      if (!codeToId.has(code)) {
        codeToId.set(code, id);
      }
    }
  }

  return {
    career: parsed.career,
    university: parsed.university,
    planYear: parsed.planYear,
    warnings: [...parsed.warnings],
    subjects: parsed.subjects.map((subject, index): DraftSubject => ({
      id: ids[index] ?? slugify(subject.name),
      code: subject.code,
      name: subject.name,
      year: subject.year,
      term: subject.term,
      requiresRegularized: mapPrerequisites(
        subject.prerequisiteCodes,
        codeToId,
      ),
      requiresApproved: [],
      warnings: [...subject.warnings],
    })),
  };
}

export function createDraftFromStudyPlan(plan: StudyPlan): DraftStudyPlan {
  return {
    career: plan.career,
    university: plan.university,
    planYear: plan.planYear,
    warnings: [],
    subjects: plan.subjects.map((subject) => ({
      id: subject.id,
      code: subject.code ?? "",
      name: subject.name,
      year: subject.year,
      term: subject.term,
      requiresRegularized: [...subject.requiresRegularized],
      requiresApproved: [...subject.requiresApproved],
      warnings: [],
    })),
  };
}

export function createEmptySubject(subjects: DraftSubject[]): DraftSubject {
  const used = new Set(subjects.map((subject) => subject.id));

  return {
    id: uniqueId("nueva-materia", used),
    code: "",
    name: "Nueva materia",
    year: 1,
    requiresRegularized: [],
    requiresApproved: [],
    warnings: [],
  };
}

function uniqueReferences(references: string[], selfId: string): string[] {
  return [...new Set(references)].filter((reference) => reference !== selfId);
}

export function toStudyPlan(draft: DraftStudyPlan): StudyPlan {
  return {
    career: draft.career.trim(),
    university: draft.university.trim(),
    planYear: draft.planYear,
    subjects: draft.subjects.map(
      (subject): Subject => ({
        id: subject.id,
        ...(subject.code.trim() ? { code: subject.code.trim() } : {}),
        name: subject.name.trim(),
        year: subject.year,
        ...(subject.term ? { term: subject.term } : {}),
        requiresRegularized: uniqueReferences(
          subject.requiresRegularized,
          subject.id,
        ),
        requiresApproved: uniqueReferences(
          subject.requiresApproved,
          subject.id,
        ),
      }),
    ),
  };
}
