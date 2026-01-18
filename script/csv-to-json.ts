
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(process.cwd(), 'attached_assets', 'imported_books.csv');
const JSON_OUTPUT_PATH = path.join(process.cwd(), 'client', 'public', 'products.json');

// Interface matching the schema used in the app (roughly)
// We need to map the CSV fields to the Product schema
interface CSVBook {
    Title: string;
    Price: string;
    Description: string;
    Url: string;
    Image_File: string;
    Image_Url: string;
}

interface Product {
    id: number;
    title: string;
    price: string;
    currentPrice: number;
    originalPrice: number | null;
    isOnSale: boolean;
    description: string;
    url: string;
    imageFile: string | null;
    imageUrl: string | null;
    category: string;
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

function main() {
    if (!fs.existsSync(CSV_PATH)) {
        console.error(`CSV file not found at ${CSV_PATH}`);
        process.exit(1);
    }

    console.log(`Reading CSV from ${CSV_PATH}...`);
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    }) as CSVBook[];

    console.log(`Found ${records.length} records. converting...`);

    const products: Product[] = records.map((record, index) => {
        const priceData = parsePrice(record.Price);

        return {
            id: index + 1, // Simple ID generation
            title: record.Title,
            price: record.Price, // Keeping original string for display if needed, but app likely uses numbers
            ...priceData,
            description: record.Description,
            url: record.Url,
            imageFile: record.Image_File || null,
            imageUrl: record.Image_Url || null,
            category: determineCategory(record.Title)
        };
    });

    // Ensure directory exists
    const dir = path.dirname(JSON_OUTPUT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(products, null, 2));
    console.log(`Successfully wrote ${products.length} products to ${JSON_OUTPUT_PATH}`);
}

main();
