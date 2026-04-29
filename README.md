# Web to Markdown (Raycast Extension)

Convert the main content of a webpage (blog articles, docs posts, etc.) into a Markdown file saved to your computer (defaults to `~/Downloads`) and copy the Markdown to your clipboard.

## Usage

1. Import this extension in Raycast (`Import Extension`) and select this folder.
2. In a terminal, from this folder:
   - `npm install`
   - `npm run dev`
3. Run **Convert Webpage to Markdown** in Raycast.

### Input URL

- If you pass a `url` argument, the command runs immediately.
- Otherwise it will prefill the URL field from your clipboard (if it looks like a URL).

### Output

- Writes a `.md` file to the configured output directory (default `~/Downloads`).
- Copies the generated Markdown to the clipboard.

## Notes

- By default, extraction is local (Readability + HTML→Markdown).
- Optional external fallback can be enabled in command preferences. When enabled, the URL may be sent to a third-party service (as configured).

