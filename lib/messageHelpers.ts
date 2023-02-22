export function markdownifyImageUrls(content: string): string {
  // Here, we isolate image urls (png/jpg/jpeg/gif/svg/webp)
  const imageRegex = /(?<!\!\[[\w\s\-_]+\]\()https?:\/\/.*\.(?:png|jpe?g|gif|svg|webp)(?:\?.*)?(?!\))/gi;
  const imageUrls = content.match(imageRegex);
  if (imageUrls) {
    imageUrls.forEach((url: string) => {
      content = content.replace(
        url,
        `![image](${url})`
      );
    });
  }

  return content;
}

export function stripMarkdownFootnotes(content: string): string {
  const footnoteRegex = /\[\^[\w\s\-_]+\]:?\s/gi;
  return content.replace(footnoteRegex, '');
}

export function sanitizeMessage(content: string): string {
  content = markdownifyImageUrls(content);
  content = stripMarkdownFootnotes(content);

  return content;
}
