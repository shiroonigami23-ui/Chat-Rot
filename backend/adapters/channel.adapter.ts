import { ChannelId, IChannelAdapter, UniversalInboundMessage } from '../types/universal.types.ts';

/**
 * Web Adapter: Normalized JSON inbound with rich Markdown egress
 */
export class WebAdapter implements IChannelAdapter {
  channelId: ChannelId = 'web';
  name = 'Web Embed & JavaScript Widget';
  format = 'markdown/html';

  normalizeInbound(rawPayload: any): UniversalInboundMessage {
    return {
      messageId: `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      channel: 'web',
      userId: rawPayload.userId || 'web_user',
      sessionId: rawPayload.sessionId || `sess_web_${Date.now().toString(36)}`,
      content: (rawPayload.message || rawPayload.content || '').trim(),
      timestamp: rawPayload.timestamp || Date.now(),
      systemPrompt: rawPayload.systemPrompt,
      temperature: rawPayload.temperature,
      history: rawPayload.history,
      metadata: rawPayload.metadata,
    };
  }

  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>) {
    return {
      channel: 'web',
      format: 'markdown',
      text: reply,
      sessionId,
      renderedHtmlSupported: true,
      ...meta,
    };
  }
}

/**
 * Slack Adapter: Converts Slack BlockKit / Events API payloads
 */
export class SlackAdapter implements IChannelAdapter {
  channelId: ChannelId = 'slack';
  name = 'Slack Events API & BlockKit';
  format = 'Slack BlockKit JSON';

  normalizeInbound(rawPayload: any): UniversalInboundMessage {
    const event = rawPayload.event || {};
    const text = event.text || rawPayload.text || '';
    // Strip app mention tag if present (<@U12345> hello -> hello)
    const sanitizedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    return {
      messageId: `slack_${event.client_msg_id || Date.now().toString(36)}`,
      channel: 'slack',
      userId: event.user || rawPayload.user_id || 'slack_user',
      sessionId: event.channel || rawPayload.channel_id || 'slack_chan',
      content: sanitizedText || text,
      timestamp: Math.floor(parseFloat(event.ts || Date.now() / 1000) * 1000),
      systemPrompt: rawPayload.systemPrompt,
      temperature: rawPayload.temperature,
      history: rawPayload.history,
    };
  }

  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>) {
    return {
      response_type: 'in_channel',
      channel: sessionId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*OmniCore Bot:*\n${reply}`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Channel: Slack • Session: \`${sessionId}\` • Powered by OmniCore`,
            },
          ],
        },
      ],
      ...meta,
    };
  }
}

/**
 * Discord Adapter: Converts Discord interaction webhooks and outputs Rich Embeds
 */
export class DiscordAdapter implements IChannelAdapter {
  channelId: ChannelId = 'discord';
  name = 'Discord Interaction Webhook';
  format = 'Discord Rich Embed';

  normalizeInbound(rawPayload: any): UniversalInboundMessage {
    let content = rawPayload.content || '';
    if (rawPayload.data?.name) {
      content = `/${rawPayload.data.name} ${JSON.stringify(rawPayload.data.options || {})}`;
    }

    return {
      messageId: `discord_${rawPayload.id || Date.now().toString(36)}`,
      channel: 'discord',
      userId: rawPayload.member?.user?.id || rawPayload.author?.id || 'discord_user',
      sessionId: rawPayload.channel_id || 'discord_chan',
      content: content.trim(),
      timestamp: Date.now(),
      systemPrompt: rawPayload.systemPrompt,
      temperature: rawPayload.temperature,
      history: rawPayload.history,
    };
  }

  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>) {
    return {
      embeds: [
        {
          title: 'OmniCore Universal Bot',
          description: reply,
          color: 0x4f46e5, // indigo
          footer: {
            text: `Session: ${sessionId} • Discord Gateway Adapter`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
      ...meta,
    };
  }
}

/**
 * REST API Adapter: Direct headless interaction for Python, Node, Go, or cURL
 */
export class RestAdapter implements IChannelAdapter {
  channelId: ChannelId = 'rest-api';
  name = 'REST API Direct Client';
  format = 'application/json';

  normalizeInbound(rawPayload: any): UniversalInboundMessage {
    return {
      messageId: `rest_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      channel: 'rest-api',
      userId: rawPayload.userId || 'rest_service_client',
      sessionId: rawPayload.sessionId || `rest_sess_${Date.now().toString(36)}`,
      content: (rawPayload.message || rawPayload.content || '').trim(),
      timestamp: Date.now(),
      systemPrompt: rawPayload.systemPrompt,
      temperature: rawPayload.temperature,
      history: rawPayload.history,
      metadata: rawPayload.metadata,
    };
  }

  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>) {
    return {
      format: 'json',
      reply,
      sessionId,
      ...meta,
    };
  }
}

/**
 * Custom Webhook Adapter: Generic CRM/ERP normalizer
 */
export class CustomWebhookAdapter implements IChannelAdapter {
  channelId: ChannelId = 'custom-webhook';
  name = 'Generic CRM / ERP Inbound Webhook';
  format = 'application/json';

  normalizeInbound(rawPayload: any): UniversalInboundMessage {
    const content = rawPayload.text || rawPayload.message || rawPayload.query || JSON.stringify(rawPayload);
    return {
      messageId: `wh_${Date.now().toString(36)}`,
      channel: 'custom-webhook',
      userId: rawPayload.userId || rawPayload.sender || 'crm_agent',
      sessionId: rawPayload.sessionId || rawPayload.ticketId || `wh_sess_${Date.now().toString(36)}`,
      content: String(content).trim(),
      timestamp: Date.now(),
      systemPrompt: rawPayload.systemPrompt,
      temperature: rawPayload.temperature,
    };
  }

  formatOutbound(reply: string, sessionId: string, meta?: Record<string, unknown>) {
    return {
      channel: 'custom-webhook',
      status: 'success',
      reply,
      sessionId,
      ...meta,
    };
  }
}

/**
 * Adapter Registry
 */
export class ChannelRegistry {
  private adapters = new Map<string, IChannelAdapter>();

  constructor() {
    this.register(new WebAdapter());
    this.register(new SlackAdapter());
    this.register(new DiscordAdapter());
    this.register(new RestAdapter());
    this.register(new CustomWebhookAdapter());
  }

  register(adapter: IChannelAdapter) {
    this.adapters.set(adapter.channelId, adapter);
  }

  get(channelId: string): IChannelAdapter {
    return this.adapters.get(channelId) || this.adapters.get('web')!;
  }

  getAll(): IChannelAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const channelRegistry = new ChannelRegistry();
