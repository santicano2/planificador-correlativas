"use client";

import { useRef, useState } from "react";

import { FileIcon, LockIcon, UploadIcon, SparkIcon } from "@/components/icons";

interface UploadPanelProps {
  busy: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onExample: () => void;
}

export function UploadPanel({
  busy,
  error,
  onFile,
  onExample,
}: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];

    if (file && !busy) {
      onFile(file);
    }
  };

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute -inset-2 rotate-1 rounded-[30px] border border-line/70 bg-paper-deep/50"
      />

      <div className="paper-shadow relative rounded-[26px] border border-ink/15 bg-paper-light p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-forest">
            <span className="flex size-5 items-center justify-center rounded-full bg-forest text-[9px] text-paper">
              1
            </span>
            Importar plan
          </span>
          <span className="rounded-full border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-ink-soft">
            PDF
          </span>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          className={[
            "relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-[18px] border-2 border-dashed px-5 py-8 text-center transition-colors",
            isDragging
              ? "border-terracotta bg-terracotta-soft/50"
              : "border-line bg-paper/55",
          ].join(" ")}
        >
          {busy ? (
            <div role="status" aria-live="polite" className="flex flex-col items-center">
              <div className="relative mb-5 h-24 w-20">
                <div className="absolute inset-0 rounded-lg border border-forest/30 bg-paper-light">
                  <div className="mt-3 space-y-2 px-3">
                    <span className="block h-1.5 w-10 rounded-full bg-forest/20" />
                    <span className="block h-1.5 w-12 rounded-full bg-forest/20" />
                    <span className="block h-1.5 w-8 rounded-full bg-forest/20" />
                    <span className="mt-3 block h-1.5 w-11 rounded-full bg-forest/20" />
                    <span className="block h-1.5 w-9 rounded-full bg-forest/20" />
                  </div>
                </div>
                <div className="animate-scan absolute inset-x-2 top-2 h-0.5 rounded-full bg-terracotta shadow-[0_0_12px_rgba(169,82,43,0.8)]" />
              </div>
              <p className="font-display text-2xl font-semibold text-ink">
                Leyendo el PDF
              </p>
              <p className="mt-2 max-w-[26ch] text-sm leading-6 text-ink-soft">
                Buscando materias, años y correlativas. Todo pasa en tu
                navegador.
              </p>
            </div>
          ) : (
            <>
              <div className="relative mb-5">
                <span className="animate-pulse-ring absolute inset-0 rounded-full bg-forest/15" />
                <span className="relative flex size-16 items-center justify-center rounded-full bg-forest text-paper">
                  <UploadIcon className="size-7" />
                </span>
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Subí el PDF de tu plan
              </h2>
              <p className="mt-2 max-w-[30ch] text-sm leading-6 text-ink-soft">
                Arrastrá el archivo acá o elegilo desde tu compu.
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
              >
                <FileIcon className="size-4" />
                Elegir PDF
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                tabIndex={-1}
                className="sr-only"
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft/80">
                Hasta 15 MB · 40 páginas
              </p>
            </>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-3 flex gap-3 rounded-2xl border border-terracotta/30 bg-terracotta-soft/60 px-4 py-3 text-sm leading-6 text-ink"
          >
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-terracotta font-mono text-[10px] font-bold text-paper">
              !
            </span>
            {error}
          </div>
        ) : null}

        {!busy ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onExample}
              className="group inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-forest transition hover:bg-forest/5"
            >
              <SparkIcon className="size-4 text-terracotta" />
              Probar con un plan de ejemplo
              <span className="transition group-hover:translate-x-0.5">→</span>
            </button>
            <p className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft">
              <LockIcon className="size-3.5" />
              No se sube a ningún servidor
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
