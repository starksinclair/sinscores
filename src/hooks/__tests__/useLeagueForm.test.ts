import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLeagueForm } from "../useLeagueForm";

describe("useLeagueForm", () => {
  it("step 1 blocks progression if name < 3 chars", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => {
      result.current.updateForm({ name: "ab", season: "2025" });
    });
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(1);
  });

  it("step 1 blocks progression if season empty", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => {
      result.current.updateForm({ name: "Spring League", season: "" });
    });
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(1);
  });

  it("step 1 allows progression when valid", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => {
      result.current.updateForm({ name: "Spring League", season: "2025" });
    });
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(2);
  });

  it("step 2 blocks progression if fewer than 2 teams", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => {
      result.current.updateForm({ name: "League", season: "2025" });
    });
    act(() => result.current.nextStep());
    act(() => result.current.addTeam("Team A"));
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(2);
  });

  it("addTeam rejects duplicate names (case insensitive)", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => result.current.addTeam("Thunder FC"));
    let duplicateResult: boolean = true;
    act(() => {
      duplicateResult = result.current.addTeam("thunder fc");
    });
    expect(duplicateResult).toBe(false);
    expect(result.current.formData.teams).toHaveLength(1);
  });

  it("addTeam rejects names shorter than 2 chars", () => {
    const { result } = renderHook(() => useLeagueForm());
    let ok = true;
    act(() => {
      ok = result.current.addTeam("A");
    });
    expect(ok).toBe(false);
  });

  it("removeTeam removes correct team", () => {
    const { result } = renderHook(() => useLeagueForm());
    act(() => {
      result.current.addTeam("Team A");
      result.current.addTeam("Team B");
    });
    expect(result.current.formData.teams).toHaveLength(2);
    act(() => result.current.removeTeam("Team A"));
    expect(result.current.formData.teams).toEqual(["Team B"]);
  });
});
