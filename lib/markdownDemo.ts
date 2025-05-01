import { markdownToHtml } from "./markdown";

// Example usage of the markdownToHtml function
const markdownExample = `# Markdown to HTML Converter

This is a simple markdown to HTML converter that supports:

## Features

- **Bold text** and *italic text*
- Headings (h1-h3)
- [Links](https://example.com)
- Unordered lists
- Ordered lists
  1. Like this
  2. And this
- \`Inline code\`
- Code blocks:
\`\`\`
const convertMarkdown = (md) => { 
  // Convert markdown to HTML
  return html;
};
\`\`\`
- > Blockquotes

Pretty neat, right?`;

// Convert the markdown to HTML
const htmlOutput = markdownToHtml(markdownExample);

// In a real application, you could use this to display markdown content as HTML
console.log("Markdown input:");
console.log(markdownExample);
console.log("\nHTML output:");
console.log(htmlOutput);
