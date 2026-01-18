
import axios from 'axios';
import * as cheerio from 'cheerio';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://digitallistings.net/product-category/dentistry-books/';
const OUTPUT_FILE = path.join(__dirname, '../attached_assets/imported_books.csv');

interface Book {
  Title: string;
  Price: string;
  Description: string;
  Url: string;
  Image_File: string;
  Image_Url: string;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeBookDetails(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    
    // Try different selectors for description
    let description = $('#tab-description').text().trim();
    if (!description) {
      description = $('.woocommerce-product-details__short-description').text().trim();
    }
    // Clean up whitespace
    return description.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.warn(`Failed to scrape details for ${url}: ${error}`);
    return '';
  }
}

async function scrapePage(pageNumber: number): Promise<{ books: Book[], hasNext: boolean }> {
  const url = pageNumber === 1 ? BASE_URL : `${BASE_URL}page/${pageNumber}/`;
  console.log(`Scraping page ${pageNumber}: ${url}`);

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const books: Book[] = [];

    const products = $('.product');
    
    if (products.length === 0) {
      return { books: [], hasNext: false };
    }

    for (const element of products) {
      const $el = $(element);
      const title = $el.find('h2.woocommerce-loop-product__title, .astra-shop-summary-wrap h2').text().trim();
      const price = $el.find('.price').text().replace(/\s+/g, ' ').trim();
      const productUrl = $el.find('a.woocommerce-LoopProduct-link').attr('href') || $el.find('a').attr('href') || '';
      const imageUrl = $el.find('img').attr('src') || '';

      if (title && productUrl) {
        console.log(`  Found book: ${title}`);
        
        // Fetch detailed description
        await sleep(500); // Be polite
        const description = await scrapeBookDetails(productUrl);

        books.push({
          Title: title,
          Price: price,
          Description: description,
          Url: productUrl,
          Image_File: '', // We aren't downloading images locally yet to save space/time, just linking
          Image_Url: imageUrl
        });
      }
    }

    const nextLink = $('.next.page-numbers');
    return { books, hasNext: nextLink.length > 0 };

  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error);
    return { books: [], hasNext: false };
  }
}

async function main() {
  let page = 1;
  let allBooks: Book[] = [];
  let keepScraping = true;

  while (keepScraping) {
    const { books, hasNext } = await scrapePage(page);
    allBooks = [...allBooks, ...books];
    
    if (!hasNext || page >= 20) { // Safety limit of 20 pages
      keepScraping = false;
    } else {
      page++;
      await sleep(1000); // Delay between pages
    }
  }

  console.log(`\nTotal books scraped: ${allBooks.length}`);
  
  if (allBooks.length > 0) {
    const csvContent = stringify(allBooks, {
      header: true,
      columns: ['Title', 'Price', 'Description', 'Url', 'Image_File', 'Image_Url']
    });

    // Ensure directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, csvContent);
    console.log(`Saved to ${OUTPUT_FILE}`);
  } else {
    console.log("No books found.");
  }
}

main().catch(console.error);
