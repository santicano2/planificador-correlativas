import {
  getSubjectAvailability,
  type SubjectAvailability,
} from "./availability";
import { getEffectiveStatus } from "./status";
import type {
  RequiredStatus,
  StudyPlan,
  StudyProgress,
  Subject,
  SubjectStatus,
} from "./types";

export interface CorrelationGraphNode {
  subject: Subject;
  status: SubjectStatus;
  availability: SubjectAvailability;
  prerequisiteIds: string[];
  dependentIds: string[];
}

export interface CorrelationGraphEdge {
  id: string;
  fromId: string;
  toId: string;
  requiredStatus: RequiredStatus;
}

export interface CorrelationGraph {
  nodes: CorrelationGraphNode[];
  nodesById: Map<string, CorrelationGraphNode>;
  edges: CorrelationGraphEdge[];
  years: number[];
}

function compareSubjects(a: Subject, b: Subject): number {
  return (
    a.year - b.year ||
    (a.code ?? "").localeCompare(b.code ?? "", "es", { numeric: true }) ||
    a.name.localeCompare(b.name, "es")
  );
}

export function buildCorrelationGraph(
  plan: StudyPlan,
  progress: StudyProgress,
): CorrelationGraph {
  const subjects = [...plan.subjects].sort(compareSubjects);
  const order = new Map(
    subjects.map((subject, index) => [subject.id, index]),
  );
  const nodes = subjects.map<CorrelationGraphNode>((subject) => ({
    subject,
    status: getEffectiveStatus(progress, subject.id),
    availability: getSubjectAvailability(subject, progress),
    prerequisiteIds: [],
    dependentIds: [],
  }));
  const nodesById = new Map(nodes.map((node) => [node.subject.id, node]));
  const edges: CorrelationGraphEdge[] = [];

  for (const node of nodes) {
    const prerequisiteIds = new Set([
      ...node.subject.requiresRegularized,
      ...node.subject.requiresApproved,
    ]);
    const validPrerequisiteIds = [...prerequisiteIds]
      .filter((subjectId) => subjectId !== node.subject.id)
      .filter((subjectId) => nodesById.has(subjectId))
      .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));

    node.prerequisiteIds = validPrerequisiteIds;

    for (const prerequisiteId of validPrerequisiteIds) {
      const requiredStatus: RequiredStatus =
        node.subject.requiresApproved.includes(prerequisiteId)
          ? "approved"
          : "regularized";

      edges.push({
        id: `${prerequisiteId}->${node.subject.id}`,
        fromId: prerequisiteId,
        toId: node.subject.id,
        requiredStatus,
      });

      nodesById.get(prerequisiteId)?.dependentIds.push(node.subject.id);
    }
  }

  edges.sort(
    (a, b) =>
      (order.get(a.fromId) ?? 0) - (order.get(b.fromId) ?? 0) ||
      (order.get(a.toId) ?? 0) - (order.get(b.toId) ?? 0),
  );

  return {
    nodes,
    nodesById,
    edges,
    years: [...new Set(nodes.map((node) => node.subject.year))].sort(
      (a, b) => a - b,
    ),
  };
}
