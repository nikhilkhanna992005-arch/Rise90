import { z } from "zod";

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates");

export const problemSchema = z.object({
  problemNumber: z.string().trim().max(32).optional().default(""),
  problemName: z.string().trim().max(180).optional().default(""),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("easy"),
  url: z.string().trim().url().max(1024).or(z.literal("")).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  completed: z.boolean(),
});

export const dayInputSchema = z.object({
  date: dateKey,
  webDevCompleted: z.boolean(),
  gymCompleted: z.boolean(),
  leetcodeCount: z.number().int().min(0).max(100),
  studyMinutes: z.number().int().min(0).max(1440),
  gymDurationMinutes: z.number().int().min(0).max(1440),
  journal: z.string().trim().max(5000),
  webDevLog: z.object({
    topic: z.string().trim().max(180).optional().default(""),
    project: z.string().trim().max(180).optional().default(""),
    notes: z.string().trim().max(3000).optional().default(""),
  }).optional(),
  gymLog: z.object({
    workoutType: z.string().trim().max(100).optional().default(""),
    exercises: z.string().trim().max(3000).optional().default(""),
    notes: z.string().trim().max(3000).optional().default(""),
  }).optional(),
  problems: z.array(problemSchema).max(30),
});

export const startChallengeSchema = z.object({
  startDate: dateKey,
  leetcodeTarget: z.number().int().min(1).max(25).default(5),
});

export const settingsSchema = startChallengeSchema;
