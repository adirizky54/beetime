import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import type { MemberAllQuery, MemberQuery } from "@beetime/schema";

import { members, users } from "@/database/schema";
import { db } from "@/lib/db";
import { withPagination } from "@/lib/pagination";

function buildMemberConditions(orgId: string, query: MemberAllQuery) {
  const conditions = [eq(members.organizationId, orgId)];

  if (query.search) {
    const pattern = `%${query.search}%`;
    const searchCondition = or(
      ilike(users.name, pattern),
      ilike(users.email, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (query.role) {
    conditions.push(eq(members.role, query.role));
  }

  return conditions;
}

const memberFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  role: members.role,
  banned: users.banned,
  createdAt: members.createdAt,
};

export async function listMembers(orgId: string, query: MemberQuery) {
  const conditions = buildMemberConditions(orgId, query);

  const memberList = db
    .select(memberFields)
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(and(...conditions))
    .orderBy(asc(users.name))
    .$dynamic();

  const memberCount = db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(and(...conditions))
    .then(([row]) => row.count);

  const result = await withPagination(
    memberList,
    memberCount,
    { page: query.page, pageSize: query.pageSize },
  );

  return result;
}

export async function listMembersAll(orgId: string, query: MemberAllQuery) {
  const conditions = buildMemberConditions(orgId, query);

  return db
    .select(memberFields)
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(and(...conditions))
    .orderBy(asc(users.name));
}
