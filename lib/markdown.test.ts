import { markdownToHtml } from "./markdown";

describe("markdownToHtml", () => {
  test("should convert basic paragraph", () => {
    const markdown = "This is a paragraph.";
    const expected = "<p>This is a paragraph.</p>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert multiple paragraphs", () => {
    const markdown = "First paragraph.\n\nSecond paragraph.";
    const expected = "<p>First paragraph.</p><p>Second paragraph.</p>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert headings", () => {
    const markdown = "# Heading 1\n## Heading 2\n### Heading 3";
    const expected = "<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert bold and italic text", () => {
    const markdown = "This is **bold** and *italic* text.";
    const expected =
      "<p>This is <strong>bold</strong> and <em>italic</em> text.</p>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert links", () => {
    const markdown = "Visit [Google](https://www.google.com).";
    const expected =
      '<p>Visit <a href="https://www.google.com">Google</a>.</p>';
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert unordered lists", () => {
    const markdown = "- Item 1\n- Item 2\n- Item 3";
    const expected = "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert ordered lists", () => {
    const markdown = "1. First item\n2. Second item\n3. Third item";
    const expected =
      "<ol><li>First item</li><li>Second item</li><li>Third item</li></ol>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert code blocks", () => {
    const markdown = "```\nconst x = 1;\n```";
    const expected = "<pre><code>const x = 1;\n</code></pre>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert inline code", () => {
    const markdown = "Use the `console.log()` function.";
    const expected = "<p>Use the <code>console.log()</code> function.</p>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should convert blockquotes", () => {
    const markdown = "> This is a quote.";
    const expected = "<blockquote>This is a quote.</blockquote>";
    expect(markdownToHtml(markdown)).toBe(expected);
  });

  test("should handle nested markdown correctly", () => {
    const markdown =
      "# Main Title\n\n## Subtitle\n\nThis is a paragraph with **bold** and *italic* text.\n\n- List item with [link](https://example.com)\n- Another item\n\n> A quote with `code`";
    const expected =
      '<h1>Main Title</h1><h2>Subtitle</h2><p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p><ul><li>List item with <a href="https://example.com">link</a></li><li>Another item</li></ul><blockquote>A quote with <code>code</code></blockquote>';
    expect(markdownToHtml(markdown)).toBe(expected);
  });
});
