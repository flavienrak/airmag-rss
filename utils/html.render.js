import { loadArticles } from './articles.js';

const createHTMLFeed = () => {
  const articles = loadArticles();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Flux RSS Tourmag</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .article { margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
        .article img { max-width: 100%; height: auto; }
      </style>
    </head>
    <body>
      <h1>Derniers Articles</h1>
      ${articles
        .map(
          (article) => `
        <div class="article">
          <h2><a href="${article.link}" target="_blank">${
            article.title
          }</a></h2>
          <a href="${article.link}" target="_blank">${
            article.image
              ? `<img src="${article.image}" alt="${article.title}">`
              : ''
          }</a>
          <div>${article.summary}</div>
        </div>`
        )
        .join('')}
    </body>
    </html>
  `;
};

export { createHTMLFeed };
