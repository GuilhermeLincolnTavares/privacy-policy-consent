# CLAUDE.md

Guidelines for AI-assisted development in this repository.

## Project

Privacy policy consent module. After login, a user who has not accepted the current
privacy policy version sees a modal with the terms and a confirmation button. Acceptance
is persisted so the modal is not shown again. Admins see each user's acceptance status in
a grid and can switch the notification on or off.

Stack: Spring Boot 4.2 and Java 21 (Maven), PostgreSQL 17 via Docker Compose, Flyway,
React + Vite + TypeScript.

## Architecture

- Classic Spring layers: `controller -> service -> repository`.
- Backend packages are organized by feature (`consent`, `policy`, `user`, `auth`), each
  holding its own controller, service, repository and entity.
- Controllers only receive requests, validate input and return responses. Business rules
  live in services.
- API input and output use DTOs (Java `record`). JPA entities are never exposed by the API.
- Frontend is organized by file type (`pages`, `components`, `hooks`, `services`, `context`,
  `types`), with the API calls kept apart from the screens.
- No hexagonal, DDD or Clean Architecture layers: the domain is small and extra
  abstractions would hurt readability.

## Code style

- Names must explain themselves (`hasAcceptedCurrentPolicy`, not `check`). This is
  preferred over comments.
- Short methods with a single responsibility.
- Frontend: React components, hooks and helpers are arrow functions
  (`export const Name = () => {}`), never `function` declarations.
- No Lombok. Use `record` for DTOs and plain getters in entities.
- No magic numbers or strings: use named constants.
- Comment only the why (non-obvious decisions, traps), never the what.
- Code, comments and commit messages in English. UI texts and the README in Portuguese.

## Business rules

- The modal is shown when the notification is enabled AND the user has not accepted the
  current policy version.
- The notification switch is global (`privacy_settings`, a single row), so it survives
  new policy versions.
- A user's status only becomes "accepted" when the user accepts. Disabling the
  notification never changes acceptance records.
- Accepting is idempotent: one record per user and policy version.
- Exactly one policy is current at a time.

## Database

- Only Flyway changes the schema (`backend/src/main/resources/db/migration`).
- An applied migration is never edited. Create a new one instead.
- Hibernate runs with `ddl-auto: validate`.

## Workflow

- Branches: `main` (stable), `dev` (integration), `feat/*` (one per feature, merged into
  `dev` through a pull request).
- Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`.
- Propose the design first and write files only after the user approves.
- Every business rule in services must have unit tests.

## Commands

```
docker compose up -d                      # start PostgreSQL
cd backend && .\mvnw.cmd spring-boot:run  # run the API on :8080
cd backend && .\mvnw.cmd test             # run backend tests
cd frontend && npm install && npm run dev # run the UI on :5173
```
