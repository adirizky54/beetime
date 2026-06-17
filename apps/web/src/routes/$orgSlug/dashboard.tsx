import { RiCalendarLine } from "@remixicon/react";
import { createFileRoute } from "@tanstack/react-router";
import { endOfDay, format, isAfter, startOfDay } from "date-fns";
import { useState } from "react";
import * as v from "valibot";

import { Button } from "@beetime/ui/components/button";
import { Calendar } from "@beetime/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@beetime/ui/components/popover";

import { AppBody } from "@/components/layouts/app-body";
import { AppContent } from "@/components/layouts/app-content";
import { AppHeader } from "@/components/layouts/app-header";
import { DashboardStatCards } from "@/components/dashboard/stat-cards";

import { useMount } from "@/hooks/use-mount";
import { formatDateRange } from "@/utils/string";

export const Route = createFileRoute("/$orgSlug/dashboard")({
  head: () => ({
    meta: [{ title: "Dashboard — Bee Time" }],
  }),
  validateSearch: v.object({
    from: v.optional(
      v.pipe(v.string(), v.minLength(1, "From is required")),
      format(startOfDay(new Date()), "yyyy-MM-dd"),
    ),
    to: v.optional(v.pipe(v.string(), v.minLength(1, "To is required")), format(endOfDay(new Date()), "yyyy-MM-dd")),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { orgSlug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [open, setOpen] = useState(false);

  useMount(() => {
    const today = new Date();
    const from = new Date(search.from);
    const to = new Date(search.to);

    // to must not be greater than today
    if (isAfter(startOfDay(to), startOfDay(today))) {
      navigate({
        search: {
          ...search,
          to: format(endOfDay(today), "yyyy-MM-dd"),
        },
        replace: true,
      });
    }

    // from must not be greater than today
    if (isAfter(startOfDay(from), startOfDay(today))) {
      navigate({
        search: {
          ...search,
          from: format(startOfDay(today), "yyyy-MM-dd"),
        },
        replace: true,
      });
    }

    // from must not be after to
    if (isAfter(from, to)) {
      navigate({
        search: {
          ...search,
          from: format(startOfDay(to), "yyyy-MM-dd"),
        },
        replace: true,
      });
    }
  });

  return (
    <AppContent>
      <AppHeader breadcrumbs={[{ title: "Dashboard", to: "/$orgSlug", params: { orgSlug } }]}>
        <div className="ml-auto">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={<Button variant="outline" id="date-picker-range" className="justify-start px-2.5 font-normal" />}
            >
              <RiCalendarLine data-icon="inline-start" />
              {formatDateRange(new Date(search.from), new Date(search.to))}
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                captionLayout="dropdown"
                disabled={(date) => date > new Date()}
                selected={{
                  from: new Date(search.from),
                  to: new Date(search.to),
                }}
                onSelect={(range) => {
                  if (typeof range !== "undefined" && range.from && range.to) {
                    setOpen(false);
                    navigate({
                      search: {
                        from: format(range.from, "yyyy-MM-dd"),
                        to: format(range.to, "yyyy-MM-dd"),
                      },
                      replace: true,
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </AppHeader>

      <AppBody>
        <DashboardStatCards />
      </AppBody>
    </AppContent>
  );
}
