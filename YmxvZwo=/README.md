# CHA Terminal Blog

A retro terminal-style website for Chattanooga Hackers Anonymous (CHA).
You write blog entries in plain .txt files, convert them to .json, and view them in a browser-based terminal UI.



## How to Write a Blog Post
	1.	Create a file in YmxvZwo=/
### Name it like: 2025-06-04_MY_POST.txt
	2.	Structure:
      Line 1: Title
      Line 2: Author name (optional — you’ll be prompted if blank)
      Line 3+: Each line becomes one entry in the JSON content array

## Example:

WHAT HAPPENED TO US

I remember when hacking meant opening something not meant to be opened.
Now it's all branding and bug bounties.
We used to trace UARTs with paperclips.
Now it's USB badges and Discord servers.




###Convert to JSON

Run the script:

```python3 convert_blog_txt_prompt.py blogdata_raw/2025-06-04_MY_POST.txt```

It will prompt you for:
	•	Author (if not already in the file)
	•	Publication date (YYYY-MM-DD)

It creates a .json file in blogdata/.


## Update index.json

Make sure blogdata/index.json contains a list of your blog files:
```
[
  "2025-06-03_Blog.json",
  "2025-06-04_Blog.json"
]
```

## Done

You’re now blogging like it’s 1999.
No CMS. No WYSIWYG. Just raw files, a Python script, and the command line.

