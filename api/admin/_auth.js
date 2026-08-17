const crypto = require("crypto");

const SESSION_TTL = 12 * 60 * 60 * 1000;

function send(res, status, payload) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(status).send(JSON.stringify(payload));
}

function secureEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function createToken() {
  const expiresAt = String(Date.now() + SESSION_TTL);
  const signature = crypto
    .createHmac("sha256", sessionSecret())
    .update(expiresAt)
    .digest("base64url");
  return `${expiresAt}.${signature}`;
}

function isAuthorized(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const parts = token.split(".");
  if (parts.length !== 2 || !sessionSecret()) return false;

  const expiresAt = Number(parts[0]);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = crypto
    .createHmac("sha256", sessionSecret())
    .update(parts[0])
    .digest("base64url");
  return secureEqual(parts[1], expected);
}

function requireAdmin(req, res) {
  if (isAuthorized(req)) return true;
  send(res, 401, { error: "Сессия администратора не подтверждена." });
  return false;
}

module.exports = { createToken, requireAdmin, secureEqual, send };

