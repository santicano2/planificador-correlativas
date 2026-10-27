"use client";

import { useSyncExternalStore } from "react";

import {
  EMPTY_TERM_SELECTION,
  type StudyTermSelection,
} from "../study-plan/term";
import {
  STUDY_TERM_SELECTION_STORAGE_KEY,
  clearStudyTermSelection,
  loadStudyTermSelection,
  saveStudyTermSelection,
} from "./study-term-selection-storage";

const listeners = new Set<() => void>();

let initialized = false;
let cachedRaw: string | null = null;
let cachedSelection: StudyTermSelection = EMPTY_TERM_SELECTION;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STUDY_TERM_SELECTION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): StudyTermSelection {
  const raw = readRaw();

  if (!initialized || raw !== cachedRaw) {
    initialized = true;
    cachedRaw = raw;
    cachedSelection = raw
      ? loadStudyTermSelection()
      : EMPTY_TERM_SELECTION;
  }

  return cachedSelection;
}

function getServerSnapshot(): StudyTermSelection {
  return EMPTY_TERM_SELECTION;
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === STUDY_TERM_SELECTION_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useStoredStudyTermSelection(): StudyTermSelection {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveStoredStudyTermSelection(
  selection: StudyTermSelection,
): void {
  saveStudyTermSelection(selection);
  emit();
}

export function clearStoredStudyTermSelection(): void {
  clearStudyTermSelection();
  emit();
}
