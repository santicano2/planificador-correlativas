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
          className="w-full rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs font-semibold text-ink"
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
        className="hidden items-center gap-0.5 rounded-full border border-ink/12 bg-paper p-0.5 sm:inline-flex"
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
                "rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition",
                isActive
                  ? STATUS_ACTIVE_CLASSES[status]
                  : "text-ink-soft hover:bg-ink/5 hover:text-ink",
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
          className="w-full rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs font-semibold text-ink"
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
