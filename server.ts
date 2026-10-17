import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './backend/routes/api.routes.ts';
import { aiClient } from './backend/core/pipeline.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '5mb' }));

// Mount backend API routes under /api/v1
app.use('/api/v1', apiRouter);

// Start server and mount Vite middleware (dev) or dist static files (prod)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[OmniCore Gateway] Running at http://${HOST}:${PORT}`);
    console.log(`[OmniCore Gateway] AI Provider: ${aiClient ? 'Gemini 3.8 Flash (Active)' : 'Simulation Engine'}`);
    console.log(`[OmniCore Gateway] Backend Routes: /api/v1/* loaded from backend/routes/api.routes.ts`);
  });
}

startServer().catch((err) => {
  console.error('[OmniCore] Failed to start server:', err);
  process.exit(1);
});
