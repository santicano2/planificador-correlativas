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
import type {
  StudyPlan,
  StudyProgress,
  StudyTermSelection,
} from "@/lib/study-plan";

const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

interface BackupActionsProps {
  variant: "dashboard" | "home";
  currentPlan?: StudyPlan | null;
  progress?: StudyProgress;
  termSelection?: StudyTermSelection;
  onRestore: (backup: StudyPlanBackup) => void;
}

export function BackupActions({
  variant,
  currentPlan,
  progress,
  termSelection,
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
      const blob = new Blob(
        [
          serializeStudyPlanBackup(
            currentPlan,
            progress,
            termSelection ?? { subjectIds: [] },
          ),
        ],
        { type: "application/json" },
      );
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
      className={
        variant === "dashboard"
          ? "panel p-4"
          : "border border-line bg-surface p-3"
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {variant === "dashboard"
              ? "Respaldo"
              : "¿Ya tenés un respaldo?"}
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-ink-soft">
            {variant === "dashboard"
              ? "Descargá una copia del plan, tu progreso y tu cuatrimestre, o restaurá un archivo."
              : "Restaurá un plan exportado desde otro navegador o después de borrarlo."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {variant === "dashboard" ? (
            <button
              type="button"
              onClick={handleExport}
              className="btn btn-secondary btn-sm"
            >
              <DownloadIcon className="size-3.5" />
              Exportar respaldo
            </button>
          ) : null}

          <button
            type="button"
            onClick={openFilePicker}
            disabled={isBusy}
            className="btn btn-primary btn-sm"
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
          className="mt-3 flex items-start gap-2 text-xs leading-5 text-signal"
        >
          <AlertIcon className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}

      {pendingBackup ? (
        <div className="service-alert service-alert--warning mt-3">
          <AlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
          <div>
            <p className="text-xs font-semibold text-ink">
              Confirmá el reemplazo
            </p>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Vas a reemplazar <strong>{currentPlan?.career}</strong> por{" "}
              <strong>{pendingBackup.plan.career}</strong>. Se restaurarán{" "}
              {pendingBackup.plan.subjects.length} materias,{" "}
              {Object.keys(pendingBackup.progress).length} estados guardados y{" "}
              {pendingBackup.termSelection.subjectIds.length} materias en tu
              cuatrimestre.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={confirmRestore}
                className="btn btn-danger btn-sm"
              >
                Sí, restaurar
              </button>
              <button
                type="button"
                onClick={() => setPendingBackup(null)}
                className="btn btn-ghost btn-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
