import { createFileRoute, redirect, useCanGoBack, useRouter } from "@tanstack/react-router";
import * as v from "valibot";
import { RiArrowLeftSLine } from "@remixicon/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@beetime/ui/components/tabs";
import { Button } from "@beetime/ui/components/button";

import { MinimalLayout } from "@/components/layouts/minimal-layout";
import { GeneralTab } from "@/components/profile/general-tab";
import { SecurityTab } from "@/components/profile/security-tab";
import { SessionsTab } from "@/components/profile/sessions-tab";

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ context }) => {
    if (!context.session) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [{ title: "Profile — Bee Time" }],
  }),
  validateSearch: v.object({
    tab: v.optional(v.picklist(["general", "security", "sessions"]), "general"),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const canGoBack = useCanGoBack();
  const search = Route.useSearch();

  const onBack = () => {
    if (canGoBack) {
      router.history.back();
    } else {
      navigate({ to: "/" });
    }
  };

  return (
    <MinimalLayout className="items-start py-10">
      <div className="w-full max-w-2xl">
        <Button variant="link" className="h-auto px-0 text-muted-foreground" onClick={onBack}>
          <RiArrowLeftSLine />
          Go Back
        </Button>

        <h3 className="text-2xl font-semibold text-balance text-foreground">Profile</h3>
        <p className="mt-1 text-sm text-pretty text-muted-foreground dark:text-muted-foreground">
          Manage your account settings
        </p>

        <Tabs
          value={search.tab}
          onValueChange={(value) => {
            navigate({ search: (prev) => ({ ...prev, tab: value }) });
          }}
          className="mt-8"
        >
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </MinimalLayout>
  );
}
