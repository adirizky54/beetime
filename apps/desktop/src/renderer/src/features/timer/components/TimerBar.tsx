import { RiArrowDownLine, RiPlayLargeFill } from "@remixicon/react";

import { Button } from "@beetime/ui/components/button";
import { cn } from "@beetime/ui/lib/utils";

export function TimerBar() {
  return (
    <div
      data-state="idle"
      className={cn(
        "flex h-16 w-full items-center justify-between gap-4 border-b border-border px-3 py-1.5 select-none",
        "data-[state=empty]:bg-info",
        "data-[state=idle]:bg-gray-500",
        "data-[state=running]:bg-success",
      )}
    >
      {/*STATE: empty*/}
      {/*<div className="flex items-center gap-1.5 text-white">
        <p className="text-lg font-medium">Hi! To start working, click on a task</p>
        <RiArrowDownLine className="size-5 shrink-0 animate-bounce" />
      </div>*/}

      {/*STATE: idle & running*/}
      <div className="flex flex-1 items-center justify-between gap-1.5">
        <div className="flex flex-1 flex-col">
          <p className="truncate text-base font-medium text-white">Meeting</p>
          <p className="truncate text-sm text-white/90">Redesign Landing Page</p>
        </div>

        <div className="flex flex-col text-right">
          <p className="text-xl font-semibold text-white tabular-nums">00:14:32</p>
          <p className="text-sm text-white">
            Worked Today: <span className="font-medium">14m</span>
          </p>
        </div>
      </div>

      <Button variant="outline" size="icon-lg" className="size-11 rounded-full">
        <RiPlayLargeFill className="size-5" />
      </Button>
    </div>
  );
}
