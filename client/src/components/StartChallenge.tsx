import { trpc } from "@/lib/trpc";
import { todayKey } from "@/lib/tracker";
import { CalendarDays, ChevronRight, Crosshair, Target } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

export function StartChallenge() {
  const utils = trpc.useUtils();
  const [startDate, setStartDate] = useState(todayKey());
  const [target, setTarget] = useState(5);
  const start = trpc.tracker.start.useMutation({ onSuccess: () => { utils.tracker.state.invalidate(); toast.success("Challenge started. Day one begins now."); }, onError: error => toast.error(error.message) });
  return <div className="grid min-h-[calc(100vh-80px)] place-items-center p-5"><div className="surface relative w-full max-w-4xl overflow-hidden p-7 sm:p-10"><img src="/manus-storage/90day-midnight-grid_3e8a40b8.png" className="absolute inset-0 h-full w-full object-cover opacity-25" alt="" /><div className="relative grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><div className="grid size-12 place-items-center rounded-2xl border border-[#d9ff3e]/30 bg-[#d9ff3e]/[.12] text-[#d9ff3e]"><Crosshair className="size-5" /></div><p className="mt-7 eyebrow text-[#d9ff3e]">Protocol 01 · Challenge initialization</p><h1 className="mt-3 max-w-lg font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Build proof of your consistency.</h1><p className="mt-4 max-w-md text-sm leading-6 text-white/55">Set the start line. Lock the daily target. Begin Day 1. The record only moves when you do.</p></div><form onSubmit={event => { event.preventDefault(); start.mutate({ startDate, leetcodeTarget: target }); }} className="space-y-5 rounded-2xl border border-white/[.1] bg-[#111722]/80 p-5 backdrop-blur"><label className="block"><span className="mb-2 flex items-center gap-2 text-xs font-medium text-white/60"><CalendarDays className="size-3.5" /> Start date</span><input className="quiet-input" value={startDate} type="date" max={todayKey()} onChange={event => setStartDate(event.target.value)} required /></label><label className="block"><span className="mb-2 text-xs font-medium text-white/60">Daily LeetCode target</span><select className="quiet-input" value={target} onChange={event => setTarget(Number(event.target.value))}>{[3, 4, 5, 6, 7, 10].map(value => <option key={value} value={value}>{value} questions</option>)}</select></label><Button type="submit" disabled={start.isPending} className="w-full bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#ebff87]">{start.isPending ? "Initializing…" : "Lock targets & begin Day 1"}<ChevronRight className="ml-1 size-4" /></Button></form></div></div></div>;
}
