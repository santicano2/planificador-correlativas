"use client";

import { useId } from "react";

import { AlertIcon, LockIcon, SparkIcon } from "@/components/icons";
import {
  buildEdgePath,
  type CorrelationGraph,
  type CorrelationGraphLayout,
  type GraphNodeLayout,
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
  selectedId: string | null;
  onSelect: (subjectId: string) => void;
  onClear: () => void;
}

export function CorrelationGraph({
  graph,
  layout,
  selectedId,
  onSelect,
  onClear,
}: CorrelationGraphProps) {
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
      <section className="rounded-3xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
        <p className="font-display text-xl font-semibold text-ink">
          No hay materias para graficar
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Importá o editá un plan para ver sus correlativas.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-ink/12 bg-paper-light p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            Mapa de correlativas
          </p>
          <p className="mt-1 max-w-lg text-xs leading-5 text-ink-soft">
            Elegí una materia para ver qué necesita y qué habilita.
          </p>
        </div>
        <GraphLegend />
      </div>

      {graph.edges.length === 0 ? (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-gold/35 bg-gold/10 px-3 py-2 text-[11px] leading-5 text-ink-soft">
          <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-gold" />
          Este plan no tiene correlativas cargadas. Las materias se muestran sin
          flechas.
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
        className="mt-4 overflow-x-auto pb-2"
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
              className="pointer-events-none absolute top-0 rounded-3xl border border-ink/8 bg-paper/45"
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
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                {column.year}º año
              </p>
              <p className="font-mono text-[9px] text-ink-soft">
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-forest)" />
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-terracotta)" />
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
                  strokeWidth={highlighted ? 2.2 : 1.5}
                  strokeDasharray={isApproved ? "6 5" : undefined}
                  markerEnd={`url(#${
                    isApproved ? approvedMarkerId : regularizedMarkerId
                  })`}
                  vectorEffect="non-scaling-stroke"
                  className={[
                    "transition-opacity",
                    isApproved ? "stroke-terracotta" : "stroke-forest",
                    highlighted ? "opacity-100" : "",
                    dimmed ? "opacity-10" : "opacity-45",
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
              isDimmed={Boolean(selectedNode) && !relatedIds.has(nodeLayout.node.subject.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-[10px] text-ink-soft lg:hidden">
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
  onSelect,
}: {
  nodeLayout: GraphNodeLayout;
  isSelected: boolean;
  isRelated: boolean;
  isDimmed: boolean;
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
        "absolute flex min-w-0 flex-col rounded-2xl border border-ink/12 border-l-4 bg-paper-light px-3 py-1.5 text-left shadow-[2px_2px_0_rgba(23,36,29,0.05)] transition",
        "hover:-translate-y-0.5 hover:shadow-[3px_4px_0_rgba(23,36,29,0.08)]",
        STATUS_BORDER_CLASSES[status],
        isSelected
          ? "z-10 ring-2 ring-terracotta ring-offset-2 ring-offset-paper-light"
          : "",
        isRelated && !isSelected ? "ring-1 ring-forest/20" : "",
        isDimmed ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[9px] text-ink">
          {subject.code || "—"}
        </span>
        <span className="flex items-center gap-1">
          {isPending && isAvailable ? (
            <SparkIcon className="size-3.5 text-forest" />
          ) : null}
          {isPending && !isAvailable ? (
            <LockIcon className="size-3.5 text-terracotta" />
          ) : null}
          <span
            className={`size-2 rounded-full ${STATUS_DOT_CLASSES[status]}`}
          />
        </span>
      </div>

      <p className="mt-0.5 line-clamp-2 font-display text-[13px] font-semibold leading-tight text-ink">
        {subject.name}
      </p>

      <p className="mt-auto font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft">
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
          <span className={`size-2 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
          {STATUS_LABELS[status]}
        </span>
      ))}
      <span className="h-3 w-px bg-ink/10" />
      <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft/70">
        Correlativa
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0.5 w-4 bg-forest" />
        Pide regularizada
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 border-t-2 border-dashed border-terracotta" />
        Pide aprobada
      </span>
    </div>
  );
}
