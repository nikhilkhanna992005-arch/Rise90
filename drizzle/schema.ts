import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const challenges = mysqlTable(
  "challenges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    leetcodeTarget: int("leetcodeTarget").notNull().default(5),
    status: mysqlEnum("status", ["active", "completed", "archived"]).notNull().default("active"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("challenges_user_status_idx").on(table.userId, table.status)],
);

export const goals = mysqlTable(
  "goals",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", [
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
      .notNull()
      .default("Personal Growth"),
    type: mysqlEnum("type", ["completion", "numeric", "time", "habit"]).notNull().default("completion"),
    targetValue: int("targetValue").notNull().default(1),
    unit: varchar("unit", { length: 50 }),
    frequency: mysqlEnum("frequency", ["daily", "weekly", "weekdays"]).notNull().default("daily"),
    priority: mysqlEnum("priority", ["low", "medium", "high"]).notNull().default("medium"),
    startDate: timestamp("startDate"),
    durationDays: int("durationDays").notNull().default(90),
    isArchived: boolean("isArchived").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("goals_user_challenge_idx").on(table.userId, table.challengeId),
    index("goals_user_archived_idx").on(table.userId, table.isArchived),
  ],
);

export const goalProgress = mysqlTable(
  "goalProgress",
  {
    id: int("id").autoincrement().primaryKey(),
    goalId: int("goalId").notNull().references(() => goals.id, { onDelete: "cascade" }),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    completed: boolean("completed").notNull().default(false),
    currentValue: int("currentValue").notNull().default(0),
    targetValue: int("targetValue").notNull().default(1),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("goalProgress_goal_date_unique").on(table.goalId, table.date),
    index("goalProgress_user_date_idx").on(table.userId, table.date),
    index("goalProgress_challenge_date_idx").on(table.challengeId, table.date),
  ],
);

export const userAchievements = mysqlTable(
  "userAchievements",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    achievementKey: varchar("achievementKey", { length: 64 }).notNull(),
    unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("userAchievements_user_key_unique").on(table.userId, table.achievementKey)],
);

export const weeklyReviews = mysqlTable(
  "weeklyReviews",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    weekNumber: int("weekNumber").notNull(),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    overallPercent: int("overallPercent").notNull().default(0),
    summaryText: text("summaryText"),
    recommendationsJson: text("recommendationsJson"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [uniqueIndex("weeklyReviews_user_challenge_week_unique").on(table.userId, table.challengeId, table.weekNumber)],
);

export const dailyProgress = mysqlTable(
  "dailyProgress",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    webDevCompleted: boolean("webDevCompleted").notNull().default(false),
    gymCompleted: boolean("gymCompleted").notNull().default(false),
    leetcodeCount: int("leetcodeCount").notNull().default(0),
    studyMinutes: int("studyMinutes").notNull().default(0),
    gymDurationMinutes: int("gymDurationMinutes").notNull().default(0),
    journal: text("journal"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("dailyProgress_challenge_date_unique").on(table.challengeId, table.date),
    index("dailyProgress_challenge_date_idx").on(table.challengeId, table.date),
  ],
);

export const leetcodeProblems = mysqlTable(
  "leetcodeProblems",
  {
    id: int("id").autoincrement().primaryKey(),
    dailyProgressId: int("dailyProgressId").notNull().references(() => dailyProgress.id, { onDelete: "cascade" }),
    problemNumber: varchar("problemNumber", { length: 32 }),
    problemName: varchar("problemName", { length: 180 }),
    difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).notNull().default("easy"),
    url: varchar("url", { length: 1024 }),
    notes: text("notes"),
    completed: boolean("completed").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("leetcodeProblems_daily_idx").on(table.dailyProgressId)],
);

export const webDevLogs = mysqlTable(
  "webDevLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    dailyProgressId: int("dailyProgressId").notNull().references(() => dailyProgress.id, { onDelete: "cascade" }),
    topic: varchar("topic", { length: 180 }),
    project: varchar("project", { length: 180 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("webDevLogs_daily_idx").on(table.dailyProgressId)],
);

export const gymLogs = mysqlTable(
  "gymLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    dailyProgressId: int("dailyProgressId").notNull().references(() => dailyProgress.id, { onDelete: "cascade" }),
    workoutType: varchar("workoutType", { length: 100 }),
    exercises: text("exercises"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("gymLogs_daily_idx").on(table.dailyProgressId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = typeof goals.$inferInsert;
export type GoalProgress = typeof goalProgress.$inferSelect;
export type InsertGoalProgress = typeof goalProgress.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;
export type DailyProgress = typeof dailyProgress.$inferSelect;
