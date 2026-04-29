import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useManageAccess } from "../useManageAccess";

// Mock the container/repositories
vi.mock("@/infrastructure/container", () => ({
  repositories: {
    league: {
      getById: vi.fn(),
    },
  },
}));

import { repositories } from "@/infrastructure/container";

describe("useManageAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  });

  it("unlock returns true for correct code", async () => {
    vi.mocked(repositories.league.getById).mockResolvedValue({
      leagueId: "l1",
      name: "League",
      season: "2025",
      accessCode: "AB12CD",
      createdAt: "",
    });

    const { result } = renderHook(() => useManageAccess("l1"));
    let ok = false;
    await act(async () => {
      ok = await result.current.unlock("AB12CD");
    });
    expect(ok).toBe(true);
  });

  it("unlock returns false for wrong code", async () => {
    vi.mocked(repositories.league.getById).mockResolvedValue({
      leagueId: "l1",
      name: "League",
      season: "2025",
      accessCode: "AB12CD",
      createdAt: "",
    });

    const { result } = renderHook(() => useManageAccess("l1"));
    let ok = true;
    await act(async () => {
      ok = await result.current.unlock("WRONG1");
    });
    expect(ok).toBe(false);
  });

  it("isUnlocked returns true after successful unlock", async () => {
    vi.mocked(repositories.league.getById).mockResolvedValue({
      leagueId: "l1",
      name: "League",
      season: "2025",
      accessCode: "AB12CD",
      createdAt: "",
    });

    const { result } = renderHook(() => useManageAccess("l1"));
    await act(async () => {
      await result.current.unlock("AB12CD");
    });
    expect(result.current.isUnlocked).toBe(true);
  });

  it("lock clears sessionStorage", async () => {
    vi.mocked(repositories.league.getById).mockResolvedValue({
      leagueId: "l1",
      name: "League",
      season: "2025",
      accessCode: "AB12CD",
      createdAt: "",
    });

    const { result } = renderHook(() => useManageAccess("l1"));
    await act(async () => {
      await result.current.unlock("AB12CD");
    });
    act(() => result.current.lock());
    expect(result.current.isUnlocked).toBe(false);
  });
});
