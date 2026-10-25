import { describe, expect, it } from "vitest";

import { buildCorrelationGraph } from "./graph";
import {
  buildEdgePath,
  GRAPH_COLUMN_GAP,
  GRAPH_HEADER_HEIGHT,
  GRAPH_NODE_HEIGHT,
  GRAPH_NODE_WIDTH,
  GRAPH_PADDING,
  GRAPH_ROW_GAP,
  layoutCorrelationGraph,
} from "./graph-layout";
import { makePlan, makeSubject } from "./test-fixtures";

const graph = buildCorrelationGraph(
  makePlan([
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
      requiresRegularized: ["algorithms"],
    }),
  ]),
  {},
);

describe("layoutCorrelationGraph", () => {
  it("creates year columns in ascending order", () => {
    const layout = layoutCorrelationGraph(graph);

    expect(layout.years.map((column) => column.year)).toEqual([1, 2]);
    expect(layout.years.map((column) => column.x)).toEqual([
      GRAPH_PADDING,
      GRAPH_PADDING + GRAPH_NODE_WIDTH + GRAPH_COLUMN_GAP,
    ]);
    expect(layout.years.map((column) => column.count)).toEqual([1, 2]);
  });

  it("places nodes by year and stacks them inside the column", () => {
    const layout = layoutCorrelationGraph(graph);

    expect(layout.nodesById.get("intro")).toMatchObject({
      x: GRAPH_PADDING,
      y: GRAPH_HEADER_HEIGHT,
      width: GRAPH_NODE_WIDTH,
      height: GRAPH_NODE_HEIGHT,
    });
    expect(layout.nodesById.get("algorithms")).toMatchObject({
      x: GRAPH_PADDING + GRAPH_NODE_WIDTH + GRAPH_COLUMN_GAP,
      y: GRAPH_HEADER_HEIGHT,
    });
    expect(layout.nodesById.get("databases")).toMatchObject({
      x: GRAPH_PADDING + GRAPH_NODE_WIDTH + GRAPH_COLUMN_GAP,
      y: GRAPH_HEADER_HEIGHT + GRAPH_NODE_HEIGHT + GRAPH_ROW_GAP,
    });
  });

  it("calculates the canvas and column bounds", () => {
    const layout = layoutCorrelationGraph(graph);

    expect(layout.width).toBe(
      GRAPH_PADDING * 2 + GRAPH_NODE_WIDTH * 2 + GRAPH_COLUMN_GAP,
    );
    expect(layout.height).toBe(
      GRAPH_HEADER_HEIGHT +
        GRAPH_NODE_HEIGHT * 2 +
        GRAPH_ROW_GAP +
        GRAPH_PADDING,
    );
    expect(layout.years[0]?.height).toBe(
      GRAPH_HEADER_HEIGHT + GRAPH_NODE_HEIGHT + GRAPH_PADDING,
    );
    expect(layout.years[1]?.height).toBe(layout.height);
  });

  it("returns empty dimensions for a graph without nodes", () => {
    const layout = layoutCorrelationGraph(
      buildCorrelationGraph(makePlan([]), {}),
    );

    expect(layout).toEqual({
      nodes: [],
      nodesById: new Map(),
      years: [],
      width: 0,
      height: 0,
    });
  });
});

describe("buildEdgePath", () => {
  const layout = layoutCorrelationGraph(graph);
  const intro = layout.nodesById.get("intro");
  const algorithms = layout.nodesById.get("algorithms");
  const databases = layout.nodesById.get("databases");

  if (!intro || !algorithms || !databases) {
    throw new Error("Fixture layout is incomplete");
  }

  it("routes edges from the right edge to the left edge across years", () => {
    expect(buildEdgePath(intro, algorithms)).toBe(
      "M 192 88 C 204 88, 200 88, 212 88",
    );
  });

  it("routes edges vertically within the same column", () => {
    expect(buildEdgePath(algorithms, databases)).toBe(
      "M 300 128 C 318 128, 318 140, 300 140",
    );
  });

  it("returns an empty path for the same node", () => {
    expect(buildEdgePath(intro, intro)).toBe("");
  });
});
