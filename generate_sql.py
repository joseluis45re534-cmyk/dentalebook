import csv
import re

csv_path = r"c:\Users\pc\Downloads\product_issues_2026-01-25_15_23_09.csv"
unique_ids = set()

with open(csv_path, mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        unique_ids.add(row['Item ID'])

ids_tuple = f"({', '.join(sorted(list(unique_ids)))})"

# SQL for Titles
# 1. Replace "Edition" with "Version"
# 2. Append " - Interactive Educational Software" if not present
# 3. Specifically handle common problematic strings
sql_updates = [
    # Titles
    f"UPDATE products SET title = REPLACE(title, 'Edition', 'Version') WHERE id IN {ids_tuple};",
    f"UPDATE products SET title = REPLACE(title, 'edition', 'Version') WHERE id IN {ids_tuple};",
    f"UPDATE products SET title = REPLACE(title, 'Book', 'Educational Resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET title = title || ' - Interactive Educational Software' WHERE id IN {ids_tuple} AND title NOT LIKE '%Interactive Educational Software%';",
    
    # Descriptions
    f"UPDATE products SET description = REPLACE(description, 'This book', 'This interactive educational software') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'this book', 'this educational software') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'the book', 'the educational resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'Book', 'Resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'book', 'resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'PDF', 'Digital Resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'eBook', 'Digital Resource') WHERE id IN {ids_tuple};",
    f"UPDATE products SET description = REPLACE(description, 'ebook', 'digital resource') WHERE id IN {ids_tuple};",
]

# Write SQL to a file
with open('merchant_cleanup.sql', 'w', encoding='utf-8') as f:
    for sql in sql_updates:
        f.write(sql + "\n")

print(f"Generated SQL for {len(unique_ids)} unique products.")
print(f"Target IDs: {ids_tuple}")
