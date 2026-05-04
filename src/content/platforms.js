(function attachSocialLensPlatforms(global) {
  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function hashString(value) {
    let hash = 0;
    const input = String(value || "");

    for (let index = 0; index < input.length; index += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(index);
      hash |= 0;
    }

    return Math.abs(hash).toString(36);
  }

  function absoluteUrl(path) {
    try {
      return new URL(path, window.location.href).toString();
    } catch (_error) {
      return window.location.href;
    }
  }

  function findAuthor(element) {
    const link = element.querySelector(
      'a[href*="/user/"], a[href*="/u/"], a[href^="/@"], a[href*="/in/"], a[href*="/status/"], a[href*="/watch"], a.yt-simple-endpoint'
    );

    if (!link) {
      return "";
    }

    return cleanText(link.textContent || link.getAttribute("aria-label") || link.href);
  }

  function findCanonicalLink(element) {
    const link = element.querySelector(
      'a[href*="/status/"], a[href*="/comments/"], a[href*="/watch"], a[href*="item?id="], a[href]'
    );

    if (!link) {
      return window.location.href;
    }

    return absoluteUrl(link.getAttribute("href"));
  }

  function inferPlatform() {
    const host = window.location.hostname.replace(/^www\./, "");

    if (host === "x.com" || host === "twitter.com") return "x";
    if (host.endsWith("reddit.com")) return "reddit";
    if (host === "youtube.com") return "youtube";
    if (host === "news.ycombinator.com") return "hacker-news";
    if (host === "linkedin.com") return "linkedin";

    return host;
  }

  const selectorsByPlatform = {
    x: ['article[data-testid="tweet"]'],
    reddit: ['shreddit-post', '[data-testid="post-container"]', 'div[id^="t3_"]'],
    youtube: ["ytd-rich-item-renderer", "ytd-video-renderer", "ytd-comment-thread-renderer"],
    "hacker-news": ["tr.athing"],
    linkedin: [".feed-shared-update-v2", ".comments-comment-item"],
    generic: ["article", "main section", "li"]
  };

  function getCandidateSelectors(platform) {
    return selectorsByPlatform[platform] || selectorsByPlatform.generic;
  }

  function extractItem(element) {
    const platform = inferPlatform();
    const url = findCanonicalLink(element);
    const text = cleanText(element.innerText || element.textContent || "");
    const author = findAuthor(element);
    const contentId = `${platform}:${hashString(url + text.slice(0, 160))}`;
    const authorId = author ? `${platform}:author:${author.toLowerCase()}` : "";

    return {
      platform,
      url,
      domain: window.location.hostname.replace(/^www\./, ""),
      title: text.slice(0, 140),
      author,
      authorId,
      contentId
    };
  }

  function findItems() {
    const platform = inferPlatform();
    const selectors = getCandidateSelectors(platform);
    const seen = new Set();
    const items = [];

    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        if (seen.has(element) || element.closest(".slens-panel")) {
          continue;
        }

        const text = cleanText(element.innerText || element.textContent || "");

        if (text.length < 24) {
          continue;
        }

        seen.add(element);
        items.push({ element, context: extractItem(element) });
      }
    }

    if (items.length === 0 && document.body) {
      items.push({ element: document.body, context: extractItem(document.body) });
    }

    return items;
  }

  global.SocialLensPlatforms = {
    extractItem,
    findItems,
    inferPlatform
  };
})(globalThis);
