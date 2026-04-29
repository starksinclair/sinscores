import { describe, it, expect } from "vitest";
import * as leagueRepository from "../league.repository";

describe("league.repository", () => {
  it("getAll returns sample leagues", async () => {
    const leagues = await leagueRepository.getAll();
    expect(leagues).toBeDefined();
    expect(Array.isArray(leagues)).toBe(true);
    expect(leagues.length).toBeGreaterThan(0);
    expect(leagues[0]).toHaveProperty("leagueId");
    expect(leagues[0]).toHaveProperty("name");
    expect(leagues[0]).toHaveProperty("season");
    expect(leagues[0]).toHaveProperty("accessCode");
  });

  it("getById returns league when found", async () => {
    const league = await leagueRepository.getById("league1");
    expect(league).not.toBeNull();
    expect(league?.leagueId).toBe("league1");
  });

  it("getById returns null when not found", async () => {
    const league = await leagueRepository.getById("nonexistent");
    expect(league).toBeNull();
  });

  it("getByAccessCode returns league when code matches", async () => {
    const league = await leagueRepository.getByAccessCode("ABC123");
    expect(league).not.toBeNull();
    expect(league?.accessCode).toBe("ABC123");
  });
});
