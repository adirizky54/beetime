import { createFileRoute } from "@tanstack/react-router";
import { TimerPage } from "@/features/timer/pages/TimerPage";

export const Route = createFileRoute("/app/timer")({
  component: TimerPage,
});
