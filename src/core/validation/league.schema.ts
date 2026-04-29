import { z } from "zod";

export const leagueInfoSchema = z.object({
  name: z.string().min(3, "Min 3 characters").max(50, "Max 50 characters"),
  season: z.string().min(2, "Season required"),
  description: z.string().max(200).optional(),
});

export const teamNameSchema = z
  .string()
  .min(2, "Min 2 characters")
  .max(30, "Max 30 characters");

export const accessCodeSchema = z
  .string()
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z]{2}$/, "Invalid code format");
