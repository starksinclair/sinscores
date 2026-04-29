"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useLeagueByAccessCode } from "@/hooks/useLeagues";

const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === "true";

export default function ManagePage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const accessCode = code.join("");
  const { data: league, refetch, isFetching } = useLeagueByAccessCode(accessCode);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const chars = value.slice(0, 6).split("");
      const newCode = [...code];
      chars.forEach((char, i) => {
        if (index + i < 6) newCode[index + i] = char;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = value.toUpperCase();
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
    }
  };

  const handleSubmit = async () => {
    const result = await refetch();
    const leagueData = result.data;
    if (leagueData) {
      if (isProduction) {
        const res = await fetch("/api/manage/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leagueId: leagueData.leagueId, code: accessCode }),
        });
        const data = (await res.json()) as { success?: boolean; accessCode?: string };
        if (data.success) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`nl_manage_${leagueData.leagueId}`, "unlocked");
            if (data.accessCode) {
              sessionStorage.setItem(`nl_manage_code_${leagueData.leagueId}`, data.accessCode);
            }
          }
        }
      }
      router.push(`/manage/${leagueData.leagueId}`);
    }
  };

  const isValid = accessCode.length === 6;

  return (
    <PageShell title="Admin" hideNav>
      <div className="p-4 max-w-phone mx-auto">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-center mb-2">
              Enter League Code
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              Enter the 6-character access code to manage your league
            </p>
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 dark:border-gray-600 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                />
              ))}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isFetching}
              className="w-full"
            >
              {isFetching ? "Checking..." : "Continue"}
            </Button>
            {accessCode.length === 6 && !league && !isFetching && (
              <p className="text-sm text-red-500 text-center mt-3">
                Invalid code. Please try again.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
