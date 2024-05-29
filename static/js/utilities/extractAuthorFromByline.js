/* Removes common byline junk to just return the author */

export default function extractAuthorFromByline(byline) {
    if (!byline) {
        return "";
    }
    const authorSplitWords = [
      "social",
      "source",
      "links",
      "view",
      "author",
      "archive",
      "email",
      "rss",
      "feed",
      "contact",
      "by",
      "dateline"
    ];
    if (authorSplitWords.some(word => byline.toLowerCase().includes(word))) {
      let foundAuthor = false;
      byline.split(" ").forEach((word, idx) => {
        if (authorSplitWords.includes(word.toLowerCase())) {
          if (foundAuthor) {
            byline = byline.split(word)[0].trim();
            return byline;
          } else {
            byline = byline.split(word)[1].trim();
          }
        } else {
          foundAuthor = true;
        }
      });
    }
    return byline;
  }
