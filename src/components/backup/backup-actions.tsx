"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { AlertIcon, DownloadIcon, UploadIcon } from "@/components/icons";
import {
  StudyPlanBackupError,
  createBackupFilename,
  parseStudyPlanBackup,
  serializeStudyPlanBackup,
  type StudyPlanBackup,
} from "@/lib/backup/study-plan-backup";
import type { StudyPlan, StudyProgress } from "@/lib/study-plan";

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

interface BackupActionsProps {
  variant: "dashboard" | "home";
  currentPlan?: StudyPlan | null;
  progress?: StudyProgress;
  onRestore: (backup: StudyPlanBackup) => void;
}

export function BackupActions({
  variant,
  currentPlan,
  progress,
  onRestore,
}: BackupActionsProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingBackup, setPendingBackup] = useState<StudyPlanBackup | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);

  const openFilePicker = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleExport = () => {
    if (!currentPlan || !progress) {
      return;
    }

    setError(null);

    try {
      const blob = new Blob([serializeStudyPlanBackup(currentPlan, progress)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = createBackupFilename(currentPlan);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("No pudimos generar el respaldo.");
    }
  };

  const applyBackup = (backup: StudyPlanBackup): boolean => {
    try {
      onRestore(backup);
      setPendingBackup(null);
      setError(null);
      return true;
    } catch {
      setError("No pudimos restaurar el respaldo en este navegador.");
      return false;
    }
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setError(null);
    setPendingBackup(null);

    if (file.size > MAX_BACKUP_BYTES) {
      setError("El archivo supera el límite de 2 MB.");
      return;
    }

    setIsBusy(true);

    try {
      const backup = parseStudyPlanBackup(await file.text());

      if (currentPlan) {
        setPendingBackup(backup);
      } else {
        applyBackup(backup);
      }
    } catch (cause) {
      setError(
        cause instanceof StudyPlanBackupError
          ? cause.message
          : "No pudimos leer el respaldo.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const confirmRestore = () => {
    if (pendingBackup) {
      applyBackup(pendingBackup);
    }
  };

  return (
    <section
      className={[
        "rounded-2xl border px-4 py-3",
        variant === "dashboard"
          ? "border-ink/12 bg-paper-light"
          : "border-dashed border-ink/20 bg-paper-light/60",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">
            {variant === "dashboard"
              ? "Respaldo"
              : "¿Ya tenés un respaldo?"}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-ink-soft">
            {variant === "dashboard"
              ? "Descargá una copia del plan y tu progreso, o restaurá un archivo."
              : "Restaurá un plan exportado desde otro navegador o después de borrarlo."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variant === "dashboard" ? (
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-3 py-2 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
            >
              <DownloadIcon className="size-3.5" />
              Exportar respaldo
            </button>
          ) : null}

          <button
            type="button"
            onClick={openFilePicker}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep disabled:cursor-wait disabled:opacity-60"
          >
            <UploadIcon className="size-3.5" />
            {isBusy ? "Leyendo..." : "Restaurar respaldo"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            aria-label="Elegir respaldo"
            className="hidden"
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-xs leading-5 text-terracotta"
        >
          <AlertIcon className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {pendingBackup ? (
        <div className="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-3 py-3">
          <p className="text-xs font-semibold text-ink">
            Confirmá el reemplazo
          </p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Vas a reemplazar <strong>{currentPlan?.career}</strong> por{" "}
            <strong>{pendingBackup.plan.career}</strong>. Se restaurarán{" "}
            {pendingBackup.plan.subjects.length} materias y{" "}
            {Object.keys(pendingBackup.progress).length} estados guardados.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={confirmRestore}
              className="rounded-full bg-terracotta px-3 py-1.5 text-xs font-semibold text-paper"
            >
              Sí, restaurar
            </button>
            <button
              type="button"
              onClick={() => setPendingBackup(null)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-ink/5"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
