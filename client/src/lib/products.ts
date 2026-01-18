import Papa from "papaparse";
import { Product, PaginatedResponse, SearchParams } from "@shared/schema";

// Cache the products promise to avoid multiple fetches
let productsCache: Promise<Product[]> | null = null;

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

async function getAllProducts(): Promise<Product[]> {
    if (productsCache) return productsCache;

    productsCache = new Promise((resolve, reject) => {
        Papa.parse("/imported_books.csv", {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const records = results.data as CSVBook[];
                    const products: Product[] = records.map((record, index) => {
                        const priceData = parsePrice(record.Price);
                        return {
                            id: index + 1,
                            title: record.Title,
                            price: record.Price,
                            ...priceData,
                            description: record.Description,
                            url: record.Url,
                            imageFile: record.Image_File || null,
                            imageUrl: record.Image_Url || null,
                            category: determineCategory(record.Title)
                        };
                    });
                    resolve(products);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => {
                console.error("Error parsing CSV:", err);
                reject(err);
            }
        });
    });

    return productsCache!;
}

export async function fetchProducts(params: Partial<SearchParams>): Promise<PaginatedResponse> {
    const allProducts = await getAllProducts();

    // 1. Filter
    let filtered = allProducts;

    if (params.category) {
        filtered = filtered.filter(p => p.category === params.category);
    }

    if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }

    // 2. Sort
    const sort = params.sort || "date";
    filtered.sort((a, b) => {
        switch (sort) {
            case "price-asc":
                return a.currentPrice - b.currentPrice;
            case "price-desc":
                return b.currentPrice - a.currentPrice;
            case "title":
                return a.title.localeCompare(b.title);
            case "date":
            default:
                // Assuming higher ID is newer since we don't have a date field in this dataset
                return b.id - a.id;
        }
    });

    // 3. Paginate
    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 12;
    const start = (page - 1) * limit;
    const end = start + limit;

    const pageProducts = filtered.slice(start, end);
    const totalPages = Math.ceil(total / limit);

    return {
        products: pageProducts,
        total,
        page,
        totalPages,
        hasMore: end < total
    };
}

export async function fetchProductById(id: number): Promise<Product | undefined> {
    const allProducts = await getAllProducts();
    return allProducts.find(p => p.id === id);
}

export async function fetchProductsByIds(ids: number[]): Promise<Product[]> {
    const allProducts = await getAllProducts();
    return allProducts.filter(p => ids.includes(p.id));
}
