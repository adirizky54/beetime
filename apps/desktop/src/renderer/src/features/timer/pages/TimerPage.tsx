import { useState } from "react";

import { TimerBar } from "@/features/timer/components/TimerBar";
import { OrgProjectPanel } from "@/features/timer/components/OrgProjectPanel";
import { TaskPanel } from "@/features/timer/components/TaskPanel";
import { MOCK_ORGS, MOCK_PROJECTS, MOCK_TASKS } from "@/features/timer/data/mock";
import { useTimer } from "@/features/timer/hooks/useTimer";

export function TimerPage() {
  const timer = useTimer();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const [taskDoneMap, setTaskDoneMap] = useState<Record<string, string | null>>(() => {
    const map: Record<string, string | null> = {};
    for (const t of MOCK_TASKS) map[t.id] = t.doneAt;
    return map;
  });

  const [searchQuery, setSearchQuery] = useState("");

  function handleToggleDone(taskId: string) {
    setTaskDoneMap((prev) => ({
      ...prev,
      [taskId]: prev[taskId] ? null : new Date().toISOString(),
    }));
  }

  const selectedProject = MOCK_PROJECTS.find((p) => p.id === selectedProjectId) ?? null;
  const tasksForSelected = selectedProjectId
    ? MOCK_TASKS.filter((t) => t.projectId === selectedProjectId)
    : [];

  return (
    <div className="flex h-full flex-col">
      <TimerBar
        timerContext={timer.timerContext}
        timerState={timer.timerState}
        elapsedSeconds={timer.elapsedSeconds}
        onStop={timer.stopTimer}
        onResume={timer.resumeTimer}
      />

      <div className="flex flex-1 overflow-hidden">
        <OrgProjectPanel
          orgs={MOCK_ORGS}
          projects={MOCK_PROJECTS}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
        />

        <TaskPanel
          projectName={selectedProject?.name ?? null}
          tasks={tasksForSelected}
          taskDoneMap={taskDoneMap}
          searchQuery={searchQuery}
          timerRunning={timer.timerState === "running"}
          onSearchChange={setSearchQuery}
          onToggleDone={handleToggleDone}
          onStartTask={timer.startTask}
        />
      </div>
    </div>
  );
}
