import {
  RiFolder3Fill,
  RiGroupFill,
  RiMoneyDollarCircleFill,
  RiTaskFill,
  RiTimeFill,
  RiTimer2Fill,
} from "@remixicon/react";

import { Frame, FrameHeader, FramePanel, FrameTitle } from "@beetime/ui/components/frame";
import { Skeleton } from "@beetime/ui/components/skeleton";
import { auth } from "@/lib/auth";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  loading: boolean;
}

function StatCard({ icon, label, value, loading }: StatCardProps) {
  return (
    <Frame>
      <FrameHeader>
        <FrameTitle className="flex items-center space-x-2">
          {icon}
          <span>{label}</span>
        </FrameTitle>
      </FrameHeader>
      <FramePanel>
        {loading ? <Skeleton className="h-8 w-24" /> : <p className="text-2xl font-semibold tracking-tight">{value}</p>}
      </FramePanel>
    </Frame>
  );
}

export function DashboardStatCards() {
  const { data } = auth.useActiveMemberRole();

  const isMember = data?.role === "member";

  const cards = [
    {
      icon: <RiTimeFill className="size-4" />,
      label: "Time Tracked",
      value: "1h",
    },
    {
      icon: isMember ? <RiTimer2Fill className="size-4" /> : <RiMoneyDollarCircleFill className="size-4" />,
      label: isMember ? "Avg Hours/Day" : "Billable Hours",
      value: "1h",
    },
    {
      icon: <RiFolder3Fill className="size-4" />,
      label: "Active Projects",
      value: "1",
    },
    {
      icon: isMember ? <RiTaskFill className="size-4" /> : <RiGroupFill className="size-4" />,
      label: isMember ? "Assigned Tasks" : "Active Members",
      value: "1",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} loading={false} />
      ))}
    </div>
  );
}
