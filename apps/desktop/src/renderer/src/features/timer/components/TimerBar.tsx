import { RiPlayMiniFill, RiStopLine, RiTimerLine } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";

import type { TimerContext, TimerState } from "@/features/timer/hooks/useTimer";
import { formatTime } from "@/features/timer/hooks/useTimer";

interface TimerBarProps {
  timerContext: TimerContext | null;
  timerState: TimerState;
  elapsedSeconds: number;
  onStop: () => void;
  onResume: () => void;
}

export function TimerBar({
  timerContext,
  timerState,
  elapsedSeconds,
  onStop,
  onResume,
}: TimerBarProps) {
  return (
    <div className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <RiTimerLine className="size-5 text-muted-foreground" />
        {timerContext ? (
          <span className="text-sm font-medium">
            {timerContext.projectName}
            <span className="mx-1.5 text-muted-foreground">→</span>
            {timerContext.taskName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">No active timer</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {timerContext && (
          <span className="font-mono text-lg tabular-nums tracking-wider">
            {formatTime(elapsedSeconds)}
          </span>
        )}

        {timerContext && timerState === "running" ? (
          <Button size="sm" variant="destructive" onClick={onStop}>
            <RiStopLine className="size-4" />
            Stop
          </Button>
        ) : timerContext ? (
          <Button size="sm" onClick={onResume}>
            <RiPlayMiniFill className="size-4" />
            Resume
          </Button>
        ) : null}
      </div>
    </div>
  );
}
