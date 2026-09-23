import {
  CHALLENGE_LENGTH,
  addDays,
  buildProgressSeries,
  buildWeekTotals,
  calculateAnalytics,
  getChallengeDay,
  getDailyScore,
  toDateKey,
} from "@shared/tracker";

export type ChallengeData = {
  id: number;
  startDate: Date;
  endDate: Date;
  leetcodeTarget: number;
  status: "active" | "completed" | "archived";
};

export type DayRecord = {
  id: number;
  date: Date;
  webDevCompleted: boolean;
  gymCompleted: boolean;
  leetcodeCount: number;
  studyMinutes: number;
  gymDurationMinutes: number;
  journal: string | null;
};

export type ProblemRecord = {
  id: number;
  dailyProgressId: number;
  problemNumber: string | null;
  problemName: string | null;
  difficulty: "easy" | "medium" | "hard";
  url: string | null;
  notes: string | null;
  completed: boolean;
};

export type WebLog = { id: number; dailyProgressId: number; topic: string | null; project: string | null; notes: string | null };
export type GymLog = { id: number; dailyProgressId: number; workoutType: string | null; exercises: string | null; notes: string | null };

export type GoalRecord = {
  id: number;
  userId: number;
  challengeId: number;
  name: string;
  description?: string | null;
  category: string;
  type: string;
  targetValue: number;
  unit?: string | null;
  frequency: string;
  priority: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GoalProgressRecord = {
  id: number;
  goalId: number;
  userId: number;
  challengeId: number;
  date: Date;
  completed: boolean;
  currentValue: number;
  targetValue: number;
  notes?: string | null;
};

export type TrackerState = {
  challenge: ChallengeData | null;
  records: DayRecord[];
  problems: ProblemRecord[];
  webLogs: WebLog[];
  gymLogs: GymLog[];
  goals?: GoalRecord[];
  goalProgress?: GoalProgressRecord[];
};

export const todayKey = () => toDateKey(new Date());
export const formatDate = (value: Date | string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) => new Intl.DateTimeFormat(undefined, options).format(new Date(value));
export const formatDuration = (minutes: number) => minutes ? `${Math.floor(minutes / 60) ? `${Math.floor(minutes / 60)}h ` : ""}${minutes % 60 ? `${minutes % 60}m` : ""}`.trim() : "—";

export function stateForDay(state: TrackerState, dateKey: string) {
  const record = state.records.find(item => toDateKey(item.date) === dateKey) ?? null;
  return {
    record,
    problems: record ? state.problems.filter(item => item.dailyProgressId === record.id) : [],
    webLog: record ? state.webLogs.find(item => item.dailyProgressId === record.id) ?? null : null,
    gymLog: record ? state.gymLogs.find(item => item.dailyProgressId === record.id) ?? null : null,
  };
}

/**
 * Produces a primitive dependency for DailyEditor hydration. stateForDay() creates
 * filtered arrays on each render, so the editor must not depend on those arrays
 * directly inside a state-setting effect.
 */
export function dailyEditorSyncSignature(state: TrackerState, dateKey: string) {
  const selected = stateForDay(state, dateKey);
  return JSON.stringify({
    record: selected.record ? {
      id: selected.record.id,
      webDevCompleted: selected.record.webDevCompleted,
      gymCompleted: selected.record.gymCompleted,
      leetcodeCount: selected.record.leetcodeCount,
      studyMinutes: selected.record.studyMinutes,
      gymDurationMinutes: selected.record.gymDurationMinutes,
      journal: selected.record.journal,
    } : null,
    problems: selected.problems.map(problem => ({
      id: problem.id,
      problemNumber: problem.problemNumber,
      problemName: problem.problemName,
      difficulty: problem.difficulty,
      url: problem.url,
      notes: problem.notes,
      completed: problem.completed,
    })),
    webLog: selected.webLog ? { id: selected.webLog.id, topic: selected.webLog.topic, project: selected.webLog.project, notes: selected.webLog.notes } : null,
    gymLog: selected.gymLog ? { id: selected.gymLog.id, workoutType: selected.gymLog.workoutType, exercises: selected.gymLog.exercises, notes: selected.gymLog.notes } : null,
  });
}

export function trackerView(state: TrackerState) {
  if (!state.challenge) return null;
  const today = todayKey();
  const analytics = calculateAnalytics(state.challenge, state.records, today);
  const series = buildProgressSeries(state.challenge, state.records, today);
  const weeks = buildWeekTotals(state.challenge, state.records, today);
  const currentDay = getChallengeDay(state.challenge, today);
  const todayState = stateForDay(state, today);
  const target = state.challenge.leetcodeTarget;
  const webPercent = Math.round((analytics.webDevDays / CHALLENGE_LENGTH) * 100);
  const leetcodePercent = Math.round((analytics.totalLeetcode / (CHALLENGE_LENGTH * target)) * 100);
  const gymPercent = Math.round((analytics.gymDays / CHALLENGE_LENGTH) * 100);
  return { today, analytics, series, weeks, currentDay, todayState, target, webPercent, leetcodePercent, gymPercent };
}

export function allChallengeDates(challenge: ChallengeData) {
  return Array.from({ length: CHALLENGE_LENGTH }, (_, index) => addDays(challenge.startDate, index));
}

export function isFutureChallengeDate(challenge: ChallengeData, dateKey: string) {
  return dateKey > todayKey() || dateKey > toDateKey(challenge.endDate);
}

export function scoreForDate(state: TrackerState, dateKey: string) {
  const record = state.records.find(item => toDateKey(item.date) === dateKey);
  return record ? getDailyScore(record, state.challenge?.leetcodeTarget ?? 5) : 0;
}
