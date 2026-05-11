# Bee Time

A time-tracking application for freelancers and agencies, organized as a multi-tenant SaaS where users belong to **Organizations** and are assigned **Roles** that determine what they can do.

## Language

**Organization**:
A tenant workspace that owns projects, clients, tasks, and members.
_Avoid_: Team, workspace, account

**Member**:
A user who belongs to an Organization and has a Role within it.
_Avoid_: User (use "user" only for the global auth identity, "member" for org-scoped identity)

**Role**:
A named set of permissions assigned to a Member within an Organization. Built-in roles are `owner`, `admin`, and `member`.
_Avoid_: Permission level, access level

**Permission**:
A specific action a Role is allowed to perform on a Resource (e.g. `project:read`, `project:create`).
_Avoid_: Capability, right, privilege

**Resource**:
A domain object that permissions are declared against (e.g. `project`, `client`, `task`, `member`).
_Avoid_: Entity (entity implies DB; resource implies the permission surface)

**Permission Guard**:
A `beforeLoad` check in a route that validates the current member's permissions and redirects to `/access-denied` if the check fails.
_Avoid_: Auth guard (auth guard = authentication; permission guard = authorization), route protection

**Access Denied**:
The `/access-denied` route shown when a Member navigates to a page their Role does not permit.
_Avoid_: 403 page, forbidden page, unauthorized page

## Relationships

- An **Organization** has one or more **Members**
- Each **Member** has exactly one **Role** within an **Organization**
- A **Role** grants a set of **Permissions** over **Resources**
- A **Permission Guard** on a route checks the active **Member's Role** before rendering

## Example dialogue

> **Dev:** "Should the projects page be visible to all members?"
> **Domain expert:** "Only if their Role grants `project:read`. A member with no read permission hits the Permission Guard and lands on Access Denied."
> **Dev:** "Do we redirect or show something inline?"
> **Domain expert:** "Redirect — the Access Denied route is standalone so the user can go home or go back."

## Flagged ambiguities

- "user" was used broadly — resolved: `User` = the global Better Auth identity; `Member` = org-scoped identity with a Role. These are distinct.
