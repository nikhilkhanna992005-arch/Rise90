import { describe, expect, it } from "vitest";
import {
  buildProgressSeries,
  buildWeekTotals,
  calculateAnalytics,
  getChallengeDay,
  getDailyScore,
} from "../shared/tracker";

const challenge = { startDate: "2026-08-01", leetcodeTarget: 5 };
const records = [
  { date: "2026-08-01", webDevCompleted: true, leetcodeCount: 5, gymCompleted: true },
  { date: "2026-08-02", webDevCompleted: true, leetcodeCount: 3, gymCompleted: true },
  { date: "2026-08-03", webDevCompleted: true, leetcodeCount: 5, gymCompleted: true },
];

describe("tracker calculations", () => {
  it("scores only a completed LeetCode target", () => {
    expect(getDailyScore(records[1], 5)).toBe(2);
    expect(getDailyScore(records[0], 5)).toBe(3);
  });

  it("calculates cumulative actual performance, partial days, and streak breaks", () => {
    const summary = calculateAnalytics(challenge, records, "2026-08-03");
    expect(summary.totalPoints).toBe(8);
    expect(summary.performancePercent).toBe(88.9);
    expect(summary.successfulDays).toBe(2);
    expect(summary.partialDays).toBe(1);
    expect(summary.currentStreak).toBe(1);
    expect(summary.longestStreak).toBe(1);
  });

  it("builds chart points from actual daily results rather than elapsed time", () => {
    const chart = buildProgressSeries(challenge, records, "2026-08-03");
    expect(chart.map(point => point.actual)).toEqual([100, 83.3, 88.9]);
    expect(chart.map(point => point.dailyScore)).toEqual([3, 2, 3]);
  });

  it("groups real progress into weekly point totals", () => {
    const weeks = buildWeekTotals(challenge, records, "2026-08-03");
    expect(weeks).toEqual([{ week: "Week 1", points: 8, maximum: 9 }]);
  });

  it("calculates the current challenge day from the configured start date", () => {
    expect(getChallengeDay(challenge, "2026-08-01")).toBe(1);
    expect(getChallengeDay(challenge, "2026-08-09")).toBe(9);
  });
});
