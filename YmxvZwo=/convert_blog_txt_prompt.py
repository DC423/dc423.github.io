import json
import sys
from datetime import date
from pathlib import Path

def convert_txt_to_json(filepath):
    source_path = Path(filepath)
    ext = source_path.suffix

    if ext.lower() != '.txt':
        print("File must be a .txt file.")
        return

    with source_path.open("r", encoding="utf-8-sig") as f:
        lines = f.read().strip().splitlines()

    if len(lines) < 2:
        print("File must have at least 2 lines: title and content.")
        return

    title = lines[0].strip()
    content_lines = [line.strip() for line in lines[1:] if line.strip()]

    print(f"\nTitle detected: {title}")
    author = input("Author name: ").strip()
    publication_date = input("Publication date (YYYY-MM-DD): ").strip()

    try:
        date.fromisoformat(publication_date)
    except ValueError:
        print("Date format should be YYYY-MM-DD.")
        return

    json_data = {
        "title": title,
        "date": publication_date,
        "author": author,
        "content": content_lines
    }

    output_path = source_path.with_suffix(".json")
    with output_path.open("w", encoding="utf-8") as out:
        json.dump(json_data, out, indent=2, ensure_ascii=False)

    print(f"\n✔ Created JSON: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_blog_txt_prompt.py yourfile.txt")
    else:
        convert_txt_to_json(sys.argv[1])
