-- Migration number: 0006 	 2024-05-22T00:00:00.000Z
CREATE TABLE IF NOT EXISTS scripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    location TEXT CHECK(location IN ('head', 'body_start', 'footer')) NOT NULL DEFAULT 'head',
    enabled BOOLEAN NOT NULL DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);
