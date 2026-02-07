import { type User, type InsertUser, type Product, type PaginatedResponse, type SearchParams } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProducts(params: SearchParams): Promise<PaginatedResponse>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsByIds(ids: number[]): Promise<Product[]>;
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

function determineCategory(title: string, description: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerDesc = description.toLowerCase();

  if (lowerTitle.includes('course') || lowerTitle.includes('webinar') ||
    lowerTitle.includes('video') || lowerTitle.includes('lecture') ||
    lowerDesc.includes('video webinar') || lowerDesc.includes('video lecture')) {
    return 'Courses';
  }

  if (lowerTitle.includes('journal') || lowerTitle.includes('book') ||
    lowerTitle.includes('archive') || lowerTitle.includes('ebook') ||
    lowerTitle.includes('textbook') || lowerTitle.includes('edition')) {
    return 'Books';
  }

  if (lowerDesc.includes('format:') && lowerDesc.includes('video')) {
    return 'Courses';
  }

  if (lowerDesc.includes('pdf') || lowerDesc.includes('journal')) {
    return 'Books';
  }

  return 'Books';
}

function parseCSVContent(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentField);
        if (currentRow.length > 0 && currentRow.some(f => f.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        if (char === '\r') i++;
        i++;
        continue;
      } else if (char === '\r') {
        currentRow.push(currentField);
        if (currentRow.length > 0 && currentRow.some(f => f.trim())) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some(f => f.trim())) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function loadProductsFromCSV(): Product[] {
  const csvPath = path.join(process.cwd(), 'attached_assets', 'imported_books.csv');

  if (!fs.existsSync(csvPath)) {
    console.warn('CSV file not found at:', csvPath);
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSVContent(content);

  if (rows.length < 2) {
    return [];
  }

  const headerRow = rows[0];
  const titleIdx = headerRow.findIndex(h => h.toLowerCase() === 'title');
  const priceIdx = headerRow.findIndex(h => h.toLowerCase() === 'price');
  const descIdx = headerRow.findIndex(h => h.toLowerCase() === 'description');
  const urlIdx = headerRow.findIndex(h => h.toLowerCase() === 'url');
  const imageFileIdx = headerRow.findIndex(h => h.toLowerCase() === 'image_file');
  const imageUrlIdx = headerRow.findIndex(h => h.toLowerCase() === 'image_url');

  const products: Product[] = [];
  let productId = 1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    if (row.length < 3) continue;

    const title = row[titleIdx] || '';
    const price = row[priceIdx] || '';
    const description = row[descIdx] || '';
    const url = row[urlIdx] || '';
    const imageFile = row[imageFileIdx] || '';
    const imageUrl = row[imageUrlIdx] || '';

    if (!title || title.length < 5) continue;

    const { currentPrice, originalPrice, isOnSale } = parsePrice(price);

    if (currentPrice === 0) continue;

    if (!url || !url.startsWith('http')) continue;

    const images = imageFile.split(';').filter(Boolean);
    const primaryImageFile = images[0] || null;

    const imageUrls = imageUrl.split(';').filter(Boolean);
    const primaryImageUrl = imageUrls.find(u => !u.includes('300x') && !u.includes('430x')) || imageUrls[0] || null;

    products.push({
      id: productId++,
      title: title.trim(),
      price: price,
      currentPrice,
      originalPrice,
      isOnSale,
      description: description,
      url: url,
      imageFile: primaryImageFile,
      imageUrl: primaryImageUrl,
      images: imageUrls, // Store all images
      category: determineCategory(title, description),
    });
  }

  console.log(`Loaded ${products.length} valid products from CSV`);
  return products;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Product[];

  constructor() {
    this.users = new Map();
    this.products = loadProductsFromCSV();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts(params: SearchParams): Promise<PaginatedResponse> {
    let filtered = [...this.products];

    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (params.category) {
      const category = params.category.toLowerCase();
      filtered = filtered.filter(p =>
        p.category.toLowerCase() === category ||
        p.category.toLowerCase().includes(category)
      );
    }

    switch (params.sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
      default:
        break;
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 12;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const products = filtered.slice(offset, offset + limit);

    return {
      products,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.find(p => p.id === id);
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    return this.products.filter(p => ids.includes(p.id));
  }
}

export const storage = new MemStorage();
