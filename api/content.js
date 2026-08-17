const CONTENT_PATH = "data/site-content.json";
const REMOVED_NEWS_TITLE = "Уважаемые коллеги! Поздравляю Вас с наступающим Новым 2022 годом!";
const MEDIA_ALIASES = {
  "assets/media/uploads/1786426995296-sagintayeva-saule.jpg": "assets/media/2024/04/sagintayeva-saule.jpg"
};
let cached = null;
let cachedAt = 0;

function normalizeMediaPaths(content) {
  if (!content || !Array.isArray(content.branches)) return content;
  content.branches.forEach((branch) => {
    if (!Array.isArray(branch.imgs)) return;
    branch.imgs = branch.imgs.map((src) => MEDIA_ALIASES[src] || src);
  });
  return content;
}

function sanitizeContent(content) {
  if (content && Array.isArray(content.news)) {
    content.news = content.news.filter((item) => item && item.title !== REMOVED_NEWS_TITLE);
  }
  return normalizeMediaPaths(content);
}

function config() {
  return {
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY || "daniyalzhussupoff/itf-wams",
    branch: process.env.GITHUB_BRANCH || "main"
  };
}

async function readContent() {
  const { token, repository, branch } = config();
  if (!token) throw new Error("Content store is not configured.");
  const response = await fetch(`https://api.github.com/repos/${repository}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(branch)}`, {
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "User-Agent": "wams-public-content" }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Content is unavailable.");
  return JSON.parse(Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"));
}

module.exports = async function content(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    if (!cached || Date.now() - cachedAt > 60 * 1000) {
      cached = sanitizeContent(await readContent());
      cachedAt = Date.now();
    }
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json(cached);
  } catch (error) {
    return res.status(503).json({ error: "Content temporarily unavailable" });
  }
};

