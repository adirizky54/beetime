import {
  ClientAllQuerySchema,
  ClientQuerySchema,
  CreateClientSchema,
  CreateProjectSchema,
  CreateTaskSchema,
  MemberAllQuerySchema,
  MemberQuerySchema,
  ProjectQuerySchema,
  TaskAssigneesBodySchema,
  TaskQuerySchema,
  UpdateClientSchema,
  UpdateProjectSchema,
  UpdateTaskSchema,
} from "@beetime/schema";

import { createRouter } from "@/lib/app";
import { authMiddleware } from "@/middlewares/auth";
import { authorize } from "@/middlewares/authorize";
import { validator } from "@/middlewares/validator";
import { verifyMembership } from "@/middlewares/verify-membership";
import * as clientService from "@/services/clients";
import * as memberService from "@/services/members";
import * as projectService from "@/services/projects";
import * as taskService from "@/services/tasks";

export const organizationsRoutes = createRouter().basePath("/:orgId");

organizationsRoutes.use("*", authMiddleware);
organizationsRoutes.use("*", verifyMembership);

// Project routes under organization

organizationsRoutes.get(
  "/projects",
  authorize({ project: ["read"] }),
  validator("query", ProjectQuerySchema),
  async (c) => {
    const user = c.get("user")!;
    const { orgId } = c.req.param();
    const query = c.req.valid("query");

    const result = await projectService.listProjects(user, orgId, query);

    return c.json(
      {
        ...result,
        message: "Projects retrieved successfully",
      },
      200,
    );
  },
);

organizationsRoutes.get("/projects/:projectId", authorize({ project: ["read"] }), async (c) => {
  const user = c.get("user")!;
  const { orgId, projectId } = c.req.param();

  const project = await projectService.getProject(user, orgId, projectId);

  return c.json(
    {
      data: project,
      message: "Project retrieved successfully",
    },
    200,
  );
});

organizationsRoutes.get("/projects/:projectId/members", authorize({ project: ["read"] }), async (c) => {
  const { orgId, projectId } = c.req.param();

  const projectMembers = await projectService.getProjectMembers(orgId, projectId);

  return c.json(
    {
      data: projectMembers,
      message: "Project members retrieved successfully",
    },
    200,
  );
});

organizationsRoutes.post(
  "/projects",
  authorize({ project: ["create"] }),
  validator("json", CreateProjectSchema),
  async (c) => {
    const user = c.get("user")!;
    const { orgId } = c.req.param();
    const data = c.req.valid("json");

    const project = await projectService.createProject(user, orgId, data);

    return c.json(
      {
        data: project,
        message: "Project created successfully",
      },
      201,
    );
  },
);

organizationsRoutes.patch(
  "/projects/:projectId",
  authorize({ project: ["update"] }),
  validator("json", UpdateProjectSchema),
  async (c) => {
    const { orgId, projectId } = c.req.param();
    const data = c.req.valid("json");

    const updatedProject = await projectService.updateProject(orgId, projectId, data);

    return c.json(
      {
        data: updatedProject,
        message: "Project updated successfully",
      },
      200,
    );
  },
);

organizationsRoutes.delete("/projects/:projectId", authorize({ project: ["delete"] }), async (c) => {
  const { orgId, projectId } = c.req.param();

  await projectService.deleteProject(orgId, projectId);

  return c.json(
    {
      data: null,
      message: "Project deleted successfully",
    },
    200,
  );
});

organizationsRoutes.post("/projects/:projectId/archive", authorize({ project: ["archive"] }), async (c) => {
  const { orgId, projectId } = c.req.param();

  const project = await projectService.archiveProject(orgId, projectId);

  return c.json(
    {
      data: project,
      message: "Project archived successfully",
    },
    200,
  );
});

organizationsRoutes.post("/projects/:projectId/unarchive", authorize({ project: ["archive"] }), async (c) => {
  const { orgId, projectId } = c.req.param();

  const project = await projectService.unarchiveProject(orgId, projectId);

  return c.json(
    {
      data: project,
      message: "Project unarchived successfully",
    },
    200,
  );
});

// Client routes under organization

organizationsRoutes.get(
  "/clients",
  authorize({ client: ["read"] }),
  validator("query", ClientQuerySchema),
  async (c) => {
    const { orgId } = c.req.param();
    const query = c.req.valid("query");

    const result = await clientService.listClients(orgId, query);

    return c.json(
      {
        ...result,
        message: "Clients retrieved successfully",
      },
      200,
    );
  },
);

organizationsRoutes.get(
  "/clients/all",
  authorize({ client: ["read"] }),
  validator("query", ClientAllQuerySchema),
  async (c) => {
    const { orgId } = c.req.param();
    const { status } = c.req.valid("query");

    const result = await clientService.listClientsAll(orgId, status);

    return c.json(
      {
        data: result,
        message: "Clients retrieved successfully",
      },
      200,
    );
  },
);

organizationsRoutes.get("/clients/:clientId", authorize({ client: ["read"] }), async (c) => {
  const { orgId, clientId } = c.req.param();

  const client = await clientService.getClient(orgId, clientId);

  return c.json(
    {
      data: client,
      message: "Client retrieved successfully",
    },
    200,
  );
});

organizationsRoutes.post(
  "/clients",
  authorize({ client: ["create"] }),
  validator("json", CreateClientSchema),
  async (c) => {
    const user = c.get("user")!;
    const { orgId } = c.req.param();
    const data = c.req.valid("json");

    const client = await clientService.createClient(user, orgId, data);

    return c.json(
      {
        data: client,
        message: "Client created successfully",
      },
      201,
    );
  },
);

organizationsRoutes.patch(
  "/clients/:clientId",
  authorize({ client: ["update"] }),
  validator("json", UpdateClientSchema),
  async (c) => {
    const { orgId, clientId } = c.req.param();
    const data = c.req.valid("json");

    const client = await clientService.updateClient(orgId, clientId, data);

    return c.json(
      {
        data: client,
        message: "Client updated successfully",
      },
      200,
    );
  },
);

organizationsRoutes.delete("/clients/:clientId", authorize({ client: ["delete"] }), async (c) => {
  const { orgId, clientId } = c.req.param();

  await clientService.deleteClient(orgId, clientId);

  return c.json(
    {
      data: null,
      message: "Client deleted successfully",
    },
    200,
  );
});

organizationsRoutes.post("/clients/:clientId/archive", authorize({ client: ["archive"] }), async (c) => {
  const { orgId, clientId } = c.req.param();

  const client = await clientService.archiveClient(orgId, clientId);

  return c.json(
    {
      data: client,
      message: "Client archived successfully",
    },
    200,
  );
});

organizationsRoutes.post("/clients/:clientId/unarchive", authorize({ client: ["archive"] }), async (c) => {
  const { orgId, clientId } = c.req.param();

  const client = await clientService.unarchiveClient(orgId, clientId);

  return c.json(
    {
      data: client,
      message: "Client unarchived successfully",
    },
    200,
  );
});

// Member routes under organization

organizationsRoutes.get(
  "/members",
  authorize({ member: ["read"] }),
  validator("query", MemberQuerySchema),
  async (c) => {
    const { orgId } = c.req.param();
    const query = c.req.valid("query");

    const result = await memberService.listMembers(orgId, query);

    return c.json(
      {
        ...result,
        message: "Members retrieved successfully",
      },
      200,
    );
  },
);

organizationsRoutes.get(
  "/members/all",
  authorize({ member: ["read"] }),
  validator("query", MemberAllQuerySchema),
  async (c) => {
    const { orgId } = c.req.param();
    const query = c.req.valid("query");

    const data = await memberService.listMembersAll(orgId, query);

    return c.json(
      {
        data,
        message: "Members retrieved successfully",
      },
      200,
    );
  },
);

// Task routes under project

organizationsRoutes.get(
  "/projects/:projectId/tasks",
  authorize({ task: ["read"] }),
  validator("query", TaskQuerySchema),
  async (c) => {
    const { projectId } = c.req.param();
    const query = c.req.valid("query");

    const result = await taskService.listTasks(projectId, query);

    return c.json(
      {
        ...result,
        message: "Tasks retrieved successfully",
      },
      200,
    );
  },
);

organizationsRoutes.get("/projects/:projectId/tasks/:taskId", authorize({ task: ["read"] }), async (c) => {
  const { projectId, taskId } = c.req.param();

  const data = await taskService.getTask(projectId, taskId);

  return c.json(
    {
      data,
      message: "Task retrieved successfully",
    },
    200,
  );
});

organizationsRoutes.post(
  "/projects/:projectId/tasks",
  authorize({ task: ["create"] }),
  validator("json", CreateTaskSchema),
  async (c) => {
    const { projectId } = c.req.param();
    const body = c.req.valid("json");

    const data = await taskService.createTask(projectId, body);

    return c.json(
      {
        data,
        message: "Task created successfully",
      },
      201,
    );
  },
);

organizationsRoutes.patch(
  "/projects/:projectId/tasks/:taskId",
  authorize({ task: ["update"] }),
  validator("json", UpdateTaskSchema),
  async (c) => {
    const { projectId, taskId } = c.req.param();
    const body = c.req.valid("json");

    const data = await taskService.updateTask(projectId, taskId, body);

    return c.json(
      {
        data,
        message: "Task updated successfully",
      },
      200,
    );
  },
);

organizationsRoutes.delete("/projects/:projectId/tasks/:taskId", authorize({ task: ["delete"] }), async (c) => {
  const { projectId, taskId } = c.req.param();

  await taskService.deleteTask(projectId, taskId);

  return c.json(
    {
      data: null,
      message: "Task deleted successfully",
    },
    200,
  );
});

organizationsRoutes.patch(
  "/projects/:projectId/tasks/:taskId/assignees",
  authorize({ task: ["update"] }),
  validator("json", TaskAssigneesBodySchema),
  async (c) => {
    const { projectId, taskId } = c.req.param();
    const { userIds } = c.req.valid("json");

    await taskService.setTaskAssignees(projectId, taskId, userIds);

    return c.json(
      {
        data: null,
        message: "Assignees updated successfully",
      },
      200,
    );
  },
);
