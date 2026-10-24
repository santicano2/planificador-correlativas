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
import { PdfExtractionError, extractPdf } from "@/lib/pdf/extract-text";
import { parseStudyPlan } from "@/lib/pdf/parse-plan";
import {
  createDraftPlan,
  type DraftStudyPlan,
} from "@/lib/import/draft-plan";
import {
  clearStoredStudyPlan,
  saveStoredStudyPlan,
  useStoredStudyPlan,
} from "@/lib/storage/use-study-plan-storage";
import type { StudyPlan } from "@/lib/study-plan";

import { PlanSaved } from "./plan-saved";
import { ReviewPlan } from "./review-plan";
import { UploadPanel } from "./upload-panel";

type View = "home" | "review" | "saved";

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

export function ImportPlanFlow() {
  const [view, setView] = useState<View>("home");
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftStudyPlan | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [savedPlan, setSavedPlan] = useState<StudyPlan | null>(null);
  const storedPlan = useStoredStudyPlan();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

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
    saveStoredStudyPlan(plan);
    setSavedPlan(plan);
    setDraft(null);
    setSourceName(null);
    setView("saved");
  };

  const handleClearStored = () => {
    try {
      clearStoredStudyPlan();
    } catch {
      // Si el navegador bloquea el storage, igual limpiamos la vista.
    }

    setSavedPlan(null);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("home");
  };

  const handleStartOver = () => {
    setSavedPlan(null);
    setDraft(null);
    setSourceName(null);
    setError(null);
    setView("home");
  };

  const planToShow = savedPlan ?? storedPlan;

  return (
    <div className="min-h-screen">
      <a
        href="#contenido"
        className="sr-only rounded-full bg-forest px-4 py-2 text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
      >
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

            <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pt-16">
              <div className="animate-rise">
                <span className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-forest/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-forest">
                  <span className="size-1.5 rounded-full bg-terracotta" />
                  Importá tu plan en minutos
                </span>
                <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.92] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                  Tu carrera,
                  <br />
                  <span className="italic text-forest">sin adivinar</span>
                  <br />
                  correlativas.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                  Subí el PDF de tu plan de estudios. Detectamos las materias y
                  sus correlativas, y te dejamos todo listo para planificar el
                  cuatrimestre.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href="#importar"
                    className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-paper transition hover:bg-forest-deep"
                  >
                    Subir mi plan
                    <ArrowRightIcon className="size-4" />
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                    <LockIcon className="size-4 text-forest" />
                    Todo queda en tu navegador
                  </span>
                </div>

                <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-ink/10 pt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-forest" />
                    Sin cuenta
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-forest" />
                    PDF con texto
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-3.5 text-forest" />
                    Guardado local
                  </span>
                </div>
              </div>

              <div
                id="importar"
                className="animate-rise relative scroll-mt-24"
                style={{ animationDelay: "120ms" }}
              >
                <div className="relative">
                  <UploadPanel
                    busy={isBusy}
                    error={error}
                    onFile={processFile}
                    onExample={handleExample}
                  />
                </div>

                <p className="mt-4 flex items-start gap-2 px-2 text-[11px] leading-5 text-ink-soft">
                  <LockIcon className="mt-0.5 size-3.5 shrink-0 text-forest" />
                  El PDF se procesa en tu navegador. No se sube a ningún
                  servidor ni se guarda en la nube.
                </p>
              </div>
            </section>

            <HowItWorks />
          </>
        ) : null}

        {view === "review" && draft ? (
          <ReviewPlan
            draft={draft}
            sourceName={sourceName}
            onChange={setDraft}
            onSave={handleSave}
            onCancel={handleStartOver}
          />
        ) : null}

        {view === "saved" && planToShow ? (
          <PlanSaved
            plan={planToShow}
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
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl border border-forest/15 bg-forest text-paper shadow-[3px_3px_0_rgba(23,36,29,0.12)]">
          <BrandMark />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight text-ink">
            Planificador
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-ink-soft">
            de correlativas
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft sm:inline">
          Hecho para estudiantes
        </span>
        {hasStoredPlan ? (
          <button
            type="button"
            onClick={onOpenStoredPlan}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper-light px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-forest hover:text-forest"
          >
            <BookIcon className="size-3.5" />
            Mi plan
          </button>
        ) : null}
      </div>
    </header>
  );
}

function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M6 7.5h5.5M13.5 7.5H18M9 8v8M15 8v8M9.8 16h4.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="6" cy="7.5" r="2" fill="currentColor" />
      <circle cx="18" cy="7.5" r="2" fill="currentColor" />
      <circle cx="9" cy="16" r="2" fill="currentColor" />
      <circle cx="15" cy="16" r="2" fill="#a9522b" />
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
    <div className="mx-auto w-full max-w-7xl px-4 pt-2 sm:px-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-forest/20 bg-forest/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-forest">
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-paper transition hover:bg-forest-deep"
          >
            Ver mi plan
            <ArrowRightIcon className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="border-y border-ink/10 bg-paper-light/55">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-terracotta">
              Cómo funciona
            </p>
            <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
              Del PDF al cuatrimestre en tres pasos.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-ink-soft">
            Sin planillas, sin cargar todo a mano y sin crear una cuenta.
          </p>
        </div>

        <div className="mt-9 grid gap-3 md:grid-cols-3">
          <Step
            number="01"
            icon={<FileIcon className="size-4" />}
            title="Subí el PDF"
            body="Elegí el plan de estudios que te dio la facultad. Leemos el texto y detectamos el formato."
          />
          <Step
            number="02"
            icon={<SparkIcon className="size-4" />}
            title="Revisá y corregí"
            body="Ajustá nombres, años, cuatrimestres y correlativas. El PDF no siempre interpreta todo perfecto."
          />
          <Step
            number="03"
            icon={<BookIcon className="size-4" />}
            title="Guardá tu plan"
            body="Queda guardado en este navegador, sin cuentas ni servidores. Listo para planificar el cuatrimestre."
          />
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
    <article className="group rounded-2xl border border-ink/12 bg-paper p-5 transition hover:-translate-y-0.5 hover:border-forest/30">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-full bg-forest/10 text-forest">
          {icon}
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft/60">
          {number}
        </span>
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
    </article>
  );
}

function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 font-display text-sm font-semibold text-ink">
          <BrandMark />
          Planificador de Correlativas
        </p>
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-soft">
          Sin cuentas · Sin servidores · Hecho para estudiantes
        </p>
      </div>
    </footer>
  );
}
