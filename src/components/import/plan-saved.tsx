"use client";

import { useState } from "react";

import { AlertIcon, CheckIcon, FileIcon, TrashIcon } from "@/components/icons";
import type { StudyPlan, SubjectTerm } from "@/lib/study-plan";

interface PlanSavedProps {
  plan: StudyPlan;
  onImportAnother: () => void;
  onClear: () => void;
}

const TERM_LABELS: Record<SubjectTerm, string> = {
  "1": "1° cuatrimestre",
  "2": "2° cuatrimestre",
  annual: "Anual",
};

export function PlanSaved({
  plan,
  onImportAnother,
  onClear,
}: PlanSavedProps) {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const years = [...new Set(plan.subjects.map((subject) => subject.year))].sort(
    (a, b) => a - b,
  );
  const prerequisiteCount = plan.subjects.reduce(
    (total, subject) =>
      total + subject.requiresRegularized.length + subject.requiresApproved.length,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-forest text-paper">
          <CheckIcon className="size-7" />
        </span>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            Plan importado
          </p>
          <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Plan guardado
          </h1>
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
        Guardamos las materias y correlativas en este navegador. Podés volver
        cuando quieras: no se envió nada a un servidor.
      </p>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/12 bg-paper-light p-4 sm:col-span-2">
          <p className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            <FileIcon className="size-3.5" />
            {plan.planYear ? `Plan ${plan.planYear}` : "Plan de estudios"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
            {plan.career}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{plan.university}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
          <MiniStat label="Materias" value={plan.subjects.length} />
          <MiniStat label="Años" value={years.length} />
          <MiniStat label="Correlativas" value={prerequisiteCount} />
        </div>
      </div>

      <section className="mt-5 overflow-hidden rounded-2xl border border-ink/12 bg-paper-light">
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
          <h2 className="font-display text-xl font-semibold text-ink">
            Tu plan, materia por materia
          </h2>
          <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft sm:inline">
            Solo lectura
          </span>
        </div>

        {years.map((year) => {
          const subjects = plan.subjects.filter(
            (subject) => subject.year === year,
          );

          return (
            <div key={year}>
              <div className="flex items-center justify-between border-y border-ink/10 bg-paper-deep/40 px-4 py-2 first:border-t-0">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  {year}° año
                </h3>
                <span className="font-mono text-[10px] text-ink-soft">
                  {subjects.length} materias
                </span>
              </div>
              <ul>
                {subjects.map((subject) => (
                  <li
                    key={subject.id}
                    className="flex flex-col gap-1 border-b border-ink/8 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 items-baseline gap-2">
                      <span className="shrink-0 rounded-md bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink">
                        {subject.code || "—"}
                      </span>
                      <span className="truncate text-sm font-medium text-ink">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[11px] text-ink-soft">
                      <span>
                        {subject.term
                          ? TERM_LABELS[subject.term]
                          : "Sin cuatrimestre"}
                      </span>
                      <span className="text-line">·</span>
                      <span>
                        {subject.requiresRegularized.length +
                          subject.requiresApproved.length}{" "}
                        correlativas
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink/12 bg-paper-light p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2 text-xs leading-5 text-ink-soft">
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-gold" />
          Pronto vas a poder marcar materias y ver qué te falta para cursar.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {isConfirmingClear ? (
            <>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-paper"
              >
                <TrashIcon className="size-4" />
                Sí, borrar plan
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-ink/5"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-terracotta transition hover:bg-terracotta/10"
              >
                <TrashIcon className="size-4" />
                Borrar plan
              </button>
              <button
                type="button"
                onClick={onImportAnother}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep"
              >
                Importar otro plan
                <span aria-hidden="true">→</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-paper px-3 py-2">
      <p className="font-display text-xl font-semibold leading-none text-ink">
        {value}
      </p>
      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}
