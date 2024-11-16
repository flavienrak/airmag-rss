import express from 'express';
import winston from 'winston';

import { createRSSFeed } from './utils/xml.render.js';
import { fetchArticles } from './utils/articles.js';
import { createHTMLFeed } from './utils/html.render.js';

const app = express();
const PORT = 3000;

let cache = null;
let lastFetch = null;

async function fetchRSSWithCache() {
  const now = Date.now();

  if (!cache || now - lastFetch > 15 * 60 * 1000) {
    await fetchArticles();
    cache = createRSSFeed();
    lastFetch = now;
  }

  return cache;
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

app.get('/', async (req, res) => {
  res.send('Welcome !');
});

app.get('/rss', async (req, res) => {
  const rssFeed = await fetchRSSWithCache();
  res.set('Content-Type', 'application/rss+xml');
  res.send(rssFeed);
});

app.get('/rss/html', (req, res) => {
  const htmlFeed = createHTMLFeed();
  res.set('Content-Type', 'text/html');
  res.send(htmlFeed);
});

setInterval(async () => {
  logger.info('Vérification toutes les 15 minutes...');
  await fetchRSSWithCache();
}, 15 * 60 * 1000);

// Démarrer le serveur
app.listen(PORT, () => {
  logger.info(`RSS Feed server is running at http://localhost:${PORT}/rss`);
});

export default app;
