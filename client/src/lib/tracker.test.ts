import { describe, expect, it } from "vitest";
import { dailyEditorSyncSignature, type TrackerState } from "./tracker";

const state: TrackerState = {
  challenge: { id: 1, startDate: new Date("2026-08-01"), endDate: new Date("2026-10-29"), leetcodeTarget: 5, status: "active" },
  records: [{ id: 1, date: new Date("2026-08-18"), webDevCompleted: true, gymCompleted: false, leetcodeCount: 2, studyMinutes: 60, gymDurationMinutes: 0, journal: "Worked on the editor." }],
  problems: [{ id: 1, dailyProgressId: 1, problemNumber: "1", problemName: "Two Sum", difficulty: "easy", url: null, notes: null, completed: true }],
  webLogs: [{ id: 1, dailyProgressId: 1, topic: "React", project: null, notes: null }],
  gymLogs: [],
};

describe("dailyEditorSyncSignature", () => {
  it("stays stable across equivalent renders with newly allocated arrays", () => {
    const repeatedState: TrackerState = { ...state, records: [...state.records], problems: [...state.problems], webLogs: [...state.webLogs], gymLogs: [] };
    expect(dailyEditorSyncSignature(state, "2026-08-18")).toBe(dailyEditorSyncSignature(repeatedState, "2026-08-18"));
  });

  it("changes only when the selected persisted day changes", () => {
    const updated: TrackerState = { ...state, records: [{ ...state.records[0], gymCompleted: true }] };
    expect(dailyEditorSyncSignature(state, "2026-08-18")).not.toBe(dailyEditorSyncSignature(updated, "2026-08-18"));
  });
});
