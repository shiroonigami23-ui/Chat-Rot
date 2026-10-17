# OmniCore REST API Specification (v1.0)

Base URL: `http://localhost:3000/api/v1` (or deployed URL)  
Format: `application/json`  
Authentication: Optional Bearer token or `X-Bot-Token` header.

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server status, active channel adapters, uptime, and engine state |
| `POST` | `/chat` | Universal conversation endpoint |
| `GET` | `/integrations` | Channel registry with adapter capabilities and embed snippets |
| `POST` | `/webhooks/:channel` | Generic webhook receiver for third-party event ingestion |
| `POST` | `/test-connection` | Integration bot automated verification endpoint |

---

## 2. Endpoint Details

### 2.1. GET /api/v1/health
Returns the current health status of the universal gateway.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": 1729165900000,
  "uptime": 142.5,
  "aiProvider": "gemini-3.8-flash",
  "activeAdapters": ["web", "rest-api", "slack", "discord", "custom-webhook"],
  "stats": {
    "totalRequests": 48,
    "activeSessions": 3,
    "avgLatencyMs": 320
  }
}
```

---

### 2.2. POST /api/v1/chat
The core universal conversation endpoint. Accepts messages from any frontend or service.

**Request Headers:**
```http
Content-Type: application/json
X-Bot-Token: <optional_api_key>
```

**Request Body:**
```json
{
  "message": "How do I register for CS499 Capstone Project?",
  "channel": "web",
  "userId": "student_9841",
  "sessionId": "sess_f8a92b3c",
  "systemPrompt": "You are a university academic advisor chatbot for the School of Computing.",
  "temperature": 0.7,
  "history": [
    {
      "role": "user",
      "parts": [{ "text": "Hello, I am a senior student." }]
    },
    {
      "role": "model",
      "parts": [{ "text": "Hello! How can I assist you with your academic schedule today?" }]
    }
  ],
  "metadata": {
    "department": "Computer Science",
    "cohort": 2026
  }
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "messageId": "msg_90df21a4",
    "channel": "web",
    "sessionId": "sess_f8a92b3c",
    "reply": "To register for CS499 Capstone Project, you must have completed CS350 (Software Engineering) and submit your project proposal to the academic committee before November 15.",
    "formattedReply": {
      "text": "To register for **CS499 Capstone Project**, you must have completed **CS350** (Software Engineering) and submit your project proposal before November 15.",
      "contentType": "text/markdown"
    },
    "channelOutput": {
      "channel": "web",
      "rendered": "markdown"
    },
    "tokens": {
      "promptTokens": 62,
      "responseTokens": 45,
      "totalTokens": 107
    },
    "latencyMs": 412,
    "timestamp": 1729165910000
  }
}
```

**Error Response `400 Bad Request`**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "Field 'message' cannot be empty."
  }
}
```

---

### 2.3. GET /api/v1/integrations
Lists all registered channel adapters, their capabilities, and sample payloads.

**Response `200 OK`**:
```json
{
  "success": true,
  "integrations": [
    {
      "id": "web",
      "name": "Web Embed & JavaScript SDK",
      "status": "active",
      "supportsStreaming": true,
      "format": "markdown/html",
      "embedSnippet": "<script src=\"https://cdn.omnicore.app/widget.js\" data-bot-id=\"uni_bot_1\"></script>"
    },
    {
      "id": "slack",
      "name": "Slack Events API / BlockKit",
      "status": "active",
      "supportsStreaming": false,
      "format": "application/json (BlockKit)",
      "webhookPath": "/api/v1/webhooks/slack"
    },
    {
      "id": "discord",
      "name": "Discord Webhook / Interactions",
      "status": "active",
      "supportsStreaming": false,
      "format": "application/json (Embeds)",
      "webhookPath": "/api/v1/webhooks/discord"
    },
    {
      "id": "rest-api",
      "name": "REST API Direct Client",
      "status": "active",
      "supportsStreaming": true,
      "format": "application/json",
      "endpoint": "/api/v1/chat"
    }
  ]
}
```

---

### 2.4. POST /api/v1/webhooks/:channel
Receives external platform webhooks, converts them into standard `BotMessage` format, processes the query, and returns the channel-specific response.

**Path Parameters:**
- `channel`: `slack` | `discord` | `custom-webhook`

**Example: Slack Inbound Webhook (`POST /api/v1/webhooks/slack`)**:
```json
{
  "type": "event_callback",
  "event": {
    "type": "app_mention",
    "user": "U0123ABCD",
    "text": "<@U9876BOT> what is the exam schedule?",
    "channel": "C01234567",
    "ts": "1729165900.001"
  }
}
```

**Slack Normalized Egress Response:**
```json
{
  "channel": "C01234567",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*OmniCore Bot:* Final examinations commence on December 10, 2026."
      }
    }
  ]
}
```

---

### 2.5. POST /api/v1/test-connection
Used by the Action Bot CI/CD runner to test connectivity, message integrity, and latency across all adapters.

**Request Body:**
```json
{
  "adapter": "web",
  "testPayload": {
    "probe": "ping",
    "timestamp": 1729165900000
  }
}
```

**Response `200 OK`**:
```json
{
  "success": true,
  "adapter": "web",
  "roundtripMs": 48,
  "status": "PASSED",
  "checks": {
    "payloadNormalization": "PASS",
    "schemaValidation": "PASS",
    "egressFormatting": "PASS"
  }
}
```
