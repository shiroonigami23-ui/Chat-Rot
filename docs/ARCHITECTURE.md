# OmniCore System Architecture & Pipeline Specification

## 1. Executive Summary

OmniCore is architected as an **omnichannel abstraction layer** sitting between conversational AI models (e.g., Google Gemini) and heterogeneous client surfaces (Web apps, Mobile applications, Slack workspaces, Discord servers, and enterprise webhook integrations).

The primary architectural requirement is **Zero-Leakage Decoupling**: client-facing integration code must never be coupled to the underlying LLM provider, prompt template, or token format; conversely, conversational logic must never depend on the presentation idiosyncrasies of third-party platforms.

---

## 2. Architecture Diagram

```
                     ┌────────────────────────────────────────┐
                     │          INBOUND CLIENT LAYER          │
                     │  • Web Widget (SDK / Iframe)           │
                     │  • REST API Consumer (Python / Node)   │
                     │  • Third-Party Webhook (Slack / Discord)│
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         API GATEWAY & ADAPTERS         │
                     │  • Route Dispatcher (/api/v1/*)        │
                     │  • HMAC Signature & API Key Auth       │
                     │  • Inbound Channel Normalizers         │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │      UNIVERSAL MESSAGE PIPELINE        │
                     │  1. Inbound Normalization (to BotMsg)  │
                     │  2. Session State & Context Aggregator │
                     │  3. Safety & Injection Guardrails      │
                     │  4. Prompt & System Directive Assembly │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         COGNITIVE ENGINE LAYER         │
                     │  • Gemini 3.8 Flash SDK Integration    │
                     │  • Deterministic Simulator Fallback    │
                     │  • Token Budgeting & Latency Monitor   │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │       CHANNEL EGRESS FORMATTER         │
                     │  • Web: Markdown + HTML payload        │
                     │  • Slack: BlockKit formatted JSON      │
                     │  • Discord: Embeds + Field components  │
                     │  • REST: Standard Universal JSON       │
                     └───────────────────┬────────────────────┘
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         OUTBOUND DISPATCH LAYER        │
                     │  • Synchronous HTTP Response           │
                     │  • Asynchronous Webhook Callback       │
                     │  • Audit Log & Action Bot Telemetry    │
                     └────────────────────────────────────────┘
```

---

## 3. Core Architectural Modules

### 3.1. Inbound Channel Adapters
Each channel adapter implements the `IChannelAdapter` interface:
```typescript
export interface IChannelAdapter {
  channelId: 'web' | 'rest-api' | 'slack' | 'discord' | 'custom-webhook';
  normalizeInbound(rawPayload: unknown, headers: Record<string, string>): UniversalInboundMessage;
  formatOutbound(response: UniversalOutboundMessage): unknown;
}
```
- **Slack Adapter:** Unpacks Slack `event_callback` payloads, extracts `event.text`, `event.user`, and `event.channel`, and formats outgoing answers into Slack BlockKit components.
- **Discord Adapter:** Decodes Discord interaction webhooks (type 2 application commands or message components), verifying `X-Signature-Ed25519` headers and packing responses into Discord Embed structures.
- **Web Adapter:** Accepts standard JSON envelopes with rich metadata (session ID, device info, client timestamp) and renders Markdown with syntax-highlighted code blocks.
- **REST/Headless Adapter:** Direct programmatic interface for backend services and custom CRMs.

### 3.2. Universal Message Schema
All incoming requests are mapped to a canonical schema:
```typescript
export interface UniversalInboundMessage {
  messageId: string;
  channel: string;
  userId: string;
  sessionId: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
  history?: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
}
```

### 3.3. Cognitive Engine & Provider Abstraction
The backend server (`server.ts`) initializes Google GenAI:
```typescript
import { GoogleGenAI } from '@google/genai';

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
}) : null;
```
When `GEMINI_API_KEY` is present, the pipeline invokes `gemini-3.8-flash` with the configured `systemInstruction`, temperature, and conversational context. When running locally without external credentials, the **Deterministic Simulation Engine** takes over, ensuring that teammates and grading professors can test the entire pipeline without API billing constraints.

### 3.4. Session State Management
- In **Phase 1**, sessions are tracked in an in-memory LRU store keyed by `sessionId` with automatic TTL expiration (30 minutes).
- In **Phase 2**, the session layer will be decoupled into a Redis cache interface allowing horizontal scale across multiple server nodes.

---

## 4. Key Design Decisions & Trade-offs

| Decision | Alternative Considered | Rationale |
|---|---|---|
| Single Universal Express Gateway | Microservices per channel | For a 3-person college team, a modular monolith in TypeScript maximizes velocity, avoids distributed debugging overhead, and facilitates clean Git merges. |
| In-Memory Session Cache with Redis interface | Immediate Postgres storage | Zero external database dependencies required for Phase 1 dev and evaluation; clean abstraction allows swapping in PostgreSQL in Phase 2. |
| Server-Side Gemini API invocation | Direct browser SDK calls | Security best practice: eliminates API key leaks to client bundles and enables centralized prompt injection filtering and rate limiting. |
| Egress formatting at gateway level | Client-side reformatting | Host systems (like Slack and Discord webhooks) cannot run client transformations; the gateway must output natively supported payloads. |
