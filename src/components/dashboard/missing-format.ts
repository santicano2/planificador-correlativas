import type { DashboardMissingRequirement } from "@/lib/study-plan";

export function formatMissing(
  missing: DashboardMissingRequirement[],
): string {
  return missing
    .map(
      (requirement) =>
        `falta ${requirement.requiredStatus === "regularized" ? "regularizar" : "aprobar"} ${requirement.subjectName}`,
    )
    .join(" · ");
}
