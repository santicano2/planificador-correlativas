"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildCorrelationGraph,
  layoutCorrelationGraph,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
  type SubjectStatus,
} from "@/lib/study-plan";

import { CorrelationGraph } from "./correlation-graph";
import { GraphDetailPanel } from "./graph-detail-panel";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const graph = useMemo(
    () => buildCorrelationGraph(plan, progress),
    [plan, progress],
  );
  const layout = useMemo(
    () => layoutCorrelationGraph(graph),
    [graph],
  );
  const selectedNode = selectedId
    ? graph.nodesById.get(selectedId) ?? null
    : null;

  useEffect(() => {
    if (
      selectedId &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedId]);

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div
        className={[
          "min-w-0",
          selectedNode ? "order-2 lg:order-1" : "order-1",
        ].join(" ")}
      >
        <CorrelationGraph
          graph={graph}
          layout={layout}
          termSelection={termSelection}
          selectedId={selectedNode ? selectedId : null}
          onSelect={setSelectedId}
          onClear={() => setSelectedId(null)}
        />
      </div>

      <div
        ref={detailRef}
        className={[
          "order-1 scroll-mt-4 lg:order-2 lg:sticky lg:top-6",
          selectedNode ? "" : "hidden lg:block",
        ].join(" ")}
      >
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
      </div>
    </div>
  );
}
