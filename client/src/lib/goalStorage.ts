import { toDateKey } from "@shared/tracker";

export type GoalCategory = "Career" | "Education" | "Fitness" | "Health" | "Coding" | "Finance" | "Personal Growth" | "Relationships" | "Creativity" | "Other";
export type GoalType = "Completion" | "Numeric" | "Time-based" | "Habit";
export type GoalPriority = "Low" | "Medium" | "High";

export type PersonalGoal = {
  id: string;
  name: string;
  category: GoalCategory;
  description: string;
  targetType: GoalType;
  target: number;
  unit: string;
  frequency: "Daily" | "Weekly" | "Custom";
  priority: GoalPriority;
  color: string;
  createdAt: string;
  archived: boolean;
  progress: Record<string, number>;
};

const palette = ["#d9ff3e", "#8291ff", "#ff8e6e", "#6ee7c8", "#d9a6ff"];
const keyFor = (userId: number | string, challengeId: number | string) => `rise90:goals:${userId}:${challengeId}`;
const today = () => toDateKey(new Date());

const starterGoals = (): PersonalGoal[] => [
  { id: "starter-web", name: "Learn Web Development", category: "Coding", description: "Build practical skills through focused practice.", targetType: "Time-based", target: 2, unit: "hours", frequency: "Daily", priority: "High", color: palette[0], createdAt: new Date().toISOString(), archived: false, progress: {} },
  { id: "starter-reading", name: "Read consistently", category: "Personal Growth", description: "Make space for ideas every day.", targetType: "Numeric", target: 20, unit: "pages", frequency: "Daily", priority: "Medium", color: palette[1], createdAt: new Date().toISOString(), archived: false, progress: {} },
  { id: "starter-movement", name: "Move your body", category: "Fitness", description: "Show up for a stronger, healthier you.", targetType: "Habit", target: 1, unit: "session", frequency: "Daily", priority: "High", color: palette[2], createdAt: new Date().toISOString(), archived: false, progress: {} },
];

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadGoals(userId: number | string, challengeId: number | string): PersonalGoal[] {
  if (!canUseStorage()) return starterGoals();
  try {
    const raw = window.localStorage.getItem(keyFor(userId, challengeId));
    if (!raw) {
      const initial = starterGoals();
      window.localStorage.setItem(keyFor(userId, challengeId), JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as PersonalGoal[];
    return Array.isArray(parsed) ? parsed : starterGoals();
  } catch {
    return starterGoals();
  }
}

export function saveGoals(userId: number | string, challengeId: number | string, goals: PersonalGoal[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(keyFor(userId, challengeId), JSON.stringify(goals));
}

export function createGoal(input: Pick<PersonalGoal, "name" | "category" | "description" | "targetType" | "target" | "unit" | "frequency" | "priority">): PersonalGoal {
  return { ...input, id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, color: palette[Math.floor(Math.random() * palette.length)], createdAt: new Date().toISOString(), archived: false, progress: {} };
}

export function progressValue(goal: PersonalGoal, date = today()) {
  return goal.progress[date] ?? 0;
}

export function goalPercent(goal: PersonalGoal, date = today()) {
  return Math.min(100, Math.round((progressValue(goal, date) / Math.max(goal.target, 1)) * 100));
}

export function updateGoalProgress(goal: PersonalGoal, value: number, date = today()): PersonalGoal {
  return { ...goal, progress: { ...goal.progress, [date]: Math.max(0, value) } };
}

export function goalStats(goal: PersonalGoal) {
  const values = Object.values(goal.progress);
  const completed = values.filter(value => value >= goal.target).length;
  const partial = values.filter(value => value > 0 && value < goal.target).length;
  const total = values.reduce((sum, value) => sum + value, 0);
  return { completed, partial, total, consistency: values.length ? Math.round((completed / values.length) * 100) : 0 };
}

export function riseScore(goals: PersonalGoal[], challengePercent: number, currentStreak: number, longestStreak: number) {
  const goalConsistency = goals.length ? goals.reduce((sum, goal) => sum + goalStats(goal).consistency, 0) / goals.length : 0;
  const consistencyScore = Math.min(250, Math.round(goalConsistency * 2.5));
  const completionScore = Math.round(Math.min(100, challengePercent) * 4);
  const streakScore = Math.min(200, currentStreak * 8 + longestStreak * 2);
  const difficultyScore = Math.min(150, goals.reduce((sum, goal) => sum + (goal.priority === "High" ? 30 : goal.priority === "Medium" ? 20 : 10), 0));
  return Math.min(1000, completionScore + consistencyScore + streakScore + difficultyScore);
}
