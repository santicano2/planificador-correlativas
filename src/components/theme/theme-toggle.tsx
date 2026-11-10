"use client";

import { useEffect } from "react";

import { MoonIcon, SunIcon } from "@/components/icons";
import {
  THEME_STORAGE_KEY,
  getNextTheme,
  isTheme,
  resolveInitialTheme,
  type Theme,
} from "@/lib/theme/theme";

let hasExplicitChoice = false;

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function readStoredTheme(): string | null {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

export function ThemeToggle() {
  useEffect(() => {
    if (hasExplicitChoice || isTheme(readStoredTheme())) {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = () => {
      if (hasExplicitChoice || isTheme(readStoredTheme())) {
        return;
      }

      applyTheme(resolveInitialTheme(null, media.matches));
    };

    media.addEventListener("change", handleSystemChange);

    return () => media.removeEventListener("change", handleSystemChange);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const current = isTheme(root.dataset.theme) ? root.dataset.theme : "light";
    const next = getNextTheme(current);

    hasExplicitChoice = true;
    applyTheme(next);
    writeStoredTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm size-8 p-0"
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      <MoonIcon className="theme-icon theme-icon--light size-4" />
      <SunIcon className="theme-icon theme-icon--dark size-4" />
    </button>
  );
}
