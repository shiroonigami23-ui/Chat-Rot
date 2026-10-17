# Changelog

All notable changes to the OmniCore Universal Chatbot project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned for Phase 2
- Redis-backed persistent session store for distributed multi-instance deployment.
- Vector store / RAG integration for uploading university PDF documents and course syllabus.
- Bi-directional Slack Socket Mode and Discord Gateway bot workers.
- OAuth 2.0 Client Credentials flow for enterprise CRM integrations.

---

## [0.1.0] - Phase 1 Foundation - 2026-10-17

### Added
- **Universal Gateway Architecture:** Express-based server running normalization pipeline on `/api/v1/chat`.
- **Channel Normalization Engine:** Initial adapter abstraction supporting `web`, `rest-api`, `slack`, `discord`, and `custom-webhook`.
- **LLM Engine Dispatcher:** Server-side Gemini API (`gemini-3.8-flash`) integration with smart fallback simulator when running offline.
- **Webhook Gateway Receiver:** Inbound webhook router on `/api/v1/webhooks/:channel` that normalizes external third-party events.
- **Action Bot Verification Suite:** Automated integration testing harness checking API health, contract adherence, payload normalization, and response latency.
- **React Developer Studio:** Complete browser-based sandbox with live chat channel simulator, payload inspector, code snippet generator, and documentation explorer.
- **Universal SDK:** In-app copyable JavaScript, TypeScript/Node.js, Python, and cURL snippets for immediate integration into external applications.
- **Project Governance & Documentation:**
  - `README.md`: High-level system overview, architecture diagram, and quickstart.
  - `LICENSE`: Open-source MIT license.
  - `CONTRIBUTING.md`: Teammate onboarding, Git flow, and PR requirements.
  - `docs/ARCHITECTURE.md`: Deep dive into core pipeline and adapter contract.
  - `docs/API_SPECIFICATION.md`: REST endpoints and OpenAPI payload definitions.
  - `docs/INTEGRATION_GUIDE.md`: Multi-language and multi-platform integration guides.
  - `docs/SECURITY_MODEL.md`: Auth token specs, rate-limiting, and input sanitization.
  - `docs/TEAM_MILESTONES.txt`: 8-week capstone roadmap and team role allocations.
  - `.github/workflows/ci.yml`: Continuous integration workflow for lint and build.
  - `.github/workflows/bot-verification.yml`: Automated action bot test workflow for GitHub Actions.
