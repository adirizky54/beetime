export interface MockOrg {
  id: string;
  name: string;
  slug: string;
}

export interface MockProject {
  id: string;
  name: string;
  organizationId: string;
}

export interface MockTask {
  id: string;
  name: string;
  projectId: string;
  doneAt: string | null;
}

export const MOCK_ORGS: MockOrg[] = [
  { id: "org-1", name: "Freelance", slug: "freelance" },
  { id: "org-2", name: "Agency Co.", slug: "agency-co" },
];

export const MOCK_PROJECTS: MockProject[] = [
  { id: "proj-1", name: "Website Redesign", organizationId: "org-1" },
  { id: "proj-2", name: "Mobile App", organizationId: "org-1" },
  { id: "proj-3", name: "Dashboard MVP", organizationId: "org-2" },
  { id: "proj-4", name: "API Integration", organizationId: "org-2" },
];

export const MOCK_TASKS: MockTask[] = [
  { id: "task-1", name: "Design homepage mockup", projectId: "proj-1", doneAt: null },
  { id: "task-2", name: "Implement auth flow", projectId: "proj-1", doneAt: null },
  { id: "task-3", name: "Set up CI/CD pipeline", projectId: "proj-1", doneAt: "2026-06-18T14:00:00Z" },
  { id: "task-4", name: "Write API documentation", projectId: "proj-1", doneAt: null },
  { id: "task-5", name: "Create onboarding screen", projectId: "proj-2", doneAt: null },
  { id: "task-6", name: "Push notification support", projectId: "proj-2", doneAt: null },
  { id: "task-7", name: "Offline mode cache", projectId: "proj-2", doneAt: "2026-06-17T09:00:00Z" },
  { id: "task-8", name: "Chart widget", projectId: "proj-3", doneAt: null },
  { id: "task-9", name: "User management table", projectId: "proj-3", doneAt: null },
  { id: "task-10", name: "Export CSV feature", projectId: "proj-3", doneAt: null },
  { id: "task-11", name: "Stripe checkout", projectId: "proj-4", doneAt: null },
  { id: "task-12", name: "Webhook receiver", projectId: "proj-4", doneAt: "2026-06-16T11:00:00Z" },
];
