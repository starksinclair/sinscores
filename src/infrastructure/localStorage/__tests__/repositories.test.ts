import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageLeagueRepository } from "../league.repository";

describe("localStorage repositories", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  describe("create and getById", () => {
    it("create persists to localStorage and returns typed object", async () => {
      const repo = new LocalStorageLeagueRepository();
      const league = await repo.create({
        name: "Test League",
        season: "2025",
        accessCode: "AB12CD",
        createdAt: new Date().toISOString(),
      });
      expect(league.name).toBe("Test League");
      expect(league.leagueId).toBeDefined();
      const found = await repo.getById(league.leagueId);
      expect(found?.name).toBe("Test League");
    });

    it("getById returns null for missing id", async () => {
      const repo = new LocalStorageLeagueRepository();
      const found = await repo.getById("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("update and delete", () => {
    it("update merges fields correctly", async () => {
      const repo = new LocalStorageLeagueRepository();
      const league = await repo.create({
        name: "Original",
        season: "2025",
        accessCode: "AB12CD",
        createdAt: new Date().toISOString(),
      });
      const updated = await repo.update(league.leagueId, { name: "Updated" });
      expect(updated.name).toBe("Updated");
      expect(updated.season).toBe("2025");
    });

    it("delete removes record", async () => {
      const repo = new LocalStorageLeagueRepository();
      const league = await repo.create({
        name: "To Delete",
        season: "2025",
        accessCode: "AB12CD",
        createdAt: new Date().toISOString(),
      });
      await repo.delete(league.leagueId);
      const found = await repo.getById(league.leagueId);
      expect(found).toBeNull();
    });
  });

  describe("getAll", () => {
    it("returns empty array when localStorage is empty", async () => {
      const repo = new LocalStorageLeagueRepository();
      const all = await repo.getAll();
      expect(all).toEqual([]);
    });
  });

  describe("getByAccessCode", () => {
    it("returns correct league", async () => {
      const repo = new LocalStorageLeagueRepository();
      await repo.create({
        name: "League",
        season: "2025",
        accessCode: "XY99ZZ",
        createdAt: new Date().toISOString(),
      });
      const found = await repo.getByAccessCode("XY99ZZ");
      expect(found?.name).toBe("League");
    });
  });
});
