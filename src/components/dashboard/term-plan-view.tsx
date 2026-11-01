"use client";

import { useMemo, useState } from "react";

import { AlertIcon, CheckIcon, SearchIcon } from "@/components/icons";
import {
  buildTermPlan,
  toggleTermSelection,
  type StudyPlan,
  type StudyProgress,
  type StudyTermSelection,
  type TermPlanRow,
} from "@/lib/study-plan";

import { formatMissing } from "./missing-format";
import { TERM_LABELS } from "./term-meta";

interface TermPlanViewProps {
  plan: StudyPlan;
  progress: StudyProgress;
  selection: StudyTermSelection;
  onSelectionChange: (selection: StudyTermSelection) => void;
}

type TermFilter = "all" | "available" | "blocked" | "selected";

export function TermPlanView({
  plan,
  progress,
  selection,
  onSelectionChange,
}: TermPlanViewProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TermFilter>("all");
  const [saveError, setSaveError] = useState<string | null>(null);

  const termPlan = useMemo(
    () => buildTermPlan(plan, progress, selection),
    [plan, progress, selection],
  );

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");

    return termPlan.rows.filter((row) => {
      if (filter === "selected" && !row.isSelected) {
        return false;
      }

      if (
        filter === "available" &&
        row.availability.status !== "available"
      ) {
        return false;
      }

      if (filter === "blocked" && row.availability.status !== "blocked") {
        return false;
      }

      if (!normalized) {
        return true;
      }

      return `${row.subject.code ?? ""} ${row.subject.name}`
        .toLocaleLowerCase("es")
        .includes(normalized);
    });
  }, [filter, query, termPlan.rows]);

  const grouped = useMemo(() => {
    const groups = new Map<number, TermPlanRow[]>();

    for (const row of visibleRows) {
      const group = groups.get(row.subject.year) ?? [];
      group.push(row);
      groups.set(row.subject.year, group);
    }

    return groups;
  }, [visibleRows]);

  const hasFilters = query.trim() !== "" || filter !== "all";

  const updateSelection = (nextSelection: StudyTermSelection) => {
    setSaveError(null);

    try {
      onSelectionChange(nextSelection);
    } catch {
      setSaveError(
        "No pudimos guardar tu cuatrimestre en este navegador. Revisá el espacio disponible e intentá de nuevo.",
      );
    }
  };

  const toggle = (subjectId: string) => {
    updateSelection(toggleTermSelection(selection, subjectId));
  };

  const resetFilters = () => {
    setQuery("");
    setFilter("all");
  };

  if (termPlan.rows.length === 0) {
    return (
      <section className="mt-5 rounded-3xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
        <CheckIcon className="mx-auto size-6 text-forest" />
        <p className="mt-3 font-display text-xl font-semibold text-ink">
          No te quedan materias pendientes
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Cuando agregues materias o vuelvas a poner una en pendiente, van a
          aparecer acá.
        </p>
      </section>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-3xl border border-ink/12 bg-paper-light p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Próximo cuatrimestre
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {termPlan.summary.selectedCount === 0
                ? "Elegí tus materias"
                : `${termPlan.summary.selectedCount} ${
                    termPlan.summary.selectedCount === 1
                      ? "materia seleccionada"
                      : "materias seleccionadas"
                  }`}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Armá tu próximo cuatrimestre. Podés sumar materias bloqueadas: te
              vamos a mostrar qué correlativas faltan.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Stat
              label="Disponibles"
              value={termPlan.summary.selectedAvailableCount}
              className="text-forest"
            />
            <Stat
              label="Bloqueadas"
              value={termPlan.summary.selectedBlockedCount}
              className="text-terracotta"
            />
            <Stat
              label="Pendientes"
              value={termPlan.summary.pendingCount}
              className="text-ink"
            />
          </div>
        </div>

        {termPlan.summary.selectedBlockedCount > 0 ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-xs leading-5 text-ink">
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-gold" />
            Tenés materias bloqueadas en tu cuatrimestre. Revisá las
            correlativas antes de anotarte.
          </p>
        ) : null}

        {termPlan.summary.selectedCount > 0 ? (
          <button
            type="button"
            onClick={() => updateSelection({ subjectIds: [] })}
            className="mt-3 text-xs font-semibold text-terracotta hover:underline"
          >
            Quitar todas
          </button>
        ) : null}
      </section>

      {saveError ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-terracotta/40 bg-terracotta-soft/45 px-4 py-3 text-xs leading-5 text-ink"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-terracotta" />
          {saveError}
        </p>
      ) : null}

      <section className="rounded-2xl border border-ink/12 bg-paper-light p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por materia o código..."
              aria-label="Buscar materia para el cuatrimestre"
              className="w-full rounded-full border border-ink/15 bg-paper py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-soft/60"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as TermFilter)
            }
            aria-label="Filtrar materias del cuatrimestre"
            className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs text-ink"
          >
            <option value="all">Todas las pendientes</option>
            <option value="available">Disponibles</option>
            <option value="blocked">Bloqueadas</option>
            <option value="selected">Seleccionadas</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft">
            Mostrando {visibleRows.length} de {termPlan.rows.length} pendientes
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-forest hover:underline"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </section>

      {visibleRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
          <SearchIcon className="mx-auto size-6 text-ink-soft/60" />
          <p className="mt-3 font-display text-xl font-semibold text-ink">
            No hay materias con esos filtros
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Probá con otra búsqueda o limpiá los filtros.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([year, rows]) => (
            <section
              key={year}
              className="overflow-hidden rounded-2xl border border-ink/12 bg-paper-light"
            >
              <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper-deep/40 px-4 py-2.5">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  {year}º año
                </h3>
                <span className="font-mono text-[10px] text-ink-soft">
                  {rows.length} {rows.length === 1 ? "materia" : "materias"}
                </span>
              </header>
              <ul className="divide-y divide-ink/8">
                {rows.map((row) => (
                  <TermRow
                    key={row.subject.id}
                    row={row}
                    onToggle={toggle}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper px-3 py-2 text-center">
      <p className={`font-display text-2xl font-semibold ${className}`}>
        {value}
      </p>
      <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}

function TermRow({
  row,
  onToggle,
}: {
  row: TermPlanRow;
  onToggle: (subjectId: string) => void;
}) {
  const { subject, availability, missing, isSelected } = row;
  const prerequisiteCount =
    subject.requiresRegularized.length + subject.requiresApproved.length;
  const missingId = `term-missing-${subject.id}`;

  return (
    <li
      className={[
        "border-l-4 px-4 py-4 transition-colors",
        isSelected
          ? "border-forest bg-forest/5"
          : "border-transparent bg-paper-light hover:bg-paper/60",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(subject.id)}
          aria-describedby={missing.length > 0 ? missingId : undefined}
          className="mt-1 size-4 shrink-0 accent-forest"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="rounded-md bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink">
              {subject.code || "—"}
            </span>
            <span className="font-display text-lg font-semibold leading-tight text-ink">
              {subject.name}
            </span>
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-soft">
            <span>
              {subject.term
                ? TERM_LABELS[subject.term]
                : "Cuatrimestre sin definir"}
            </span>
            <span className="text-line">•</span>
            <span>
              {prerequisiteCount}{" "}
              {prerequisiteCount === 1 ? "correlativa" : "correlativas"}
            </span>
          </span>

          {availability.status === "available" ? (
            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-forest">
              <CheckIcon className="size-3.5" />
              Lista para cursar
            </span>
          ) : (
            <span
              id={missingId}
              className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-ink-soft"
            >
              <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
              {formatMissing(missing)}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}
