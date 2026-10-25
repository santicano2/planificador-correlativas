"use client";

import { useSyncExternalStore } from "react";

import type { StudyProgress } from "../study-plan/types";
import {
  STUDY_PROGRESS_STORAGE_KEY,
  clearStudyProgress,
  loadStudyProgress,
  saveStudyProgress,
} from "./study-progress-storage";

const listeners = new Set<() => void>();
const EMPTY_PROGRESS: StudyProgress = {};

let initialized = false;
let cachedRaw: string | null = null;
let cachedProgress: StudyProgress = EMPTY_PROGRESS;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): StudyProgress {
  const raw = readRaw();

  if (!initialized || raw !== cachedRaw) {
    initialized = true;
    cachedRaw = raw;
    cachedProgress = raw ? loadStudyProgress() : EMPTY_PROGRESS;
  }

  return cachedProgress;
}

function getServerSnapshot(): StudyProgress {
  return EMPTY_PROGRESS;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STUDY_PROGRESS_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredStudyProgress(): StudyProgress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveStoredStudyProgress(progress: StudyProgress): void {
  saveStudyProgress(progress);
  emit();
}

export function clearStoredStudyProgress(): void {
  clearStudyProgress();
  emit();
}
