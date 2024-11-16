import { loadArticles } from './articles.js';
import { BASE_URL } from './constants.js';

const createRSSFeed = () => {
  const articles = loadArticles();
  const rssHeader = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Flux RSS Airmag</title>
    <link>${BASE_URL}</link>
    <description>Les derniers articles de Airmag</description>`;

  const rssItems = articles
    .map(
      (article) => `
    <item>
      <title>${article.title}</title>
      <link>${article.link}</link>
      <description><![CDATA[${article.summary}]]></description>
      ${article.image ? `<image>${article.image}</image>` : ''}
    </item>`
    )
    .join('');

  return `${rssHeader}${rssItems}</channel></rss>`;
};

export { createRSSFeed };
