# OmniCore Universal Chatbot Gateway & Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Project_Stage-Phase_1_Foundation-brightgreen.svg)](docs/TEAM_MILESTONES.txt)
[![Architecture](https://img.shields.io/badge/Architecture-Universal_Gateway-orange.svg)](docs/ARCHITECTURE.md)
[![Status](https://img.shields.io/badge/Integration_Bot-Passing-success.svg)](.github/workflows/bot-verification.yml)

> **College Final Year Capstone Project (2-Month Sprint Plan)**  
> **Team Size:** 3 Members  
> **Objective:** Design, develop, and benchmark a channel-agnostic Universal Chatbot Engine that seamlessly integrates into any host system (Web, Mobile, Slack, Discord, CRM/ERP webhooks, and headless REST/gRPC environments) via normalized payloads, modular pipeline adapters, and robust verification tooling.

---

## 1. Project Overview

Modern conversational AI systems frequently suffer from tight coupling: bots built for web frontends require major rewrites to operate inside enterprise chat tools (Slack, Discord), ticketing systems (Zendesk, Jira), or proprietary CRM webhooks. 

**OmniCore** solves this by establishing a **Universal Integration Gateway** pattern:
1. **Decoupled Channel Adapters:** Incoming requests from any source format (Slack BlockKit, Discord Webhooks, Web sockets, REST JSON) are normalized into a unified `BotMessage` schema.
2. **Context-Aware Processing Pipeline:** Manages multi-turn conversation memory, system prompt policy enforcement, token budgeting, and tool invocation.
3. **Pluggable LLM Dispatcher:** Powered by Google's Gemini API (`gemini-3.8-flash`) with fallback routers and deterministic simulation for edge/offline testing.
4. **Channel Egress Formatter:** Re-encodes the universal response into the native target system's schema (e.g., Slack JSON blocks, Discord embeds, HTML widget DOM, or standard REST output).
5. **Action Bot CI/CD Harness:** Continuous integration workflows to simulate integration handshakes and assert contract reliability before deployment.

---

## 2. System Architecture

```
   [External Systems]
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │  Web Widget  │     │ Slack / Bots │     │ REST Clients │
   └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌────────────────────────────────────────────────────────┐
   │             OmniCore Channel Adapters                  │
   │  (WebAdapter, SlackAdapter, DiscordAdapter, RestApi)   │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Universal Normalization Gateway            │
   │     • Inbound Payload Sanitizer                        │
   │     • HMAC Security & Token Verifier                   │
   │     • Session & State Orchestrator                     │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │             Core Cognitive Pipeline                    │
   │     • System Instruction & Persona Router              │
   │     • Conversation Context Window & Memory             │
   │     • Guardrail & Safety Evaluator                     │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │         LLM Engine (Gemini 3.8 Flash / Providers)       │
   └──────────────────────────┬─────────────────────────────┘
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │              Channel Egress Formatter                  │
   │   (HTML/Markdown, Slack BlockKit, Discord Rich Embed)  │
   └────────────────────────────────────────────────────────┘
```

Detailed architectural diagrams, sequence flows, and design trade-offs are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## 3. Repository Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml                 # PR validation, linting, build test
│       └── bot-verification.yml   # Action Bot automated integration tests
├── assets/                        # Brand vectors, architecture diagrams & logos
│   ├── logo.svg                   # Core project logo
│   └── architecture-diagram.svg   # Architectural pipeline diagram
├── backend/                       # Modular Backend Architecture
│   ├── adapters/                  # Channel adapters (Web, Slack, Discord, REST, Webhooks)
│   ├── core/                      # Cognitive pipeline, session store, Gemini AI engine
│   ├── routes/                    # API router (/api/v1/*)
│   └── types/                     # Canonical typed interfaces & contracts
├── docs/
│   ├── ARCHITECTURE.md            # Deep dive into system internals & dataflow
│   ├── API_SPECIFICATION.md       # OpenAPI / REST payload contract details
│   ├── INTEGRATION_GUIDE.md       # Integration tutorials (Web, Python, Node, Slack)
│   ├── SECURITY_MODEL.md          # Auth, HMAC, sanitization & guardrails
│   └── TEAM_MILESTONES.txt        # 8-week team roadmap & role breakdown
├── src/                           # Frontend Developer Studio & Test Portal
│   ├── components/                # React components (Sandbox, Widget, Docs, Action Bot)
│   ├── sdk/                       # Universal Bot Client SDK
│   ├── App.tsx                    # Studio dashboard & management interface
│   └── main.tsx                   # Client entry point
├── server.ts                      # Express API Gateway entry point & Vite dev bridge
├── CHANGELOG.md                   # Release notes and sprint history
├── CONTRIBUTING.md                # Collaboration workflow for team members
├── LICENSE                        # Open-source MIT license
└── package.json                   # Dependencies and npm scripts
```

---

## 4. Quickstart Guide

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)
- (Optional) `GEMINI_API_KEY` for live generative responses; the platform automatically falls back to deterministic simulation if unconfigured.

### Installation & Run

```bash
# 1. Clone the team repository
git clone https://github.com/your-college-team/omnicore-universal-chatbot.git
cd omnicore-universal-chatbot

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env

# 4. Start the full-stack system (Express API + Vite Dev Portal)
npm run dev
```

Visit `http://localhost:3000` to interact with the **Developer Studio**, run the **Channel Simulator**, test the **Action Bot**, or inspect live docs.

---

## 5. Core API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Gateway health check, adapter status, and memory metrics |
| `POST` | `/api/v1/chat` | Universal conversation endpoint (accepts universal payload) |
| `GET` | `/api/v1/integrations` | Returns list of configured channel adapters and specs |
| `POST` | `/api/v1/webhooks/:channel` | Generic webhook receiver for Slack, Discord, and CRM events |
| `POST` | `/api/v1/test-connection` | Integration verification bot test runner |

Full schemas and sample cURL / JSON examples are located in [`docs/API_SPECIFICATION.md`](docs/API_SPECIFICATION.md).

---

## 6. Team Distribution (Capstone Sprint)

- **Student 1 (Core Pipeline & LLM Engine):** Context orchestrator, Gemini integration, session memory store, prompt engineering.
- **Student 2 (Channel Adapters & Webhook Gateway):** Slack/Discord transform layer, REST/Webhook receivers, HMAC validation, Python SDK.
- **Student 3 (Developer Studio & CI/CD Testing):** React developer portal, test harness, GitHub Actions workflows, documentation management.

See [`docs/TEAM_MILESTONES.txt`](docs/TEAM_MILESTONES.txt) for the complete 8-week timeline and sprint deliverables.

---

## 7. License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more details.
