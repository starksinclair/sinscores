import { z } from "zod";

export const addGameSchema = z
  .object({
    homeTeamId: z.string().min(1, "Home team required"),
    awayTeamId: z.string().min(1, "Away team required"),
    playedAt: z.string().min(1, "Date and time required"),
  })
  .refine((data) => data.homeTeamId !== data.awayTeamId, {
    message: "Home and away teams must be different",
    path: ["awayTeamId"],
  });
