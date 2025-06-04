import os
import json
import sys

def convert_txt_to_json(filepath):
    filename = os.path.basename(filepath)
    name, ext = os.path.splitext(filename)

    if ext.lower() != '.txt':
        print("File must be a .txt file.")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.read().strip().splitlines()

    if len(lines) < 2:
        print("File must have at least 2 lines: title and content.")
        return

    title = lines[0].strip()
    content_lines = [line.strip() for line in lines[1:] if line.strip()]

    print(f"\nTitle detected: {title}")
    author = input("Author name: ").strip()
    date = input("Publication date (YYYY-MM-DD): ").strip()

    if not date.count("-") == 2:
        print("Date format should be YYYY-MM-DD.")
        return

    json_data = {
        "title": title,
        "date": date,
        "author": author,
        "content": content_lines
    }

    output_path = filepath.replace(".txt", ".json")
    with open(output_path, "w", encoding="utf-8") as out:
        json.dump(json_data, out, indent=2, ensure_ascii=False)

    print(f"\n✔ Created JSON: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python convert_blog_txt_prompt.py yourfile.txt")
    else:
        convert_txt_to_json(sys.argv[1])
