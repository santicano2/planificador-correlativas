import type { CorrelationGraph, CorrelationGraphNode } from "./graph";

export const GRAPH_NODE_WIDTH = 176;
export const GRAPH_NODE_HEIGHT = 72;
export const GRAPH_COLUMN_GAP = 20;
export const GRAPH_ROW_GAP = 12;
export const GRAPH_PADDING = 16;
export const GRAPH_HEADER_HEIGHT = 48;

export interface GraphNodeLayout {
  node: CorrelationGraphNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphYearColumn {
  year: number;
  x: number;
  width: number;
  height: number;
  count: number;
}

export interface CorrelationGraphLayout {
  nodes: GraphNodeLayout[];
  nodesById: Map<string, GraphNodeLayout>;
  years: GraphYearColumn[];
  width: number;
  height: number;
}

function round(value: number): number {
  return Number(value.toFixed(2));
}

export function layoutCorrelationGraph(
  graph: CorrelationGraph,
): CorrelationGraphLayout {
  if (graph.nodes.length === 0) {
    return {
      nodes: [],
      nodesById: new Map(),
      years: [],
      width: 0,
      height: 0,
    };
  }

  const nodesByYear = new Map<number, CorrelationGraphNode[]>();

  for (const node of graph.nodes) {
    const group = nodesByYear.get(node.subject.year) ?? [];
    group.push(node);
    nodesByYear.set(node.subject.year, group);
  }

  const years: GraphYearColumn[] = [];
  const nodes: GraphNodeLayout[] = [];
  const nodesById = new Map<string, GraphNodeLayout>();

  graph.years.forEach((year, yearIndex) => {
    const yearNodes = nodesByYear.get(year) ?? [];
    const x =
      GRAPH_PADDING + yearIndex * (GRAPH_NODE_WIDTH + GRAPH_COLUMN_GAP);
    const contentHeight =
      yearNodes.length * GRAPH_NODE_HEIGHT +
      Math.max(0, yearNodes.length - 1) * GRAPH_ROW_GAP;

    years.push({
      year,
      x,
      width: GRAPH_NODE_WIDTH,
      height: GRAPH_HEADER_HEIGHT + contentHeight + GRAPH_PADDING,
      count: yearNodes.length,
    });

    yearNodes.forEach((node, nodeIndex) => {
      const layout: GraphNodeLayout = {
        node,
        x,
        y: GRAPH_HEADER_HEIGHT + nodeIndex * (GRAPH_NODE_HEIGHT + GRAPH_ROW_GAP),
        width: GRAPH_NODE_WIDTH,
        height: GRAPH_NODE_HEIGHT,
      };

      nodes.push(layout);
      nodesById.set(node.subject.id, layout);
    });
  });

  const width =
    GRAPH_PADDING * 2 +
    years.length * GRAPH_NODE_WIDTH +
    Math.max(0, years.length - 1) * GRAPH_COLUMN_GAP;
  const height = Math.max(...years.map((column) => column.height));

  return { nodes, nodesById, years, width, height };
}

export function buildEdgePath(
  from: GraphNodeLayout,
  to: GraphNodeLayout,
): string {
  if (from.node.subject.id === to.node.subject.id) {
    return "";
  }

  const fromCenterY = from.y + from.height / 2;
  const toCenterY = to.y + to.height / 2;

  if (from.x !== to.x) {
    const leftToRight = from.x < to.x;
    const startX = leftToRight ? from.x + from.width : from.x;
    const endX = leftToRight ? to.x : to.x + to.width;
    const controlOffset = Math.max(
      12,
      Math.abs(endX - startX) * 0.5,
    );
    const firstControlX = leftToRight
      ? startX + controlOffset
      : startX - controlOffset;
    const secondControlX = leftToRight
      ? endX - controlOffset
      : endX + controlOffset;

    return `M ${round(startX)} ${round(fromCenterY)} C ${round(firstControlX)} ${round(fromCenterY)}, ${round(secondControlX)} ${round(toCenterY)}, ${round(endX)} ${round(toCenterY)}`;
  }

  const fromCenterX = from.x + from.width / 2;
  const toCenterX = to.x + to.width / 2;
  const downward = from.y < to.y;
  const startY = downward ? from.y + from.height : from.y;
  const endY = downward ? to.y : to.y + to.height;
  const controlOffset = 18;

  return `M ${round(fromCenterX)} ${round(startY)} C ${round(fromCenterX + controlOffset)} ${round(startY)}, ${round(toCenterX + controlOffset)} ${round(endY)}, ${round(toCenterX)} ${round(endY)}`;
}
