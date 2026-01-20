CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'page_view', 'add_to_cart', 'checkout_start'
  path TEXT,
  metadata TEXT, -- JSON string for extra data (product_id, referrer, etc)
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
