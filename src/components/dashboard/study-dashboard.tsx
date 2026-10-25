"use client";

import { useMemo, useState } from "react";

import { BackupActions } from "@/components/backup/backup-actions";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  FileIcon,
  LockIcon,
  PencilIcon,
  SearchIcon,
  SparkIcon,
  TrashIcon,
} from "@/components/icons";
import type { StudyPlanBackup } from "@/lib/backup/study-plan-backup";
import {
  buildDashboard,
  type DashboardRow,
  type StudyPlan,
  type StudyProgress,
  type SubjectStatus,
  type SubjectTerm,
} from "@/lib/study-plan";

import { ProgressOverview } from "./progress-overview";
import { StatusControl } from "./status-control";
import {
  STATUS_BORDER_CLASSES,
  STATUS_DOT_CLASSES,
  STATUS_LABELS,
} from "./status-meta";

interface StudyDashboardProps {
  plan: StudyPlan;
  progress: StudyProgress;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
  onEdit: () => void;
  onRestore: (backup: StudyPlanBackup) => void;
  onImportAnother: () => void;
  onClear: () => void;
}

type YearFilter = "all" | number;
type StatusFilter = "all" | SubjectStatus;
type AvailabilityFilter = "all" | "available" | "blocked";

const TERM_LABELS: Record<SubjectTerm, string> = {
  "1": "1º cuatrimestre",
  "2": "2º cuatrimestre",
  annual: "Anual",
};

export function StudyDashboard({
  plan,
  progress,
  onStatusChange,
  onEdit,
  onRestore,
  onImportAnother,
  onClear,
}: StudyDashboardProps) {
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const dashboard = useMemo(
    () => buildDashboard(plan, progress),
    [plan, progress],
  );
  const years = useMemo(
    () =>
      [...new Set(plan.subjects.map((subject) => subject.year))].sort(
        (a, b) => a - b,
      ),
    [plan.subjects],
  );

  const hasFilters =
    query.trim() !== "" ||
    yearFilter !== "all" ||
    statusFilter !== "all" ||
    availabilityFilter !== "all";

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");

    return dashboard.rows.filter((row) => {
      if (yearFilter !== "all" && row.subject.year !== yearFilter) {
        return false;
      }

      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }

      if (availabilityFilter !== "all") {
        if (row.status !== "pending") {
          return false;
        }

        if (row.availability.status !== availabilityFilter) {
          return false;
        }
      }

      if (!normalized) {
        return true;
      }

      return `${row.subject.code ?? ""} ${row.subject.name}`
        .toLocaleLowerCase("es")
        .includes(normalized);
    });
  }, [availabilityFilter, dashboard.rows, query, statusFilter, yearFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<number, DashboardRow[]>();

    for (const row of visibleRows) {
      const group = groups.get(row.subject.year) ?? [];
      group.push(row);
      groups.set(row.subject.year, group);
    }

    return groups;
  }, [visibleRows]);

  const updateStatus = (subjectId: string, status: SubjectStatus) => {
    setSaveError(null);

    try {
      onStatusChange(subjectId, status);
    } catch {
      setSaveError(
        "No pudimos guardar el estado en este navegador. Revisá el espacio disponible e intentá de nuevo.",
      );
    }
  };

  const resetFilters = () => {
    setQuery("");
    setYearFilter("all");
    setStatusFilter("all");
    setAvailabilityFilter("all");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            Mi plan
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight text-ink sm:text-5xl">
            Tu tablero
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
            Marcá el estado de cada materia y mirá al instante qué podés cursar
            y qué correlativas te faltan.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-light px-3 py-1.5">
              <FileIcon className="size-3.5 text-forest" />
              {plan.planYear ? `Plan ${plan.planYear}` : "Plan de estudios"}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper-light px-3 py-1.5">
              {plan.career}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper-light px-3 py-1.5">
              {plan.university}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isConfirmingClear ? (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-terracotta/30 bg-terracotta-soft/35 px-3 py-2">
              <span className="text-xs font-medium text-ink">
                ¿Borrar plan y progreso?
              </span>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold text-paper"
              >
                <TrashIcon className="size-3.5" />
                Sí, borrar
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(false)}
                className="rounded-full px-2.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-ink/5"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
              >
                <PencilIcon className="size-3.5" />
                Editar plan
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingClear(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-terracotta transition hover:bg-terracotta/10"
              >
                <TrashIcon className="size-3.5" />
                Borrar plan
              </button>
              <button
                type="button"
                onClick={onImportAnother}
                className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
              >
                Importar otro plan
                <ArrowRightIcon className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {saveError ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-terracotta/40 bg-terracotta-soft/45 px-4 py-3 text-xs leading-5 text-ink"
        >
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-terracotta" />
          {saveError}
        </div>
      ) : null}

      <div className="mt-6">
        <ProgressOverview
          summary={dashboard.summary}
          availableCount={dashboard.availableCount}
          blockedCount={dashboard.blockedCount}
        />
      </div>

      <div className="mt-5">
        <BackupActions
          variant="dashboard"
          currentPlan={plan}
          progress={progress}
          onRestore={onRestore}
        />
      </div>

      <section className="mt-5 rounded-2xl border border-ink/12 bg-paper-light p-3 sm:p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft/70" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por materia o código..."
              aria-label="Buscar materia"
              className="w-full rounded-full border border-ink/15 bg-paper py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-soft/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:ml-auto">
            <select
              value={yearFilter}
              onChange={(event) =>
                setYearFilter(
                  event.target.value === "all"
                    ? "all"
                    : Number(event.target.value),
                )
              }
              aria-label="Filtrar por año"
              className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs text-ink"
            >
              <option value="all">Todos los años</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}º año
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="Filtrar por estado"
              className="rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs text-ink"
            >
              <option value="all">Todos los estados</option>
              {(Object.keys(STATUS_LABELS) as SubjectStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <select
              value={availabilityFilter}
              onChange={(event) =>
                setAvailabilityFilter(
                  event.target.value as AvailabilityFilter,
                )
              }
              aria-label="Filtrar por disponibilidad"
              className="col-span-2 rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs text-ink sm:col-span-1"
            >
              <option value="all">Cualquier disponibilidad</option>
              <option value="available">Disponibles</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-soft">
            Mostrando {visibleRows.length} de {dashboard.rows.length} materias
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
        <div className="mt-5 rounded-2xl border border-dashed border-ink/20 bg-paper-light px-6 py-14 text-center">
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
        <div className="mt-5 space-y-4">
          {[...grouped.entries()].map(([year, rows]) => {
            const yearRows = dashboard.rows.filter(
              (row) => row.subject.year === year,
            );
            const approved = yearRows.filter(
              (row) => row.status === "approved",
            ).length;

            return (
              <section
                key={year}
                className="overflow-hidden rounded-2xl border border-ink/12 bg-paper-light"
              >
                <header className="flex items-center justify-between gap-3 border-b border-ink/10 bg-paper-deep/40 px-4 py-2.5">
                  <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                    {year}º año
                  </h2>
                  <span className="font-mono text-[10px] text-ink-soft">
                    {approved} de {yearRows.length} aprobadas
                  </span>
                </header>
                <ul className="divide-y divide-ink/8">
                  {rows.map((row) => (
                    <SubjectRow
                      key={row.subject.id}
                      row={row}
                      onStatusChange={updateStatus}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SubjectRow({
  row,
  onStatusChange,
}: {
  row: DashboardRow;
  onStatusChange: (subjectId: string, status: SubjectStatus) => void;
}) {
  const { subject, status, availability, missing } = row;
  const prerequisiteCount =
    subject.requiresRegularized.length + subject.requiresApproved.length;

  return (
    <li
      className={`border-l-4 bg-paper-light px-4 py-4 transition-colors hover:bg-paper/60 ${STATUS_BORDER_CLASSES[status]}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="rounded-md bg-ink/5 px-1.5 py-0.5 font-mono text-[10px] text-ink">
              {subject.code || "—"}
            </span>
            <h3 className="font-display text-lg font-semibold leading-tight text-ink">
              {subject.name}
            </h3>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-soft">
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
          </div>

          <SubjectHint
            status={status}
            availability={availability}
            missing={missing}
          />
        </div>

        <div className="shrink-0">
          <StatusControl
            subjectName={subject.name}
            value={status}
            onChange={(nextStatus) => onStatusChange(subject.id, nextStatus)}
          />
        </div>
      </div>
    </li>
  );
}

function SubjectHint({
  status,
  availability,
  missing,
}: Pick<DashboardRow, "status" | "availability" | "missing">) {
  if (availability.status === "blocked" && missing.length > 0) {
    if (status !== "pending" && status !== "in_progress") {
      return (
        <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-ink-soft">
          <AlertIcon className="mt-0.5 size-3.5 shrink-0 text-gold" />
          Correlativas sin cumplir: {formatMissing(missing)}
        </p>
      );
    }

    return (
      <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-5 text-ink-soft">
        <LockIcon className="mt-0.5 size-3.5 shrink-0 text-terracotta" />
        {formatMissing(missing)}
      </p>
    );
  }

  if (status === "pending") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-forest">
        <SparkIcon className="size-3.5" />
        Lista para cursar
      </p>
    );
  }

  if (status === "in_progress") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-soft">
        <span className={`size-2 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
        Cursando actualmente
      </p>
    );
  }

  if (status === "regularized") {
    return (
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-ink-soft">
        <span className={`size-2 rounded-full ${STATUS_DOT_CLASSES[status]}`} />
        Cursada aprobada, final pendiente
      </p>
    );
  }

  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-forest">
      <CheckIcon className="size-3.5" />
      Materia aprobada
    </p>
  );
}

function formatMissing(
  missing: DashboardRow["missing"],
): string {
  return missing
    .map(
      (requirement) =>
        `falta ${requirement.requiredStatus === "regularized" ? "regularizar" : "aprobar"} ${requirement.subjectName}`,
    )
    .join(" · ");
}
