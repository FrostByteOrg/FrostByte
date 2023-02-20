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
