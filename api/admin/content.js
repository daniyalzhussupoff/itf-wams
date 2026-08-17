const { requireAdmin, send } = require("./_auth");

const CONTENT_PATH = "data/site-content.json";

function githubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    repository: process.env.GITHUB_REPOSITORY || "daniyalzhussupoff/itf-wams",
    branch: process.env.GITHUB_BRANCH || "main"
  };
}

async function github(url, options, token) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "wams-site-admin",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `GitHub вернул ошибку ${response.status}.`);
  }
  return data;
}

function validContent(content) {
  if (!content || typeof content !== "object" || Array.isArray(content)) return false;
  return ["news", "members", "branches", "documents", "partners"].every((key) => {
    return content[key] === undefined || Array.isArray(content[key]);
  });
}

module.exports = async function content(req, res) {
  if (!requireAdmin(req, res)) return;
  if (req.method !== "GET" && req.method !== "PUT") {
    return send(res, 405, { error: "Поддерживаются GET и PUT-запросы." });
  }

  const { token, repository, branch } = githubConfig();
  if (!token) {
    return send(res, 503, { error: "Не задан GITHUB_TOKEN в настройках Vercel." });
  }

  const url = `https://api.github.com/repos/${repository}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(branch)}`;

  try {
    const current = await github(url, { method: "GET" }, token);

    if (req.method === "GET") {
      const raw = Buffer.from(current.content.replace(/\n/g, ""), "base64").toString("utf8");
      return send(res, 200, { content: JSON.parse(raw) });
    }

    const next = req.body && req.body.content;
    if (!validContent(next)) {
      return send(res, 400, { error: "Файл данных имеет неверную структуру." });
    }

    const serialized = `${JSON.stringify(next, null, 2)}\n`;
    const result = await github(
      `https://api.github.com/repos/${repository}/contents/${CONTENT_PATH}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "CMS: обновление содержимого сайта",
          content: Buffer.from(serialized).toString("base64"),
          branch,
          sha: current.sha
        })
      },
      token
    );

    return send(res, 200, {
      ok: true,
      commit: result.commit && result.commit.html_url,
      message: "Изменения сохранены. Vercel опубликует их автоматически."
    });
  } catch (error) {
    return send(res, 502, { error: error.message || "Не удалось сохранить данные в GitHub." });
  }
};

