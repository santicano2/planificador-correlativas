"use client";

import {
  AlertIcon,
  CalendarIcon,
  LockIcon,
  SparkIcon,
  XIcon,
} from "@/components/icons";
import type {
  CorrelationGraph,
  CorrelationGraphNode,
  SubjectStatus,
} from "@/lib/study-plan";

import { StatusControl } from "./status-control";
import { STATUS_DOT_CLASSES, STATUS_LABELS } from "./status-meta";
import { TERM_LABELS } from "./term-meta";

interface GraphDetailPanelProps {
  graph: CorrelationGraph;
  node: CorrelationGraphNode | null;
  isInTermPlan: boolean;
  onSelect: (subjectId: string) => void;
  onClear: () => void;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
}

export function GraphDetailPanel({
  graph,
  node,
  isInTermPlan,
  onSelect,
  onClear,
  onStatusChange,
}: GraphDetailPanelProps) {
  if (!node) {
    return (
      <aside
        aria-label="Detalle de la materia"
        className="rounded-3xl border border-ink/12 bg-paper-light p-5"
      >
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
          Detalle
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
          Elegí una materia
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Hacé clic en un nodo para ver sus correlativas, su estado y las
          materias que habilita.
        </p>
        <div className="mt-4 rounded-2xl border border-ink/10 bg-paper px-3 py-2.5 text-[11px] leading-5 text-ink-soft">
          <p>Tab recorre las materias.</p>
          <p>Enter o Espacio abre el detalle.</p>
          <p>Escape cierra la selección.</p>
        </div>
      </aside>
    );
  }

  const { subject, status, availability } = node;
  const prerequisiteNodes = node.prerequisiteIds
    .map((subjectId) => graph.nodesById.get(subjectId))
    .filter((candidate): candidate is CorrelationGraphNode =>
      Boolean(candidate),
    );
  const dependentNodes = node.dependentIds
    .map((subjectId) => graph.nodesById.get(subjectId))
    .filter((candidate): candidate is CorrelationGraphNode =>
      Boolean(candidate),
    );

  return (
    <aside
      aria-label="Detalle de la materia"
      className="rounded-3xl border border-ink/12 bg-paper-light p-4 sm:p-5 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto"
    >
      <p className="sr-only" aria-live="polite">
        Detalle de {subject.name}
      </p>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink">
              {subject.code || "—"}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft">
              {subject.year}º año
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl font-semibold leading-tight text-ink">
            {subject.name}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">
            {subject.term
              ? TERM_LABELS[subject.term]
              : "Cuatrimestre sin definir"}
          </p>
          {isInTermPlan ? (
            <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-forest">
              <CalendarIcon className="size-3" />
              En mi cuatrimestre
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="Cerrar detalle"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/10 text-ink-soft transition hover:border-ink/25 hover:text-ink"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-ink/10 bg-paper px-3 py-3">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Estado
        </p>
        <div className="mt-2">
          <StatusControl
            subjectName={subject.name}
            value={status}
            compact
            onChange={(nextStatus) =>
              onStatusChange(subject.id, nextStatus)
            }
          />
        </div>
      </div>

      {availability.status === "available" ? (
        <p className="mt-3 flex items-start gap-2 rounded-2xl border border-forest/20 bg-forest/5 px-3 py-2.5 text-xs font-medium leading-5 text-forest">
          <SparkIcon className="mt-0.5 size-4 shrink-0" />
          Lista para cursar: no le faltan correlativas.
        </p>
      ) : (
        <div className="mt-3 rounded-2xl border border-terracotta/25 bg-terracotta-soft/30 px-3 py-2.5">
          <p className="flex items-center gap-2 text-xs font-semibold text-ink">
            <LockIcon className="size-4 text-terracotta" />
            Faltan requisitos
          </p>
          <ul className="mt-2 space-y-1.5">
            {availability.missing.map((requirement) => {
              const requiredNode = graph.nodesById.get(requirement.subjectId);
              const requiredName =
                requiredNode?.subject.name ?? requirement.subjectId;

              return (
                <li key={requirement.subjectId}>
                  <button
                    type="button"
                    onClick={() => onSelect(requirement.subjectId)}
                    className="flex w-full items-start justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-ink/5"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-ink">
                        {requiredName}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-soft">
                        {requirement.requiredStatus === "approved"
                          ? "Pide final aprobado"
                          : "Pide cursada regularizada"}
                        {" · "}
                        Ahora: {STATUS_LABELS[requirement.currentStatus]}
                      </span>
                    </span>
                    <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <section className="mt-4">
        <h3 className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Correlativas
        </h3>
        {prerequisiteNodes.length === 0 ? (
          <p className="mt-2 text-xs text-ink-soft">
            No tiene correlativas cargadas.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {prerequisiteNodes.map((prerequisite) => {
              const requirement = graph.edges.find(
                (edge) =>
                  edge.fromId === prerequisite.subject.id &&
                  edge.toId === subject.id,
              );

              return (
                <li key={prerequisite.subject.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(prerequisite.subject.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink/10 bg-paper px-2.5 py-2 text-left transition hover:border-forest/30"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-ink">
                        {prerequisite.subject.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-ink-soft">
                        {requirement?.requiredStatus === "approved"
                          ? "Pide aprobada"
                          : "Pide regularizada"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft">
                      <span
                        className={`size-1.5 rounded-full ${STATUS_DOT_CLASSES[prerequisite.status]}`}
                      />
                      {STATUS_LABELS[prerequisite.status]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-4">
        <h3 className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          Habilita
        </h3>
        {dependentNodes.length === 0 ? (
          <p className="mt-2 text-xs text-ink-soft">
            No desbloquea otras materias directamente.
          </p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {dependentNodes.map((dependent) => (
              <li key={dependent.subject.id}>
                <button
                  type="button"
                  onClick={() => onSelect(dependent.subject.id)}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-ink/10 bg-paper px-2.5 py-2 text-left transition hover:border-forest/30"
                >
                  <span className="min-w-0 truncate text-xs font-medium text-ink">
                    {dependent.subject.name}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-ink-soft">
                    <span
                      className={`size-1.5 rounded-full ${STATUS_DOT_CLASSES[dependent.status]}`}
                    />
                    {STATUS_LABELS[dependent.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
