"use client";

import type { SubjectStatus } from "@/lib/study-plan";

import {
  STATUS_ACTIVE_CLASSES,
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_SHORT_LABELS,
} from "./status-meta";

interface StatusControlProps {
  subjectName: string;
  value: SubjectStatus;
  onChange: (status: SubjectStatus) => void;
  compact?: boolean;
}

export function StatusControl({
  subjectName,
  value,
  onChange,
  compact = false,
}: StatusControlProps) {
  if (compact) {
    return (
      <label className="block">
        <span className="sr-only">Estado de {subjectName}</span>
        <select
          value={value}
          aria-label={`Estado de ${subjectName}`}
          onChange={(event) => onChange(event.target.value as SubjectStatus)}
          className="field font-semibold"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <>
      <div
        role="group"
        aria-label={`Estado de ${subjectName}`}
        className="hidden items-center gap-0.5 border border-line bg-surface p-0.5 sm:inline-flex"
      >
        {STATUS_ORDER.map((status) => {
          const isActive = value === status;

          return (
            <button
              key={status}
              type="button"
              aria-pressed={isActive}
              title={STATUS_LABELS[status]}
              onClick={() => onChange(status)}
              className={[
                "min-h-[30px] border border-transparent px-2.5 text-[11px] font-semibold transition",
                isActive
                  ? STATUS_ACTIVE_CLASSES[status]
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink",
              ].join(" ")}
            >
              {STATUS_SHORT_LABELS[status]}
            </button>
          );
        })}
      </div>

      <label className="block sm:hidden">
        <span className="sr-only">Estado de {subjectName}</span>
        <select
          value={value}
          aria-label={`Estado de ${subjectName}`}
          onChange={(event) => onChange(event.target.value as SubjectStatus)}
          className="field font-semibold"
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </label>
    </>
  );
}
