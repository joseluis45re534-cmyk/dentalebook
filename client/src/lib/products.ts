import { Product, PaginatedResponse, SearchParams } from "@shared/schema";

// Cache the products promise to avoid multiple fetches
let productsCache: Promise<Product[]> | null = null;

async function getAllProducts(): Promise<Product[]> {
    if (productsCache) return productsCache;

    productsCache = fetch("/api/products")
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch products");
            return res.json() as Promise<Product[]>;
        })
        .catch(err => {
            console.error("Error fetching products:", err);
            return []; // Fallback to empty
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
    // We could fetch single from API (/api/products/:id) but since we cache all, find is faster for navigation
    // However, to ensure fresh data on direct load, maybe fetch single?
    // Let's rely on getAllProducts cache for now to keep it snappy, 
    // invalidating cache would be needed on Admin updates (but this is public view).
    const all = await getAllProducts();
    return all.find(p => p.id === id);
}

export async function fetchProductsByIds(ids: number[]): Promise<Product[]> {
    const allProducts = await getAllProducts();
    return allProducts.filter(p => ids.includes(p.id));
}
