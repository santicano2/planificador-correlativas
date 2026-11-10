"use client";

import { useId } from "react";

import {
  AlertIcon,
  CalendarIcon,
  LockIcon,
  SparkIcon,
} from "@/components/icons";
import {
  buildEdgePath,
  type CorrelationGraph,
  type CorrelationGraphLayout,
  type GraphNodeLayout,
  type StudyTermSelection,
} from "@/lib/study-plan";

import {
  STATUS_BORDER_CLASSES,
  STATUS_DOT_CLASSES,
  STATUS_LABELS,
  STATUS_ORDER,
} from "./status-meta";
import { TERM_SHORT_LABELS } from "./term-meta";

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
  const rawId = useId();
  const markerBase = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const regularizedMarkerId = `correlation-arrow-${markerBase}-regularized`;
  const approvedMarkerId = `correlation-arrow-${markerBase}-approved`;

  const selectedNode = selectedId
    ? graph.nodesById.get(selectedId)
    : undefined;
  const relatedIds = new Set<string>();

  if (selectedNode) {
    relatedIds.add(selectedNode.subject.id);

    for (const subjectId of selectedNode.prerequisiteIds) {
      relatedIds.add(subjectId);
    }

    for (const subjectId of selectedNode.dependentIds) {
      relatedIds.add(subjectId);
    }
  }

  if (graph.nodes.length === 0) {
    return (
      <div className="empty-state">
        <p className="font-display text-2xl font-semibold text-ink">
          No hay materias para graficar
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Importá o editá un plan para ver sus correlativas.
        </p>
      </div>
    );
  }

  return (
    <section className="panel">
      <div className="panel-head flex-col items-start gap-3 lg:flex-row lg:items-center">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Mapa de correlativas
          </h2>
          <p className="mt-0.5 max-w-lg text-xs leading-5 text-ink-soft">
            Elegí una materia para ver qué necesita y qué habilita.
          </p>
        </div>
        <GraphLegend />
      </div>

      {graph.edges.length === 0 ? (
        <div className="p-3 pb-0 sm:p-4 sm:pb-0">
          <div className="service-alert service-alert--warning">
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>
              Este plan no tiene correlativas cargadas. Las materias se muestran
              sin flechas.
            </span>
          </div>
        </div>
      ) : null}

      <div
        role="region"
        aria-label="Grafo de correlativas"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onClear();
          }
        }}
        className="mt-3 overflow-x-auto p-3 pb-2 sm:p-4 sm:pb-2"
      >
        <div
          className="relative"
          style={{ width: layout.width, height: layout.height }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              onClear();
            }
          }}
        >
          {layout.years.map((column) => (
            <div
              key={`column-${column.year}`}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 border border-line bg-surface-2/45"
              style={{
                left: column.x - 8,
                width: column.width + 16,
                height: column.height,
              }}
            />
          ))}

          {layout.years.map((column) => (
            <div
              key={`header-${column.year}`}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 flex h-12 flex-col justify-center"
              style={{ left: column.x, width: column.width }}
            >
              <p className="font-display text-sm font-semibold text-ink">
                {column.year}º año
              </p>
              <p className="text-[10px] text-ink-soft">
                {column.count} {column.count === 1 ? "materia" : "materias"}
              </p>
            </div>
          ))}

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-visible"
            width={layout.width}
            height={layout.height}
          >
            <defs>
              <marker
                id={regularizedMarkerId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-primary)" />
              </marker>
              <marker
                id={approvedMarkerId}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-signal)" />
              </marker>
            </defs>

            {graph.edges.map((edge) => {
              const from = layout.nodesById.get(edge.fromId);
              const to = layout.nodesById.get(edge.toId);

              if (!from || !to) {
                return null;
              }

              const directlyConnected = selectedNode
                ? edge.fromId === selectedNode.subject.id ||
                  edge.toId === selectedNode.subject.id
                : false;
              const betweenRelated =
                Boolean(selectedNode) &&
                relatedIds.has(edge.fromId) &&
                relatedIds.has(edge.toId);
              const highlighted = directlyConnected || betweenRelated;
              const dimmed = Boolean(selectedNode) && !highlighted;
              const isApproved = edge.requiredStatus === "approved";

              return (
                <path
                  key={edge.id}
                  d={buildEdgePath(from, to)}
                  fill="none"
                  strokeWidth={highlighted ? 2.4 : 1.5}
                  strokeDasharray={isApproved ? "6 5" : undefined}
                  markerEnd={`url(#${
                    isApproved ? approvedMarkerId : regularizedMarkerId
                  })`}
                  vectorEffect="non-scaling-stroke"
                  className={[
                    "transition-opacity",
                    isApproved ? "stroke-signal" : "stroke-primary",
                    highlighted ? "opacity-100" : "",
                    dimmed ? "opacity-10" : "opacity-60",
                  ].join(" ")}
                />
              );
            })}
          </svg>

          {layout.nodes.map((nodeLayout) => (
            <GraphNode
              key={nodeLayout.node.subject.id}
              nodeLayout={nodeLayout}
              isSelected={nodeLayout.node.subject.id === selectedId}
              isRelated={relatedIds.has(nodeLayout.node.subject.id)}
              isDimmed={
                Boolean(selectedNode) &&
                !relatedIds.has(nodeLayout.node.subject.id)
              }
              isInTermPlan={termIds.has(nodeLayout.node.subject.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <p className="px-3 pb-3 text-[10px] text-ink-soft sm:px-4">
        Deslizá el mapa para ver todos los años.
      </p>
    </section>
  );
}

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
  const { node } = nodeLayout;
  const { subject, status, availability } = node;
  const isAvailable = availability.status === "available";
  const isPending = status === "pending";
  const availabilityLabel = isAvailable
    ? "disponible para cursar"
    : "bloqueada por correlativas";
  const ariaLabel = [
    subject.name,
    subject.code ? `código ${subject.code}` : null,
    STATUS_LABELS[status],
    availabilityLabel,
    isInTermPlan ? "en mi cuatrimestre" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      onClick={() => onSelect(subject.id)}
      style={{
        left: nodeLayout.x,
        top: nodeLayout.y,
        width: nodeLayout.width,
        height: nodeLayout.height,
      }}
      className={[
        "absolute flex min-w-0 flex-col border border-t-2 border-line bg-surface px-3 py-1.5 text-left transition",
        "hover:border-primary hover:bg-primary-soft/20",
        STATUS_BORDER_CLASSES[status],
        isSelected
          ? "z-10 outline outline-2 outline-primary outline-offset-2"
          : "",
        isRelated && !isSelected ? "border-primary/50" : "",
        isDimmed ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="route-badge text-ink-soft">
          {subject.code || "—"}
        </span>
        <span className="flex items-center gap-1">
          {isInTermPlan ? (
            <CalendarIcon className="size-3.5 text-primary" />
          ) : null}
          {isPending && isAvailable ? (
            <SparkIcon className="size-3.5 text-success" />
          ) : null}
          {isPending && !isAvailable ? (
            <LockIcon className="size-3.5 text-signal" />
          ) : null}
          <span
            className={`status-dot ${STATUS_DOT_CLASSES[status]}`}
          />
        </span>
      </div>

      <p className="mt-0.5 line-clamp-2 font-display text-[13px] font-semibold leading-tight text-ink">
        {subject.name}
      </p>

      <p className="mt-auto text-[9px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
        {subject.term ? TERM_SHORT_LABELS[subject.term] : "Sin cuatrimestre"}
      </p>
    </button>
  );
}

function GraphLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-ink-soft">
      {STATUS_ORDER.map((status) => (
        <span key={status} className="inline-flex items-center gap-1.5">
          <span
            className={`status-dot ${STATUS_DOT_CLASSES[status]}`}
          />
          {STATUS_LABELS[status]}
        </span>
      ))}
      <span className="h-3 w-px bg-line" />
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-4 bg-primary" />
        Pide regularizada
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 border-t-2 border-dashed border-signal" />
        Pide aprobada
      </span>
    </div>
  );
}
