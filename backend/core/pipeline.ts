import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { UniversalInboundMessage, UniversalOutboundMessage } from '../types/universal.types.ts';
import { channelRegistry } from '../adapters/channel.adapter.ts';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

export const aiClient = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Telemetry & metrics tracker
export const metrics = {
  startTime: Date.now(),
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  activeSessions: new Set<string>(),
  latencies: [] as number[],
};

// In-Memory Session Cache (Phase 1 Foundation)
export interface SessionContext {
  sessionId: string;
  userId: string;
  channel: string;
  lastActive: number;
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  systemPrompt?: string;
  metadata?: Record<string, unknown>;
}

const sessionStore = new Map<string, SessionContext>();
const SESSION_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function getOrCreateSession(sessionId: string, userId = 'anon', channel = 'web'): SessionContext {
  const now = Date.now();
  let session = sessionStore.get(sessionId);

  if (!session || (now - session.lastActive > SESSION_TTL_MS)) {
    session = {
      sessionId,
      userId,
      channel,
      lastActive: now,
      history: [],
    };
    sessionStore.set(sessionId, session);
  } else {
    session.lastActive = now;
  }

  metrics.activeSessions.add(sessionId);
  return session;
}

/**
 * Deterministic Simulation Engine for test suites, offline evaluation, and fallback
 */
export function generateSimulatedReply(
  prompt: string,
  systemPrompt?: string,
  channel: string = 'web',
  knowledgeBase?: string
): string {
  const p = prompt.toLowerCase();

  if (p.includes('ping') || p.includes('test handshake') || p.includes('health') || p.includes('probe')) {
    return `[OmniCore Gateway Online] Handshake acknowledged on channel \`${channel}\`. Inbound payload normalized, security passed.`;
  }

  if (knowledgeBase && knowledgeBase.trim().length > 0) {
    return `According to your system context: "${knowledgeBase.trim()}"\n\nIn response to your query: "${prompt}", all parameters match the configured knowledge base rules.`;
  }

  if (p.includes('capstone') || p.includes('project') || p.includes('college') || p.includes('phase')) {
    return `**OmniCore Universal Chatbot Capstone Architecture**\n\n- **Current Stage:** Phase 1 (Core Normalization & Gateway Foundation)\n- **Architecture:** Channel Adapters → Normalization Gateway → Context Pipeline → Gemini Engine → Egress Formatter\n- **Supported Channels:** Web Widget, REST API, Slack BlockKit, Discord Embeds, Custom Webhooks\n- **Next Sprint:** Persistent session cache and Redis multi-node synchronization.`;
  }

  if (p.includes('prerequisite') || p.includes('cs499') || p.includes('register') || p.includes('advis')) {
    return `To register for **CS499 Capstone Project**, students must have completed **CS350** (Software Engineering) and **CS330** (Database Systems) with a grade of C or higher, and submit their proposal to the academic review committee before the semester deadline.`;
  }

  if (p.includes('ssh') || p.includes('git') || p.includes('vpn') || p.includes('gpu')) {
    return `To push to your team's Git repository:\n1. Generate an SSH keypair: \`ssh-keygen -t ed25519 -C "student@university.edu"\`\n2. Add the public key (\`cat ~/.ssh/id_ed25519.pub\`) to your GitHub account under **Settings > SSH Keys**.\n3. Verify access with: \`ssh -T git@github.com\`.`;
  }

  if (systemPrompt && systemPrompt.toLowerCase().includes('academic advisor')) {
    return `As your Academic Advisor, I can help you plan your degree roadmap, register for elective courses, verify graduation prerequisites, or connect with faculty advisors. What specific course or requirement would you like to review?`;
  }

  return `OmniCore has processed your message through the **${channel}** adapter.\n\nYour query: "${prompt}"\n\nAll inbound payloads are normalized into canonical UniversalMessage objects and can be routed to any external client surface with zero vendor lock-in.`;
}

/**
 * Core Cognitive Pipeline Execution
 */
export async function executePipeline(inbound: UniversalInboundMessage): Promise<UniversalOutboundMessage> {
  const reqStartTime = Date.now();
  metrics.totalRequests++;

  const adapter = channelRegistry.get(inbound.channel);
  const session = getOrCreateSession(inbound.sessionId, inbound.userId, inbound.channel);

  // Guardrail: max content limit
  if (inbound.content.length > 4000) {
    throw new Error('Message length exceeds 4,000 character maximum limit.');
  }

  const systemInstruction = inbound.systemPrompt || session.systemPrompt || 'You are OmniCore, an intelligent and helpful universal chatbot assistant.';
  const temperature = inbound.temperature ?? 0.7;

  // Build conversational context
  const conversationHistory = (inbound.history && inbound.history.length > 0)
    ? inbound.history
    : session.history;

  let replyText = '';
  let providerUsed = 'simulation-engine';

  if (aiClient) {
    try {
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      for (const turn of conversationHistory.slice(-8)) {
        if (turn && turn.role && Array.isArray(turn.parts)) {
          contents.push({
            role: turn.role === 'model' ? 'model' : 'user',
            parts: turn.parts.map((p) => ({ text: p.text || '' })),
          });
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: inbound.content }],
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: Math.max(0, Math.min(2, temperature)),
        },
      });

      replyText = response.text || generateSimulatedReply(inbound.content, systemInstruction, inbound.channel);
      providerUsed = 'gemini-3.8-flash';
    } catch (err: any) {
      console.warn('[OmniCore Pipeline] Gemini call error, falling back to simulation engine:', err?.message);
      replyText = generateSimulatedReply(inbound.content, systemInstruction, inbound.channel);
      providerUsed = 'gemini-fallback-simulation';
    }
  } else {
    replyText = generateSimulatedReply(inbound.content, systemInstruction, inbound.channel);
  }

  // Update session history
  session.history.push({ role: 'user', parts: [{ text: inbound.content }] });
  session.history.push({ role: 'model', parts: [{ text: replyText }] });
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }

  const latencyMs = Date.now() - reqStartTime;
  metrics.latencies.push(latencyMs);
  if (metrics.latencies.length > 100) metrics.latencies.shift();
  metrics.successfulRequests++;

  const promptTokens = Math.ceil((inbound.content.length + systemInstruction.length) / 4);
  const responseTokens = Math.ceil(replyText.length / 4);

  const formattedOutbound = adapter.formatOutbound(replyText, inbound.sessionId);

  return {
    messageId: inbound.messageId,
    channel: inbound.channel,
    sessionId: inbound.sessionId,
    reply: replyText,
    formattedReply: {
      text: replyText,
      contentType: 'text/markdown',
    },
    channelOutput: formattedOutbound,
    tokens: {
      promptTokens,
      responseTokens,
      totalTokens: promptTokens + responseTokens,
    },
    latencyMs,
    provider: providerUsed,
    timestamp: Date.now(),
  };
}
