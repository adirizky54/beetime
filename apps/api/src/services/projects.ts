import { and, desc, eq, exists, ilike, inArray, isNotNull, isNull, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { CreateProjectInput, ProjectQuery, UpdateProjectInput } from "@beetime/schema";

import { clients, members, projectMembers, projects, users } from "@/database/schema";
import type { AuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withPagination } from "@/lib/pagination";

export async function listProjects(user: AuthUser, orgId: string, query: ProjectQuery) {
  const conditions = [eq(projects.organizationId, orgId)];

  if (query.status === "active") {
    conditions.push(isNull(projects.archivedAt));
  } else if (query.status === "archived") {
    conditions.push(isNotNull(projects.archivedAt));
  }

  if (query.clientId) {
    conditions.push(eq(projects.clientId, query.clientId));
  }

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    const searchCondition = or(ilike(projects.name, searchPattern), ilike(projects.description, searchPattern));
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Admins/owners see all projects; regular members see public + their private projects
  if (!user.role?.includes("admin") && !user.role?.includes("owner")) {
    const privacyCondition = or(
      eq(projects.privacy, "public"),
      exists(
        db
          .select()
          .from(projectMembers)
          .where(and(eq(projectMembers.projectId, projects.id), eq(projectMembers.userId, user.id))),
      ),
    );
    if (privacyCondition) conditions.push(privacyCondition);
  }

  const projectList = db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      privacy: projects.privacy,
      organizationId: projects.organizationId,
      createdBy: projects.createdBy,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      archivedAt: projects.archivedAt,
      clientId: projects.clientId,
      client: {
        id: clients.id,
        name: clients.name,
      },
      members: sql<{ id: string; name: string; image: string | null }[]>`
        COALESCE(
          (
            SELECT json_agg(json_build_object('id', ${users.id}, 'name', ${users.name}, 'image', ${users.image}))
            FROM ${projectMembers}
            JOIN ${users} ON ${projectMembers.userId} = ${users.id}
            WHERE ${projectMembers.projectId} = ${projects.id}
          ),
          '[]'::json
        )
      `,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(...conditions))
    .orderBy(desc(projects.createdAt))
    .$dynamic();

  const projectCount = db.$count(projects, and(...conditions));

  const result = await withPagination(projectList, projectCount, { page: query.page, pageSize: query.pageSize });

  return result;
}

export async function getProject(user: AuthUser, orgId: string, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.organizationId, orgId), eq(projects.id, projectId)),
    with: {
      client: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found!" });
  }

  if (project.privacy === "private") {
    if (!user.role?.includes("admin") && !user.role?.includes("owner")) {
      const membership = await db.query.projectMembers.findFirst({
        where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, user.id)),
      });
      if (!membership) {
        // Return 404 to avoid leaking existence of private projects
        throw new HTTPException(404, { message: "Project not found!" });
      }
    }
  }

  return project;
}

export async function getProjectMembers(projectId: string) {
  const members = await db.query.projectMembers.findMany({
    where: eq(projectMembers.projectId, projectId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return members.map((member) => member.user);
}

export async function createProject(user: AuthUser, orgId: string, data: CreateProjectInput) {
  if (data.clientId) {
    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, data.clientId), eq(clients.organizationId, orgId)),
    });

    if (client) {
      if (client.archivedAt) {
        throw new HTTPException(400, { message: "Cannot assign an archived client to a project!" });
      }
    } else {
      throw new HTTPException(400, { message: "Client not found in this organization!" });
    }
  }

  const [project] = await db.transaction(async (tx) => {
    const [newProject] = await tx
      .insert(projects)
      .values({
        organizationId: orgId,
        name: data.name,
        description: data.description,
        privacy: data.privacy,
        clientId: data.clientId ?? null,
        createdBy: user.id,
      })
      .returning();

    if (data.privacy === "public") {
      const orgMembers = await tx.query.members.findMany({
        where: eq(members.organizationId, orgId),
      });

      if (orgMembers.length > 0) {
        await tx
          .insert(projectMembers)
          .values(orgMembers.map((m) => ({ projectId: newProject.id, userId: m.userId })))
          .onConflictDoNothing();
      }
    } else {
      const orgMembers = await tx.query.members.findMany({
        where: and(eq(members.organizationId, orgId), inArray(members.userId, data.userIds)),
      });

      const validUserIds = new Set(orgMembers.map((m) => m.userId));
      const invalidIds = data.userIds.filter((id: string) => !validUserIds.has(id));
      if (invalidIds.length > 0) {
        throw new HTTPException(400, {
          message: `The following users are not members of this organization: ${invalidIds.join(", ")}`,
        });
      }

      await tx
        .insert(projectMembers)
        .values(orgMembers.map((m) => ({ projectId: newProject.id, userId: m.userId })))
        .onConflictDoNothing();
    }

    return [newProject];
  });

  return project;
}

export async function updateProject(orgId: string, projectId: string, data: UpdateProjectInput) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, orgId)),
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found!" });
  }

  if (data.clientId) {
    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, data.clientId), eq(clients.organizationId, orgId)),
    });

    if (client) {
      if (client.archivedAt) {
        throw new HTTPException(400, { message: "Cannot assign an archived client to a project!" });
      }
    } else {
      throw new HTTPException(400, { message: "Client not found in this organization!" });
    }
  }

  const { userIds, ...projectData } = data;

  const switchingToPublic = project.privacy === "private" && data.privacy === "public";
  const switchingToPrivate = project.privacy === "public" && data.privacy === "private";
  const stayingPrivate = project.privacy === "private" && data.privacy !== "public";

  // Validate org membership for userIds when project will be private
  let validatedUserIds: string[] | undefined;
  if ((switchingToPrivate || stayingPrivate) && userIds && userIds.length > 0) {
    const orgMemberResults = await db.query.members.findMany({
      where: and(eq(members.organizationId, orgId), inArray(members.userId, userIds)),
    });

    const validUserIdSet = new Set(orgMemberResults.map((m) => m.userId));
    const invalidIds = userIds.filter((id) => !validUserIdSet.has(id));
    if (invalidIds.length > 0) {
      throw new HTTPException(400, {
        message: `The following users are not members of this organization: ${invalidIds.join(", ")}`,
      });
    }

    validatedUserIds = userIds;
  }

  const [updatedProject] = await db.transaction(async (tx) => {
    const [result] = await tx.update(projects).set(projectData).where(eq(projects.id, projectId)).returning();

    if (switchingToPublic) {
      // Enroll all current org members (existing behavior)
      const orgMembers = await tx.query.members.findMany({
        where: eq(members.organizationId, orgId),
      });

      if (orgMembers.length > 0) {
        await tx
          .insert(projectMembers)
          .values(orgMembers.map((m) => ({ projectId, userId: m.userId })))
          .onConflictDoNothing();
      }
    } else if (validatedUserIds) {
      // Full replacement: delete all current members, re-insert new list
      await tx.delete(projectMembers).where(eq(projectMembers.projectId, projectId));

      await tx.insert(projectMembers).values(validatedUserIds.map((userId) => ({ projectId, userId })));
    }

    return [result];
  });

  return updatedProject;
}

export async function deleteProject(orgId: string, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, orgId)),
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found!" });
  }

  await db.delete(projects).where(eq(projects.id, projectId));
}

export async function archiveProject(orgId: string, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, orgId)),
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found!" });
  }

  if (project.archivedAt) {
    throw new HTTPException(409, { message: "Project is already archived!" });
  }

  const [updatedProject] = await db
    .update(projects)
    .set({ archivedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  return updatedProject;
}

export async function unarchiveProject(orgId: string, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.organizationId, orgId)),
  });

  if (!project) {
    throw new HTTPException(404, { message: "Project not found!" });
  }

  if (!project.archivedAt) {
    throw new HTTPException(409, { message: "Project is already active!" });
  }

  const [updatedProject] = await db
    .update(projects)
    .set({ archivedAt: null })
    .where(eq(projects.id, projectId))
    .returning();

  return updatedProject;
}
