import { useAuth } from "@/_core/hooks/useAuth";
import { ContributionCalendar } from "@/components/ContributionCalendar";
import { DailyEditor } from "@/components/DailyEditor";
import DashboardLayout from "@/components/DashboardLayout";
import { GoalOnboarding } from "@/components/GoalOnboarding";
import { ProgressChart } from "@/components/ProgressChart";
import { ProgressRing } from "@/components/ProgressRing";
import { StartChallenge } from "@/components/StartChallenge";
import { useTracker } from "@/components/TrackerFrame";
import type { TrackerState } from "@/lib/tracker";
import { formatDate, trackerView } from "@/lib/tracker";
import { toDateKey } from "@shared/tracker";
import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, Flame, LoaderCircle, Sparkles, Target, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

function Stat({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: React.ReactNode }) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between">
        <p className="eyebrow">{label}</p>
        <span className="text-[#d9ff3e]">{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs text-white/40">{detail}</p>
    </div>
  );
}

export default function Home() {
  const tracker = useTracker();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const state = tracker.data as TrackerState | undefined;

  if (tracker.isLoading) {
    return (
      <DashboardLayout>
        <div className="grid min-h-[70vh] place-items-center">
          <LoaderCircle className="size-6 animate-spin text-[#d9ff3e]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!state?.challenge) {
    return (
      <DashboardLayout>
        <StartChallenge />
      </DashboardLayout>
    );
  }

  const activeGoals = (state?.goals ?? []).filter(g => !g.isArchived);

  if (activeGoals.length === 0) {
    return (
      <DashboardLayout>
        <GoalOnboarding onComplete={() => tracker.refetch()} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent
        state={state}
        userId={user?.id ?? "guest"}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </DashboardLayout>
  );
}

function DashboardContent({
  state,
  userId,
  selectedDate,
  onSelectDate,
}: {
  state: TrackerState;
  userId: number | string;
  selectedDate: string | null;
  onSelectDate: (value: string | null) => void;
}) {
  const view = trackerView(state)!;
  const goals = useMemo(() => (state.goals ?? []).filter(g => !g.isArchived), [state.goals]);
  const currentDate = selectedDate ?? view.today;
  const dayDisplay = Math.min(Math.max(view.currentDay, 1), 90);
  const score = Math.round(view.analytics.totalChallengePercent * 7 + view.analytics.currentStreak * 15 + goals.length * 20);
  const insight =
    view.analytics.elapsedDays < 3
      ? "Complete a few more days to unlock deeper personalized insights."
      : view.analytics.currentStreak > 0
        ? `You are on a ${view.analytics.currentStreak}-day run. Protect your momentum today.`
        : "A reset is not failure. Choose your primary goal and make today's check-in count.";

  // Calculate goal completion map for today
  const progressMap = useMemo(() => {
    const map = new Map<number, { currentValue: number; completed: boolean }>();
    if (state.goalProgress) {
      for (const p of state.goalProgress) {
        if (toDateKey(p.date) === view.today) {
          map.set(p.goalId, { currentValue: p.currentValue, completed: p.completed });
        }
      }
    }
    return map;
  }, [state.goalProgress, view.today]);

  const topGoalBreakdown = useMemo(() => {
    return goals.slice(0, 3).map(g => {
      const prog = progressMap.get(g.id);
      const val = prog?.currentValue ?? 0;
      const pct = Math.min(100, Math.round((val / (g.targetValue || 1)) * 100));
      return { name: g.name, percent: pct };
    });
  }, [goals, progressMap]);

  return (
    <div className="mx-auto max-w-[1500px] p-5 sm:p-7 lg:p-8">
      <header className="fade-in flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow text-[#d9ff3e]">90-day journey · {formatDate(view.today)}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Make today count.
          </h1>
          <p className="mt-2 text-sm text-white/45">
            Day {dayDisplay} of 90 · {view.analytics.daysRemaining} days remain.
          </p>
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border border-[#d9ff3e]/25 bg-[#d9ff3e]/[.08] px-5 py-3 shadow-[0_0_20px_rgba(217,255,62,.15)] backdrop-blur-md">
          <Flame className="size-5 text-[#d9ff3e] float-slow" />
          <div>
            <p className="text-sm font-bold text-white">{view.analytics.currentStreak} day streak</p>
            <p className="text-[11px] text-white/50">Longest: {view.analytics.longestStreak} days</p>
          </div>
        </div>
      </header>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Rise Score" value={score} detail="Completion + consistency + streak" icon={<Sparkles className="size-4" />} />
        <Stat label="Challenge score" value={`${view.analytics.totalChallengePercent}%`} detail={`${view.analytics.totalPoints} of 270 points`} icon={<Activity className="size-4" />} />
        <Stat label="Days completed" value={view.analytics.successfulDays} detail={`${view.analytics.partialDays} partial · ${view.analytics.missedDays} missed`} icon={<CheckCircle2 className="size-4" />} />
        <Stat label="Best streak" value={`${view.analytics.longestStreak}d`} detail="Your personal record" icon={<Trophy className="size-4" />} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <DailyEditor state={state} dateKey={currentDate} onSaved={() => onSelectDate(null)} />
          <ProgressChart data={view.series} />
        </div>

        <aside className="space-y-5">
          <div className="surface relative overflow-hidden p-6">
            <p className="eyebrow text-[#d9ff3e]">90-day completion</p>
            <div className="mt-4 flex items-center justify-between">
              <ProgressRing value={view.analytics.totalChallengePercent} label="Progress" />
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-white">Day {dayDisplay}</p>
                <p className="mt-1 text-xs text-white/45">{view.analytics.daysRemaining} to finish</p>
              </div>
            </div>
            <div className="mt-6 h-px bg-white/[.07]" />
            <div className="mt-4 space-y-2">
              {topGoalBreakdown.map(gb => (
                <div key={gb.name} className="flex items-center justify-between text-xs">
                  <span className="truncate text-white/60">{gb.name}</span>
                  <span className="font-semibold text-[#d9ff3e]">{gb.percent}%</span>
                </div>
              ))}
              {topGoalBreakdown.length === 0 && (
                <p className="text-xs text-white/40">Add goals to see progress breakdown.</p>
              )}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Your focus</p>
                <h2 className="mt-1 panel-title">Personalized insight</h2>
              </div>
              <Sparkles className="size-4 text-[#d9ff3e]" />
            </div>
            <p className="mt-4 text-sm leading-6 text-white/60">{insight}</p>
            <Link href="/analytics" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9ff3e] hover:underline">
              See deeper analysis <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </aside>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow text-[#d9ff3e]">Your Goals ({goals.length})</p>
              <h2 className="mt-1 panel-title">Daily Commitments</h2>
            </div>
            <Link href="/goals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d9ff3e] hover:underline">
              Manage goals <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {goals.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {goals.slice(0, 6).map(goal => {
                const prog = progressMap.get(goal.id);
                const currentValue = prog?.currentValue ?? 0;
                return <GoalSnapshot key={goal.id} goal={goal} currentValue={currentValue} />;
              })}
            </div>
          ) : (
            <div className="mt-5 text-center text-sm text-white/40">
              No active goals found. Click Manage goals to create yours.
            </div>
          )}
        </div>

        <div className="surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">This week</p>
              <h2 className="mt-1 panel-title">Consistency Momentum</h2>
            </div>
            <CalendarDays className="size-4 text-white/40" />
          </div>
          <div className="mt-5 space-y-3.5">
            {view.weeks.slice(-4).reverse().map(week => (
              <div key={week.week}>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-white/60">{week.week}</span>
                  <span className="font-semibold text-white">{week.points}/{week.maximum}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[.08]">
                  <div
                    className="h-full rounded-full bg-[#d9ff3e]"
                    style={{ width: `${week.maximum ? (week.points / week.maximum) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ContributionCalendar state={state} selectedDate={currentDate} onSelect={onSelectDate} />
      </div>
    </div>
  );
}

function GoalSnapshot({
  goal,
  currentValue,
}: {
  goal: { id: number; name: string; targetValue: number; unit?: string | null; priority: string };
  currentValue: number;
}) {
  const percent = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold text-white">{goal.name}</p>
        <span className="text-xs font-bold text-[#d9ff3e]">{percent}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.08]">
        <div className="h-full rounded-full bg-[#d9ff3e]" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-white/40">
        <span>
          {currentValue} / {goal.targetValue} {goal.unit || ""}
        </span>
        <span className="uppercase text-[#d9ff3e]/80 font-medium">{goal.priority}</span>
      </div>
    </div>
  );
}
