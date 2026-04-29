import { describe, it, expect } from "vitest";
import { generateAccessCode, validateAccessCode } from "../accessCode.util";

describe("generateAccessCode", () => {
  it("always returns 6 chars", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateAccessCode();
      expect(code).toHaveLength(6);
    }
  });

  it("always matches format 2 uppercase + 2 digits + 2 uppercase", () => {
    for (let i = 0; i < 20; i++) {
      const code = generateAccessCode();
      expect(code).toMatch(/^[A-Z]{2}[0-9]{2}[A-Z]{2}$/);
    }
  });

  it("1000 consecutive calls produce no duplicates", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateAccessCode());
    }
    expect(codes.size).toBe(1000);
  });
});

describe("validateAccessCode", () => {
  it("accepts valid format", () => {
    expect(validateAccessCode("AB12CD")).toBe(true);
    expect(validateAccessCode("XY99ZZ")).toBe(true);
  });

  it("rejects wrong format - too short", () => {
    expect(validateAccessCode("AB12C")).toBe(false);
  });

  it("rejects wrong format - lowercase", () => {
    expect(validateAccessCode("ab12cd")).toBe(false);
  });

  it("rejects wrong format - letters in digit positions", () => {
    expect(validateAccessCode("ABABCD")).toBe(false);
  });

  it("rejects wrong format - digits in letter positions", () => {
    expect(validateAccessCode("1212CD")).toBe(false);
  });
});
