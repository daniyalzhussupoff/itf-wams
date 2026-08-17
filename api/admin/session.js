const { createToken, secureEqual, send } = require("./_auth");

module.exports = function session(req, res) {
  if (req.method !== "POST") {
    return send(res, 405, { error: "Используйте POST-запрос." });
  }

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return send(res, 503, { error: "Админ-панель ещё не настроена на сервере." });
  }

  const password = req.body && req.body.password;
  if (!secureEqual(password, process.env.ADMIN_PASSWORD)) {
    return send(res, 401, { error: "Неверный пароль." });
  }

  return send(res, 200, { token: createToken(), expiresIn: 12 * 60 * 60 });
};

