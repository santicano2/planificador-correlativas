import type { SubjectTerm } from "../study-plan/types";
import type {
  ParsedStudyPlan,
  ParsedSubject,
  PdfExtraction,
  PdfPage,
  PdfTextItem,
} from "./types";

type PlanColumn =
  | "code"
  | "name"
  | "totalHours"
  | "weeklyHours"
  | "term"
  | "prerequisites"
  | "ignored";

interface ItemBucket {
  anchor: PdfTextItem;
  items: { column: PlanColumn; item: PdfTextItem }[];
}

const YEAR_WORDS: Record<string, number> = {
  primer: 1,
  primero: 1,
  segundo: 2,
  tercer: 3,
  tercero: 3,
  cuarto: 4,
  quinto: 5,
  sexto: 6,
};

const MAX_ROW_DISTANCE = 40;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("es");
}

function normalizeCode(value: string): string {
  return value.replace(/\s+/g, "").toLocaleUpperCase("es");
}

function toTitleCase(value: string): string {
  const connectors = new Set(["de", "del", "la", "las", "los", "en", "y", "e"]);
  const lower = value.toLocaleLowerCase("es").replace(/\s+/g, " ").trim();

  return lower
    .split(" ")
    .map((word, index) =>
      index > 0 && connectors.has(word)
        ? word
        : `${word.charAt(0).toLocaleUpperCase("es")}${word.slice(1)}`,
    )
    .join(" ");
}

function parseYearHeading(text: string): number | undefined {
  const match = normalizeText(text).match(
    /^(primer|primero|segundo|tercer|tercero|cuarto|quinto|sexto)\s+ano$/,
  );

  if (!match) {
    return undefined;
  }

  return YEAR_WORDS[match[1] ?? ""];
}

function isSubjectCode(text: string): boolean {
  return /^(?=.*\d)[a-z0-9]{1,10}$/i.test(text.trim());
}

function columnFor(x: number, pageWidth: number): PlanColumn {
  const ratio = x / pageWidth;

  if (ratio < 0.2) return "code";
  if (ratio < 0.5) return "name";
  if (ratio < 0.58) return "totalHours";
  if (ratio < 0.64) return "weeklyHours";
  if (ratio < 0.75) return "term";
  if (ratio < 0.95) return "prerequisites";
  return "ignored";
}

function normalizeTerm(raw: string): SubjectTerm | undefined {
  const text = normalizeText(raw);

  if (!text) {
    return undefined;
  }

  if (text.includes("anual")) {
    return "annual";
  }

  if (/(?:^|\s)(?:1|primer|primero|1er|1ro)\s*(?:º|°|er|ro)?\s*(?:cuatrimestre|semestre)/.test(text)) {
    return "1";
  }

  if (/(?:^|\s)(?:2|segundo|2do|2da)\s*(?:º|°|do|da)?\s*(?:cuatrimestre|semestre)/.test(text)) {
    return "2";
  }

  return undefined;
}

function extractPrerequisiteCodes(raw: string): string[] {
  const matches = raw.match(/[A-Za-z]{0,4}\d{1,3}[A-Za-z]?/g) ?? [];

  return [...new Set(matches.map(normalizeCode))];
}

function joinItems(items: PdfTextItem[]): string {
  return items
    .slice()
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((item) => item.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildLines(page: PdfPage): { y: number; text: string }[] {
  const tolerance = 8;
  const sorted = page.items
    .slice()
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; text: string; items: PdfTextItem[] }[] = [];

  for (const item of sorted) {
    const current = lines[lines.length - 1];

    if (!current || Math.abs(current.y - item.y) > tolerance) {
      lines.push({ y: item.y, items: [item], text: "" });
    } else {
      current.items.push(item);
    }
  }

  return lines.map((line) => ({
    y: line.y,
    text: joinItems(line.items),
  }));
}

function findCareer(lines: { y: number; text: string }[]): string {
  const candidates = lines.filter((line) =>
    /licenciatura|analista/i.test(line.text),
  );
  const header = candidates.find((line) => /licenciatura/i.test(line.text));
  const selected = header ?? candidates[0];

  if (!selected) {
    return "";
  }

  const parts = selected.text.split("/");
  const career = parts[parts.length - 1]?.trim() ?? selected.text;

  return toTitleCase(career);
}

function findPlanYear(lines: { y: number; text: string }[]): number | undefined {
  const match = lines
    .map((line) => line.text.match(/plan de estudios\s+(\d{4})/i))
    .find((candidate) => candidate !== null);

  return match ? Number(match[1]) : undefined;
}

function findUniversity(lines: { y: number; text: string }[]): string {
  const line = lines.find((candidate) => /universidad/i.test(candidate.text));

  if (!line) {
    return "";
  }

  return line.text.trim();
}

function parsePage(
  page: PdfPage,
  fallbackYear: number,
): {
  subjects: ParsedSubject[];
  lastHeadingYear: number;
} {
  const yearHeadings: { y: number; year: number }[] = [];
  const anchors: PdfTextItem[] = [];

  for (const item of page.items) {
    const year = parseYearHeading(item.text);

    if (year !== undefined) {
      yearHeadings.push({ y: item.y, year });
      continue;
    }

    if (
      columnFor(item.x, page.width) === "code" &&
      isSubjectCode(item.text)
    ) {
      anchors.push(item);
    }
  }

  anchors.sort((a, b) => b.y - a.y || a.x - b.x);
  yearHeadings.sort((a, b) => b.y - a.y);

  const buckets: ItemBucket[] = anchors.map((anchor) => ({
    anchor,
    items: [],
  }));

  for (const item of page.items) {
    if (
      parseYearHeading(item.text) !== undefined ||
      anchors.includes(item)
    ) {
      continue;
    }

    const column = columnFor(item.x, page.width);

    if (column === "code" || column === "ignored") {
      continue;
    }

    let nearest: ItemBucket | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const bucket of buckets) {
      const distance = Math.abs(bucket.anchor.y - item.y);

      if (distance < nearestDistance) {
        nearest = bucket;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance <= MAX_ROW_DISTANCE) {
      nearest.items.push({ column, item });
    }
  }

  const sortedHeadings = [...yearHeadings].sort((a, b) => a.y - b.y);

  const subjects = buckets.map(({ anchor, items }) => {
    const code = normalizeCode(anchor.text);
    const nameParts = items
      .filter(({ column }) => column === "name")
      .map(({ item }) => item);
    const termParts = items
      .filter(({ column }) => column === "term")
      .map(({ item }) => item);
    const prerequisiteParts = items
      .filter(({ column }) => column === "prerequisites")
      .map(({ item }) => item);
    const name = joinItems(nameParts);
    const term = normalizeTerm(joinItems(termParts));
    const prerequisiteText = joinItems(prerequisiteParts);
    const warningList: string[] = [];
    const year =
      sortedHeadings.find((candidate) => candidate.y >= anchor.y)?.year ??
      fallbackYear;

    if (!name) {
      warningList.push("No pudimos detectar el nombre de la materia.");
    }

    if (prerequisiteText.includes("*")) {
      warningList.push(
        "Tiene requisitos especiales que no se pueden representar como correlativas.",
      );
    }

    return {
      code,
      name,
      year,
      term,
      prerequisiteCodes: extractPrerequisiteCodes(prerequisiteText).filter(
        (candidate) => candidate !== code,
      ),
      warnings: warningList,
    };
  });

  const lastHeadingYear = sortedHeadings.at(-1)?.year ?? fallbackYear;

  return { subjects, lastHeadingYear };
}

export function parseStudyPlan(extraction: PdfExtraction): ParsedStudyPlan {
  const allLines = extraction.pages.flatMap((page) => buildLines(page));
  const career = findCareer(allLines);
  const university = findUniversity(allLines);
  const planYear = findPlanYear(allLines);
  const warnings: string[] = [];
  const subjects: ParsedSubject[] = [];
  let lastYear = 1;

  for (const page of extraction.pages) {
    const parsed = parsePage(page, lastYear);
    subjects.push(...parsed.subjects);
    lastYear = parsed.lastHeadingYear;
  }

  const codes = new Set(subjects.map((subject) => subject.code));

  for (const subject of subjects) {
    for (const prerequisite of subject.prerequisiteCodes) {
      if (!codes.has(prerequisite)) {
        warnings.push(
          `La correlativa ${prerequisite} de la materia ${subject.code} no aparece en el plan.`,
        );
      }
    }
  }

  if (!career) {
    warnings.push("No pudimos detectar la carrera. Completala en la revisión.");
  }

  if (!university) {
    warnings.push(
      "No pudimos detectar la universidad. Completala en la revisión.",
    );
  }

  if (subjects.length === 0) {
    warnings.push("No pudimos detectar materias en el PDF.");
  }

  return {
    career,
    university,
    planYear,
    subjects,
    warnings,
  };
}
