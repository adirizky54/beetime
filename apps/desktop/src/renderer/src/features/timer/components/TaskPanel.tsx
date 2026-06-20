import { RiPlayMiniFill, RiSearchLine } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";
import { Checkbox } from "@beetime/ui/components/checkbox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@beetime/ui/components/empty";
import { Input } from "@beetime/ui/components/input";
import { ScrollArea } from "@beetime/ui/components/scroll-area";

import type { MockTask } from "@/features/timer/data/mock";

interface TaskPanelProps {
  projectName: string | null;
  tasks: MockTask[];
  taskDoneMap: Record<string, string | null>;
  searchQuery: string;
  timerRunning: boolean;
  onSearchChange: (query: string) => void;
  onToggleDone: (taskId: string) => void;
  onStartTask: (projectId: string, taskId: string) => void;
}

export function TaskPanel({
  projectName,
  tasks,
  taskDoneMap,
  searchQuery,
  timerRunning,
  onSearchChange,
  onToggleDone,
  onStartTask,
}: TaskPanelProps) {
  const selectedProjectId = tasks[0]?.projectId ?? null;
  const filteredTasks = searchQuery
    ? tasks.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* Search */}
      <div className="border-b px-4 py-3">
        <div className="relative">
          <RiSearchLine className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={
              projectName
                ? `Search tasks in ${projectName}…`
                : "Select a project to search tasks"
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={!projectName}
            className="pl-9"
          />
        </div>
      </div>

      {/* Task list */}
      <ScrollArea className="flex-1">
        {!projectName ? (
          <div className="flex h-full items-center justify-center p-8">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No project selected</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  Select a project from the left panel to view its tasks.
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No tasks found</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <EmptyDescription>
                  {searchQuery
                    ? "No tasks match your search."
                    : "This project has no tasks yet."}
                </EmptyDescription>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 p-3">
            {filteredTasks.map((task) => {
              const done = taskDoneMap[task.id] !== null;
              return (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => onToggleDone(task.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.name}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onStartTask(selectedProjectId, task.id)}
                    disabled={timerRunning}
                  >
                    <RiPlayMiniFill className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Bottom bar */}
      {projectName && (
        <div className="border-t px-4 py-2">
          <p className="text-xs text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            {searchQuery && tasks.length !== filteredTasks.length
              ? ` (filtered from ${tasks.length})`
              : ""}
          </p>
        </div>
      )}
    </main>
  );
}
