import { eq, and, or, like, isNull, isNotNull, asc } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import type { ClientQuery, CreateClientInput, UpdateClientInput } from "@beetime/schema";

import { clients } from "@/database/schema";
import type { AuthUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { withPagination } from "@/lib/pagination";

export async function listClients(orgId: string, query: ClientQuery) {
  const conditions = [eq(clients.organizationId, orgId)];

  if (query.status === "active") {
    conditions.push(isNull(clients.archivedAt));
  } else if (query.status === "archived") {
    conditions.push(isNotNull(clients.archivedAt));
  }

  if (query.search) {
    const searchPattern = `%${query.search}%`;
    const searchCondition = or(like(clients.name, searchPattern), like(clients.email, searchPattern));
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const clientList = db
    .select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      address: clients.address,
      organizationId: clients.organizationId,
      createdBy: clients.createdBy,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      archivedAt: clients.archivedAt,
    })
    .from(clients)
    .where(and(...conditions))
    .orderBy(asc(clients.name))
    .$dynamic();

  const clientCount = db.$count(clients, and(...conditions));

  const result = await withPagination(clientList, clientCount, { page: query.page, pageSize: query.pageSize });

  return result;
}

export async function listClientsAll(orgId: string, status: ClientQuery["status"]) {
  const conditions = [eq(clients.organizationId, orgId)];

  if (status === "active") {
    conditions.push(isNull(clients.archivedAt));
  } else if (status === "archived") {
    conditions.push(isNotNull(clients.archivedAt));
  }

  const clientsList = await db.query.clients.findMany({
    where: and(...conditions),
    orderBy: asc(clients.name),
  });

  return clientsList;
}

export async function getClient(orgId: string, clientId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.organizationId, orgId), eq(clients.id, clientId)),
  });

  if (!client) {
    throw new HTTPException(404, { message: "Client not found" });
  }

  return client;
}

export async function createClient(user: AuthUser, orgId: string, data: CreateClientInput) {
  const [client] = await db
    .insert(clients)
    .values({
      organizationId: orgId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      createdBy: user.id,
    })
    .returning();

  return client;
}

export async function updateClient(orgId: string, clientId: string, data: UpdateClientInput) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.organizationId, orgId), eq(clients.id, clientId)),
  });

  if (client) {
    if (client.archivedAt) {
      throw new HTTPException(409, {
        message: "Cannot update archived client. Please unarchive the client first.",
      });
    }
  } else {
    throw new HTTPException(404, { message: "Client not found" });
  }

  const [updatedClient] = await db
    .update(clients)
    .set(data)
    .where(and(eq(clients.organizationId, orgId), eq(clients.id, clientId)))
    .returning();

  return updatedClient;
}

export async function deleteClient(orgId: string, clientId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.organizationId, orgId), eq(clients.id, clientId)),
  });

  if (!client) {
    throw new HTTPException(404, { message: "Client not found!" });
  }

  await db.delete(clients).where(eq(clients.id, clientId));
}

export async function archiveClient(orgId: string, clientId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.organizationId, orgId), eq(clients.id, clientId)),
  });

  if (!client) {
    throw new HTTPException(404, { message: "Client not found" });
  }

  if (client.archivedAt) {
    throw new HTTPException(409, {
      message: "Client is already archived",
    });
  }

  const [updatedClient] = await db
    .update(clients)
    .set({ archivedAt: new Date() })
    .where(and(eq(clients.organizationId, orgId), eq(clients.id, clientId)))
    .returning();

  return updatedClient;
}

export async function unarchiveClient(orgId: string, clientId: string) {
  const client = await db.query.clients.findFirst({
    where: and(eq(clients.organizationId, orgId), eq(clients.id, clientId)),
  });

  if (!client) {
    throw new HTTPException(404, { message: "Client not found" });
  }

  if (!client.archivedAt) {
    throw new HTTPException(409, {
      message: "Client is already active",
    });
  }

  const [updatedClient] = await db
    .update(clients)
    .set({ archivedAt: null })
    .where(and(eq(clients.organizationId, orgId), eq(clients.id, clientId)))
    .returning();

  return updatedClient;
}
