import { ContributionCalendar } from "@/components/ContributionCalendar";
import { DailyEditor } from "@/components/DailyEditor";
import { TrackerFrame } from "@/components/TrackerFrame";
import { todayKey } from "@/lib/tracker";
import { useState } from "react";

export default function CalendarPage() { const [date, setDate] = useState(todayKey()); return <TrackerFrame>{state => <div className="mx-auto max-w-[1160px] p-5 sm:p-7 lg:p-8"><p className="eyebrow text-[#d9ff3e]">Challenge history</p><h1 className="mt-2 font-display text-3xl font-bold text-white">90-day calendar</h1><p className="mt-2 text-sm text-white/45">Inspect any completed or partial day. Future days remain locked.</p><div className="mt-7 space-y-5"><ContributionCalendar state={state} selectedDate={date} onSelect={setDate} /><DailyEditor state={state} dateKey={date} /></div></div>}</TrackerFrame>; }
