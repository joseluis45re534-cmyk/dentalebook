-- Drop table if exists to ensure clean state during dev (careful in prod!)
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INTEGER PRIMARY KEY, -- We can keep the integer ID for compatibility
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL, -- Storing the raw price string from CSV for now, or we can parse it. Let's store raw + parsed columns.
  current_price REAL,
  original_price REAL,
  is_on_sale BOOLEAN DEFAULT 0,
  url TEXT,
  image_file TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster category filtering
CREATE INDEX idx_products_category ON products(category);
