"use client";

import { useSyncExternalStore } from "react";

import type { StudyPlan } from "../study-plan/types";
import {
  STUDY_PLAN_STORAGE_KEY,
  clearStudyPlan,
  loadStudyPlan,
  saveStudyPlan,
} from "./study-plan-storage";

const listeners = new Set<() => void>();

let initialized = false;
let cachedRaw: string | null = null;
let cachedPlan: StudyPlan | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STUDY_PLAN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): StudyPlan | null {
  const raw = readRaw();

  if (!initialized || raw !== cachedRaw) {
    initialized = true;
    cachedRaw = raw;
    cachedPlan = raw ? loadStudyPlan() : null;
  }

  return cachedPlan;
}

function getServerSnapshot(): StudyPlan | null {
  return null;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STUDY_PLAN_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredStudyPlan(): StudyPlan | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveStoredStudyPlan(plan: StudyPlan): void {
  saveStudyPlan(plan);
  emit();
}

export function clearStoredStudyPlan(): void {
  clearStudyPlan();
  emit();
}
