import { CheckIcon, LockIcon, SparkIcon } from "@/components/icons";
import type { ProgressSummary } from "@/lib/study-plan";

import { STATUS_DOT_CLASSES, STATUS_LABELS, STATUS_ORDER } from "./status-meta";

interface ProgressOverviewProps {
  summary: ProgressSummary;
  availableCount: number;
  blockedCount: number;
}

export function ProgressOverview({
  summary,
  availableCount,
  blockedCount,
}: ProgressOverviewProps) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="font-display text-xl font-semibold text-ink">
          Avance de la carrera
        </h2>
        <p className="data-value text-2xl font-semibold text-ink">
          {summary.percentage}%
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <p className="text-xs text-ink-soft" aria-live="polite">
          {summary.approved} de {summary.total} materias aprobadas
        </p>

        <div
          role="progressbar"
          aria-label="Progreso de la carrera"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={summary.percentage}
          className="mt-4 flex h-3 gap-0.5 bg-surface-3"
        >
          {STATUS_ORDER.map((status) => {
            const count = summary.byStatus[status];
            const width =
              summary.total === 0 ? 0 : (count / summary.total) * 100;

            if (count === 0) {
              return null;
            }

            return (
              <span
                key={status}
                title={`${STATUS_LABELS[status]}: ${count}`}
                className={STATUS_DOT_CLASSES[status]}
                style={{ width: `${width}%` }}
              />
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {STATUS_ORDER.map((status) => (
            <span
              key={status}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft"
            >
              <span
                className={`status-dot ${STATUS_DOT_CLASSES[status]}`}
              />
              {STATUS_LABELS[status]} {summary.byStatus[status]}
            </span>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Aprobadas" value={summary.byStatus.approved} />
          <Stat label="Cursando" value={summary.byStatus.in_progress} />
          <Stat label="Regularizadas" value={summary.byStatus.regularized} />
          <Stat label="Pendientes" value={summary.byStatus.pending} />
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-line pt-4 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
          <span className="inline-flex items-center gap-2 font-medium text-success">
            <SparkIcon className="size-4" />
            {availableCount}{" "}
            {availableCount === 1
              ? "materia disponible para cursar"
              : "materias disponibles para cursar"}
          </span>
          <span className="inline-flex items-center gap-2 text-ink-soft">
            <LockIcon className="size-4" />
            {blockedCount}{" "}
            {blockedCount === 1
              ? "materia bloqueada por correlativas"
              : "materias bloqueadas por correlativas"}
          </span>
          {summary.remaining > 0 ? (
            <span className="inline-flex items-center gap-2 text-ink-soft sm:ml-auto">
              <CheckIcon className="size-4 text-success" />
              {summary.remaining}{" "}
              {summary.remaining === 1
                ? "materia por delante"
                : "materias por delante"}
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-tile">
      <p className="data-value text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}
