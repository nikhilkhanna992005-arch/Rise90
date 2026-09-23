import { DailyEditor } from "@/components/DailyEditor";
import { TrackerFrame } from "@/components/TrackerFrame";
import { todayKey } from "@/lib/tracker";
import { BookOpenCheck, Dumbbell, Laptop } from "lucide-react";

const copy = { leetcode: { title: "LeetCode", note: "Turn hard problems into a steady practice.", icon: BookOpenCheck }, web: { title: "Web Development", note: "Log the work that compounds your craft.", icon: Laptop }, gym: { title: "Gym", note: "Record the sessions that protect your energy.", icon: Dumbbell } } as const;
export default function FocusPage({ section }: { section: keyof typeof copy }) { const item = copy[section]; const Icon = item.icon; return <TrackerFrame>{state => <div className="mx-auto max-w-[980px] p-5 sm:p-7 lg:p-8"><div className="flex items-center gap-4"><div className="grid size-11 place-items-center rounded-2xl bg-[#d9ff3e] text-[#0b0d12]"><Icon className="size-5" /></div><div><p className="eyebrow text-[#d9ff3e]">Daily focus</p><h1 className="mt-1 font-display text-3xl font-bold text-white">{item.title}</h1></div></div><p className="mt-4 text-sm text-white/45">{item.note}</p><div className="mt-7"><DailyEditor state={state} dateKey={todayKey()} /></div></div>}</TrackerFrame>; }
