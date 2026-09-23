import { pbkdf2Sync, randomBytes } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  challenges,
  dailyProgress,
  goalProgress,
  goals,
  gymLogs,
  InsertGoal,
  InsertUser,
  leetcodeProblems,
  userAchievements,
  users,
  webDevLogs,
  weeklyReviews,
} from "../drizzle/schema";
import { addDays, dateFromKey, toDateKey } from "../shared/tracker";
import { ENV } from "./_core/env";
import type { z } from "zod";
import type { dayInputSchema } from "./trackerSchemas";

let _db: ReturnType<typeof drizzle> | null = null;
type DayInput = z.infer<typeof dayInputSchema>;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combined: string): boolean {
  const [salt, storedHash] = combined.split(":");
  if (!salt || !storedHash) return false;
  const hash = pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return storedHash === hash;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable. Please try again shortly.");
  return db;
}

export async function registerLocalUser(email: string, password: string, name?: string) {
  const db = await requireDb();
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    throw new Error("An account with this email already exists.");
  }
  const passwordHash = hashPassword(password);
  const openId = `local_${randomBytes(16).toString("hex")}`;
  const values: InsertUser = {
    openId,
    email,
    name: name || email.split("@")[0],
    passwordHash,
    loginMethod: "local",
    lastSignedIn: new Date(),
  };
  const result = await db.insert(users).values(values);
  const insertId = Number(result[0].insertId);
  const rows = await db.select().from(users).where(eq(users.id, insertId)).limit(1);
  const user = rows[0];

  // Auto-create initial 90-day challenge for new local user
  if (user) {
    const today = toDateKey(new Date());
    await createChallenge(user.id, today, 5);
  }

  return user;
}

export async function loginLocalUser(email: string, password: string) {
  const db = await requireDb();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Invalid email or password.");
  }
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
  return user;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: values.lastSignedIn };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getCurrentChallenge(userId: number) {
  const db = await requireDb();
  const result = await db
    .select()
    .from(challenges)
    .where(and(eq(challenges.userId, userId), eq(challenges.status, "active")))
    .orderBy(desc(challenges.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function createChallenge(userId: number, startDate: string, leetcodeTarget: number) {
  const db = await requireDb();
  const start = dateFromKey(startDate);
  const end = addDays(start, 89);
  await db.update(challenges).set({ status: "archived" }).where(and(eq(challenges.userId, userId), eq(challenges.status, "active")));
  const result = await db.insert(challenges).values({ userId, startDate: start, endDate: end, leetcodeTarget, status: "active" });
  const id = Number(result[0].insertId);
  const rows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  return rows[0];
}

export async function getUserGoals(userId: number, challengeId?: number) {
  const db = await requireDb();
  let targetChallengeId = challengeId;
  if (!targetChallengeId) {
    const active = await getCurrentChallenge(userId);
    if (active) targetChallengeId = active.id;
  }
  if (!targetChallengeId) return [];

  return db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.challengeId, targetChallengeId), eq(goals.isArchived, false)))
    .orderBy(desc(goals.createdAt));
}

export async function createGoal(userId: number, input: Omit<InsertGoal, "userId" | "challengeId">) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) throw new Error("An active challenge is required to create a goal.");

  const values: InsertGoal = {
    ...input,
    userId,
    challengeId: challenge.id,
  };

  const result = await db.insert(goals).values(values);
  const insertId = Number(result[0].insertId);
  const rows = await db.select().from(goals).where(eq(goals.id, insertId)).limit(1);
  return rows[0];
}

export async function updateGoal(userId: number, goalId: number, input: Partial<InsertGoal>) {
  const db = await requireDb();
  await db.update(goals).set({ ...input, updatedAt: new Date() }).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  const rows = await db.select().from(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId))).limit(1);
  return rows[0];
}

export async function archiveGoal(userId: number, goalId: number, isArchived = true) {
  const db = await requireDb();
  await db.update(goals).set({ isArchived, updatedAt: new Date() }).where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  return { success: true };
}

export async function getGoalProgressForDate(userId: number, dateKey: string) {
  const db = await requireDb();
  const date = dateFromKey(dateKey);
  return db.select().from(goalProgress).where(and(eq(goalProgress.userId, userId), eq(goalProgress.date, date)));
}

export async function saveGoalProgressItem(
  userId: number,
  goalId: number,
  dateKey: string,
  currentValue: number,
  completed?: boolean,
  notes?: string,
) {
  const db = await requireDb();
  const goalRows = await db.select().from(goals).where(and(eq(goals.id, goalId), eq(goals.userId, userId))).limit(1);
  const goal = goalRows[0];
  if (!goal) throw new Error("Goal not found or unauthorized.");

  const date = dateFromKey(dateKey);
  const isCompleted = completed ?? currentValue >= goal.targetValue;

  await db
    .insert(goalProgress)
    .values({
      goalId,
      userId,
      challengeId: goal.challengeId,
      date,
      currentValue,
      targetValue: goal.targetValue,
      completed: isCompleted,
      notes: notes || null,
    })
    .onDuplicateKeyUpdate({
      set: {
        currentValue,
        completed: isCompleted,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

  const rows = await db
    .select()
    .from(goalProgress)
    .where(and(eq(goalProgress.goalId, goalId), eq(goalProgress.date, date)))
    .limit(1);
  return rows[0];
}

export async function getAllGoalProgress(userId: number, challengeId?: number) {
  const db = await requireDb();
  let targetChallengeId = challengeId;
  if (!targetChallengeId) {
    const active = await getCurrentChallenge(userId);
    if (active) targetChallengeId = active.id;
  }
  if (!targetChallengeId) return [];

  return db.select().from(goalProgress).where(and(eq(goalProgress.userId, userId), eq(goalProgress.challengeId, targetChallengeId)));
}

export async function getUserAchievements(userId: number) {
  const db = await requireDb();
  const rows = await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  return rows.map(r => r.achievementKey);
}

export async function unlockAchievement(userId: number, achievementKey: string) {
  const db = await requireDb();
  await db.insert(userAchievements).values({ userId, achievementKey }).onDuplicateKeyUpdate({ set: { unlockedAt: new Date() } });
  return getUserAchievements(userId);
}

export async function getWeeklyReviews(userId: number) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) return [];
  return db
    .select()
    .from(weeklyReviews)
    .where(and(eq(weeklyReviews.userId, userId), eq(weeklyReviews.challengeId, challenge.id)))
    .orderBy(desc(weeklyReviews.weekNumber));
}

export async function getTrackerState(userId: number) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) return { challenge: null, records: [], problems: [], webLogs: [], gymLogs: [], goals: [], goalProgress: [] };

  const [records, userGoals, userProgressList] = await Promise.all([
    db.select().from(dailyProgress).where(eq(dailyProgress.challengeId, challenge.id)).orderBy(dailyProgress.date),
    db.select().from(goals).where(and(eq(goals.userId, userId), eq(goals.challengeId, challenge.id), eq(goals.isArchived, false))),
    db.select().from(goalProgress).where(and(eq(goalProgress.userId, userId), eq(goalProgress.challengeId, challenge.id))),
  ]);

  const ids = records.map(record => record.id);
  if (!ids.length) return { challenge, records, problems: [], webLogs: [], gymLogs: [], goals: userGoals, goalProgress: userProgressList };

  const [problems, webLogs, gymLogRows] = await Promise.all([
    db.select().from(leetcodeProblems).where(inArray(leetcodeProblems.dailyProgressId, ids)),
    db.select().from(webDevLogs).where(inArray(webDevLogs.dailyProgressId, ids)),
    db.select().from(gymLogs).where(inArray(gymLogs.dailyProgressId, ids)),
  ]);

  return { challenge, records, problems, webLogs, gymLogs: gymLogRows, goals: userGoals, goalProgress: userProgressList };
}

export async function saveDay(userId: number, input: DayInput) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) throw new Error("Start a challenge before saving progress.");
  const date = dateFromKey(input.date);
  const start = toDateKey(challenge.startDate);
  const end = toDateKey(challenge.endDate);
  const today = toDateKey(new Date());
  if (input.date < start || input.date > end) throw new Error("This date is outside the active challenge.");
  if (input.date > today) throw new Error("Future days are locked to protect your challenge history.");

  await db
    .insert(dailyProgress)
    .values({
      challengeId: challenge.id,
      date,
      webDevCompleted: input.webDevCompleted,
      gymCompleted: input.gymCompleted,
      leetcodeCount: input.leetcodeCount,
      studyMinutes: input.studyMinutes,
      gymDurationMinutes: input.gymDurationMinutes,
      journal: input.journal || null,
    })
    .onDuplicateKeyUpdate({
      set: {
        webDevCompleted: input.webDevCompleted,
        gymCompleted: input.gymCompleted,
        leetcodeCount: input.leetcodeCount,
        studyMinutes: input.studyMinutes,
        gymDurationMinutes: input.gymDurationMinutes,
        journal: input.journal || null,
      },
    });
  const existing = await db
    .select()
    .from(dailyProgress)
    .where(and(eq(dailyProgress.challengeId, challenge.id), eq(dailyProgress.date, date)))
    .limit(1);
  const progress = existing[0];
  if (!progress) throw new Error("Could not save daily progress.");

  await Promise.all([
    db.delete(leetcodeProblems).where(eq(leetcodeProblems.dailyProgressId, progress.id)),
    db.delete(webDevLogs).where(eq(webDevLogs.dailyProgressId, progress.id)),
    db.delete(gymLogs).where(eq(gymLogs.dailyProgressId, progress.id)),
  ]);
  if (input.problems.length) {
    await db.insert(leetcodeProblems).values(input.problems.map(problem => ({ ...problem, dailyProgressId: progress.id, url: problem.url || null, notes: problem.notes || null, problemNumber: problem.problemNumber || null, problemName: problem.problemName || null })));
  }
  if (input.webDevLog && (input.webDevLog.topic || input.webDevLog.project || input.webDevLog.notes)) {
    await db.insert(webDevLogs).values({ dailyProgressId: progress.id, ...input.webDevLog, topic: input.webDevLog.topic || null, project: input.webDevLog.project || null, notes: input.webDevLog.notes || null });
  }
  if (input.gymLog && (input.gymLog.workoutType || input.gymLog.exercises || input.gymLog.notes)) {
    await db.insert(gymLogs).values({ dailyProgressId: progress.id, ...input.gymLog, workoutType: input.gymLog.workoutType || null, exercises: input.gymLog.exercises || null, notes: input.gymLog.notes || null });
  }

  // Also sync with user goalProgress database records for Web Dev, LeetCode, and Gym
  const currentGoals = await getUserGoals(userId, challenge.id);
  const webGoal = currentGoals.find(g => g.name.toLowerCase().includes("web"));
  const leetGoal = currentGoals.find(g => g.name.toLowerCase().includes("leetcode"));
  const gymGoal = currentGoals.find(g => g.name.toLowerCase().includes("gym"));

  if (webGoal) {
    await saveGoalProgressItem(userId, webGoal.id, input.date, input.webDevCompleted ? 2 : 0, input.webDevCompleted);
  }
  if (leetGoal) {
    await saveGoalProgressItem(userId, leetGoal.id, input.date, input.leetcodeCount, input.leetcodeCount >= leetGoal.targetValue);
  }
  if (gymGoal) {
    await saveGoalProgressItem(userId, gymGoal.id, input.date, input.gymCompleted ? 1 : 0, input.gymCompleted);
  }

  return getTrackerState(userId);
}

export async function updateChallengeSettings(userId: number, startDate: string, leetcodeTarget: number) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) throw new Error("No active challenge found.");
  const start = dateFromKey(startDate);
  await db.update(challenges).set({ startDate: start, endDate: addDays(start, 89), leetcodeTarget }).where(eq(challenges.id, challenge.id));
  return getTrackerState(userId);
}

export async function deleteAllChallengeData(userId: number) {
  const db = await requireDb();
  await db.delete(challenges).where(eq(challenges.userId, userId));
  return { success: true } as const;
}

export async function resetCurrentChallenge(userId: number) {
  const db = await requireDb();
  const challenge = await getCurrentChallenge(userId);
  if (!challenge) throw new Error("No active challenge found.");
  await db.delete(challenges).where(eq(challenges.id, challenge.id));
  return { success: true } as const;
}

export async function exportTrackerData(userId: number) {
  return getTrackerState(userId);
}

