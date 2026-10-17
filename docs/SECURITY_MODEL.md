# OmniCore Security Model & Threat Mitigation

This document details the security architecture, authentication methods, payload sanitization, and defensive guardrails built into the OmniCore Universal Chatbot Gateway.

---

## 1. Authentication & Access Control

The gateway enforces a defense-in-depth model across endpoints:

### 1.1. Client API Keys
- Public REST clients authenticate using the `X-Bot-Token` HTTP header or standard `Authorization: Bearer <token>`.
- In production, tokens are checked against SHA-256 hashes stored in environment secrets or database stores.

### 1.2. Webhook Signature Verification
- **Slack Webhooks:** Validates `X-Slack-Signature` and `X-Slack-Request-Timestamp` using HMAC-SHA256 with the team's signing secret. Rejects timestamps older than 300 seconds to prevent replay attacks.
- **Discord Interactions:** Verifies `X-Signature-Ed25519` and `X-Signature-Timestamp` public key crypto before processing interaction payloads.

---

## 2. Input Sanitization & Prompt Injection Mitigation

1. **Max Payload Boundaries:**
   - Inbound messages are capped at 4,000 characters per message turn.
   - History turns are limited to the most recent 20 interactions to protect the LLM context window from Denial of Service (DoS) attacks.
2. **System Prompt Encapsulation:**
   - System prompts and developer directives are isolated in the `config.systemInstruction` parameter of the Gemini SDK, strictly separated from user messages to prevent direct instruction overriding.
3. **Control Character Stripping:**
   - High ASCII null bytes and malformed UTF-8 byte sequences are stripped at the gateway normalizer before reaching the inference pipeline.

---

## 3. Rate Limiting & Denial of Service Protection

- Default per-IP rate limit: 60 requests/minute.
- Per-Session rate limit: 20 messages/minute.
- Automatic exponential backoff responses (`429 Too Many Requests`) with `Retry-After` headers.

---

## 4. Secret & Key Isolation

- Under no circumstances is `GEMINI_API_KEY` sent to the frontend or exposed in client bundles.
- All GenAI inference takes place exclusively inside `server.ts` behind the `/api/v1/chat` reverse proxy.
- Local configuration is managed strictly through `.env` (ignored in `.gitignore`).
