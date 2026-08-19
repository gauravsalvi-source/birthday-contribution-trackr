import express from 'express';
import 'dotenv/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app, { registerErrorHandler } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');
const PORT = process.env.PORT || 3000;

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }

  const indexPath = path.join(distPath, 'index.html');

  if (!existsSync(indexPath)) {
    res.status(500).json({
      error: 'Frontend build not found. Run npm run build before starting the server.',
    });
    return;
  }

  res.sendFile(indexPath);
});

registerErrorHandler(app);

app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
