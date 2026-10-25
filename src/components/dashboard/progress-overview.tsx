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
    <section className="rounded-3xl border border-ink/12 bg-paper-light p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            Avance de la carrera
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <p className="font-display text-6xl font-semibold leading-none tracking-tight text-ink">
              {summary.percentage}%
            </p>
            <p className="pb-1 text-sm text-ink-soft" aria-live="polite">
              {summary.approved} de {summary.total} materias aprobadas
            </p>
          </div>

          <div
            role="progressbar"
            aria-label="Progreso de la carrera"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={summary.percentage}
            className="mt-5 flex h-3 overflow-hidden rounded-full bg-ink/8"
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
                className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft"
              >
                <span
                  className={`size-2 rounded-full ${STATUS_DOT_CLASSES[status]}`}
                />
                {STATUS_LABELS[status]} {summary.byStatus[status]}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 self-end">
          <Stat label="Aprobadas" value={summary.byStatus.approved} />
          <Stat label="Cursando" value={summary.byStatus.in_progress} />
          <Stat label="Regularizadas" value={summary.byStatus.regularized} />
          <Stat label="Pendientes" value={summary.byStatus.pending} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-ink/10 pt-4 text-xs sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
        <span className="inline-flex items-center gap-2 font-medium text-forest">
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
            <CheckIcon className="size-4 text-forest" />
            {summary.remaining}{" "}
            {summary.remaining === 1 ? "materia por delante" : "materias por delante"}
          </span>
        ) : null}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper px-4 py-3">
      <p className="font-display text-3xl font-semibold leading-none text-ink">
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}
