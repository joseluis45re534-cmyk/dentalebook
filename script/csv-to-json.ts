
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_CSV = path.join(process.cwd(), "attached_assets", "digitallistings_products_1768658324529.csv");
const JSON_OUTPUT_PATH = path.join(process.cwd(), 'client', 'public', 'products.json');

// Interface matching the schema used in the app (roughly)
// We need to map the CSV fields to the Product schema
interface CSVBook {
    title: string;
    price: string;
    description: string;
    url: string;
    image_file: string;
    image_url: string;
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
    if (!fs.existsSync(INPUT_CSV)) {
        console.error(`CSV file not found at ${INPUT_CSV}`);
        process.exit(1);
    }

    console.log(`Reading CSV from ${INPUT_CSV}...`);
    const csvContent = fs.readFileSync(INPUT_CSV, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
    }) as CSVBook[];

    console.log(`Found ${records.length} records. converting...`);

    const products: Product[] = records.map((record, index) => {
        const priceData = parsePrice(record.price);

        return {
            id: index + 1, // Simple ID generation
            title: record.title,
            price: record.price, // Keeping original string for display if needed, but app likely uses numbers
            ...priceData,
            description: record.description,
            url: record.url,
            category: determineCategory(record.title),
            // The CSV contains multiple images separated by semicolons. We just want the first one.
            imageFile: record.image_file ? record.image_file.split(';')[0] : null,
            imageUrl: record.image_url ? record.image_url.split(';')[0] : null
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
