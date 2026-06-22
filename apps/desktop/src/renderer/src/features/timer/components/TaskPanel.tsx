import { Badge } from "@beetime/ui/components/badge";
import { Button } from "@beetime/ui/components/button";
import { ScrollArea } from "@beetime/ui/components/scroll-area";

export function TaskPanel() {
  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      <ScrollArea className="h-[calc(100svh-4rem)]">
        <div className="flex flex-col divide-y divide-border">
          <Button variant="ghost" size="lg" className="w-full justify-between rounded-none px-3 whitespace-normal">
            <span className="line-clamp-1 flex-1 text-left group-data-[state=running]/button:text-success">
              Meeting
            </span>

            {/*state: running*/}
            {/*<Badge className="rounded bg-success font-normal text-white">10:00</Badge>*/}

            {/*state: idle*/}
            <span className="shrink-0 text-right text-muted-foreground">14m</span>
          </Button>
        </div>
      </ScrollArea>
    </main>
  );
}
