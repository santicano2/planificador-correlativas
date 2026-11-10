"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  ArrowRightIcon,
  BookIcon,
  CheckIcon,
  FileIcon,
  LockIcon,
  SparkIcon,
} from "@/components/icons";
import { RouteMap } from "@/components/home/route-map";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { PdfExtractionError, extractPdf } from "@/lib/pdf/extract-text";
import { parseStudyPlan } from "@/lib/pdf/parse-plan";
import {
  createDraftFromStudyPlan,
  createDraftPlan,
  type DraftStudyPlan,
} from "@/lib/import/draft-plan";
import { BackupActions } from "@/components/backup/backup-actions";
import { StudyDashboard } from "@/components/dashboard/study-dashboard";
import type { StudyPlanBackup } from "@/lib/backup/study-plan-backup";
import {
  clearStoredStudyProgress,
  saveStoredStudyProgress,
  useStoredStudyProgress,
} from "@/lib/storage/use-study-progress-storage";
import {
  clearStoredStudyPlan,
  saveStoredStudyPlan,
  useStoredStudyPlan,
} from "@/lib/storage/use-study-plan-storage";
import {
  clearStoredStudyTermSelection,
  saveStoredStudyTermSelection,
  useStoredStudyTermSelection,
} from "@/lib/storage/use-study-term-selection-storage";
import {
  pruneProgress,
  pruneTermSelection,
  type StudyPlan,
  type StudyTermSelection,
  type SubjectStatus,
} from "@/lib/study-plan";

import { ReviewPlan } from "./review-plan";
import { UploadPanel } from "./upload-panel";

type View = "home" | "review" | "edit" | "saved";

const EXAMPLE_PATH = "/examples/plan-2014-sistemas.pdf";
const EXAMPLE_UNIVERSITY = "Universidad Nacional de La Plata";

function isPdf(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof PdfExtractionError) {
    return error.message;
  }

  return "No pudimos leer el PDF. Probá con otro archivo o revisá que no esté protegido.";
}

function sameSubjectIds(a: string[], b: string[]): boolean {
  return (
    a.length === b.length &&
    a.every((subjectId, index) => subjectId === b[index])
  );
}

export function ImportPlanFlow() {
  const [view, setView] = useState<View>("home");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftStudyPlan | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [savedPlan, setSavedPlan] = useState<StudyPlan | null>(null);
  const storedPlan = useStoredStudyPlan();
  const progress = useStoredStudyProgress();
  const termSelection = useStoredStudyTermSelection();
  const planToShow = savedPlan ?? storedPlan;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    if (!planToShow) {
      return;
    }

    const pruned = pruneTermSelection(
      planToShow,
      progress,
      termSelection,
    );

    if (!sameSubjectIds(pruned.subjectIds, termSelection.subjectIds)) {
      try {
        saveStoredStudyTermSelection(pruned);
      } catch {}
    }
  }, [planToShow, progress, termSelection]);

  const processFile = async (file: File, universityHint?: string) => {
    if (!isPdf(file)) {
      setError("Elegí un archivo PDF.");
      return;
    }

    setError(null);
    setIsBusy(true);
    setSourceName(file.name);

    try {
      const extraction = await extractPdf(file);
      const parsed = parseStudyPlan(extraction);

      if (parsed.subjects.length === 0) {
        setError(
          "No pudimos detectar materias en este PDF. Verificá que tenga texto seleccionable y el formato de un plan de estudios.",
        );
        setSourceName(null);
        return;
      }

      const nextDraft = createDraftPlan(parsed);

      if (universityHint && !nextDraft.university.trim()) {
        nextDraft.university = universityHint;
      }

      setDraft(nextDraft);
      setView("review");
    } catch (cause) {
      setError(errorMessage(cause));
      setSourceName(null);
    } finally {
      setIsBusy(false);
    }
  };

  const handleExample = async () => {
    setError(null);
    setIsBusy(true);

    try {
      const response = await fetch(EXAMPLE_PATH);

      if (!response.ok) {
        throw new Error("No se pudo cargar el ejemplo.");
      }

      const blob = await response.blob();
      const file = new File([blob], "plan-2014-sistemas.pdf", {
        type: "application/pdf",
      });

      await processFile(file, EXAMPLE_UNIVERSITY);
    } catch {
      setError(
        "No pudimos cargar el plan de ejemplo. Probá subiendo tu propio PDF.",
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleSave = (plan: StudyPlan) => {
    const nextProgress = pruneProgress(plan, progress);
    const nextTermSelection = pruneTermSelection(
      plan,
      nextProgress,
      termSelection,
    );

    saveStoredStudyPlan(plan);
    saveStoredStudyProgress(nextProgress);
    saveStoredStudyTermSelection(nextTermSelection);
    setSavedPlan(plan);
    setDraft(null);
    setSourceName(null);
    setView("saved");
  };

  const handleClearStored = () => {
    try {
      clearStoredStudyPlan();
      clearStoredStudyProgress();
      clearStoredStudyTermSelection();
    } catch {
      // Si el navegador bloquea el storage, igual limpiamos la vista.
    }

    setSavedPlan(null);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("home");
  };

  const handleStatusChange = (subjectId: string, status: SubjectStatus) => {
    const nextProgress = { ...progress };

    if (status === "pending") {
      delete nextProgress[subjectId];
    } else {
      nextProgress[subjectId] = status;
    }

    saveStoredStudyProgress(nextProgress);

    if (planToShow) {
      saveStoredStudyTermSelection(
        pruneTermSelection(planToShow, nextProgress, termSelection),
      );
    }
  };

  const handleTermSelectionChange = (
    selection: StudyTermSelection,
  ) => {
    if (!planToShow) {
      return;
    }

    saveStoredStudyTermSelection(
      pruneTermSelection(planToShow, progress, selection),
    );
  };

  const handleEdit = () => {
    if (!planToShow) {
      return;
    }

    setDraft(createDraftFromStudyPlan(planToShow));
    setSourceName(null);
    setError(null);
    setView("edit");
  };

  const handleCancelReview = () => {
    const wasEditing = view === "edit";

    setDraft(null);
    setSourceName(null);
    setError(null);
    setView(wasEditing ? "saved" : "home");
  };

  const handleRestore = (backup: StudyPlanBackup) => {
    const nextProgress = pruneProgress(backup.plan, backup.progress);
    const nextTermSelection = pruneTermSelection(
      backup.plan,
      nextProgress,
      backup.termSelection,
    );

    saveStoredStudyPlan(backup.plan);
    saveStoredStudyProgress(nextProgress);
    saveStoredStudyTermSelection(nextTermSelection);
    setSavedPlan(backup.plan);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("saved");
  };

  const handleStartOver = () => {
    setSavedPlan(null);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("home");
  };

  return (
    <div className="min-h-screen">
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <Header
        hasStoredPlan={view === "home" && Boolean(storedPlan)}
        onOpenStoredPlan={() => {
          if (storedPlan) {
            setSavedPlan(storedPlan);
            setView("saved");
          }
        }}
      />

      <main id="contenido">
        {view === "home" ? (
          <>
            {storedPlan ? (
              <StoredPlanBanner
                plan={storedPlan}
                onOpen={() => {
                  setSavedPlan(storedPlan);
                  setView("saved");
                }}
              />
            ) : null}

            <section className="shell grid gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14 lg:pt-14">
              <div>
                <h1 className="font-display text-6xl font-semibold leading-[0.88] tracking-tight text-ink sm:text-7xl lg:text-[5.25rem]">
                  Tu carrera,
                  <br />
                  <span className="text-primary">sin adivinar</span>
                  <br />
                  correlativas.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                  Subí el PDF de tu plan de estudios. Detectamos las materias y
                  sus correlativas, y te dejamos todo listo para planificar el
                  cuatrimestre.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <a href="#importar" className="btn btn-primary">
                    Subir mi plan
                    <ArrowRightIcon className="size-4" />
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <LockIcon className="size-4 text-primary" />
                    Todo queda en tu navegador
                  </span>
                </div>

                <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-4 text-xs text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-success" />
                    Sin cuenta
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-success" />
                    PDF con texto
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-success" />
                    Guardado local
                  </span>
                </div>
              </div>

              <div id="importar" className="scroll-mt-24">
                <RouteMap />

                <div className="mt-3">
                  <UploadPanel
                    busy={isBusy}
                    error={error}
                    onFile={processFile}
                    onExample={handleExample}
                  />
                </div>

                <p className="mt-3 flex items-start gap-2 px-1 text-[11px] leading-5 text-ink-soft">
                  <LockIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  El PDF se procesa en tu navegador. No se sube a ningún
                  servidor ni se guarda en la nube.
                </p>

                <div className="mt-3">
                  <BackupActions
                    variant="home"
                    currentPlan={storedPlan}
                    onRestore={handleRestore}
                  />
                </div>
              </div>
            </section>

            <HowItWorks />
          </>
        ) : null}

        {(view === "review" || view === "edit") && draft ? (
          <ReviewPlan
            draft={draft}
            sourceName={sourceName}
            mode={view === "edit" ? "edit" : "import"}
            onChange={setDraft}
            onSave={handleSave}
            onCancel={handleCancelReview}
          />
        ) : null}

        {view === "saved" && planToShow ? (
          <StudyDashboard
            plan={planToShow}
            progress={progress}
            termSelection={termSelection}
            onStatusChange={handleStatusChange}
            onTermSelectionChange={handleTermSelectionChange}
            onEdit={handleEdit}
            onRestore={handleRestore}
            onImportAnother={handleStartOver}
            onClear={handleClearStored}
          />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

function Header({
  hasStoredPlan,
  onOpenStoredPlan,
}: {
  hasStoredPlan: boolean;
  onOpenStoredPlan: () => void;
}) {
  return (
    <header className="border-b border-line bg-surface">
      <div className="shell flex min-h-[72px] items-center justify-between gap-4">
        <a
          href="#contenido"
          className="flex items-center gap-3"
          aria-label="Planificador de Correlativas, inicio"
        >
          <span className="grid size-9 place-items-center bg-ink text-surface">
            <BrandMark />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-xl font-semibold tracking-tight text-ink">
              Planificador
            </span>
            <span className="block text-[11px] font-medium text-ink-soft">
              de correlativas
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-ink-soft md:inline-flex">
            <span className="status-dot bg-success" />
            Hecho para estudiantes
          </span>
          <ThemeToggle />
          {hasStoredPlan ? (
            <button
              type="button"
              onClick={onOpenStoredPlan}
              className="btn btn-secondary btn-sm"
            >
              <BookIcon className="size-3.5" />
              Mi plan
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M3 6h8a4 4 0 0 1 4 4v9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 6h-6a4 4 0 0 0-4 4v9"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.55"
      />
      <rect x="1" y="4" width="4" height="4" fill="currentColor" />
      <rect x="19" y="4" width="4" height="4" fill="currentColor" />
      <rect x="13" y="17" width="4" height="4" fill="currentColor" />
    </svg>
  );
}

function StoredPlanBanner({
  plan,
  onOpen,
}: {
  plan: StudyPlan;
  onOpen: () => void;
}) {
  return (
    <div className="border-b border-line bg-surface-2">
      <div className="shell flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-8 shrink-0 place-items-center border border-line bg-surface text-primary">
            <BookIcon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              Ya tenés un plan guardado
            </p>
            <p className="text-xs text-ink-soft">
              {plan.career}
              {plan.university ? ` · ${plan.university}` : ""} ·{" "}
              {plan.subjects.length} materias
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="btn btn-primary btn-sm self-start sm:self-auto"
        >
          Ver mi plan
          <ArrowRightIcon className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="border-y border-line bg-surface">
      <div className="shell py-14 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="max-w-2xl font-display text-4xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-5xl">
              Del PDF al cuatrimestre en tres estaciones.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
              Sin planillas, sin cargar todo a mano y sin crear una cuenta.
            </p>
          </div>
          <span className="route-badge self-start text-primary sm:self-auto">
            Línea local
          </span>
        </div>

        <div className="relative mt-10">
          <div className="absolute left-4 right-4 top-4 hidden h-px bg-line md:block" />
          <ol className="relative grid gap-8 md:grid-cols-3 md:gap-6">
            <Step
              number="1"
              icon={<FileIcon className="size-4" />}
              title="Subí el PDF"
              body="Elegí el plan de estudios que te dio la facultad. Leemos el texto y detectamos el formato."
            />
            <Step
              number="2"
              icon={<SparkIcon className="size-4" />}
              title="Revisá y corregí"
              body="Ajustá nombres, años, cuatrimestres y correlativas. El PDF no siempre interpreta todo perfecto."
            />
            <Step
              number="3"
              icon={<BookIcon className="size-4" />}
              title="Guardá tu plan"
              body="Queda guardado en este navegador, sin cuentas ni servidores. Listo para planificar el cuatrimestre."
            />
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({
  number,
  icon,
  title,
  body,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="relative md:pr-6">
      <span className="relative z-10 grid size-8 place-items-center border-2 border-primary bg-surface font-display text-sm font-semibold text-primary">
        {number}
      </span>
      <div className="mt-4 flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-soft">{body}</p>
    </li>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="shell flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <BrandMark />
          Planificador de Correlativas
        </p>
        <p className="text-[11px] text-ink-soft">
          Sin cuentas · Sin servidores · Hecho para estudiantes
        </p>
      </div>
    </footer>
  );
}
