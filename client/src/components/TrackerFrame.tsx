import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import type { TrackerState } from "@/lib/tracker";
import { LoaderCircle, Plus } from "lucide-react";
import { Button } from "./ui/button";

export function useTracker() {
  const { isAuthenticated } = useAuth();
  return trpc.tracker.state.useQuery(undefined, { enabled: isAuthenticated, staleTime: 15_000 });
}

export function TrackerFrame({ children }: { children: (state: TrackerState) => React.ReactNode }) {
  const tracker = useTracker();
  return <DashboardLayout>{tracker.isLoading ? <div className="grid min-h-[75vh] place-items-center" role="status" aria-label="Loading tracker"><LoaderCircle className="size-5 animate-spin text-[#d9ff3e]" /></div> : tracker.isError ? <div className="grid min-h-[75vh] place-items-center p-5"><div className="surface max-w-xl p-8 text-center" role="alert"><p className="eyebrow text-[#d9ff3e]">Connection interrupted</p><h1 className="mt-3 font-display text-3xl font-bold text-white">Your progress is still safe.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">The tracker could not load right now. Please check your connection and try again.</p><Button className="mt-6 bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#ebff87]" onClick={() => tracker.refetch()}>Try again</Button></div></div> : tracker.data?.challenge ? children(tracker.data as TrackerState) : <div className="grid min-h-[75vh] place-items-center p-5"><div className="surface max-w-xl p-8 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#d9ff3e] text-[#0b0d12]"><Plus className="size-5" /></div><h1 className="mt-5 font-display text-3xl font-bold text-white">Start your 90-day challenge</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/50">90 days. Three goals. One version of you that does not quit.</p><Button className="mt-6 bg-[#d9ff3e] text-[#0b0d12] hover:bg-[#ebff87]" onClick={() => location.assign("/")}>Set up your challenge</Button></div></div>}</DashboardLayout>;
}
