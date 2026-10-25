import { describe, expect, it } from "vitest";

import { buildCorrelationGraph } from "./graph";
import { makePlan, makeSubject } from "./test-fixtures";
import type { StudyProgress } from "./types";

const plan = makePlan([
  makeSubject({
    id: "projects",
    code: "4",
    name: "Proyectos",
    year: 3,
    requiresRegularized: ["algorithms"],
    requiresApproved: ["algorithms"],
  }),
  makeSubject({ id: "intro", code: "1", name: "Intro", year: 1 }),
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
    name: "Bases",
    year: 2,
    requiresApproved: ["intro"],
  }),
  makeSubject({
    id: "broken",
    code: "5",
    name: "Rota",
    year: 3,
    requiresRegularized: ["missing", "broken"],
  }),
]);

const progress: StudyProgress = {
  intro: "regularized",
};

describe("buildCorrelationGraph", () => {
  it("sorts nodes by year and code and resolves statuses", () => {
    const graph = buildCorrelationGraph(plan, progress);

    expect(graph.nodes.map((node) => node.subject.id)).toEqual([
      "intro",
      "algorithms",
      "databases",
      "projects",
      "broken",
    ]);
    expect(graph.nodes.map((node) => node.status)).toEqual([
      "regularized",
      "pending",
      "pending",
      "pending",
      "pending",
    ]);
    expect(graph.years).toEqual([1, 2, 3]);
  });

  it("resolves availability for each node", () => {
    const graph = buildCorrelationGraph(plan, progress);

    expect(graph.nodesById.get("algorithms")?.availability).toEqual({
      status: "available",
    });
    expect(graph.nodesById.get("databases")?.availability).toEqual({
      status: "blocked",
      missing: [
        {
          subjectId: "intro",
          requiredStatus: "approved",
          currentStatus: "regularized",
        },
      ],
    });
  });

  it("creates one edge per pair using the strongest requirement", () => {
    const graph = buildCorrelationGraph(plan, progress);

    expect(graph.edges).toEqual([
      {
        id: "intro->algorithms",
        fromId: "intro",
        toId: "algorithms",
        requiredStatus: "regularized",
      },
      {
        id: "intro->databases",
        fromId: "intro",
        toId: "databases",
        requiredStatus: "approved",
      },
      {
        id: "algorithms->projects",
        fromId: "algorithms",
        toId: "projects",
        requiredStatus: "approved",
      },
    ]);
  });

  it("links prerequisites and dependents in both directions", () => {
    const graph = buildCorrelationGraph(plan, progress);

    expect(graph.nodesById.get("intro")?.dependentIds).toEqual([
      "algorithms",
      "databases",
    ]);
    expect(graph.nodesById.get("algorithms")?.prerequisiteIds).toEqual([
      "intro",
    ]);
    expect(graph.nodesById.get("algorithms")?.dependentIds).toEqual([
      "projects",
    ]);
    expect(graph.nodesById.get("projects")?.prerequisiteIds).toEqual([
      "algorithms",
    ]);
  });

  it("ignores missing and self references", () => {
    const graph = buildCorrelationGraph(plan, progress);
    const broken = graph.nodesById.get("broken");

    expect(broken?.prerequisiteIds).toEqual([]);
    expect(broken?.dependentIds).toEqual([]);
    expect(
      graph.edges.some(
        (edge) => edge.fromId === "broken" || edge.toId === "broken",
      ),
    ).toBe(false);
  });

  it("returns an empty graph for a plan without subjects", () => {
    const graph = buildCorrelationGraph(makePlan([]), {});

    expect(graph).toEqual({
      nodes: [],
      nodesById: new Map(),
      edges: [],
      years: [],
    });
  });
});
