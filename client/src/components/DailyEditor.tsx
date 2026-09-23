import type { TrackerState } from "@/lib/tracker";
import { formatDate, isFutureChallengeDate, stateForDay, todayKey, trackerView } from "@/lib/tracker";
import { trpc } from "@/lib/trpc";
import { Check, ChevronDown, LockKeyhole, Save, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export function DailyEditor({
  state,
  dateKey,
  onSaved,
}: {
  state: TrackerState;
  dateKey: string;
  onSaved?: () => void;
}) {
  const challenge = state.challenge!;
  const utils = trpc.useUtils();
  const isFuture = isFutureChallengeDate(challenge, dateKey);
  const activeGoals = useMemo(() => (state.goals ?? []).filter(g => !g.isArchived), [state.goals]);
  const [journal, setJournal] = useState(() => {
    const dayRecord = stateForDay(state, dateKey).record;
    return dayRecord?.journal ?? "";
  });
  const [expandedGoalId, setExpandedGoalId] = useState<number | null>(null);
  const [notesState, setNotesState] = useState<Record<number, string>>({});

  const saveProgressMutation = trpc.progress.saveItem.useMutation({
    onSuccess: () => {
      utils.tracker.state.invalidate();
      onSaved?.();
    },
    onError: error => toast.error(error.message),
  });

  const saveDayMutation = trpc.tracker.saveDay.useMutation({
    onSuccess: () => {
      utils.tracker.state.invalidate();
      toast.success("Daily progress saved.");
      onSaved?.();
    },
    onError: error => toast.error(error.message),
  });

  // Map of goal progress for the selected dateKey
  const goalProgressMap = useMemo(() => {
    const map = new Map<number, { currentValue: number; completed: boolean; notes: string }>();
    if (state.goalProgress) {
      for (const p of state.goalProgress) {
        if (formatDateKey(p.date) === dateKey) {
          map.set(p.goalId, {
            currentValue: p.currentValue,
            completed: p.completed,
            notes: p.notes || "",
          });
        }
      }
    }
    return map;
  }, [state.goalProgress, dateKey]);

  const toggleGoal = (goal: (typeof activeGoals)[0]) => {
    if (isFuture) return;
    const current = goalProgressMap.get(goal.id);
    const isCompleted = !current?.completed;
    const nextVal = isCompleted ? goal.targetValue : 0;

    saveProgressMutation.mutate({
      goalId: goal.id,
      date: dateKey,
      currentValue: nextVal,
      completed: isCompleted,
      notes: notesState[goal.id] ?? current?.notes,
    });

    if (isCompleted) {
      toast.success(`Completed "${goal.name}"! 🔥`);
    }
  };

  const handleSaveJournal = () => {
    if (isFuture) return;
    saveDayMutation.mutate({
      date: dateKey,
      webDevCompleted: false,
      gymCompleted: false,
      leetcodeCount: 0,
      studyMinutes: 0,
      gymDurationMinutes: 0,
      journal,
      problems: [],
    });
  };

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow">{dateKey === todayKey() ? "Today’s focus" : "Daily record"}</p>
          <h2 className="mt-1 panel-title">
            {formatDate(dateKey, { weekday: "long", month: "long", day: "numeric" })}
          </h2>
        </div>
        {isFuture ? (
          <span className="flex items-center gap-1.5 rounded-full border border-white/[.1] bg-white/[.04] px-3 py-1.5 text-xs text-white/45">
            <LockKeyhole className="size-3" /> Future Day Locked
          </span>
        ) : (
          <button
            onClick={handleSaveJournal}
            disabled={saveDayMutation.isPending}
            className="flex items-center gap-2 rounded-xl bg-[#d9ff3e] px-4 py-2 text-xs font-bold text-[#0b0d12] hover:bg-[#edff9b]"
          >
            <Save className="size-3.5" />
            {saveDayMutation.isPending ? "Saving..." : "Save journal & log"}
          </button>
        )}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <p className="eyebrow text-[#d9ff3e]">Check off today's commitments ({activeGoals.length}):</p>

        {activeGoals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
            No active goals. Set up your goals to begin daily progress tracking.
          </div>
        ) : (
          activeGoals.map(goal => {
            const prog = goalProgressMap.get(goal.id);
            const isDone = Boolean(prog?.completed);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div key={goal.id} className="space-y-2">
                <div
                  className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                    isDone
                      ? "border-[#d9ff3e]/40 bg-[#d9ff3e]/[0.08]"
                      : "border-white/[.08] bg-white/[.025] hover:border-white/[.16]"
                  } ${isFuture ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <button
                    type="button"
                    disabled={isFuture}
                    onClick={() => toggleGoal(goal)}
                    className="flex flex-1 items-center gap-3.5 text-left"
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-xl transition-transform active:scale-90 ${
                        isDone ? "bg-[#d9ff3e] text-[#0b0d12]" : "bg-white/[.06] text-white/45"
                      }`}
                    >
                      {isDone ? <Check className="size-4" /> : <Target className="size-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-base font-semibold text-white">
                          {goal.name}
                        </span>
                        <span className="rounded-full bg-white/[.08] px-2 py-0.5 text-[10px] font-medium text-white/60 uppercase">
                          {goal.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-white/45">
                        Target: {goal.targetValue} {goal.unit || ""} · Priority: {goal.priority}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                      className="flex items-center gap-1 text-xs text-white/40 hover:text-white"
                    >
                      Notes <ChevronDown className={`size-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                    <button
                      type="button"
                      disabled={isFuture}
                      onClick={() => toggleGoal(goal)}
                      className={`size-5 rounded-full border transition-all ${
                        isDone ? "border-[#d9ff3e] bg-[#d9ff3e]" : "border-white/30"
                      }`}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="rounded-xl border border-white/[.08] bg-black/20 p-4">
                    <label className="eyebrow">Notes / Refinement for {goal.name}</label>
                    <input
                      className="quiet-input mt-2"
                      value={notesState[goal.id] ?? prog?.notes ?? ""}
                      onChange={e => setNotesState({ ...notesState, [goal.id]: e.target.value })}
                      placeholder="Add details, duration, or thoughts for this goal today..."
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        <div className="mt-6 rounded-2xl border border-white/[.08] bg-white/[.025] p-5">
          <p className="mb-2 text-sm font-semibold text-white">Daily Reflections & Log</p>
          <textarea
            disabled={isFuture}
            className="quiet-input min-h-24 resize-y"
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Document what went well today, what you learned, and your mindset..."
          />
        </div>
      </div>
    </section>
  );
}

function formatDateKey(d: Date | string): string {
  if (typeof d === "string") return d.split("T")[0];
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
