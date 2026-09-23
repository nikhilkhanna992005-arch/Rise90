import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  archiveGoal,
  createChallenge,
  createGoal,
  deleteAllChallengeData,
  exportTrackerData,
  getAllGoalProgress,
  getGoalProgressForDate,
  getTrackerState,
  getUserAchievements,
  getUserGoals,
  getWeeklyReviews,
  loginLocalUser,
  registerLocalUser,
  resetCurrentChallenge,
  saveDay,
  saveGoalProgressItem,
  unlockAchievement,
  updateChallengeSettings,
  updateGoal,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { dayInputSchema, settingsSchema, startChallengeSchema } from "./trackerSchemas";

function databaseError(error: unknown): never {
  if (error instanceof TRPCError) throw error;
  const message = error instanceof Error ? error.message : "Could not save your progress. Please try again.";
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  description: z.string().optional(),
  category: z
    .enum([
      "Career",
      "Education",
      "Fitness",
      "Health",
      "Coding",
      "Finance",
      "Personal Growth",
      "Creativity",
      "Other",
    ])
    .default("Personal Growth"),
  type: z.enum(["completion", "numeric", "time", "habit"]).default("completion"),
  targetValue: z.number().min(1).default(1),
  unit: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "weekdays"]).default("daily"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  durationDays: z.number().default(90),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    signup: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
          name: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await registerLocalUser(input.email, input.password, input.name);
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || "",
            expiresInMs: ONE_YEAR_MS,
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return { user, sessionToken };
        } catch (error) {
          return databaseError(error);
        }
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Invalid email address"),
          password: z.string().min(1, "Password is required"),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await loginLocalUser(input.email, input.password);
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.name || "",
            expiresInMs: ONE_YEAR_MS,
          });
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
          return { user, sessionToken };
        } catch (error) {
          return databaseError(error);
        }
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  goals: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserGoals(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
    create: protectedProcedure.input(createGoalSchema).mutation(async ({ ctx, input }) => {
      try {
        return await createGoal(ctx.user.id, input);
      } catch (error) {
        return databaseError(error);
      }
    }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          category: z
            .enum([
              "Career",
              "Education",
              "Fitness",
              "Health",
              "Coding",
              "Finance",
              "Personal Growth",
              "Creativity",
              "Other",
            ])
            .optional(),
          type: z.enum(["completion", "numeric", "time", "habit"]).optional(),
          targetValue: z.number().optional(),
          unit: z.string().optional(),
          frequency: z.enum(["daily", "weekly", "weekdays"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { id, ...updates } = input;
          return await updateGoal(ctx.user.id, id, updates);
        } catch (error) {
          return databaseError(error);
        }
      }),
    archive: protectedProcedure
      .input(z.object({ id: z.number(), isArchived: z.boolean().default(true) }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await archiveGoal(ctx.user.id, input.id, input.isArchived);
        } catch (error) {
          return databaseError(error);
        }
      }),
  }),
  progress: router({
    getDaily: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ ctx, input }) => {
      try {
        return await getGoalProgressForDate(ctx.user.id, input.date);
      } catch (error) {
        return databaseError(error);
      }
    }),
    saveItem: protectedProcedure
      .input(
        z.object({
          goalId: z.number(),
          date: z.string(),
          currentValue: z.number(),
          completed: z.boolean().optional(),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        try {
          return await saveGoalProgressItem(
            ctx.user.id,
            input.goalId,
            input.date,
            input.currentValue,
            input.completed,
            input.notes,
          );
        } catch (error) {
          return databaseError(error);
        }
      }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getAllGoalProgress(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
  }),
  achievements: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getUserAchievements(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
    unlock: protectedProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
      try {
        return await unlockAchievement(ctx.user.id, input.key);
      } catch (error) {
        return databaseError(error);
      }
    }),
  }),
  weeklyReviews: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getWeeklyReviews(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
  }),
  tracker: router({
    state: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getTrackerState(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
    start: protectedProcedure.input(startChallengeSchema).mutation(async ({ ctx, input }) => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        if (input.startDate > today) throw new Error("A challenge cannot start in the future.");
        return await createChallenge(ctx.user.id, input.startDate, input.leetcodeTarget);
      } catch (error) {
        return databaseError(error);
      }
    }),
    saveDay: protectedProcedure.input(dayInputSchema).mutation(async ({ ctx, input }) => {
      try {
        return await saveDay(ctx.user.id, input);
      } catch (error) {
        return databaseError(error);
      }
    }),
    updateSettings: protectedProcedure.input(settingsSchema).mutation(async ({ ctx, input }) => {
      try {
        return await updateChallengeSettings(ctx.user.id, input.startDate, input.leetcodeTarget);
      } catch (error) {
        return databaseError(error);
      }
    }),
    exportData: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await exportTrackerData(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
    reset: protectedProcedure.input(z.object({ confirmed: z.literal(true) })).mutation(async ({ ctx }) => {
      try {
        return await resetCurrentChallenge(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
    deleteAll: protectedProcedure.input(z.object({ confirmed: z.literal(true) })).mutation(async ({ ctx }) => {
      try {
        return await deleteAllChallengeData(ctx.user.id);
      } catch (error) {
        return databaseError(error);
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;

