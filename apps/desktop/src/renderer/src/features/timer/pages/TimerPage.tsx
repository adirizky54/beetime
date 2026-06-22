import { TimerBar } from "@/features/timer/components/TimerBar";
import { OrgProjectPanel } from "@/features/timer/components/OrgProjectPanel";
import { TaskPanel } from "@/features/timer/components/TaskPanel";

export function TimerPage() {
  return (
    <div className="flex h-full flex-col">
      <TimerBar />
      <div className="flex flex-1 overflow-hidden">
        <OrgProjectPanel />
        <TaskPanel />
      </div>
    </div>
  );
}
