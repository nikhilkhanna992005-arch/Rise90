export const CHALLENGE_LENGTH = 90;
export const DEFAULT_LEETCODE_TARGET = 5;

export type ProgressLike = {
  date: Date | string;
  webDevCompleted: boolean;
  gymCompleted: boolean;
  leetcodeCount: number;
};

export type ChallengeLike = {
  startDate: Date | string;
  leetcodeTarget: number;
};

export function toDateKey(value: Date | string): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}

export function dateFromKey(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Date must use YYYY-MM-DD format");
  return new Date(`${value}T00:00:00.000Z`);
}

export function addDays(value: Date | string, count: number): Date {
  const date = dateFromKey(toDateKey(value));
  date.setUTCDate(date.getUTCDate() + count);
  return date;
}

export function differenceInDays(later: Date | string, earlier: Date | string): number {
  return Math.floor((dateFromKey(toDateKey(later)).getTime() - dateFromKey(toDateKey(earlier)).getTime()) / 86_400_000);
}

export function getChallengeDay(challenge: ChallengeLike, date: Date | string): number {
  return differenceInDays(date, challenge.startDate) + 1;
}

export function getDailyScore(record: ProgressLike, target = DEFAULT_LEETCODE_TARGET): number {
  return Number(record.webDevCompleted) + Number(record.leetcodeCount >= target) + Number(record.gymCompleted);
}

export function isSuccessfulDay(record: ProgressLike, target = DEFAULT_LEETCODE_TARGET): boolean {
  return getDailyScore(record, target) === 3;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getDateRecordMap(records: ProgressLike[]): Map<string, ProgressLike> {
  return new Map(records.map(record => [toDateKey(record.date), record]));
}

export type AnalyticsSummary = {
  elapsedDays: number;
  daysRemaining: number;
  totalPoints: number;
  maximumAvailablePoints: number;
  performancePercent: number;
  totalChallengePercent: number;
  successfulDays: number;
  partialDays: number;
  missedDays: number;
  currentStreak: number;
  longestStreak: number;
  webDevDays: number;
  gymDays: number;
  totalLeetcode: number;
};

export function calculateAnalytics(
  challenge: ChallengeLike,
  records: ProgressLike[],
  today: Date | string,
): AnalyticsSummary {
  const challengeDay = getChallengeDay(challenge, today);
  const elapsedDays = clamp(challengeDay, 0, CHALLENGE_LENGTH);
  const recordMap = getDateRecordMap(records);
  const target = challenge.leetcodeTarget || DEFAULT_LEETCODE_TARGET;
  let totalPoints = 0;
  let successfulDays = 0;
  let partialDays = 0;
  let missedDays = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let webDevDays = 0;
  let gymDays = 0;
  let totalLeetcode = 0;

  for (let offset = 0; offset < elapsedDays; offset += 1) {
    const date = addDays(challenge.startDate, offset);
    const record = recordMap.get(toDateKey(date));
    const score = record ? getDailyScore(record, target) : 0;
    totalPoints += score;
    if (record?.webDevCompleted) webDevDays += 1;
    if (record?.gymCompleted) gymDays += 1;
    totalLeetcode += record?.leetcodeCount ?? 0;
    if (score === 3) {
      successfulDays += 1;
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      if (score === 0) missedDays += 1;
      else partialDays += 1;
      runningStreak = 0;
    }
  }

  currentStreak = runningStreak;
  const maximumAvailablePoints = elapsedDays * 3;
  return {
    elapsedDays,
    daysRemaining: Math.max(CHALLENGE_LENGTH - elapsedDays, 0),
    totalPoints,
    maximumAvailablePoints,
    performancePercent: maximumAvailablePoints ? formatPercent((totalPoints / maximumAvailablePoints) * 100) : 0,
    totalChallengePercent: formatPercent((totalPoints / (CHALLENGE_LENGTH * 3)) * 100),
    successfulDays,
    partialDays,
    missedDays,
    currentStreak,
    longestStreak,
    webDevDays,
    gymDays,
    totalLeetcode,
  };
}

export type ChartPoint = {
  day: number;
  date: string;
  actual: number;
  ideal: number;
  dailyScore: number;
  currentStreak: number;
};

export function buildProgressSeries(
  challenge: ChallengeLike,
  records: ProgressLike[],
  throughDate: Date | string,
): ChartPoint[] {
  const elapsedDays = clamp(getChallengeDay(challenge, throughDate), 0, CHALLENGE_LENGTH);
  const target = challenge.leetcodeTarget || DEFAULT_LEETCODE_TARGET;
  const recordMap = getDateRecordMap(records);
  let totalPoints = 0;
  let streak = 0;

  return Array.from({ length: elapsedDays }, (_, index) => {
    const date = addDays(challenge.startDate, index);
    const record = recordMap.get(toDateKey(date));
    const dailyScore = record ? getDailyScore(record, target) : 0;
    totalPoints += dailyScore;
    streak = dailyScore === 3 ? streak + 1 : 0;
    return {
      day: index + 1,
      date: toDateKey(date),
      actual: formatPercent((totalPoints / ((index + 1) * 3)) * 100),
      ideal: formatPercent(((index + 1) / CHALLENGE_LENGTH) * 100),
      dailyScore,
      currentStreak: streak,
    };
  });
}

export function buildWeekTotals(challenge: ChallengeLike, records: ProgressLike[], throughDate: Date | string) {
  const series = buildProgressSeries(challenge, records, throughDate);
  const weekCount = Math.ceil(series.length / 7);
  return Array.from({ length: weekCount }, (_, index) => {
    const points = series.slice(index * 7, index * 7 + 7).reduce((sum, entry) => sum + entry.dailyScore, 0);
    return { week: `Week ${index + 1}`, points, maximum: Math.min(7, series.length - index * 7) * 3 };
  });
}
