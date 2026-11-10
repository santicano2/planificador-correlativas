import { describe, expect, it } from "vitest";

import { getNextTheme, isTheme, resolveInitialTheme } from "./theme";

describe("resolveInitialTheme", () => {
  it("uses a stored dark theme over a light system", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
  });

  it("uses a stored light theme over a dark system", () => {
    expect(resolveInitialTheme("light", true)).toBe("light");
  });

  it("falls back to the system when the stored value is invalid", () => {
    expect(resolveInitialTheme("sepia", true)).toBe("dark");
    expect(resolveInitialTheme("sepia", false)).toBe("light");
  });

  it("falls back to the system when there is no stored value", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(undefined, false)).toBe("light");
  });
});

describe("getNextTheme", () => {
  it("toggles between light and dark", () => {
    expect(getNextTheme("light")).toBe("dark");
    expect(getNextTheme("dark")).toBe("light");
  });
});

describe("isTheme", () => {
  it("accepts only light and dark", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("sepia")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});
