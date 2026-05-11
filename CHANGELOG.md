# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Route-level permission guards on `/projects` and `/projects/:projectId` — redirects to `/access-denied` when the member lacks `project:read`
- `/access-denied` page with a shield icon, descriptive message, Go Back (uses `router.history.back()`), and Go Home actions
- `CONTEXT.md` — domain glossary covering Organization, Member, Role, Permission, Resource, Permission Guard, and Access Denied

### Changed

- Removed `project: ["read"]` from the `member` role so the permission guard is exercised for restricted members
