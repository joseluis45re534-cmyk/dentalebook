import fs from 'fs';

const csvPath = 'c:\\Users\\pc\\Downloads\\product_issues_2026-01-25_15_23_09.csv';
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n');
const uniqueIds = new Set();

for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser for single column ID
    let itemId = '';
    if (line.startsWith('"')) {
        // Quoted string handling if needed, but Item ID is usually first and numeric
        const match = line.match(/^"([^"]+)"/);
        if (match) itemId = match[1];
    } else {
        itemId = line.split(',')[0];
    }

    if (itemId && !isNaN(itemId)) {
        uniqueIds.add(itemId);
    }
}

const ids = Array.from(uniqueIds).sort((a, b) => parseInt(a) - parseInt(b));
const idsTuple = `(${ids.join(', ')})`;

const sqlUpdates = [
    // Titles
    `UPDATE products SET title = REPLACE(title, 'Edition', 'Version') WHERE id IN ${idsTuple};`,
    `UPDATE products SET title = REPLACE(title, 'edition', 'Version') WHERE id IN ${idsTuple};`,
    `UPDATE products SET title = REPLACE(title, 'Book', 'Educational Resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET title = title || ' - Interactive Educational Software' WHERE id IN ${idsTuple} AND title NOT LIKE '%Interactive Educational Software%';`,

    // Descriptions
    `UPDATE products SET description = REPLACE(description, 'This book', 'This interactive educational software') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'this book', 'this educational software') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'the book', 'the educational resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'Book', 'Resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'book', 'resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'PDF', 'Digital Resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'eBook', 'Digital Resource') WHERE id IN ${idsTuple};`,
    `UPDATE products SET description = REPLACE(description, 'ebook', 'digital resource') WHERE id IN ${idsTuple};`
];

fs.writeFileSync('merchant_cleanup.sql', sqlUpdates.join('\n'));
console.log(`Generated SQL for ${ids.length} unique products.`);
console.log(`Target IDs: ${idsTuple}`);
