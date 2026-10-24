"use client";

import { useId, useMemo, useState } from "react";

import { SearchIcon, XIcon } from "@/components/icons";
import type { DraftSubject } from "@/lib/import/draft-plan";

interface PrerequisiteSelectorProps {
  title: string;
  description: string;
  tone: "regularized" | "approved";
  subjects: DraftSubject[];
  currentId: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

function subjectLabel(subject: DraftSubject): string {
  return subject.code ? `${subject.code} · ${subject.name}` : subject.name;
}

function sortSubjects(subjects: DraftSubject[]): DraftSubject[] {
  return [...subjects].sort(
    (a, b) =>
      a.year - b.year ||
      a.code.localeCompare(b.code, "es", { numeric: true }) ||
      a.name.localeCompare(b.name, "es"),
  );
}

export function PrerequisiteSelector({
  title,
  description,
  tone,
  subjects,
  currentId,
  selectedIds,
  onChange,
}: PrerequisiteSelectorProps) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const selected = new Set(selectedIds);
  const byId = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects],
  );
  const available = useMemo(
    () => sortSubjects(subjects.filter((subject) => subject.id !== currentId)),
    [subjects, currentId],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");

    if (!normalized) {
      return available;
    }

    return available.filter((subject) =>
      `${subject.code} ${subject.name}`
        .toLocaleLowerCase("es")
        .includes(normalized),
    );
  }, [available, query]);

  const unknownIds = selectedIds.filter((id) => !byId.has(id));
  const selectedSubjects = selectedIds
    .map((id) => byId.get(id))
    .filter((subject): subject is DraftSubject => Boolean(subject));

  const grouped = filtered.reduce<Map<number, DraftSubject[]>>(
    (groups, subject) => {
      const group = groups.get(subject.year) ?? [];
      group.push(subject);
      groups.set(subject.year, group);
      return groups;
    },
    new Map(),
  );

  const toggle = (id: string) => {
    if (selected.has(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }

    onChange([...selectedIds, id]);
  };

  const accent =
    tone === "regularized"
      ? "border-forest/50 bg-forest/5"
      : "border-terracotta/50 bg-terracotta/5";

  return (
    <section className={`rounded-2xl border ${accent}`}>
      <div className="border-b border-ink/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <span className="rounded-full bg-paper-light px-2 py-0.5 font-mono text-[10px] text-ink-soft">
            {selectedIds.length}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-ink-soft">{description}</p>
      </div>

      <div className="space-y-3 p-4">
        {selectedSubjects.length > 0 || unknownIds.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selectedSubjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => toggle(subject.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-paper-light px-2.5 py-1 text-left text-[11px] font-medium text-ink transition hover:border-terracotta/50 hover:text-terracotta"
                title={`Quitar ${subject.name}`}
              >
                <span className="font-mono text-[10px] text-ink-soft">
                  {subject.code || subject.name}
                </span>
                <XIcon className="size-3" />
              </button>
            ))}
            {unknownIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onChange(selectedIds.filter((value) => value !== id))}
                className="inline-flex items-center gap-1.5 rounded-full border border-terracotta/40 bg-terracotta-soft px-2.5 py-1 text-[11px] font-medium text-ink"
                title="Quitar correlativa desconocida"
              >
                <span className="font-mono text-[10px]">{id} · no encontrada</span>
                <XIcon className="size-3" />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-soft/80">Sin correlativas cargadas.</p>
        )}

        <div>
          <label htmlFor={searchId} className="sr-only">
            Buscar materias para {title.toLowerCase()}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-soft/70" />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar materia o código..."
              className="w-full rounded-xl border border-ink/15 bg-paper-light py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-soft/60"
            />
          </div>
        </div>

        <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-soft">
              No encontramos materias con ese nombre.
            </p>
          ) : (
            [...grouped.entries()].map(([year, group]) => (
              <div key={year}>
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft/70">
                  {year}° año
                </p>
                <div className="space-y-0.5">
                  {group.map((subject) => {
                    const checked = selected.has(subject.id);

                    return (
                      <label
                        key={subject.id}
                        className="flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1 text-xs leading-5 transition hover:bg-paper-light"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(subject.id)}
                          className="mt-0.5 size-3.5 shrink-0 accent-[#1f4d3a]"
                        />
                        <span className={checked ? "font-medium text-ink" : "text-ink-soft"}>
                          {subjectLabel(subject)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
