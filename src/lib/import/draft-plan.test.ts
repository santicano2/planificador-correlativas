import { describe, expect, it } from "vitest";

import {
  createDraftFromStudyPlan,
  createDraftPlan,
  createEmptySubject,
  toStudyPlan,
} from "./draft-plan";
import type { ParsedStudyPlan } from "../pdf/types";

const parsedPlan: ParsedStudyPlan = {
  career: "Licenciatura en Sistemas",
  university: "Universidad Nacional de Ejemplo",
  planYear: 2014,
  warnings: ["Advertencia general"],
  subjects: [
    {
      code: "1",
      name: "Programación de Computadoras",
      year: 1,
      term: "annual",
      prerequisiteCodes: [],
      warnings: [],
    },
    {
      code: "2",
      name: "Matemática 1",
      year: 1,
      term: "1",
      prerequisiteCodes: ["1"],
      warnings: ["Advertencia de materia"],
    },
  ],
};

describe("createDraftPlan", () => {
  it("assigns stable ids from the subject codes", () => {
    const draft = createDraftPlan(parsedPlan);

    expect(draft.subjects.map((subject) => subject.id)).toEqual(["1", "2"]);
  });

  it("maps prerequisite codes to subject ids", () => {
    const draft = createDraftPlan(parsedPlan);

    expect(draft.subjects[1]?.requiresRegularized).toEqual(["1"]);
    expect(draft.subjects[1]?.requiresApproved).toEqual([]);
  });

  it("keeps warnings from the parser", () => {
    const draft = createDraftPlan(parsedPlan);

    expect(draft.warnings).toEqual(["Advertencia general"]);
    expect(draft.subjects[1]?.warnings).toEqual(["Advertencia de materia"]);
  });

  it("keeps unresolved prerequisite codes so validation can report them", () => {
    const draft = createDraftPlan({
      ...parsedPlan,
      subjects: [
        {
          code: "1",
          name: "Materia uno",
          year: 1,
          prerequisiteCodes: ["99"],
          warnings: [],
        },
      ],
    });

    expect(draft.subjects[0]?.requiresRegularized).toEqual(["99"]);
  });

  it("generates unique ids when codes repeat or are missing", () => {
    const draft = createDraftPlan({
      ...parsedPlan,
      subjects: [
        {
          code: "1",
          name: "Materia uno",
          year: 1,
          prerequisiteCodes: [],
          warnings: [],
        },
        {
          code: "1",
          name: "Materia uno bis",
          year: 1,
          prerequisiteCodes: [],
          warnings: [],
        },
        {
          code: "",
          name: "Materia sin código",
          year: 2,
          prerequisiteCodes: [],
          warnings: [],
        },
      ],
    });

    expect(draft.subjects.map((subject) => subject.id)).toEqual([
      "1",
      "1-2",
      "materia-sin-codigo",
    ]);
  });
});

describe("createEmptySubject", () => {
  it("generates a unique id even when a new subject already exists", () => {
    const existing = createDraftPlan(parsedPlan).subjects;
    const first = createEmptySubject(existing);
    const second = createEmptySubject([...existing, first]);

    expect(first.id).toBe("nueva-materia");
    expect(second.id).toBe("nueva-materia-2");
  });
});

describe("createDraftFromStudyPlan", () => {
  it("preserves ids, metadata and prerequisites", () => {
    const plan = toStudyPlan(createDraftPlan(parsedPlan));
    const draft = createDraftFromStudyPlan(plan);

    expect(draft.subjects).toEqual([
      {
        id: "1",
        code: "1",
        name: "Programación de Computadoras",
        year: 1,
        term: "annual",
        requiresRegularized: [],
        requiresApproved: [],
        warnings: [],
      },
      {
        id: "2",
        code: "2",
        name: "Matemática 1",
        year: 1,
        term: "1",
        requiresRegularized: ["1"],
        requiresApproved: [],
        warnings: [],
      },
    ]);
    expect(draft.warnings).toEqual([]);
  });

  it("round-trips without losing plan data", () => {
    const plan = toStudyPlan(createDraftPlan(parsedPlan));

    expect(toStudyPlan(createDraftFromStudyPlan(plan))).toEqual(plan);
  });
});

describe("toStudyPlan", () => {
  it("converts the draft into the domain model", () => {
    const plan = toStudyPlan(createDraftPlan(parsedPlan));

    expect(plan).toMatchObject({
      career: "Licenciatura en Sistemas",
      university: "Universidad Nacional de Ejemplo",
      planYear: 2014,
    });
    expect(plan.subjects[1]).toMatchObject({
      id: "2",
      code: "2",
      name: "Matemática 1",
      year: 1,
      term: "1",
      requiresRegularized: ["1"],
      requiresApproved: [],
    });
  });

  it("removes duplicate references and self references", () => {
    const draft = createDraftPlan(parsedPlan);
    const second = draft.subjects[1];

    if (!second) {
      throw new Error("Falta la segunda materia");
    }

    second.requiresRegularized = ["1", "1", "2"];

    const plan = toStudyPlan(draft);

    expect(plan.subjects[1]?.requiresRegularized).toEqual(["1"]);
  });
});
