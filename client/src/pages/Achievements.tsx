import { TrackerFrame } from "@/components/TrackerFrame";
import { trackerView } from "@/lib/tracker";
import { Award, Check, Flame, LockKeyhole, Rocket, Star, Target, Trophy } from "lucide-react";
import type { TrackerState } from "@/lib/tracker";

export default function Achievements() {
  return <TrackerFrame>{state => <AchievementsContent state={state} />}</TrackerFrame>;
}

function AchievementsContent({ state }: { state: TrackerState }) {
  const view = trackerView(state)!;
  const totalGoalsCompleted = view.analytics.successfulDays * 3;
  const achievements = [
    { title: "First goal completed", copy: "You showed up and finished a goal.", icon: Check, unlocked: totalGoalsCompleted >= 1, accent: "#d9ff3e" },
    { title: "7-day streak", copy: "A full week of keeping promises to yourself.", icon: Flame, unlocked: view.analytics.longestStreak >= 7, accent: "#ff8e6e" },
    { title: "30-day streak", copy: "Consistency is becoming part of your identity.", icon: Flame, unlocked: view.analytics.longestStreak >= 30, accent: "#ff8e6e" },
    { title: "First perfect day", copy: "Every active goal completed in one day.", icon: Star, unlocked: view.analytics.successfulDays >= 1, accent: "#8291ff" },
    { title: "50 goals completed", copy: "Small wins compound into a different life.", icon: Target, unlocked: totalGoalsCompleted >= 50, accent: "#6ee7c8" },
    { title: "Halfway there", copy: "You have crossed 50% of the journey.", icon: Rocket, unlocked: view.analytics.totalChallengePercent >= 50, accent: "#d9a6ff" },
    { title: "90-day finisher", copy: "The full journey, completed.", icon: Trophy, unlocked: view.analytics.elapsedDays >= 90 && view.analytics.totalChallengePercent >= 80, accent: "#d9ff3e" },
  ];
  const unlockedCount = achievements.filter(item => item.unlocked).length;
  return <div className="mx-auto max-w-[1200px] p-5 sm:p-7 lg:p-8"><header><p className="eyebrow text-[#d9ff3e]">Proof you are changing</p><h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Achievements</h1><p className="mt-2 text-sm text-white/45">A few quiet markers for the work you are already doing.</p></header><div className="surface mt-7 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="grid size-14 place-items-center rounded-2xl bg-[#d9ff3e]/10 text-[#d9ff3e]"><Award className="size-7" /></div><div><p className="eyebrow">Unlocked</p><p className="mt-1 font-display text-3xl font-bold text-white">{unlockedCount}<span className="ml-1 text-base font-normal text-white/35">/ {achievements.length}</span></p></div></div><div className="max-w-sm text-left text-sm leading-6 text-white/45 sm:text-right">Achievements are not the point. They are reminders that consistency leaves a trace.</div></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{achievements.map(item => <div key={item.title} className={`surface p-5 ${item.unlocked ? "" : "opacity-60"}`}><div className="flex items-start justify-between"><div className="grid size-11 place-items-center rounded-2xl" style={{ backgroundColor: `${item.accent}18`, color: item.accent }}><item.icon className="size-5" /></div>{item.unlocked ? <span className="inline-flex items-center gap-1 rounded-full bg-[#d9ff3e]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#d9ff3e]"><Check className="size-3" /> Earned</span> : <LockKeyhole className="size-4 text-white/25" />}</div><h2 className="mt-6 font-display text-base font-semibold text-white">{item.title}</h2><p className="mt-2 text-sm leading-6 text-white/40">{item.copy}</p></div>)}</div>{!unlockedCount && <div className="mt-6 text-center text-sm text-white/40">Your first achievement is waiting. Complete today’s goals to unlock it.</div>}</div>;
}
