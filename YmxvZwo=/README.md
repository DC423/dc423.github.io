# CHA Terminal Blog

The CHA blog is a dependency-free JSON feed rendered by `../blog.html`.

## Create a text post

1. Create a `.txt` file in this directory, for example:

   ```text
   2026-10-05_MY_POST.txt
   ```

2. Put the title on the first line. Each later non-empty line becomes a paragraph:

   ```text
   WHAT HAPPENED TO US
   I remember when hacking meant opening something not meant to be opened.
   Now it's all branding and bug bounties.
   ```

3. Run the converter from this directory:

   ```console
   python convert_blog_txt_prompt.py 2026-10-05_MY_POST.txt
   ```

4. Enter the author and an ISO publication date (`YYYY-MM-DD`) when prompted.

The converter writes `2026-10-05_MY_POST.json` beside the source file. It uses
`Path.with_suffix()`, so uppercase `.TXT` inputs are handled safely and never
overwrite the source text file.

## Structured content

Normal `content` entries are rendered as plain text. Raw HTML is intentionally
not supported. A post may include an HTTPS image using this explicit structure:

```json
{
  "type": "image",
  "src": "https://example.org/image.jpg",
  "alt": "Meaningful image description",
  "width": 600,
  "height": 400,
  "caption": "Optional caption"
}
```

## Update the index

Add the JSON filename to `index.json`. Keep newest posts first:

```json
[
  "2026-10-05_MY_POST.json",
  "2026-05-13_Canvas_Hack_And_Classroom_Resilience.json"
]
```

No CMS. No WYSIWYG. Just raw files, a small Python script, and the command line.