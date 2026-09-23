import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BookOpen, Brain, Check, Code, Dumbbell, Flame, Plus, Sparkles, Target, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { GoalCategory, GoalPriority, GoalType } from "@/pages/Goals";

type DraftGoal = {
  name: string;
  category: GoalCategory;
  type: GoalType;
  targetValue: number;
  unit: string;
  priority: GoalPriority;
  description: string;
};

const SUGGESTIONS = [
  { name: "DSA & Problem Solving", category: "Coding" as GoalCategory, type: "numeric" as GoalType, targetValue: 3, unit: "problems", priority: "high" as GoalPriority, icon: Code },
  { name: "Learn Java & Backend", category: "Education" as GoalCategory, type: "time" as GoalType, targetValue: 2, unit: "hours", priority: "high" as GoalPriority, icon: Brain },
  { name: "Gym & Strength Training", category: "Fitness" as GoalCategory, type: "completion" as GoalType, targetValue: 1, unit: "workout", priority: "medium" as GoalPriority, icon: Dumbbell },
  { name: "Read Books Daily", category: "Personal Growth" as GoalCategory, type: "numeric" as GoalType, targetValue: 20, unit: "pages", priority: "medium" as GoalPriority, icon: BookOpen },
  { name: "Build Business Project", category: "Career" as GoalCategory, type: "time" as GoalType, targetValue: 1, unit: "hour", priority: "high" as GoalPriority, icon: Zap },
];

const CATEGORIES: GoalCategory[] = [
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

export function GoalOnboarding({ onComplete }: { onComplete?: () => void }) {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [goalsList, setGoalsList] = useState<DraftGoal[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for creating a goal
  const [name, setName] = useState("");
  const [category, setCategory] = useState<GoalCategory>("Personal Growth");
  const [type, setType] = useState<GoalType>("completion");
  const [targetValue, setTargetValue] = useState(1);
  const [unit, setUnit] = useState("session");
  const [priority, setPriority] = useState<GoalPriority>("medium");
  const [description, setDescription] = useState("");

  const createGoalMutation = trpc.goals.create.useMutation();

  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a goal name first.");
      return;
    }

    setGoalsList(prev => [
      ...prev,
      {
        name: name.trim(),
        category,
        type,
        targetValue: Math.max(1, Number(targetValue) || 1),
        unit: unit.trim() || "session",
        priority,
        description: description.trim(),
      },
    ]);

    // Reset single goal form
    setName("");
    setDescription("");
    toast.success(`"${name.trim()}" added to your 90-day setup!`);
  };

  const handleSuggestionClick = (s: typeof SUGGESTIONS[0]) => {
    setName(s.name);
    setCategory(s.category);
    setType(s.type);
    setTargetValue(s.targetValue);
    setUnit(s.unit);
    setPriority(s.priority);
  };

  const handleRemoveGoal = (index: number) => {
    setGoalsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinishOnboarding = async () => {
    if (goalsList.length === 0) {
      toast.error("Please add at least one goal to start your 90-day challenge.");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const g of goalsList) {
        await createGoalMutation.mutateAsync({
          name: g.name,
          category: g.category,
          type: g.type,
          targetValue: g.targetValue,
          unit: g.unit,
          priority: g.priority,
          description: g.description,
          durationDays: 90,
          frequency: "daily",
        });
      }

      await utils.goals.list.invalidate();
      await utils.tracker.state.invalidate();
      toast.success("Your personalized 90-day challenge is live!");
      if (onComplete) onComplete();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save your goals. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-5 sm:p-8 lg:p-10 fade-in">
      <div className="surface relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-[#d9ff3e]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-72 rounded-full bg-[#8291ff]/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9ff3e]/30 bg-[#d9ff3e]/10 px-3.5 py-1.5 text-xs font-semibold text-[#d9ff3e]">
            <Sparkles className="size-3.5" /> Step 1 of 1 · Personalized Goal Setup
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Welcome, {user?.name || "Achiever"}.<br />
            <span className="text-[#d9ff3e]">Define your 90 days.</span>
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-white/60">
            Rise90 is built around your individual growth. Create the custom goals you commit to tracking daily over the next 90 days.
          </p>

          {/* Quick Suggestions */}
          <div className="mt-6 border-t border-white/[.08] pt-6">
            <p className="eyebrow text-[#d9ff3e]">Popular suggestions (click to auto-fill):</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[.09] bg-white/[.03] px-3.5 py-2 text-xs font-medium text-white/80 transition-all hover:border-[#d9ff3e]/50 hover:bg-[#d9ff3e]/10 hover:text-white"
                  >
                    <Icon className="size-3.5 text-[#d9ff3e]" />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form to Add Goal */}
          <form onSubmit={handleAddGoal} className="surface-card mt-8 grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="eyebrow">Goal Title / Name *</label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Learn Java, DSA Practice, Gym, Read Books"
                className="quiet-input mt-2"
                required
              />
            </div>

            <div>
              <label className="eyebrow">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as GoalCategory)}
                className="quiet-input mt-2"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="eyebrow">Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as GoalPriority)}
                className="quiet-input mt-2"
              >
                <option value="high">🔥 High</option>
                <option value="medium">⚡ Medium</option>
                <option value="low">🌱 Low</option>
              </select>
            </div>

            <div>
              <label className="eyebrow">Goal Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as GoalType)}
                className="quiet-input mt-2"
              >
                <option value="completion">Completion (Yes/No)</option>
                <option value="numeric">Numeric Count</option>
                <option value="time">Time-based</option>
                <option value="habit">Habit</option>
              </select>
            </div>

            <div>
              <label className="eyebrow">Daily Target & Unit</label>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={targetValue}
                  onChange={e => setTargetValue(Number(e.target.value))}
                  className="quiet-input w-24"
                />
                <input
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="hours / problems / mins"
                  className="quiet-input"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <label className="eyebrow">Why does this matter? (Optional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief motivation or target detail"
                className="quiet-input mt-2"
              />
            </div>

            <div className="flex items-end sm:col-span-2 lg:col-span-4">
              <Button type="submit" className="w-full bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#edff9b]">
                <Plus className="mr-1.5 size-4" /> Add Goal to My Setup
              </Button>
            </div>
          </form>

          {/* List of Added Goals */}
          <div className="mt-8 border-t border-white/[.08] pt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white">
                Your 90-Day Commitments ({goalsList.length})
              </h3>
              {goalsList.length > 0 && (
                <span className="text-xs text-[#d9ff3e]">Ready to activate</span>
              )}
            </div>

            {goalsList.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/15 p-8 text-center">
                <Target className="mx-auto size-8 text-white/30" />
                <p className="mt-3 font-display text-base font-semibold text-white/80">
                  No goals added yet.
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Add at least 1 goal above or click a suggestion to build your custom 90-day challenge.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {goalsList.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-2xl border border-white/[.08] bg-white/[.025] p-4 backdrop-blur-md"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-base font-semibold text-white">
                          {g.name}
                        </span>
                        <span className="rounded-full bg-[#d9ff3e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#d9ff3e]">
                          {g.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-white/40">
                        {g.category} · Target: {g.targetValue} {g.unit}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      className="grid size-8 shrink-0 place-items-center rounded-xl text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
                      title="Remove goal"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="mt-8 flex justify-end">
            <Button
              onClick={handleFinishOnboarding}
              disabled={isSubmitting || goalsList.length === 0}
              className="gap-2 bg-[#d9ff3e] px-7 py-3 text-base font-bold text-[#0b0d12] shadow-xl hover:bg-[#edff9b] disabled:opacity-50"
            >
              {isSubmitting ? (
                "Saving Your Goals..."
              ) : (
                <>
                  Save Goals & Launch My Dashboard <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
