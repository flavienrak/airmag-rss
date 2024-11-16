import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

import { BASE_URL } from './constants.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, 'articles.json');

const getNextPageUrl = (currentUrl) => {
  const urlObj = new URL(currentUrl, BASE_URL);
  const startParam = parseInt(urlObj.searchParams.get('start') || '0');
  const nextStart = startParam + 6;
  urlObj.searchParams.set('start', nextStart);
  return urlObj.toString();
};

const loadArticles = () => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Aucun fichier existant, création d’un nouveau fichier.');
    return [];
  }
};

const saveArticles = (articles) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2), 'utf8');
    console.log('Articles enregistrés avec succès.');
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des articles :", error);
  }
};

const updateArticles = (newArticles) => {
  const existingArticles = loadArticles();
  const existingLinks = new Set(
    existingArticles.map((article) => article.link)
  );

  const uniqueArticles = newArticles.filter(
    (article) => !existingLinks.has(article.link)
  );
  const allArticles = [...existingArticles, ...uniqueArticles];

  if (uniqueArticles.length > 0) {
    saveArticles(allArticles);
  }

  return uniqueArticles; // Retourne uniquement les nouveaux articles pour un traitement éventuel
};

const fetchArticles = async () => {
  const items = [];
  let currentPageUrl = BASE_URL;
  let existingArticles = loadArticles();

  while (currentPageUrl) {
    console.log(`url: ${currentPageUrl}`);
    try {
      const { data, status } = await axios.get(currentPageUrl);
      if (status !== 200) {
        console.log(`Erreur avec le statut ${status} pour ${currentPageUrl}`);
        break;
      }

      const $ = cheerio.load(data);
      let pageHasArticles = false;

      $('.rub_left').each((_, element) => {
        const title = $(element).find('.titre_article').text().trim();
        const link = $(element).find('.titre_article a').attr('href');
        const image = $(element).find('.photo_left img').attr('src');
        const summary = $(element).find('.resume_article').text().trim();

        if (title && link) {
          const articleLink = new URL(link, BASE_URL).href;
          const isArticleAlreadyPresent = existingArticles.some(
            (article) => article.link === articleLink
          );
          if (isArticleAlreadyPresent) {
            console.log(
              `Article déjà trouvé : ${articleLink}, arrêt du processus.`
            );
            return;
          }

          items.push({
            title,
            link: articleLink,
            image: image ? new URL(image, BASE_URL).href : null,
            summary,
          });
          pageHasArticles = true;
        }
      });

      if (!pageHasArticles) {
        console.log('Aucun article trouvé sur cette page.');
        break;
      }

      // Obtenir l'URL de la page suivante
      currentPageUrl = getNextPageUrl(currentPageUrl);
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      break;
    }
  }

  // Retourner les nouveaux articles
  const newArticles = updateArticles(items);
  return newArticles;
};

export { loadArticles, saveArticles, updateArticles, fetchArticles };
