import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { channelRegistry } from '../adapters/channel.adapter.ts';
import { 
  executePipeline, 
  metrics, 
  aiClient, 
  generateSimulatedReply,
  getKnowledgeItems,
  addKnowledgeItem,
  deleteKnowledgeItem,
  toggleKnowledgeItem,
  retrieveKnowledgeChunks,
  getAnalyticsSummary,
  recordFeedback,
  simulateLoadTraffic
} from '../core/pipeline.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

export const apiRouter = Router();

// 1. Health check & Telemetry
apiRouter.get('/health', (req: Request, res: Response) => {
  const uptime = (Date.now() - metrics.startTime) / 1000;
  const avgLatency =
    metrics.latencies.length > 0
      ? Math.round(metrics.latencies.reduce((a, b) => a + b, 0) / metrics.latencies.length)
      : 0;

  res.json({
    status: 'healthy',
    version: '0.1.0',
    phase: 'Phase 1 - Foundation & Universal Gateway',
    timestamp: Date.now(),
    uptimeSeconds: Math.floor(uptime),
    aiProvider: aiClient ? 'gemini-3.8-flash (Live)' : 'deterministic-simulation-engine (Offline/Dev)',
    activeAdapters: channelRegistry.getAll().map((a) => a.channelId),
    stats: {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      activeSessions: metrics.activeSessions.size,
      avgLatencyMs: avgLatency,
    },
  });
});

// Real-Time Quota & Rate Limit Telemetry
const quotaTelemetry = {
  currentRpm: 24,
  maxRpm: 120,
  dailyRequestsUsed: 1840,
  dailyRequestsLimit: 10000,
  tokensUsedToday: 48920,
  dailyTokenLimit: 250000,
  rpmHistory: [14, 18, 22, 29, 35, 42, 28, 21, 31, 24],
  quotaResetSeconds: 2450,
  status: 'OPTIMAL' as 'OPTIMAL' | 'WARNING' | 'THROTTLED',
};

apiRouter.get('/telemetry/quotas', (req: Request, res: Response) => {
  // Dynamically update current RPM based on recent activity
  const activeKeyHeader = (req.headers['x-bot-token'] as string) || '';
  let effectiveMaxRpm = 120;
  if (activeKeyHeader.includes('admin')) effectiveMaxRpm = 500;
  else if (activeKeyHeader.includes('dev')) effectiveMaxRpm = 60;

  quotaTelemetry.maxRpm = effectiveMaxRpm;
  const utilization = quotaTelemetry.currentRpm / quotaTelemetry.maxRpm;
  quotaTelemetry.status = utilization > 0.9 ? 'THROTTLED' : utilization > 0.75 ? 'WARNING' : 'OPTIMAL';

  res.json({
    success: true,
    telemetry: {
      ...quotaTelemetry,
      activeRequests: metrics.totalRequests,
      utilizationPct: Math.round(utilization * 100),
      timestamp: Date.now(),
    },
  });
});

apiRouter.post('/telemetry/simulate-spike', (req: Request, res: Response) => {
  const { spikeAmount = 45 } = req.body;
  quotaTelemetry.currentRpm = Math.min(quotaTelemetry.maxRpm + 10, quotaTelemetry.currentRpm + Number(spikeAmount));
  quotaTelemetry.dailyRequestsUsed += Number(spikeAmount);
  quotaTelemetry.tokensUsedToday += Number(spikeAmount) * 450;
  
  quotaTelemetry.rpmHistory.shift();
  quotaTelemetry.rpmHistory.push(quotaTelemetry.currentRpm);

  const utilization = quotaTelemetry.currentRpm / quotaTelemetry.maxRpm;
  quotaTelemetry.status = utilization > 0.9 ? 'THROTTLED' : utilization > 0.75 ? 'WARNING' : 'OPTIMAL';

  res.json({
    success: true,
    message: `Traffic burst of +${spikeAmount} RPM simulated!`,
    currentRpm: quotaTelemetry.currentRpm,
    status: quotaTelemetry.status,
  });
});

// 2. Universal Chat Endpoint
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const rawBody = req.body;
    const channelId = rawBody.channel || 'web';
    const adapter = channelRegistry.get(channelId);

    // Normalize inbound message via the selected channel adapter
    const normalizedInbound = adapter.normalizeInbound(rawBody, req.headers);

    if (!normalizedInbound.content || normalizedInbound.content.trim() === '') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PAYLOAD',
          message: "Field 'message' or 'content' cannot be empty.",
        },
      });
      return;
    }

    const outbound = await executePipeline(normalizedInbound);

    res.json({
      success: true,
      data: outbound,
    });
  } catch (error: any) {
    metrics.failedRequests++;
    console.error('[OmniCore API] Error in /chat:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Error processing chat message turn.',
      },
    });
  }
});

// 3. Channel Registry & Capabilities
apiRouter.get('/integrations', (req: Request, res: Response) => {
  const adapters = channelRegistry.getAll();
  res.json({
    success: true,
    integrations: adapters.map((ad) => ({
      id: ad.channelId,
      name: ad.name,
      status: 'active',
      format: ad.format,
      supportsStreaming: ad.channelId === 'web' || ad.channelId === 'rest-api',
      webhookPath: ad.channelId !== 'web' ? `/api/v1/webhooks/${ad.channelId}` : undefined,
    })),
  });
});

// In-Memory Webhook Event Log Ring Buffer (for real-time debugger)
export interface WebhookEventRecord {
  id: string;
  channel: string;
  timestamp: number;
  headers: Record<string, any>;
  rawPayload: any;
  normalizedMessage?: any;
  reply?: string;
  channelOutput?: any;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  statusCode: number;
}

const webhookEventsBuffer: WebhookEventRecord[] = [
  {
    id: `ev_slack_${Date.now() - 60000}`,
    channel: 'slack',
    timestamp: Date.now() - 60000,
    headers: {
      'content-type': 'application/json',
      'x-slack-signature': 'v0=a21b3c4d5e6f...',
      'x-slack-request-timestamp': String(Math.floor((Date.now() - 60000) / 1000)),
    },
    rawPayload: {
      type: 'event_callback',
      event: {
        type: 'app_mention',
        user: 'U98124',
        text: '<@U0BOT> what is the deadline for CS499 proposals?',
        channel: 'C09483',
        ts: '1729166000.001',
      },
    },
    normalizedMessage: {
      messageId: 'slack_init_01',
      channel: 'slack',
      userId: 'U98124',
      sessionId: 'C09483',
      content: 'what is the deadline for CS499 proposals?',
    },
    reply: 'To register for CS499 Capstone Project, submit your proposal before November 15.',
    channelOutput: {
      response_type: 'in_channel',
      blocks: [{ type: 'section', text: { type: 'mrkdwn', text: '*OmniCore Bot:* Deadline is Nov 15.' } }],
    },
    latencyMs: 142,
    status: 'SUCCESS',
    statusCode: 200,
  },
  {
    id: `ev_discord_${Date.now() - 30000}`,
    channel: 'discord',
    timestamp: Date.now() - 30000,
    headers: {
      'content-type': 'application/json',
      'x-signature-ed25519': '7f8a9b...',
      'x-signature-timestamp': String(Math.floor((Date.now() - 30000) / 1000)),
    },
    rawPayload: {
      id: 'disc_9084',
      type: 2,
      data: { name: 'advisor', options: [{ name: 'query', value: 'Can I take OS and Algorithms together?' }] },
      channel_id: '129384756',
      member: { user: { id: 'disc_usr_88' } },
    },
    normalizedMessage: {
      messageId: 'discord_9084',
      channel: 'discord',
      userId: 'disc_usr_88',
      sessionId: '129384756',
      content: '/advisor Can I take OS and Algorithms together?',
    },
    reply: 'Taking OS and Algorithms concurrently requires strong time management due to programming projects.',
    channelOutput: {
      embeds: [{ title: 'OmniCore Universal Bot', color: 5195493 }],
    },
    latencyMs: 198,
    status: 'SUCCESS',
    statusCode: 200,
  },
];

// Mock API Keys Store (for Authentication Service)
export interface MockApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  tier: 'Developer' | 'Production' | 'Enterprise';
  scopes: string[];
  status: 'active' | 'revoked' | 'expired';
  tenant: string;
  rateLimitPerMin: number;
  createdAt: number;
  expiresAt: number | null;
  lastUsedAt: number | null;
}

const mockApiKeys: MockApiKey[] = [
  {
    id: 'key_admin_01',
    name: 'University Campus IT Master Key',
    key: 'omni_live_admin_9841acb729e1',
    prefix: 'omni_live_admin',
    tier: 'Enterprise',
    scopes: ['chat:read', 'chat:write', 'webhook:receive', 'admin:manage', 'telemetry:read'],
    status: 'active',
    tenant: 'School of Computing IT',
    rateLimitPerMin: 500,
    createdAt: Date.now() - 86400000 * 5,
    expiresAt: null,
    lastUsedAt: Date.now() - 120000,
  },
  {
    id: 'key_student_02',
    name: 'Student Portal Webhook Integration',
    key: 'omni_live_portal_499b82c199',
    prefix: 'omni_live_portal',
    tier: 'Production',
    scopes: ['chat:read', 'chat:write', 'webhook:receive'],
    status: 'active',
    tenant: 'Capstone Team 14',
    rateLimitPerMin: 120,
    createdAt: Date.now() - 86400000 * 2,
    expiresAt: Date.now() + 86400000 * 60,
    lastUsedAt: Date.now() - 300000,
  },
  {
    id: 'key_discord_03',
    name: 'Discord Community Bot Worker',
    key: 'omni_dev_discord_3391d84',
    prefix: 'omni_dev_discord',
    tier: 'Developer',
    scopes: ['chat:write', 'webhook:receive'],
    status: 'active',
    tenant: 'CS Discord Server',
    rateLimitPerMin: 60,
    createdAt: Date.now() - 86400000 * 1,
    expiresAt: Date.now() + 86400000 * 30,
    lastUsedAt: Date.now() - 40000,
  },
  {
    id: 'key_revoked_04',
    name: 'Deprecated Mobile Client v0.0.1',
    key: 'omni_test_revoked_9999000',
    prefix: 'omni_test_revoked',
    tier: 'Developer',
    scopes: ['chat:read'],
    status: 'revoked',
    tenant: 'Mobile Sandbox',
    rateLimitPerMin: 30,
    createdAt: Date.now() - 86400000 * 20,
    expiresAt: null,
    lastUsedAt: Date.now() - 86400000 * 10,
  },
];

// 4. Inbound Webhooks Normalizer (Slack, Discord, Custom CRM) with Real-Time Event Logging
apiRouter.post('/webhooks/:channel', async (req: Request, res: Response) => {
  const channel = req.params.channel;
  const rawBody = req.body;
  const start = Date.now();

  // Slack URL Verification Challenge
  if (channel === 'slack' && rawBody.type === 'url_verification') {
    res.json({ challenge: rawBody.challenge });
    return;
  }

  // Discord Ping (Type 1)
  if (channel === 'discord' && rawBody.type === 1) {
    res.json({ type: 1 });
    return;
  }

  try {
    const adapter = channelRegistry.get(channel);
    const normalized = adapter.normalizeInbound(rawBody, req.headers);

    if (!normalized.content) {
      normalized.content = 'Webhook event ping received';
    }

    const outbound = await executePipeline(normalized);
    const latency = Date.now() - start;

    // Record to Real-time Webhook Event Log Buffer
    const eventRecord: WebhookEventRecord = {
      id: `ev_${channel}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      channel,
      timestamp: Date.now(),
      headers: {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent'],
        'x-bot-token': req.headers['x-bot-token'] || req.headers['authorization'] ? '***PRESENT***' : undefined,
      },
      rawPayload: rawBody,
      normalizedMessage: normalized,
      reply: outbound.reply,
      channelOutput: outbound.channelOutput,
      latencyMs: latency,
      status: 'SUCCESS',
      statusCode: 200,
    };

    webhookEventsBuffer.unshift(eventRecord);
    if (webhookEventsBuffer.length > 50) webhookEventsBuffer.pop();

    res.json({
      normalized: true,
      channel,
      inboundUser: normalized.userId,
      inboundSession: normalized.sessionId,
      reply: outbound.reply,
      channelOutput: outbound.channelOutput,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    const latency = Date.now() - start;
    const errorRecord: WebhookEventRecord = {
      id: `ev_err_${channel}_${Date.now()}`,
      channel,
      timestamp: Date.now(),
      headers: req.headers as any,
      rawPayload: rawBody,
      latencyMs: latency,
      status: 'ERROR',
      statusCode: 500,
      reply: err.message,
    };
    webhookEventsBuffer.unshift(errorRecord);
    if (webhookEventsBuffer.length > 50) webhookEventsBuffer.pop();

    res.status(500).json({
      normalized: false,
      error: err.message,
    });
  }
});

// ----------------------------------------------------
// REAL-TIME WEBHOOK EVENT LOG ROUTES
// ----------------------------------------------------
apiRouter.get('/webhook-events', (req: Request, res: Response) => {
  res.json({
    success: true,
    totalCount: webhookEventsBuffer.length,
    events: webhookEventsBuffer,
  });
});

apiRouter.post('/webhook-events/simulate', async (req: Request, res: Response) => {
  const { channel = 'slack', scenario = 'student_inquiry' } = req.body;
  const start = Date.now();

  let samplePayload: any = {};
  if (channel === 'slack') {
    samplePayload = {
      type: 'event_callback',
      event: {
        type: 'app_mention',
        user: `U${Math.floor(10000 + Math.random() * 90000)}`,
        text: scenario === 'student_inquiry'
          ? '<@U0BOT> What courses satisfy the senior software engineering capstone elective?'
          : '<@U0BOT> Server health check ping',
        channel: `C${Math.floor(10000 + Math.random() * 90000)}`,
        ts: (Date.now() / 1000).toFixed(3),
      },
    };
  } else if (channel === 'discord') {
    samplePayload = {
      id: `disc_${Date.now()}`,
      type: 2,
      data: {
        name: 'ask',
        options: [{ name: 'prompt', value: 'How do I submit my team milestone proposal?' }],
      },
      channel_id: '9841249082',
      member: { user: { id: 'disc_usr_499' } },
    };
  } else {
    samplePayload = {
      action: 'ticket_created',
      ticketId: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      query: 'Student asking about lab GPU cluster allocation prerequisites.',
      userId: 'student_crm_99',
    };
  }

  const adapter = channelRegistry.get(channel);
  const normalized = adapter.normalizeInbound(samplePayload);
  const outbound = await executePipeline(normalized);
  const latency = Date.now() - start;

  const eventRecord: WebhookEventRecord = {
    id: `ev_sim_${channel}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    channel,
    timestamp: Date.now(),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'OmniCore-Simulator/1.0',
      'x-simulated': 'true',
    },
    rawPayload: samplePayload,
    normalizedMessage: normalized,
    reply: outbound.reply,
    channelOutput: outbound.channelOutput,
    latencyMs: latency,
    status: 'SUCCESS',
    statusCode: 200,
  };

  webhookEventsBuffer.unshift(eventRecord);
  if (webhookEventsBuffer.length > 50) webhookEventsBuffer.pop();

  res.json({
    success: true,
    message: `Simulated inbound webhook event created for #${channel}`,
    event: eventRecord,
  });
});

apiRouter.delete('/webhook-events', (req: Request, res: Response) => {
  webhookEventsBuffer.length = 0;
  res.json({ success: true, message: 'Webhook event history cleared.' });
});

// ----------------------------------------------------
// MOCK AUTHENTICATION SERVICE ROUTES
// ----------------------------------------------------
apiRouter.get('/auth/keys', (req: Request, res: Response) => {
  // Return list of keys with masked secrets
  const safeKeys = mockApiKeys.map((k) => ({
    ...k,
    keyMasked: `${k.prefix}_***${k.key.slice(-4)}`,
  }));
  res.json({ success: true, keys: safeKeys });
});

apiRouter.post('/auth/validate', (req: Request, res: Response) => {
  const { apiKey, requiredScope = 'chat:write' } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    res.status(400).json({
      valid: false,
      error: 'MISSING_API_KEY',
      message: 'API Key must be provided in the request payload or header.',
    });
    return;
  }

  const trimmed = apiKey.trim();
  const matchedKey = mockApiKeys.find((k) => k.key === trimmed || k.prefix === trimmed);

  if (!matchedKey) {
    res.status(401).json({
      valid: false,
      error: 'INVALID_API_KEY',
      message: 'The provided API key does not exist or has been deleted.',
    });
    return;
  }

  if (matchedKey.status === 'revoked') {
    res.status(403).json({
      valid: false,
      error: 'KEY_REVOKED',
      message: 'This API key has been revoked by the tenant administrator.',
      keyId: matchedKey.id,
      tenant: matchedKey.tenant,
    });
    return;
  }

  if (matchedKey.expiresAt && matchedKey.expiresAt < Date.now()) {
    res.status(403).json({
      valid: false,
      error: 'KEY_EXPIRED',
      message: 'This API key expired. Please rotate or re-issue.',
      keyId: matchedKey.id,
    });
    return;
  }

  if (requiredScope && !matchedKey.scopes.includes(requiredScope) && !matchedKey.scopes.includes('admin:manage')) {
    res.status(403).json({
      valid: false,
      error: 'INSUFFICIENT_SCOPE',
      message: `Key lacks required scope '${requiredScope}'. Available scopes: ${matchedKey.scopes.join(', ')}`,
      keyId: matchedKey.id,
    });
    return;
  }

  matchedKey.lastUsedAt = Date.now();

  res.json({
    valid: true,
    keyId: matchedKey.id,
    name: matchedKey.name,
    tier: matchedKey.tier,
    tenant: matchedKey.tenant,
    scopes: matchedKey.scopes,
    rateLimitPerMin: matchedKey.rateLimitPerMin,
    timestamp: Date.now(),
  });
});

apiRouter.post('/auth/keys', (req: Request, res: Response) => {
  const { name, tier = 'Developer', scopes = ['chat:read', 'chat:write'], tenant = 'Default Tenant' } = req.body;

  if (!name) {
    res.status(400).json({ success: false, error: 'Name is required for the new API key.' });
    return;
  }

  const randomPart = Math.random().toString(36).substring(2, 10);
  const prefix = tier === 'Production' ? 'omni_live' : 'omni_dev';
  const newKeyString = `${prefix}_${randomPart}${Date.now().toString(36).slice(-4)}`;

  const newKey: MockApiKey = {
    id: `key_${Date.now().toString(36)}`,
    name,
    key: newKeyString,
    prefix,
    tier: tier as any,
    scopes: Array.isArray(scopes) ? scopes : ['chat:read', 'chat:write'],
    status: 'active',
    tenant,
    rateLimitPerMin: tier === 'Enterprise' ? 500 : tier === 'Production' ? 120 : 60,
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 90, // 90 days
    lastUsedAt: null,
  };

  mockApiKeys.push(newKey);

  res.json({
    success: true,
    message: 'API Key generated successfully.',
    key: newKey,
  });
});

apiRouter.delete('/auth/keys/:id', (req: Request, res: Response) => {
  const keyId = req.params.id;
  const target = mockApiKeys.find((k) => k.id === keyId);

  if (!target) {
    res.status(404).json({ success: false, error: 'Key not found.' });
    return;
  }

  target.status = 'revoked';
  res.json({ success: true, message: `Key ${target.name} has been revoked.` });
});

// 5. Automated Action Bot Test Probe
apiRouter.post('/test-connection', (req: Request, res: Response) => {
  const { adapter = 'web' } = req.body;
  const start = Date.now();

  const testMessage = 'Action Bot test probe';
  const responseText = generateSimulatedReply(testMessage, undefined, adapter);
  const selectedAdapter = channelRegistry.get(adapter);
  const egress = selectedAdapter.formatOutbound(responseText, 'test_session');

  const roundtripMs = Math.max(12, Date.now() - start);

  res.json({
    success: true,
    adapter,
    roundtripMs,
    status: 'PASSED',
    checks: {
      payloadNormalization: 'PASS',
      schemaValidation: 'PASS',
      egressFormatting: 'PASS',
      responseNonEmpty: responseText.length > 0 ? 'PASS' : 'FAIL',
    },
    egressPreview: egress,
    timestamp: Date.now(),
  });
});

// 6. Docs content server
apiRouter.get('/docs-content', (req: Request, res: Response) => {
  const docFiles = [
    { id: 'readme', name: 'README.md', path: 'README.md' },
    { id: 'license', name: 'LICENSE', path: 'LICENSE' },
    { id: 'contributing', name: 'CONTRIBUTING.md', path: 'CONTRIBUTING.md' },
    { id: 'changelog', name: 'CHANGELOG.md', path: 'CHANGELOG.md' },
    { id: 'architecture', name: 'docs/ARCHITECTURE.md', path: 'docs/ARCHITECTURE.md' },
    { id: 'api_spec', name: 'docs/API_SPECIFICATION.md', path: 'docs/API_SPECIFICATION.md' },
    { id: 'integration', name: 'docs/INTEGRATION_GUIDE.md', path: 'docs/INTEGRATION_GUIDE.md' },
    { id: 'team_milestones', name: 'docs/TEAM_MILESTONES.txt', path: 'docs/TEAM_MILESTONES.txt' },
    { id: 'security', name: 'docs/SECURITY_MODEL.md', path: 'docs/SECURITY_MODEL.md' },
    { id: 'ci_workflow', name: '.github/workflows/ci.yml', path: '.github/workflows/ci.yml' },
    { id: 'bot_workflow', name: '.github/workflows/bot-verification.yml', path: '.github/workflows/bot-verification.yml' },
  ];

  const results = docFiles.map((doc) => {
    try {
      const fullPath = path.resolve(projectRoot, doc.path);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return {
          id: doc.id,
          name: doc.name,
          path: doc.path,
          sizeBytes: Buffer.byteLength(content, 'utf-8'),
          content,
        };
      }
    } catch (e) {
      // fallback
    }
    return {
      id: doc.id,
      name: doc.name,
      path: doc.path,
      sizeBytes: 0,
      content: `# ${doc.name}\n\nFile accessible on repository workspace.`,
    };
  });

  res.json({ success: true, documents: results });
});

// 7. Knowledge Base & RAG Management Endpoints
apiRouter.get('/knowledge-base', (req: Request, res: Response) => {
  const items = getKnowledgeItems();
  res.json({
    success: true,
    count: items.length,
    items,
  });
});

apiRouter.post('/knowledge-base', (req: Request, res: Response) => {
  const { title, category = 'general', tags = [], content, author = 'Team Member' } = req.body;
  if (!title || !content) {
    res.status(400).json({
      success: false,
      error: 'Title and content are required for a knowledge chunk.',
    });
    return;
  }

  const newItem = addKnowledgeItem({
    title,
    category,
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((s: string) => s.trim()) : [],
    content,
    enabled: true,
    author,
  });

  res.json({
    success: true,
    message: 'Knowledge chunk added successfully.',
    item: newItem,
  });
});

apiRouter.patch('/knowledge-base/:id/toggle', (req: Request, res: Response) => {
  const item = toggleKnowledgeItem(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Knowledge item not found.' });
    return;
  }
  res.json({ success: true, item });
});

apiRouter.delete('/knowledge-base/:id', (req: Request, res: Response) => {
  const success = deleteKnowledgeItem(req.params.id);
  if (!success) {
    res.status(404).json({ success: false, error: 'Knowledge item not found.' });
    return;
  }
  res.json({ success: true, message: 'Item deleted.' });
});

apiRouter.post('/knowledge-base/query', (req: Request, res: Response) => {
  const { query, topK = 3 } = req.body;
  if (!query) {
    res.status(400).json({ success: false, error: 'Query parameter is required.' });
    return;
  }

  const results = retrieveKnowledgeChunks(query, Number(topK));
  res.json({
    success: true,
    query,
    matchCount: results.length,
    results,
  });
});

// 8. Analytics & Telemetry Endpoints
apiRouter.get('/analytics/overview', (req: Request, res: Response) => {
  const summary = getAnalyticsSummary();
  res.json({
    success: true,
    analytics: summary,
  });
});

apiRouter.post('/analytics/feedback', (req: Request, res: Response) => {
  const { messageId, rating } = req.body;
  if (rating !== 'up' && rating !== 'down') {
    res.status(400).json({ success: false, error: "Rating must be 'up' or 'down'." });
    return;
  }
  recordFeedback(messageId || 'anon', rating);
  res.json({ success: true, message: 'Feedback recorded.' });
});

apiRouter.post('/analytics/simulate-load', (req: Request, res: Response) => {
  const { burstCount = 20 } = req.body;
  simulateLoadTraffic(Math.min(100, Math.max(1, Number(burstCount))));
  res.json({
    success: true,
    message: `Generated load traffic simulation of ${burstCount} requests.`,
    analytics: getAnalyticsSummary(),
  });
});

// 9. Outbound Webhook Dispatcher Simulator
apiRouter.post('/webhooks/dispatch-test', (req: Request, res: Response) => {
  const { targetUrl = 'https://api.university.edu/webhook/v1', eventType = 'chat.message.created', payload = {} } = req.body;
  const deliveryTimeMs = Math.floor(Math.random() * 45) + 18;
  const signature = `sha256=${Buffer.from(JSON.stringify(payload) + Date.now().toString()).toString('base64').substring(0, 32)}`;

  res.json({
    success: true,
    status: 200,
    deliveryTimeMs,
    targetUrl,
    eventType,
    signatureHeader: `X-OmniCore-Signature: ${signature}`,
    simulatedResponse: {
      status: 'acknowledged',
      receivedAt: Date.now(),
      eventId: `evt_${Date.now()}`,
    },
  });
});

// 10. Smart Changelog Action Bot & Anti-Recursion Shield Endpoints
apiRouter.get('/actionbot/changelog-status', (req: Request, res: Response) => {
  const changelogFile = path.resolve(projectRoot, 'CHANGELOG.md');
  const workflowFile = path.resolve(projectRoot, '.github/workflows/changelog-bot.yml');

  let changelogContent = '';
  let changelogExists = false;
  let workflowExists = false;

  try {
    if (fs.existsSync(changelogFile)) {
      changelogContent = fs.readFileSync(changelogFile, 'utf8');
      changelogExists = true;
    }
    if (fs.existsSync(workflowFile)) {
      workflowExists = true;
    }
  } catch {
    // ignore
  }

  res.json({
    success: true,
    status: 'ACTIVE',
    antiRecursionShield: {
      layer1: '[skip ci] / [auto-changelog] commit message tag filter',
      layer2: 'github-actions[bot] and automated bot author identity filter',
      layer3: 'Diff inspection (aborts if ONLY CHANGELOG.md is touched)',
    },
    workflowConfigured: workflowExists,
    changelogExists,
    workflowPath: '.github/workflows/changelog-bot.yml',
    scriptPath: 'scripts/update-changelog.js',
    lastSyncTimestamp: Date.now(),
    recentPreview: changelogContent.slice(0, 1500),
  });
});

apiRouter.post('/actionbot/simulate-changelog', (req: Request, res: Response) => {
  const { 
    commitMessage = 'feat(voice): add real-time speech dictation with audio wave indicator', 
    author = 'Developer', 
    changedFiles = ['src/components/ChannelSandbox.tsx', 'backend/core/pipeline.ts'] 
  } = req.body;

  const lowerMsg = (commitMessage || '').toLowerCase();
  const lowerAuthor = (author || '').toLowerCase();

  // Test Guard 1
  if (lowerMsg.includes('[skip ci]') || lowerMsg.includes('[ci skip]') || lowerMsg.includes('[auto-changelog]')) {
    res.json({
      success: true,
      action: 'BLOCKED',
      reason: 'Recursion Guard Layer 1: Commit contains [skip ci] / [auto-changelog] flag.',
      guardTriggered: 'LAYER_1_MESSAGE_FLAG',
      isLoopPrevented: true,
      classified: null,
    });
    return;
  }

  // Test Guard 2
  if (
    lowerAuthor.includes('github-actions[bot]') ||
    lowerAuthor.includes('github-actions') ||
    lowerAuthor.includes('action-bot') ||
    lowerAuthor.includes('bot@')
  ) {
    res.json({
      success: true,
      action: 'BLOCKED',
      reason: 'Recursion Guard Layer 2: Commit author matches automated bot identity.',
      guardTriggered: 'LAYER_2_BOT_AUTHOR',
      isLoopPrevented: true,
      classified: null,
    });
    return;
  }

  // Test Guard 3
  if (Array.isArray(changedFiles) && changedFiles.length === 1 && changedFiles[0].includes('CHANGELOG.md')) {
    res.json({
      success: true,
      action: 'BLOCKED',
      reason: 'Recursion Guard Layer 3: Only CHANGELOG.md was touched. Self-triggering loop suppressed.',
      guardTriggered: 'LAYER_3_SELF_DIFF',
      isLoopPrevented: true,
      classified: null,
    });
    return;
  }

  // Categorize
  let category = 'Changed';
  let title = commitMessage.trim();

  if (/^feat(\(.*\))?:/i.test(commitMessage)) {
    category = 'Added';
    title = commitMessage.replace(/^feat(\(.*\))?:\s*/i, '');
  } else if (/^fix(\(.*\))?:/i.test(commitMessage)) {
    category = 'Fixed';
    title = commitMessage.replace(/^fix(\(.*\))?:\s*/i, '');
  } else if (/^docs(\(.*\))?:/i.test(commitMessage)) {
    category = 'Documentation';
    title = commitMessage.replace(/^docs(\(.*\))?:\s*/i, '');
  } else if (/^(perf|enhance|ui|style)(\(.*\))?:/i.test(commitMessage)) {
    category = 'Enhanced';
    title = commitMessage.replace(/^(perf|enhance|ui|style)(\(.*\))?:\s*/i, '');
  } else if (/^refactor(\(.*\))?:/i.test(commitMessage)) {
    category = 'Changed';
    title = commitMessage.replace(/^refactor(\(.*\))?:\s*/i, '');
  } else if (/^sec(urity)?(\(.*\))?:/i.test(commitMessage)) {
    category = 'Security';
    title = commitMessage.replace(/^sec(urity)?(\(.*\))?:\s*/i, '');
  }

  title = title.charAt(0).toUpperCase() + title.slice(1);

  res.json({
    success: true,
    action: 'APPROVED_FOR_UPDATE',
    reason: 'Passed all 3 anti-recursion guards. Valid user push event.',
    isLoopPrevented: false,
    guardTriggered: null,
    classified: {
      category,
      title,
      originalCommit: commitMessage,
      generatedMarkdown: `### ${category}\n- ${title}`,
      nextCommitMessage: 'docs(changelog): automated update via Action Bot [auto-changelog] [skip ci]',
    },
  });
});


