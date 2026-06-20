import { useEffect, useRef, useState } from "react";

import { MOCK_PROJECTS, MOCK_TASKS } from "@/features/timer/data/mock";

export interface TimerContext {
  projectName: string;
  taskName: string;
}

export type TimerState = "stopped" | "running";

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>("stopped");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerContext, setTimerContext] = useState<TimerContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState]);

  function startTask(projectId: string, taskId: string) {
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    const task = MOCK_TASKS.find((t) => t.id === taskId);
    if (!project || !task) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    setElapsedSeconds(0);
    setTimerContext({ projectName: project.name, taskName: task.name });
    setTimerState("running");
  }

  function stopTimer() {
    setTimerState("stopped");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resumeTimer() {
    setTimerState("running");
  }

  return {
    timerState,
    elapsedSeconds,
    timerContext,
    startTask,
    stopTimer,
    resumeTimer,
  };
}
