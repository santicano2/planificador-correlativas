"use client";

import { useRef, useState } from "react";

import {
  AlertIcon,
  ArrowRightIcon,
  FileIcon,
  LockIcon,
  SparkIcon,
  UploadIcon,
} from "@/components/icons";

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
    <div className="panel">
      <div className="panel-head">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="grid size-5 place-items-center bg-primary text-[10px] font-semibold text-on-primary">
            1
          </span>
          Importar plan
        </span>
        <span className="route-badge text-ink-soft">PDF</span>
      </div>

      <div className="p-3 sm:p-4">
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
            "relative flex min-h-[280px] flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary-soft/40"
              : "border-line-strong bg-canvas",
          ].join(" ")}
        >
          {busy ? (
            <div
              role="status"
              aria-live="polite"
              className="flex w-full max-w-[280px] flex-col items-center"
            >
              <div className="relative h-1 w-full overflow-hidden bg-surface-3">
                <div className="animate-route absolute inset-y-0 w-1/2 bg-primary" />
              </div>
              <div className="mt-2 flex w-full justify-between text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                <span>PDF</span>
                <span>Materias</span>
                <span>Correlativas</span>
              </div>
              <p className="mt-5 font-display text-3xl font-semibold text-ink">
                Leyendo el PDF
              </p>
              <p className="mt-2 max-w-[30ch] text-sm leading-6 text-ink-soft">
                Buscando materias, años y correlativas. Todo pasa en tu
                navegador.
              </p>
            </div>
          ) : (
            <>
              <span className="grid size-14 place-items-center border border-primary bg-primary-soft text-primary">
                <UploadIcon className="size-7" />
              </span>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
                Subí el PDF de tu plan
              </h2>
              <p className="mt-2 max-w-[32ch] text-sm leading-6 text-ink-soft">
                Arrastrá el archivo acá o elegilo desde tu compu.
              </p>

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="btn btn-primary mt-5"
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

              <p className="mt-3 text-[11px] text-ink-soft">
                Hasta 15 MB · 40 páginas
              </p>
            </>
          )}
        </div>

        {error ? (
          <div
            role="alert"
            className="service-alert service-alert--danger mt-3"
          >
            <AlertIcon className="mt-0.5 size-4 shrink-0 text-signal" />
            <span>{error}</span>
          </div>
        ) : null}

        {!busy ? (
          <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onExample}
              className="btn btn-ghost btn-sm"
            >
              <SparkIcon className="size-4 text-primary" />
              Probar con un plan de ejemplo
              <ArrowRightIcon className="size-3.5" />
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
