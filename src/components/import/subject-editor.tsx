"use client";

import { useId, useState } from "react";

import { AlertIcon, CheckIcon, TrashIcon, XIcon } from "@/components/icons";
import type { DraftSubject } from "@/lib/import/draft-plan";
import type { SubjectTerm } from "@/lib/study-plan";

import { PrerequisiteSelector } from "./prerequisite-selector";

interface SubjectEditorProps {
  subject: DraftSubject;
  subjects: DraftSubject[];
  onChange: (patch: Partial<DraftSubject>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TERM_OPTIONS: ReadonlyArray<{ value: "" | SubjectTerm; label: string }> = [
  { value: "", label: "Sin definir" },
  { value: "1", label: "1° cuatrimestre" },
  { value: "2", label: "2° cuatrimestre" },
  { value: "annual", label: "Anual" },
];

export function SubjectEditor({
  subject,
  subjects,
  onChange,
  onDelete,
  onClose,
}: SubjectEditorProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const codeId = useId();
  const nameId = useId();
  const yearId = useId();
  const termId = useId();
  const maxYear = Math.max(10, subject.year);

  return (
    <div className="border-y border-line bg-surface-2 p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold text-ink">
            {subject.name || "Materia sin nombre"}
          </h3>
          <p className="mt-1 text-xs text-ink-soft">
            Ajustá los datos y las correlativas de esta materia.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn btn-ghost btn-sm"
          aria-label="Cerrar editor"
        >
          <XIcon className="size-4" />
        </button>
      </div>

      {subject.warnings.length > 0 ? (
        <div className="service-alert service-alert--warning mb-4">
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            {subject.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor={codeId} className="label">
            Código
          </label>
          <input
            id={codeId}
            value={subject.code}
            onChange={(event) => onChange({ code: event.target.value })}
            placeholder="Ej. 12"
            className="field"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label htmlFor={nameId} className="label">
            Nombre
          </label>
          <input
            id={nameId}
            value={subject.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Nombre de la materia"
            className="field"
          />
        </div>

        <div>
          <label htmlFor={yearId} className="label">
            Año
          </label>
          <select
            id={yearId}
            value={subject.year}
            onChange={(event) => onChange({ year: Number(event.target.value) })}
            className="field"
          >
            {Array.from({ length: maxYear }, (_, index) => index + 1).map(
              (year) => (
                <option key={year} value={year}>
                  {year}°
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label htmlFor={termId} className="label">
            Cuatrimestre
          </label>
          <select
            id={termId}
            value={subject.term ?? ""}
            onChange={(event) =>
              onChange({
                term: (event.target.value || undefined) as
                  | SubjectTerm
                  | undefined,
              })
            }
            className="field"
          >
            {TERM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <PrerequisiteSelector
          title="Para cursar"
          description="Materias que tenés que tener regularizadas antes de cursar esta."
          tone="regularized"
          subjects={subjects}
          currentId={subject.id}
          selectedIds={subject.requiresRegularized}
          onChange={(ids) => onChange({ requiresRegularized: ids })}
        />
        <PrerequisiteSelector
          title="Para rendir final"
          description="Materias que tenés que tener aprobadas antes de rendir el final."
          tone="approved"
          subjects={subjects}
          currentId={subject.id}
          selectedIds={subject.requiresApproved}
          onChange={(ids) => onChange({ requiresApproved: ids })}
        />
      </div>

      <div className="mt-4 flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        {isConfirmingDelete ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink">
            <span>¿Eliminar esta materia del plan?</span>
            <button
              type="button"
              onClick={onDelete}
              className="btn btn-danger btn-sm"
            >
              Sí, eliminar
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="btn btn-ghost btn-sm"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="btn btn-ghost btn-sm self-start text-signal"
          >
            <TrashIcon className="size-3.5" />
            Eliminar materia
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="btn btn-primary"
        >
          <CheckIcon className="size-4" />
          Listo
        </button>
      </div>
    </div>
  );
}
