import { describe, expect, it } from "vitest";

import fixture from "./__fixtures__/plan-2014-items.json";
import { parseStudyPlan } from "./parse-plan";
import type { PdfExtraction } from "./types";

const extraction: PdfExtraction = {
  pageCount: fixture.length,
  pages: fixture,
};

function subjectWithCode(code: string) {
  const subject = parseStudyPlan(extraction).subjects.find(
    (candidate) => candidate.code === code,
  );

  if (!subject) {
    throw new Error(`No se encontró la materia con código ${code}`);
  }

  return subject;
}

describe("parseStudyPlan", () => {
  it("detects all subjects from the sample plan", () => {
    const plan = parseStudyPlan(extraction);

    expect(plan.subjects).toHaveLength(36);
    expect(plan.subjects.map((subject) => subject.code)).toEqual(
      Array.from({ length: 36 }, (_, index) => String(index + 1)),
    );
  });

  it("extracts the career and the plan year", () => {
    const plan = parseStudyPlan(extraction);

    expect(plan.career).toBe("Licenciatura en Sistemas");
    expect(plan.planYear).toBe(2014);
  });

  it("detects year, term and name of a subject", () => {
    expect(subjectWithCode("1")).toMatchObject({
      name: "Programación de Computadoras",
      year: 1,
      term: "annual",
      prerequisiteCodes: [],
    });

    expect(subjectWithCode("3")).toMatchObject({
      name: "Arquitectura de Computadoras",
      year: 1,
      term: "2",
      prerequisiteCodes: ["2"],
    });
  });

  it("joins subject names that wrap to the next line", () => {
    expect(subjectWithCode("26").name).toBe(
      "Fundamentos de Teoría de la Computación",
    );
    expect(subjectWithCode("22").name).toBe(
      "Conceptos y Paradigmas de Lenguajes de Programación",
    );
    expect(subjectWithCode("33").name).toBe(
      "Aspectos legales y Profesionales de Informática",
    );
  });

  it("joins prerequisite numbers that wrap to the next line", () => {
    expect(subjectWithCode("24").prerequisiteCodes).toEqual(["14", "17", "19"]);
    expect(subjectWithCode("36").prerequisiteCodes).toEqual([
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
    ]);
  });

  it("keeps subjects with special requirements but without prerequisites", () => {
    expect(subjectWithCode("32").prerequisiteCodes).toEqual([]);
    expect(subjectWithCode("32").warnings.join(" ")).toMatch(
      /requisitos especiales/i,
    );
  });

  it("ignores headers, year headings and footer text", () => {
    const names = parseStudyPlan(extraction).subjects.map(
      (subject) => subject.name,
    );

    expect(names).not.toContain("Primer Año");
    expect(names).not.toContain("Código");
    expect(names).not.toContain("Asignatura");
    expect(names.join(" ")).not.toMatch(/Aprobadas las asignaturas/);
  });

  it("warns when a prerequisite is not present in the plan", () => {
    const plan = parseStudyPlan({
      pageCount: 1,
      pages: [
        {
          pageNumber: 1,
          width: 612,
          height: 792,
          items: [
            { text: "Primer Año", x: 275, y: 700, width: 60, height: 10, fontSize: 10 },
            { text: "1", x: 95, y: 680, width: 6, height: 10, fontSize: 10 },
            { text: "Materia uno", x: 128, y: 680, width: 80, height: 10, fontSize: 10 },
            { text: "1º Cuatrimestre", x: 411, y: 680, width: 80, height: 10, fontSize: 10 },
            { text: "99", x: 496, y: 680, width: 12, height: 10, fontSize: 10 },
          ],
        },
      ],
    });

    expect(plan.subjects[0]?.prerequisiteCodes).toEqual(["99"]);
    expect(plan.warnings.join(" ")).toMatch(/99/);
  });
});
