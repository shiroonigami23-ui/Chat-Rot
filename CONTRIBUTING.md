# Contributing to OmniCore Universal Chatbot

Welcome to the team! This document outlines our team development workflow, branch strategy, pull request requirements, and coding conventions for our final year capstone project.

---

## 1. Team Coordination & Roles

We have 3 team members collaborating on this codebase. To prevent merge conflicts and maintain code velocity, responsibilities are segmented:

- **Student A (Core Engine Lead):**
  - Prompt pipeline, LLM client orchestration, context memory window, token budgeting.
- **Student B (Integration & Adapter Lead):**
  - Webhook normalization, Slack/Discord/REST adapters, authentication and HMAC verification.
- **Student C (Studio UI & CI/CD Lead):**
  - React Developer Studio, testing harness, GitHub Actions workflows, documentation synchronization.

---

## 2. Git Workflow & Branch Strategy

We adhere to a trunk-based branching model with feature branches:

### Branch Naming Conventions
- `feat/<feature-name>`: New feature or channel adapter (e.g., `feat/slack-blockkit-egress`)
- `fix/<bug-name>`: Bug fixes or normalization patches (e.g., `fix/discord-signature-header`)
- `docs/<doc-name>`: Documentation updates or guides (e.g., `docs/api-spec-v1`)
- `test/<test-suite>`: New verification test cases or CI updates (e.g., `test/action-bot-e2e`)

### Step-by-Step Workflow
1. **Pull the latest main:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Create your feature branch:**
   ```bash
   git checkout -b feat/my-new-adapter
   ```
3. **Run local verification before committing:**
   ```bash
   npm run lint
   npm run build
   ```
4. **Commit with Conventional Commit messages:**
   - `feat: add discord interaction transformer`
   - `fix: resolve payload parsing for empty session ID`
   - `docs: update quickstart in README.md`
   - `refactor: extract universal message normalizer`
5. **Push and open a Pull Request:**
   ```bash
   git push origin feat/my-new-adapter
   ```

---

## 3. Pull Request Requirements

Every Pull Request must satisfy the following criteria before being merged into `main`:
1. **Review Required:** At least **one other teammate** must approve the PR.
2. **CI Passing:** The `.github/workflows/ci.yml` and `bot-verification.yml` checks must pass cleanly.
3. **No Dead Code:** Delete commented-out code and test logs before requesting review.
4. **Documentation:** If an API endpoint or adapter configuration changes, update `docs/API_SPECIFICATION.md` or `docs/INTEGRATION_GUIDE.md` in the same PR.

---

## 4. Code Standards

- **TypeScript:** Strict types must be used. Avoid `any`; use typed interfaces for inbound/outbound payloads.
- **Express Routes:** Route handlers must return consistent JSON structures (`{ success: boolean, data?: any, error?: { code, message } }`).
- **Modularity:** Separate adapters into their own files under `src/adapters/` or backend handlers in `server.ts`.
- **Security:** Never commit API keys or production secrets to Git. Always use `.env` and `.env.example`.

---

## 5. Issue Tracking & Milestones

All work items should be linked to an issue on our GitHub board. Label tickets with:
- `phase-1-foundation`
- `adapter-web` / `adapter-slack` / `adapter-discord`
- `priority:high` / `priority:medium`
- `student-a` / `student-b` / `student-c`
