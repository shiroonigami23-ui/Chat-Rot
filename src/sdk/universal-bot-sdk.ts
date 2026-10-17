/**
 * OmniCore Universal Chatbot Client SDK
 * 
 * Lightweight TypeScript/JavaScript SDK to communicate with any OmniCore Gateway.
 * Can be packaged into npm or dropped directly into web, node, or mobile apps.
 */

export interface OmniCoreConfig {
  baseUrl?: string;
  apiKey?: string;
  defaultChannel?: string;
  defaultSystemPrompt?: string;
  defaultTemperature?: number;
}

export interface SendMessageOptions {
  channel?: string;
  userId?: string;
  sessionId?: string;
  systemPrompt?: string;
  temperature?: number;
  history?: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>;
  metadata?: Record<string, unknown>;
}

export interface ChatResponseData {
  messageId: string;
  channel: string;
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

export interface ChatResponseEnvelope {
  success: boolean;
  data?: ChatResponseData;
  error?: {
    code: string;
    message: string;
  };
}

export class OmniCoreSDK {
  private baseUrl: string;
  private apiKey?: string;
  private defaultChannel: string;
  private defaultSystemPrompt?: string;
  private defaultTemperature: number;

  constructor(config: OmniCoreConfig = {}) {
    this.baseUrl = (config.baseUrl || '/api/v1').replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.defaultChannel = config.defaultChannel || 'web';
    this.defaultSystemPrompt = config.defaultSystemPrompt;
    this.defaultTemperature = config.defaultTemperature ?? 0.7;
  }

  /**
   * Send a conversation turn to the universal gateway
   */
  async sendMessage(message: string, options: SendMessageOptions = {}): Promise<ChatResponseEnvelope> {
    const url = `${this.baseUrl}/chat`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-Bot-Token'] = this.apiKey;
    }

    const payload = {
      message,
      channel: options.channel || this.defaultChannel,
      userId: options.userId || 'sdk_user',
      sessionId: options.sessionId || `sdk_sess_${Date.now().toString(36)}`,
      systemPrompt: options.systemPrompt || this.defaultSystemPrompt,
      temperature: options.temperature ?? this.defaultTemperature,
      history: options.history,
      metadata: options.metadata,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return await res.json();
  }

  /**
   * Health check query
   */
  async getHealth(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/health`);
    return await res.json();
  }

  /**
   * Retrieve active integrations and schemas
   */
  async getIntegrations(): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/integrations`);
    return await res.json();
  }
}
