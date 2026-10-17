/**
 * OmniCore Universal Types Specification
 * Defines canonical schemas across adapters, pipelines, and cognitive providers.
 */

export type ChannelId = 'web' | 'rest-api' | 'slack' | 'discord' | 'custom-webhook';

export interface UniversalInboundMessage {
  messageId: string;
  channel: ChannelId | string;
  userId: string;
  sessionId: string;
  content: string;
  timestamp: number;
  systemPrompt?: string;
  temperature?: number;
  metadata?: Record<string, unknown>;
  history?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
}

export interface UniversalOutboundMessage {
  messageId: string;
  channel: ChannelId | string;
  sessionId: string;
  reply: string;
  formattedReply: {
    text: string;
    contentType: 'text/markdown' | 'application/json' | 'text/plain';
  };
  channelOutput: unknown;
  tokens: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  provider: string;
  timestamp: number;
}

export interface IChannelAdapter {
  channelId: ChannelId;
  name: string;
  format: string;
  normalizeInbound(rawPayload: any, headers?: Record<string, string | string[] | undefined>): UniversalInboundMessage;
  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>): unknown;
}

export interface GatewayHealth {
  status: 'healthy' | 'degraded' | 'offline';
  version: string;
  phase: string;
  timestamp: number;
  uptimeSeconds: number;
  aiProvider: string;
  activeAdapters: string[];
  stats: {
    totalRequests: number;
    successfulRequests: number;
    activeSessions: number;
    avgLatencyMs: number;
  };
}
