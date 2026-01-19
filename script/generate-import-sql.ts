
import Papa from "papaparse";
import fs from "fs";
import path from "path";

// Types matching our CSV and Schema
interface CSVBook {
  Title: string;
  Price: string;
  Description: string;
  Url: string;
  Image_File: string;
  Image_Url: string;
}

function parsePrice(priceStr: string): { currentPrice: number; originalPrice: number | null; isOnSale: boolean } {
  if (!priceStr) {
    return { currentPrice: 0, originalPrice: null, isOnSale: false };
  }

  const saleMatch = priceStr.match(/\$(\d+(?:\.\d{2})?)\s*Original price was:\s*\$?(\d+(?:\.\d{2})?).*\$(\d+(?:\.\d{2})?)\s*Current price/i);
  if (saleMatch) {
    const originalPrice = parseFloat(saleMatch[1]);
    const currentPrice = parseFloat(saleMatch[3]);
    return {
      currentPrice,
      originalPrice,
      isOnSale: true
    };
  }

  const simpleMatch = priceStr.match(/\$(\d+(?:\.\d{2})?)/);
  if (simpleMatch) {
    return {
      currentPrice: parseFloat(simpleMatch[1]),
      originalPrice: null,
      isOnSale: false
    };
  }

  return { currentPrice: 0, originalPrice: null, isOnSale: false };
}

function determineCategory(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('course') || lowerTitle.includes('masterclass')) {
    return 'courses';
  }
  return 'books';
}

function escapeSql(str: string): string {
  if (!str) return "NULL";
  // Replace single quotes with two single quotes for SQL escaping
  return `'${str.replace(/'/g, "''")}'`;
}

// Read CSV
const csvPath = path.join(process.cwd(), "client", "public", "imported_books.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");

Papa.parse(csvContent, {
  header: true,
  skipEmptyLines: true,
  complete: (results) => {
    const records = results.data as CSVBook[];

    let sql = "-- Auto-generated import script\n";
    sql += "DELETE FROM products;\n"; // Clear existing data if re-run

    const batchSize = 5; // Reduced from 50 to avoid SQLITE_TOOBIG

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      sql += "INSERT INTO products (title, description, price, current_price, original_price, is_on_sale, url, image_file, image_url, category) VALUES \n";

      const values = batch.map(record => {
        const { currentPrice, originalPrice, isOnSale } = parsePrice(record.Price);
        const category = determineCategory(record.Title);

        return `(${escapeSql(record.Title)}, ${escapeSql(record.Description)}, ${escapeSql(record.Price)}, ${currentPrice}, ${originalPrice ?? 'NULL'}, ${isOnSale ? 1 : 0}, ${escapeSql(record.Url)}, ${escapeSql(record.Image_File)}, ${escapeSql(record.Image_Url)}, ${escapeSql(category)})`;
      });

      sql += values.join(",\n") + ";\n\n";
    }

    const outPath = path.join(process.cwd(), "migrations", "0002_import_products.sql");
    fs.writeFileSync(outPath, sql);
    console.log(`Successfully generated SQL import script at ${outPath} with ${records.length} records.`);
  }
});
