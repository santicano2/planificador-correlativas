import { describe, expect, it } from "vitest";

import { formatMissing } from "./missing-format";

describe("formatMissing", () => {
  it("formats regularized and approved requirements", () => {
    expect(
      formatMissing([
        {
          subjectId: "algebra",
          subjectName: "Álgebra",
          requiredStatus: "regularized",
          currentStatus: "pending",
        },
        {
          subjectId: "analysis",
          subjectName: "Análisis",
          requiredStatus: "approved",
          currentStatus: "regularized",
        },
      ]),
    ).toBe("falta regularizar Álgebra · falta aprobar Análisis");
  });
});
