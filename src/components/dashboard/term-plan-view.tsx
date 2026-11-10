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
      <div className="empty-state mt-5">
        <CheckIcon className="mx-auto size-6 text-success" />
        <p className="mt-3 font-display text-2xl font-semibold text-ink">
          No te quedan materias pendientes
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          Cuando agregues materias o vuelvas a poner una en pendiente, van a
          aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      <section className="panel">
        <div className="panel-head">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Próximo cuatrimestre
          </h2>
          <span className="route-badge text-ink-soft">
            {termPlan.summary.selectedCount} seleccionadas
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-display text-3xl font-semibold leading-tight text-ink">
                {termPlan.summary.selectedCount === 0
                  ? "Elegí tus materias"
                  : `${termPlan.summary.selectedCount} ${
                      termPlan.summary.selectedCount === 1
                        ? "materia seleccionada"
                        : "materias seleccionadas"
                    }`}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                Armá tu próximo cuatrimestre. Podés sumar materias bloqueadas:
                te vamos a mostrar qué correlativas faltan.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Stat
                label="Disponibles"
                value={termPlan.summary.selectedAvailableCount}
                className="text-success"
              />
              <Stat
                label="Bloqueadas"
                value={termPlan.summary.selectedBlockedCount}
                className="text-signal"
              />
              <Stat
                label="Pendientes"
                value={termPlan.summary.pendingCount}
                className="text-ink"
              />
            </div>
          </div>

          {termPlan.summary.selectedBlockedCount > 0 ? (
            <div className="service-alert service-alert--warning mt-4">
              <AlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
              <span>
                Tenés materias bloqueadas en tu cuatrimestre. Revisá las
                correlativas antes de anotarte.
              </span>
            </div>
          ) : null}

          {termPlan.summary.selectedCount > 0 ? (
            <button
              type="button"
              onClick={() => updateSelection({ subjectIds: [] })}
              className="btn btn-ghost btn-sm mt-3 text-signal"
            >
              Quitar todas
            </button>
          ) : null}
        </div>
      </section>

      {saveError ? (
        <p
          role="alert"
          className="service-alert service-alert--danger"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-signal" />
          {saveError}
        </p>
      ) : null}

      <section className="panel p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por materia o código..."
              aria-label="Buscar materia para el cuatrimestre"
              className="field pl-8"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as TermFilter)}
            aria-label="Filtrar materias del cuatrimestre"
            className="field sm:w-48"
          >
            <option value="all">Todas las pendientes</option>
            <option value="available">Disponibles</option>
            <option value="blocked">Bloqueadas</option>
            <option value="selected">Seleccionadas</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            Mostrando {visibleRows.length} de {termPlan.rows.length} pendientes
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="btn btn-ghost btn-sm text-primary"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </section>

      {visibleRows.length === 0 ? (
        <div className="empty-state">
          <SearchIcon className="mx-auto size-6 text-ink-faint" />
          <p className="mt-3 font-display text-2xl font-semibold text-ink">
            No hay materias con esos filtros
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Probá con otra búsqueda o limpiá los filtros.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-primary btn-sm mt-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([year, rows]) => (
            <section key={year} className="panel overflow-hidden">
              <header className="flex items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  {year}º año
                </h3>
                <span className="text-[10px] text-ink-soft">
                  {rows.length} {rows.length === 1 ? "materia" : "materias"}
                </span>
              </header>
              <ul>
                {rows.map((row) => (
                  <TermRow key={row.subject.id} row={row} onToggle={toggle} />
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
    <div className="stat-tile text-center">
      <p className={`data-value text-2xl font-semibold ${className}`}>
        {value}
      </p>
      <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
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
        "station-row px-4 py-4",
        isSelected ? "bg-primary-soft/30" : "",
      ].join(" ")}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(subject.id)}
          aria-describedby={missing.length > 0 ? missingId : undefined}
          className="mt-1 size-4 shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="route-badge text-ink-soft">
              {subject.code || "—"}
            </span>
            <span className="font-display text-xl font-semibold leading-tight text-ink">
              {subject.name}
            </span>
          </span>

          <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-soft">
            <span>
              {subject.term
                ? TERM_LABELS[subject.term]
                : "Cuatrimestre sin definir"}
            </span>
            <span className="text-line-strong">·</span>
            <span>
              {prerequisiteCount}{" "}
              {prerequisiteCount === 1 ? "correlativa" : "correlativas"}
            </span>
          </span>

          {availability.status === "available" ? (
            <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-success">
              <CheckIcon className="size-3.5" />
              Lista para cursar
            </span>
          ) : (
            <span
              id={missingId}
              className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-ink-soft"
            >
              <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-signal" />
              {formatMissing(missing)}
            </span>
          )}
        </span>
      </label>
    </li>
  );
}
