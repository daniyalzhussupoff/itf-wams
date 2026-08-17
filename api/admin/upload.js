const { requireAdmin, send } = require("./_auth");

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg",
  "application/pdf": "pdf", "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt", "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx"
};

function cleanName(name) {
  const base = String(name || "file").replace(/\.[^.]+$/, "");
  return base.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "file";
}

module.exports = async function upload(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "POST") return send(res, 405, { error: "Используйте POST-запрос." });
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY || "daniyalzhussupoff/itf-wams";
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token) return send(res, 503, { error: "Не задан GITHUB_TOKEN в настройках Vercel." });
  const input = req.body || {};
  const match = typeof input.dataUrl === "string" && input.dataUrl.match(/^data:([^;]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match || !ALLOWED[match[1]]) return send(res, 400, { error: "Тип файла не поддерживается." });
  const content = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!content.length || content.length > MAX_BYTES) return send(res, 413, { error: "Файл должен быть не больше 3 МБ." });
  const filename = `${Date.now()}-${cleanName(input.filename)}.${ALLOWED[match[1]]}`;
  const path = `assets/media/uploads/${filename}`;
  try {
    const response = await fetch(`https://api.github.com/repos/${repository}/contents/${path}`, {
      method: "PUT",
      headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "wams-site-admin" },
      body: JSON.stringify({ message: `CMS: загрузка ${filename}`, content: content.toString("base64"), branch })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "GitHub не принял файл.");
    return send(res, 200, {
      ok: true,
      path: `https://raw.githubusercontent.com/${repository}/${branch}/${path}`,
      message: "Файл загружен. Сохраните карточку и опубликуйте её."
    });
  } catch (error) {
    return send(res, 502, { error: error.message || "Не удалось загрузить файл." });
  }
};

