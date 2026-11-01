import { buildDashboard, type DashboardRow } from "./dashboard";
import type { StudyPlan, StudyProgress } from "./types";

export interface StudyTermSelection {
  subjectIds: string[];
}

export interface TermPlanRow extends DashboardRow {
  isSelected: boolean;
}

export interface TermPlanSummary {
  selectedCount: number;
  selectedAvailableCount: number;
  selectedBlockedCount: number;
  pendingCount: number;
}

export interface TermPlanModel {
  rows: TermPlanRow[];
  selectedRows: TermPlanRow[];
  summary: TermPlanSummary;
}

export const EMPTY_TERM_SELECTION: StudyTermSelection = { subjectIds: [] };

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids)];
}

export function buildTermPlan(
  plan: StudyPlan,
  progress: StudyProgress,
  selection: StudyTermSelection,
): TermPlanModel {
  const selectedIds = new Set(selection.subjectIds);
  const rows = buildDashboard(plan, progress).rows
    .filter((row) => row.status === "pending")
    .map((row) => ({
      ...row,
      isSelected: selectedIds.has(row.subject.id),
    }));
  const selectedRows = rows.filter((row) => row.isSelected);

  let selectedAvailableCount = 0;
  let selectedBlockedCount = 0;

  for (const row of selectedRows) {
    if (row.availability.status === "available") {
      selectedAvailableCount += 1;
    } else {
      selectedBlockedCount += 1;
    }
  }

  return {
    rows,
    selectedRows,
    summary: {
      selectedCount: selectedRows.length,
      selectedAvailableCount,
      selectedBlockedCount,
      pendingCount: rows.length,
    },
  };
}

export function pruneTermSelection(
  plan: StudyPlan,
  progress: StudyProgress,
  selection: StudyTermSelection,
): StudyTermSelection {
  const pendingIds = new Set(
    buildDashboard(plan, progress)
      .rows.filter((row) => row.status === "pending")
      .map((row) => row.subject.id),
  );

  return {
    subjectIds: uniqueIds(selection.subjectIds).filter((subjectId) =>
      pendingIds.has(subjectId),
    ),
  };
}

export function toggleTermSelection(
  selection: StudyTermSelection,
  subjectId: string,
): StudyTermSelection {
  const ids = new Set(selection.subjectIds);

  if (ids.has(subjectId)) {
    ids.delete(subjectId);
  } else {
    ids.add(subjectId);
  }

  return { subjectIds: [...ids] };
}
