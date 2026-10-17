# OmniCore Integration Guide

This guide provides concrete, copy-pasteable code examples for integrating the OmniCore Universal Chatbot into any external system.

---

## 1. Web Widget Integration (Vanilla HTML / React)

### Method A: Single Script Tag Embed
Place this snippet right before the closing `</body>` tag on any HTML webpage, WordPress site, or LMS portal:

```html
<!-- OmniCore Universal Chatbot Widget -->
<script 
  src="https://your-domain.app/widget.js" 
  data-endpoint="https://your-domain.app/api/v1/chat"
  data-bot-title="Campus Assistant"
  data-theme="dark"
  defer>
</script>
```

### Method B: React Hook (`useOmniBot.ts`)
For single-page applications built with React or Next.js:

```typescript
import { useState, useCallback } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function useOmniBot(apiBase = '/api/v1') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          channel: 'web',
          sessionId: 'user_session_1'
        })
      });

      const json = await res.json();
      if (json.success) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), sender: 'bot', text: json.data.reply }
        ]);
      }
    } catch (err) {
      console.error('Bot request failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  return { messages, sendMessage, loading };
}
```

---

## 2. Python Client (CLI, FastAPI, or Django)

Use the following snippet to connect Python services, backend scripts, or Discord/Telegram bots to OmniCore:

```python
import requests
import uuid

class OmniCoreClient:
    def __init__(self, base_url: str = "http://localhost:3000/api/v1", api_key: str = None):
        self.base_url = base_url.rstrip("/")
        self.session_id = f"py_sess_{uuid.uuid4().hex[:8]}"
        self.headers = {"Content-Type": "application/json"}
        if api_key:
            self.headers["X-Bot-Token"] = api_key

    def send_message(self, message: str, channel: str = "rest-api", system_prompt: str = None) -> dict:
        payload = {
            "message": message,
            "channel": channel,
            "sessionId": self.session_id,
            "userId": "python_service",
            "systemPrompt": system_prompt
        }
        response = requests.post(f"{self.base_url}/chat", json=payload, headers=self.headers, timeout=15)
        response.raise_for_status()
        data = response.json()
        if data.get("success"):
            return data["data"]
        raise Exception(f"OmniCore API Error: {data.get('error')}")

# Usage Example:
if __name__ == "__main__":
    client = OmniCoreClient("http://localhost:3000/api/v1")
    result = client.send_message("Explain QuickSort algorithm in simple terms.")
    print(f"Bot Reply:\n{result['reply']}")
    print(f"Latency: {result['latencyMs']}ms | Tokens: {result['tokens']['totalTokens']}")
```

---

## 3. Node.js / TypeScript SDK

```typescript
import axios from 'axios';

export class OmniCoreSDK {
  private baseUrl: string;
  private apiKey?: string;

  constructor(config: { baseUrl?: string; apiKey?: string } = {}) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000/api/v1';
    this.apiKey = config.apiKey;
  }

  async ask(message: string, options: { channel?: string; sessionId?: string; systemPrompt?: string } = {}) {
    const response = await axios.post(`${this.baseUrl}/chat`, {
      message,
      channel: options.channel || 'node-sdk',
      sessionId: options.sessionId || 'node_session_default',
      systemPrompt: options.systemPrompt,
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { 'X-Bot-Token': this.apiKey } : {})
      }
    });

    return response.data;
  }
}
```

---

## 4. Slack Inbound Webhook Setup

1. In your **Slack App Management** portal, navigate to **Event Subscriptions**.
2. Enable Events and set the Request URL to:
   `https://your-server.app/api/v1/webhooks/slack`
3. Subscribe to the `app_mention` and `message.im` bot events.
4. When a user mentions your bot in any channel, OmniCore automatically normalizes the Slack payload, computes the reply, and formats the egress into Slack BlockKit components.

---

## 5. cURL Verification One-Liner

```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ping! Checking integration status.",
    "channel": "rest-api",
    "sessionId": "curl_test_01"
  }'
```
