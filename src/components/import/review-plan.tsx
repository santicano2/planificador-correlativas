"use client";

import { Fragment, useMemo, useState } from "react";

import {
  AlertIcon,
  ChevronDownIcon,
  FileIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import {
  createEmptySubject,
  toStudyPlan,
  type DraftStudyPlan,
  type DraftSubject,
} from "@/lib/import/draft-plan";
import {
  validateStudyPlan,
  type PlanValidationIssue,
  type StudyPlan,
  type Subject,
} from "@/lib/study-plan";

import { SubjectEditor } from "./subject-editor";

interface ReviewPlanProps {
  draft: DraftStudyPlan;
  sourceName: string | null;
  mode?: "import" | "edit";
  onChange: (draft: DraftStudyPlan) => void;
  onSave: (plan: StudyPlan) => void;
  onCancel: () => void;
}

const TERM_LABELS: Record<NonNullable<Subject["term"]>, string> = {
  "1": "1° cuatrimestre",
  "2": "2° cuatrimestre",
  annual: "Anual",
};

function subjectLabel(
  subject: DraftSubject | Subject | undefined,
  fallbackId: string,
): string {
  if (!subject) {
    return fallbackId;
  }

  return subject.code ? `${subject.code} · ${subject.name}` : subject.name;
}

function describeIssue(
  issue: PlanValidationIssue,
  subjects: Array<DraftSubject | Subject>,
): string {
  const byId = new Map(subjects.map((subject) => [subject.id, subject]));

  switch (issue.type) {
    case "duplicate_subject_id":
      return `Hay dos materias con el mismo identificador (${issue.subjectId}).`;
    case "missing_correlative":
      return `${subjectLabel(byId.get(issue.subjectId), issue.subjectId)} necesita una correlativa que no está en el plan (${issue.missingId}).`;
    case "dependency_cycle":
      return `Estas materias se requieren entre sí: ${issue.subjectIds
        .map((id) => subjectLabel(byId.get(id), id))
        .join(", ")}.`;
  }
}

function sortSubjects(subjects: DraftSubject[]): DraftSubject[] {
  return [...subjects].sort(
    (a, b) =>
      a.year - b.year ||
      a.code.localeCompare(b.code, "es", { numeric: true }) ||
      a.name.localeCompare(b.name, "es"),
  );
}

export function ReviewPlan({
  draft,
  sourceName,
  mode = "import",
  onChange,
  onSave,
  onCancel,
}: ReviewPlanProps) {
  const isEdit = mode === "edit";
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<"all" | number>("all");
  const [saveError, setSaveError] = useState<string | null>(null);

  const plan = useMemo(() => toStudyPlan(draft), [draft]);
  const validation = useMemo(() => validateStudyPlan(plan), [plan]);

  const metadataErrors = useMemo(() => {
    const errors: string[] = [];

    if (!draft.career.trim()) {
      errors.push("Completá el nombre de la carrera.");
    }

    if (!draft.university.trim()) {
      errors.push("Completá la universidad.");
    }

    if (draft.subjects.length === 0) {
      errors.push("Agregá al menos una materia.");
    }

    for (const subject of draft.subjects) {
      if (!subject.name.trim()) {
        errors.push(`La materia ${subject.code || subject.id} no tiene nombre.`);
      }
    }

    return errors;
  }, [draft]);

  const validationMessages = validation.issues.map((issue) =>
    describeIssue(issue, draft.subjects),
  );
  const allErrors = [...metadataErrors, ...validationMessages];
  const canSave = allErrors.length === 0;

  const years = useMemo(
    () => [...new Set(draft.subjects.map((subject) => subject.year))].sort((a, b) => a - b),
    [draft.subjects],
  );

  const visibleSubjects = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");

    return sortSubjects(
      draft.subjects.filter((subject) => {
        if (yearFilter !== "all" && subject.year !== yearFilter) {
          return false;
        }

        if (!normalized) {
          return true;
        }

        return `${subject.code} ${subject.name}`
          .toLocaleLowerCase("es")
          .includes(normalized);
      }),
    );
  }, [draft.subjects, query, yearFilter]);

  const grouped = visibleSubjects.reduce<Map<number, DraftSubject[]>>(
    (groups, subject) => {
      const group = groups.get(subject.year) ?? [];
      group.push(subject);
      groups.set(subject.year, group);
      return groups;
    },
    new Map(),
  );

  const prerequisiteCount = draft.subjects.reduce(
    (total, subject) =>
      total + subject.requiresRegularized.length + subject.requiresApproved.length,
    0,
  );

  const updateSubject = (id: string, patch: Partial<DraftSubject>) => {
    onChange({
      ...draft,
      subjects: draft.subjects.map((subject) =>
        subject.id === id ? { ...subject, ...patch } : subject,
      ),
    });
  };

  const deleteSubject = (id: string) => {
    setEditingId(null);
    onChange({
      ...draft,
      subjects: draft.subjects
        .filter((subject) => subject.id !== id)
        .map((subject) => ({
          ...subject,
          requiresRegularized: subject.requiresRegularized.filter(
            (reference) => reference !== id,
          ),
          requiresApproved: subject.requiresApproved.filter(
            (reference) => reference !== id,
          ),
        })),
    });
  };

  const addSubject = () => {
    const subject = createEmptySubject(draft.subjects);

    onChange({ ...draft, subjects: [...draft.subjects, subject] });
    setQuery("");
    setYearFilter("all");
    setEditingId(subject.id);
  };

  const handleSave = () => {
    setSaveError(null);

    try {
      onSave(plan);
    } catch {
      setSaveError(
        "No pudimos guardar el plan en este navegador. Revisá el espacio disponible e intentá de nuevo.",
      );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
            {isEdit ? "Edición del plan" : "Paso 2 de 2 · Revisión"}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-5xl">
            {isEdit ? "Editá tu plan" : "Revisá lo que encontramos"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft sm:text-base">
            {isEdit
              ? "Ajustá materias, años, cuatrimestres y correlativas. Al guardar se conserva el progreso de las materias que sigan existiendo."
              : "El PDF no siempre sale perfecto. Corregí nombres, años y correlativas antes de guardar. Nada se sube a un servidor."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {sourceName ? (
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-ink/10 bg-paper-light px-3 py-1.5 font-mono text-[10px] text-ink-soft">
              <FileIcon className="size-3.5 shrink-0" />
              <span className="truncate">{sourceName}</span>
            </span>
          ) : null}
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-ink/5 hover:text-ink"
          >
            {isEdit ? "Volver al tablero" : "Empezar de nuevo"}
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Materias" value={draft.subjects.length} />
        <Stat label="Años" value={years.length} />
        <Stat label="Correlativas" value={prerequisiteCount} />
      </div>

      {allErrors.length > 0 || draft.warnings.length > 0 ? (
        <div className="mb-5 space-y-3">
          {allErrors.length > 0 ? (
            <section
              role="alert"
              className="rounded-2xl border border-terracotta/40 bg-terracotta-soft/45 px-4 py-3"
            >
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <AlertIcon className="size-4 text-terracotta" />
                Revisá estos puntos antes de guardar
              </h2>
              <ul className="mt-2 space-y-1 pl-6 text-xs leading-5 text-ink-soft">
                {allErrors.map((message) => (
                  <li key={message} className="list-disc">
                    {message}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {draft.warnings.length > 0 ? (
            <details className="group rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink">
                <AlertIcon className="size-4 text-terracotta" />
                Avisos de la lectura ({draft.warnings.length})
                <ChevronDownIcon className="ml-auto size-4 text-ink-soft transition group-open:rotate-180" />
              </summary>
              <ul className="mt-2 space-y-1 pl-6 text-xs leading-5 text-ink-soft">
                {draft.warnings.map((warning) => (
                  <li key={warning} className="list-disc">
                    {warning}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}

      <section className="mb-5 rounded-2xl border border-ink/12 bg-paper-light p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-ink">
            Datos del plan
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            Editable
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              Carrera *
            </span>
            <input
              value={draft.career}
              onChange={(event) =>
                onChange({ ...draft, career: event.target.value })
              }
              aria-invalid={!draft.career.trim()}
              placeholder="Ej. Licenciatura en Sistemas"
              className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label>
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              Universidad *
            </span>
            <input
              value={draft.university}
              onChange={(event) =>
                onChange({ ...draft, university: event.target.value })
              }
              aria-invalid={!draft.university.trim()}
              placeholder="Ej. UNLP"
              className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
          <label>
            <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
              Año del plan
            </span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={draft.planYear ?? ""}
              onChange={(event) =>
                onChange({
                  ...draft,
                  planYear: event.target.value
                    ? Number(event.target.value)
                    : undefined,
                })
              }
              placeholder="2014"
              className="w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink"
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-ink/12 bg-paper-light">
        <div className="flex flex-col gap-3 border-b border-ink/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">
              Materias
            </h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Abrí una materia para ajustar sus correlativas.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft/70" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar materia..."
                aria-label="Buscar materia"
                className="w-full rounded-full border border-ink/15 bg-paper py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-soft/60 sm:w-52"
              />
            </div>
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
                  {year}° año
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addSubject}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
            >
              <PlusIcon className="size-3.5" />
              Agregar
            </button>
          </div>
        </div>

        {visibleSubjects.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              No hay materias para mostrar
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Probá con otra búsqueda o agregá una materia.
            </p>
          </div>
        ) : (
          [...grouped.entries()].map(([year, subjects]) => (
            <div key={year}>
              <div className="flex items-center justify-between border-y border-ink/10 bg-paper-deep/40 px-4 py-2 first:border-t-0">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  {year}° año
                </h3>
                <span className="font-mono text-[10px] text-ink-soft">
                  {subjects.length}{" "}
                  {subjects.length === 1 ? "materia" : "materias"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm sm:min-w-[620px]">
                  <thead>
                    <tr className="border-b border-ink/10 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
                      <th scope="col" className="w-14 px-4 py-2 font-medium sm:w-20">
                        Código
                      </th>
                      <th scope="col" className="px-4 py-2 font-medium">
                        Materia
                      </th>
                      <th
                        scope="col"
                        className="hidden w-36 px-4 py-2 font-medium sm:table-cell"
                      >
                        Cuatrimestre
                      </th>
                      <th
                        scope="col"
                        className="hidden w-48 px-4 py-2 font-medium md:table-cell"
                      >
                        Correlativas
                      </th>
                      <th scope="col" className="w-20 px-4 py-2 font-medium">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => {
                      const isEditing = editingId === subject.id;
                      const regularized =
                        subject.requiresRegularized.length;
                      const approved = subject.requiresApproved.length;

                      return (
                        <Fragment key={subject.id}>
                          <tr
                            className={[
                              "border-b border-ink/8 transition-colors",
                              isEditing
                                ? "bg-forest/5"
                                : "hover:bg-paper/60",
                            ].join(" ")}
                          >
                            <td className="px-4 py-3 align-top">
                              <span className="rounded-md bg-ink/5 px-1.5 py-0.5 font-mono text-[11px] text-ink">
                                {subject.code || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span className="flex flex-wrap items-center gap-1.5 font-medium text-ink">
                                {subject.name || "Materia sin nombre"}
                                {subject.warnings.length > 0 ? (
                                  <span
                                    title={subject.warnings.join(" ")}
                                    className="inline-flex"
                                  >
                                    <AlertIcon className="size-3.5 text-terracotta" />
                                  </span>
                                ) : null}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-ink-soft">
                                {subject.term
                                  ? TERM_LABELS[subject.term]
                                  : "Cuatrimestre sin definir"}
                                {" · "}
                                {regularized + approved} correlativas
                              </span>
                            </td>
                            <td className="hidden px-4 py-3 align-top text-xs text-ink-soft sm:table-cell">
                              {subject.term
                                ? TERM_LABELS[subject.term]
                                : "Sin definir"}
                            </td>
                            <td className="hidden px-4 py-3 align-top text-xs text-ink-soft md:table-cell">
                              {regularized + approved === 0
                                ? "—"
                                : [
                                    regularized > 0
                                      ? `${regularized} para cursar`
                                      : null,
                                    approved > 0
                                      ? `${approved} para final`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </td>
                            <td className="px-4 py-3 text-right align-top">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingId(isEditing ? null : subject.id)
                                }
                                className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
                                aria-expanded={isEditing}
                              >
                                {isEditing ? "Cerrar" : "Editar"}
                              </button>
                            </td>
                          </tr>
                          {isEditing ? (
                            <tr>
                              <td colSpan={5} className="p-0">
                                <SubjectEditor
                                  subject={subject}
                                  subjects={draft.subjects}
                                  onChange={(patch) =>
                                    updateSubject(subject.id, patch)
                                  }
                                  onDelete={() => deleteSubject(subject.id)}
                                  onClose={() => setEditingId(null)}
                                />
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-ink/12 bg-paper-light p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="text-xs leading-5 text-ink-soft">
          {canSave ? (
            <p className="flex items-center gap-2 font-medium text-forest">
              <span className="flex size-5 items-center justify-center rounded-full bg-forest text-paper">
                ✓
              </span>
              Todo listo para guardar.
            </p>
          ) : (
            <p>
              Quedan {allErrors.length}{" "}
              {allErrors.length === 1 ? "punto" : "puntos"} por corregir.
            </p>
          )}
          {saveError ? (
            <p role="alert" className="mt-1 text-terracotta">
              {saveError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={addSubject}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
          >
            <PlusIcon className="size-4" />
            Agregar materia
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-paper transition hover:bg-forest-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isEdit ? "Guardar cambios" : "Guardar plan"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/12 bg-paper-light px-4 py-3">
      <p className="font-display text-2xl font-semibold leading-none text-ink sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
        {label}
      </p>
    </div>
  );
}
