import { useAuth } from "@/_core/hooks/useAuth";
import { TrackerFrame } from "@/components/TrackerFrame";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toDateKey } from "@shared/tracker";
import { Archive, Check, ChevronDown, Clock3, Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { TrackerState } from "@/lib/tracker";

export type GoalCategory =
  | "Career"
  | "Education"
  | "Fitness"
  | "Health"
  | "Coding"
  | "Finance"
  | "Personal Growth"
  | "Creativity"
  | "Other";

export type GoalType = "completion" | "numeric" | "time" | "habit";
export type GoalPriority = "low" | "medium" | "high";

const categories: GoalCategory[] = [
  "Career",
  "Education",
  "Fitness",
  "Health",
  "Coding",
  "Finance",
  "Personal Growth",
  "Creativity",
  "Other",
];

const goalTypes: { label: string; value: GoalType }[] = [
  { label: "Completion (Yes/No)", value: "completion" },
  { label: "Numeric Count", value: "numeric" },
  { label: "Time-based", value: "time" },
  { label: "Habit", value: "habit" },
];

export default function Goals() {
  return <TrackerFrame>{state => <GoalsContent state={state} />}</TrackerFrame>;
}

function GoalsContent({ state }: { state: TrackerState }) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const goalsQuery = trpc.goals.list.useQuery();
  const createGoalMutation = trpc.goals.create.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.tracker.state.invalidate();
      toast.success("Goal added to your 90-day challenge");
      setShowCreate(false);
    },
    onError: err => {
      toast.error(err.message || "Failed to create goal.");
    },
  });

  const archiveGoalMutation = trpc.goals.archive.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.tracker.state.invalidate();
      toast.success("Goal archived");
    },
  });

  const saveProgressMutation = trpc.progress.saveItem.useMutation({
    onSuccess: () => {
      utils.goals.list.invalidate();
      utils.tracker.state.invalidate();
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [form, setForm] = useState<{
    name: string;
    category: GoalCategory;
    description: string;
    type: GoalType;
    targetValue: number;
    unit: string;
    frequency: "daily" | "weekly" | "weekdays";
    priority: GoalPriority;
  }>({
    name: "",
    category: "Personal Growth",
    description: "",
    type: "habit",
    targetValue: 1,
    unit: "session",
    frequency: "daily",
    priority: "medium",
  });

  const today = toDateKey(new Date());

  const goals = goalsQuery.data ?? state.goals ?? [];
  const activeGoals = useMemo(() => goals.filter(g => !g.isArchived), [goals]);

  // Goal progress map for today
  const progressMap = useMemo(() => {
    const map = new Map<number, { currentValue: number; completed: boolean }>();
    if (state.goalProgress) {
      for (const p of state.goalProgress) {
        if (toDateKey(p.date) === today) {
          map.set(p.goalId, { currentValue: p.currentValue, completed: p.completed });
        }
      }
    }
    return map;
  }, [state.goalProgress, today]);

  const changeProgress = (goalId: number, targetVal: number, value: number, isCompleted?: boolean) => {
    const done = isCompleted ?? value >= targetVal;
    saveProgressMutation.mutate({
      goalId,
      date: today,
      currentValue: value,
      completed: done,
    });
    if (done) {
      toast.success("Goal completed!", { description: "Keep up the momentum!" });
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Give your goal a name first.");
    createGoalMutation.mutate({
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      targetValue: Math.max(1, Number(form.targetValue) || 1),
    });
  };

  return (
    <div className="mx-auto max-w-[1400px] p-5 sm:p-7 lg:p-8">
      <header className="fade-in flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-[#d9ff3e]">What are you becoming?</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your personalized goals
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Personalize your 90 days around the work that matters most. All goals are securely saved to your account.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(value => !value)}
          className="gap-2 bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#edff9b]"
        >
          <Plus className="size-4" /> Create goal
        </Button>
      </header>

      {showCreate && (
        <form onSubmit={submit} className="surface mt-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="eyebrow">Goal name</label>
            <input
              autoFocus
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="quiet-input mt-2"
              placeholder="e.g. Solve LeetCode Problems"
            />
          </div>
          <div>
            <label className="eyebrow">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as GoalCategory })}
              className="quiet-input mt-2"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value as GoalPriority })}
              className="quiet-input mt-2"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="eyebrow">
              Description <span className="normal-case tracking-normal text-white/20">optional</span>
            </label>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="quiet-input mt-2"
              placeholder="Why does this matter to you?"
            />
          </div>
          <div>
            <label className="eyebrow">Target type</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as GoalType })}
              className="quiet-input mt-2"
            >
              {goalTypes.map(t => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="eyebrow">Target / Unit</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min="1"
                value={form.targetValue}
                onChange={e => setForm({ ...form, targetValue: Number(e.target.value) })}
                className="quiet-input w-24"
              />
              <input
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
                className="quiet-input"
                placeholder="hours / problems / mins"
              />
            </div>
          </div>
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
            <Button
              type="submit"
              disabled={createGoalMutation.isPending}
              className="bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#edff9b]"
            >
              {createGoalMutation.isPending ? "Saving..." : "Save goal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreate(false)}
              className="border-white/10 bg-transparent text-white/65 hover:bg-white/[.05] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeGoals.map(goal => {
          const prog = progressMap.get(goal.id);
          const currentValue = prog?.currentValue ?? 0;
          const isCompleted = prog?.completed ?? currentValue >= goal.targetValue;
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              currentValue={currentValue}
              isCompleted={isCompleted}
              expanded={expanded === goal.id}
              onExpand={() => setExpanded(expanded === goal.id ? null : goal.id)}
              onProgress={(val, done) => changeProgress(goal.id, goal.targetValue, val, done)}
              onArchive={() => archiveGoalMutation.mutate({ id: goal.id, isArchived: true })}
            />
          );
        })}
      </div>

      {!activeGoals.length && (
        <div className="surface mt-7 grid place-items-center p-14 text-center">
          <div className="grid size-14 place-items-center rounded-2xl bg-[#d9ff3e]/10 text-[#d9ff3e]">
            <Target className="size-6" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">Your journey starts here.</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">
            Choose one goal that would make the next 90 days feel different.
          </p>
          <Button onClick={() => setShowCreate(true)} className="mt-6 bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#edff9b]">
            Create your first goal
          </Button>
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  currentValue,
  isCompleted,
  expanded,
  onExpand,
  onProgress,
  onArchive,
}: {
  goal: {
    id: number;
    name: string;
    category: string;
    description?: string | null;
    type: string;
    targetValue: number;
    unit?: string | null;
    frequency: string;
    priority: string;
  };
  currentValue: number;
  isCompleted: boolean;
  expanded: boolean;
  onExpand: () => void;
  onProgress: (value: number, completed?: boolean) => void;
  onArchive: () => void;
}) {
  const percent = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
  const isBinary = goal.type === "completion" || goal.type === "habit";

  return (
    <article className="surface overflow-hidden p-5 transition hover:border-white/[.15]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl bg-[#d9ff3e]/10 text-[#d9ff3e]">
            <Target className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate font-display text-base font-semibold text-white">{goal.name}</h2>
              <span className="rounded-full bg-white/[.06] px-2 py-0.5 text-[10px] text-white/45">
                {goal.category}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/40">
              {goal.description || `${goal.frequency} · ${goal.targetValue} ${goal.unit || ""}`}
            </p>
          </div>
        </div>
        <button
          onClick={onExpand}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-white/35 hover:bg-white/[.06] hover:text-white"
          aria-label={`Options for ${goal.name}`}
        >
          <ChevronDown className={`size-4 transition ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="eyebrow">Today</p>
          <p className="mt-1 font-display text-2xl font-bold text-white">
            {currentValue}
            <span className="ml-1 text-sm font-normal text-white/35">
              / {goal.targetValue} {goal.unit || ""}
            </span>
          </p>
        </div>
        <span className="text-sm font-semibold text-[#d9ff3e]">{percent}%</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.07]">
        <div
          className="h-full rounded-full bg-[#d9ff3e] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isBinary ? (
          <Button
            onClick={() => onProgress(isCompleted ? 0 : goal.targetValue, !isCompleted)}
            variant="outline"
            className={`h-9 flex-1 gap-2 border-white/10 bg-transparent text-xs ${
              isCompleted ? "text-[#d9ff3e]" : "text-white/65 hover:text-white"
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="size-3.5" /> Completed
              </>
            ) : (
              "Mark complete"
            )}
          </Button>
        ) : (
          <div className="flex flex-1 items-center gap-2">
            <input
              type="range"
              min="0"
              max={Math.max(goal.targetValue * 2, 10)}
              value={currentValue}
              onChange={e => onProgress(Number(e.target.value))}
              className="w-full accent-[#d9ff3e]"
              aria-label={`Progress for ${goal.name}`}
            />
            <span className="text-xs text-white/45">{goal.unit || ""}</span>
          </div>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-white/35">
          <Clock3 className="size-3" />
          {goal.frequency}
        </span>
      </div>

      {expanded && (
        <div className="mt-4 flex items-center justify-between border-t border-white/[.07] pt-4">
          <p className="text-xs text-white/35">{goal.priority} priority</p>
          <button onClick={onArchive} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-red-300">
            <Archive className="size-3" /> Archive
          </button>
        </div>
      )}
    </article>
  );
}

