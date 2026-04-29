import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatTime,
  formatDateTime,
  formatScore,
  formatDuration,
  getInitials,
} from "../format.util";

describe("formatDate", () => {
  it("formats ISO date correctly", () => {
    const result = formatDate("2024-03-09T14:30:00Z");
    expect(result).toMatch(/\d{1,2}\s+Mar/);
  });
});

describe("formatTime", () => {
  it("formats time in 24h format", () => {
    const result = formatTime("2024-03-09T14:30:00Z");
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe("formatDateTime", () => {
  it("combines date and time", () => {
    const result = formatDateTime("2024-03-09T14:30:00Z");
    expect(result).toContain(":");
    expect(result.length).toBeGreaterThan(5);
  });
});

describe("formatScore", () => {
  it("formats score with dash", () => {
    expect(formatScore(2, 1)).toBe("2 - 1");
    expect(formatScore(0, 0)).toBe("0 - 0");
  });
});

describe("formatDuration", () => {
  it("formats minutes with apostrophe", () => {
    expect(formatDuration(90)).toBe("90'");
    expect(formatDuration(45)).toBe("45'");
  });
});

describe("getInitials", () => {
  it("returns first letters of first two words", () => {
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("handles single name", () => {
    expect(getInitials("Madonna")).toBe("M");
  });

  it("handles three names", () => {
    expect(getInitials("John Paul Smith")).toBe("JP");
  });

  it("returns uppercase", () => {
    expect(getInitials("john doe")).toBe("JD");
  });
});
