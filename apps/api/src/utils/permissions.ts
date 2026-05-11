import { createAccessControl } from "better-auth/plugins/access";

export const statement = {
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "cancel"],
  project: ["create", "read", "update", "delete", "archive"],
  client: ["create", "read", "update", "delete", "archive"],
  task: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const superadmin = ac.newRole({
  user: ["create", "list", "set-role", "ban", "impersonate", "delete", "set-password", "get", "update"],
  session: ["list", "revoke", "delete"],
});

export const user = ac.newRole({
  user: [],
  session: [],
});

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "cancel"],
  project: ["create", "read", "update", "delete", "archive"],
  client: ["create", "read", "update", "delete", "archive"],
  task: ["create", "read", "update", "delete"],
});

export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "cancel"],
  project: ["create", "read", "update", "delete", "archive"],
  client: ["create", "read", "update", "delete", "archive"],
  task: ["create", "read", "update", "delete"],
});

export const member = ac.newRole({
  organization: [],
  member: ["read"],
  invitation: [],
  project: ["read"],
  client: ["read"],
  task: ["read"],
});
