(function () {
  "use strict";

  var root = document.getElementById("admin-root");
  var site = document.body.dataset.adminSite || "nagn";
  var brand = site === "wams" ? "ВАГН" : "НАГН";
  var tokenKey = site + "_admin_token";
  var draftKey = site + "_cms_draft";
  var titles = {
    president: "Президент", administration: "Администрация", presidium: "Президиум",
    members: "Члены академии", memberRanks: "Статусы членов", about: "История",
    articles: "Публикации", awards: "Награды", awardsNote: "Примечание к наградам",
    jubilees: "Юбиляры", branches: "Филиалы", news: "Новости", partners: "Партнёры",
    documents: "Документы", awardsImages: "Фото наград", gallery: "Фотогалерея",
    journal: "Вестник", projects: "Проекты", history: "История академии",
    founders_ru: "Учредители · RU", founders_en: "Учредители · EN",
    observers_ru: "Наблюдатели · RU", observers_en: "Наблюдатели · EN",
    leadership: "Руководство", academies: "Академии-участники", galleryGroups: "Группы галереи",
    extraDocuments: "Архив документов", settings: "Настройки сайта"
  };
  var state = {
    token: sessionStorage.getItem(tokenKey) || "", content: null, view: "dashboard",
    section: "", selected: 0, lang: "ru", notice: null, dirty: false, filter: "", uploaded: ""
  };

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>'"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]; }); }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function label(k) { return titles[k] || String(k).replace(/^_/, "").replace(/_/g, " ").replace(/([a-zа-я])([A-ZА-Я])/g, "$1 $2"); }
  function pathEncode(path) { return encodeURIComponent(JSON.stringify(path)); }
  function pathDecode(value) { try { return JSON.parse(decodeURIComponent(value)); } catch (_) { return []; } }
  function getAt(path) { return path.reduce(function (o, k) { return o == null ? undefined : o[k]; }, state.content); }
  function setAt(path, value) { var o = state.content; path.slice(0, -1).forEach(function (k) { o = o[k]; }); o[path[path.length - 1]] = value; markDirty(); }
  function markDirty() { state.dirty = true; try { localStorage.setItem(draftKey, JSON.stringify({ savedAt: Date.now(), content: state.content })); } catch (_) {} }
  function clearDraft() { localStorage.removeItem(draftKey); state.dirty = false; }
  function setNotice(text, kind) { state.notice = text ? { text: text, kind: kind || "" } : null; }
  function noticeHtml() { return state.notice ? '<div class="notice notice--' + esc(state.notice.kind || "info") + '">' + esc(state.notice.text) + "</div>" : ""; }
  function request(path, options) {
    options = options || {};
    options.headers = Object.assign({ "Content-Type": "application/json", Authorization: "Bearer " + state.token }, options.headers || {});
    return fetch(path, options).then(function (response) {
      return response.json().catch(function () { return {}; }).then(function (data) {
        if (!response.ok) throw new Error(data.error || "Не удалось выполнить запрос.");
        return data;
      });
    });
  }
  function sectionKeys() { return Object.keys(state.content || {}).filter(function (k) { return k.charAt(0) !== "_"; }); }
  function summary(value) {
    if (value == null) return "Пусто";
    if (Array.isArray(value)) return value.length + " записей";
    if (typeof value === "object") return Object.keys(value).length + " полей";
    return String(value).slice(0, 80);
  }
  function displayName(record, index) {
    if (record == null) return "Запись " + (index + 1);
    if (typeof record !== "object") return String(record).slice(0, 80) || "Запись " + (index + 1);
    var keys = ["title", "name", "name_ru", "region", "country_ru", "company", "product", "date", "role", "cat", "id"];
    for (var i = 0; i < keys.length; i++) if (record[keys[i]]) return String(record[keys[i]]);
    return "Запись " + (index + 1);
  }
  function blankLike(value) {
    if (Array.isArray(value)) return [];
    if (value && typeof value === "object") { var out = {}; Object.keys(value).forEach(function (k) { out[k] = blankLike(value[k]); }); return out; }
    if (typeof value === "boolean") return false;
    if (typeof value === "number") return 0;
    return "";
  }

  function loginHtml() {
    return '<div class="login-shell"><section class="login-card"><div class="brand-kicker">' + brand + ' · система управления контентом</div><h1>Вход в панель</h1><p>Новости, страницы, люди, документы, изображения и переводы редактируются без доступа к коду.</p><form id="login-form"><div class="field"><label for="admin-password">Пароль администратора</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required autofocus></div><button class="button button--primary" type="submit">Войти</button></form>' + noticeHtml() + '</section></div>';
  }
  function navHtml() {
    var sections = sectionKeys().map(function (k) {
      return '<button class="nav-button ' + (state.view === "section" && state.section === k ? "is-active" : "") + '" data-action="section" data-section="' + esc(k) + '"><span>' + esc(label(k)) + '</span><small>' + esc(summary(state.content[k])) + '</small></button>';
    }).join("");
    return '<button class="nav-button ' + (state.view === "dashboard" ? "is-active" : "") + '" data-action="view" data-view="dashboard">Обзор</button>' +
      '<div class="admin-nav__caption">Контент</div>' + sections +
      '<div class="admin-nav__caption">Система</div>' +
      '<button class="nav-button ' + (state.view === "translations" ? "is-active" : "") + '" data-action="view" data-view="translations">Тексты и переводы</button>' +
      '<button class="nav-button ' + (state.view === "media" ? "is-active" : "") + '" data-action="view" data-view="media">Медиа и файлы</button>' +
      '<button class="nav-button ' + (state.view === "advanced" ? "is-active" : "") + '" data-action="view" data-view="advanced">Полные данные JSON</button>';
  }
  function shellHtml(content) {
    return '<div class="admin-app"><header class="admin-top"><button class="nav-toggle" data-action="toggle-nav" aria-label="Меню">☰</button><a class="admin-top__brand" href="index.html" target="_blank">' + brand + '</a><div class="admin-top__title">Управление сайтом <span class="save-state">' + (state.dirty ? "Есть неопубликованные изменения" : "Все изменения опубликованы") + '</span></div><div class="admin-top__actions"><a class="button" href="index.html" target="_blank">Открыть сайт ↗</a><button class="button button--primary" data-action="publish">Опубликовать</button><button class="button" data-action="logout">Выйти</button></div></header><aside class="admin-nav" id="admin-nav"><div class="admin-nav__brand">Разделы сайта</div>' + navHtml() + '</aside><main class="admin-main">' + content + '</main></div>';
  }
  function dashboardHtml() {
    var cards = sectionKeys().map(function (k) { return '<button class="dash-card" data-action="section" data-section="' + esc(k) + '"><span>' + esc(label(k)) + '</span><b>' + esc(summary(state.content[k])) + '</b></button>'; }).join("");
    var draft = localStorage.getItem(draftKey);
    return '<div class="page-head"><div><div class="eyebrow">Панель управления</div><h1>' + brand + '</h1></div><p>Любое изменение сначала остаётся черновиком. Публичный сайт обновится только после нажатия «Опубликовать».</p></div>' + noticeHtml() + (draft && !state.dirty ? '<div class="draft-banner"><span>В браузере найден локальный черновик.</span><button class="button button--small" data-action="restore-draft">Восстановить</button><button class="button button--small" data-action="discard-draft">Удалить</button></div>' : '') + '<section class="dash-grid">' + cards + '</section><section class="panel backup-panel"><div><h2>Резервная копия</h2><p>Скачайте данные перед крупным обновлением или восстановите ранее сохранённый JSON.</p></div><div class="button-row"><button class="button" data-action="backup">Скачать JSON</button><label class="button file-button">Восстановить JSON<input id="restore-file" type="file" accept="application/json"></label></div></section>';
  }
  function fieldHtml(path, value, key, depth) {
    depth = depth || 0;
    var p = pathEncode(path), name = label(key);
    if (Array.isArray(value)) {
      if (!value.length || value.every(function (x) { return x == null || ["string", "number", "boolean"].indexOf(typeof x) >= 0; })) {
        return '<div class="field"><label>' + esc(name) + '</label><textarea data-path="' + p + '" data-kind="lines" rows="' + Math.min(12, Math.max(3, value.length + 1)) + '">' + esc(value.join("\n")) + '</textarea><div class="help">Один пункт на строку.</div></div>';
      }
      return '<div class="field"><label>' + esc(name) + '</label><textarea class="code-field" data-path="' + p + '" data-kind="json" rows="10">' + esc(JSON.stringify(value, null, 2)) + '</textarea><div class="help">Вложенный список. Сохраняйте квадратные скобки и запятые.</div></div>';
    }
    if (value && typeof value === "object") {
      return '<fieldset class="nested"><legend>' + esc(name) + '</legend>' + Object.keys(value).map(function (k) { return fieldHtml(path.concat(k), value[k], k, depth + 1); }).join("") + '<button class="text-button" data-action="add-field" data-path="' + p + '" type="button">+ Добавить поле</button></fieldset>';
    }
    if (typeof value === "boolean") return '<label class="check-field"><input type="checkbox" data-path="' + p + '" data-kind="boolean" ' + (value ? "checked" : "") + '><span>' + esc(name) + '</span></label>';
    var isLong = String(value == null ? "" : value).length > 100 || /paragraph|description|bio|note|text|mission|offer|sub/i.test(key);
    var control = isLong ? '<textarea data-path="' + p + '" data-kind="string" rows="5">' + esc(value) + '</textarea>' : '<input data-path="' + p + '" data-kind="' + (typeof value === "number" ? "number" : "string") + '" type="' + (typeof value === "number" ? "number" : "text") + '" value="' + esc(value) + '">';
    return '<div class="field"><label>' + esc(name) + '</label>' + control + '</div>';
  }
  function listHtml(records) {
    var phrase = state.filter.toLocaleLowerCase("ru");
    return records.map(function (record, index) {
      var name = displayName(record, index), visible = !phrase || JSON.stringify(record).toLocaleLowerCase("ru").indexOf(phrase) >= 0;
      return '<button ' + (visible ? "" : 'hidden ') + 'class="record-button ' + (index === state.selected ? "is-selected" : "") + '" data-action="select" data-index="' + index + '"><strong>' + esc(name) + '</strong><span>#' + (index + 1) + '</span></button>';
    }).join("") || '<div class="empty">Записей пока нет.</div>';
  }
  function sectionHtml() {
    var value = state.content[state.section];
    var heading = '<div class="page-head"><div><div class="eyebrow">Редактирование раздела</div><h1>' + esc(label(state.section)) + '</h1></div><p>Поля формируются из структуры данных. Изображения и документы можно сначала загрузить в разделе «Медиа и файлы».</p></div>';
    if (!Array.isArray(value)) return heading + '<section class="panel object-panel"><div class="editor-title"><h2>' + esc(label(state.section)) + '</h2><button class="button button--danger" data-action="reset-section">Очистить раздел</button></div>' + fieldHtml([state.section], value, state.section, 0) + noticeHtml() + '</section>';
    var record = value[state.selected];
    return heading + '<div class="editor-layout"><section class="panel list-panel"><div class="list-toolbar"><input id="record-filter" value="' + esc(state.filter) + '" placeholder="Поиск"><button class="button button--small" data-action="add">Добавить</button></div><div class="record-list">' + listHtml(value) + '</div></section><section class="panel editor-panel">' + (record !== undefined ? '<div class="editor-title"><div><span class="eyebrow">Запись ' + (state.selected + 1) + ' из ' + value.length + '</span><h2>' + esc(displayName(record, state.selected)) + '</h2></div><div class="icon-actions"><button class="icon-button" data-action="move-up" title="Выше">↑</button><button class="icon-button" data-action="move-down" title="Ниже">↓</button><button class="icon-button" data-action="duplicate" title="Дублировать">⧉</button><button class="button button--small button--danger" data-action="remove">Удалить</button></div></div>' + fieldHtml([state.section, state.selected], record, "Данные записи", 0) : '<div class="empty">Добавьте первую запись.</div>') + noticeHtml() + '</section></div>';
  }
  function translationsHtml() {
    var data = state.content._i18n || {};
    var dict = data[state.lang] || {};
    var keys = Object.keys(dict).sort();
    var phrase = state.filter.toLocaleLowerCase("ru");
    var rows = keys.filter(function (k) { return !phrase || (k + " " + dict[k]).toLocaleLowerCase("ru").indexOf(phrase) >= 0; }).map(function (k) {
      return '<div class="translation-row"><code>' + esc(k) + '</code><textarea data-path="' + pathEncode(["_i18n", state.lang, k]) + '" data-kind="string" rows="2">' + esc(dict[k]) + '</textarea><button class="icon-button" data-action="remove-translation" data-key="' + esc(k) + '" title="Удалить">×</button></div>';
    }).join("");
    return '<div class="page-head"><div><div class="eyebrow">Все подписи страниц</div><h1>Тексты и переводы</h1></div><p>Здесь находятся заголовки, описания, кнопки, меню и контакты, помеченные на сайте как переводимые.</p></div><section class="panel translations-panel"><div class="translations-tools"><div class="tabs">' + ["ru", "en", "kz"].map(function (l) { return '<button class="tab ' + (state.lang === l ? "is-active" : "") + '" data-action="lang" data-lang="' + l + '">' + l.toUpperCase() + '</button>'; }).join("") + '</div><input id="translation-filter" value="' + esc(state.filter) + '" placeholder="Поиск по ключу или тексту"><button class="button" data-action="add-translation">Добавить текст</button></div><div class="translation-list">' + rows + '</div>' + noticeHtml() + '</section>';
  }
  function mediaHtml() {
    return '<div class="page-head"><div><div class="eyebrow">Медиатека</div><h1>Изображения и документы</h1></div><p>Загрузите файл, скопируйте полученный адрес и вставьте его в нужное поле записи.</p></div><section class="panel media-panel"><div class="drop-zone"><input id="media-upload" type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"><strong>Выберите изображение или документ</strong><span>JPG, PNG, WebP, SVG, PDF и офисные документы · до 3 МБ</span></div><button class="button button--primary" data-action="upload">Загрузить файл</button><div id="upload-status" class="upload-result">' + (state.uploaded ? '<label>Адрес файла</label><div><input readonly value="' + esc(state.uploaded) + '"><button class="button" data-action="copy-upload">Копировать</button></div>' : "") + '</div>' + noticeHtml() + '</section>';
  }
  function advancedHtml() { return '<div class="page-head"><div><div class="eyebrow">Экспертный режим</div><h1>Полные данные</h1></div><p>Используйте только для массового переноса или восстановления. Ошибка структуры может скрыть контент.</p></div><section class="panel advanced-panel"><textarea id="advanced-json">' + esc(JSON.stringify(state.content, null, 2)) + '</textarea><div class="editor-actions"><button class="button button--primary" data-action="apply-json">Проверить и применить JSON</button></div>' + noticeHtml() + '</section>'; }
  function render() {
    if (!state.content) { root.innerHTML = loginHtml(); return; }
    var content = state.view === "dashboard" ? dashboardHtml() : state.view === "section" ? sectionHtml() : state.view === "translations" ? translationsHtml() : state.view === "media" ? mediaHtml() : advancedHtml();
    root.innerHTML = shellHtml(content);
  }

  function loadContent() {
    return request("/api/admin/content").then(function (data) {
      state.content = data.content; state.view = "dashboard"; state.selected = 0; state.dirty = false; setNotice(null); render();
    }).catch(function (error) { sessionStorage.removeItem(tokenKey); state.token = ""; setNotice(error.message, "error"); render(); });
  }
  function login(form) {
    var button = form.querySelector("button"); button.disabled = true;
    request("/api/admin/session", { method: "POST", headers: { Authorization: "" }, body: JSON.stringify({ password: form.password.value }) }).then(function (data) {
      state.token = data.token; sessionStorage.setItem(tokenKey, data.token); return loadContent();
    }).catch(function (error) { setNotice(error.message, "error"); render(); });
  }
  function publish() {
    var button = document.querySelector('[data-action="publish"]'); if (button) { button.disabled = true; button.textContent = "Публикация…"; }
    request("/api/admin/content", { method: "PUT", body: JSON.stringify({ content: state.content }) }).then(function (data) {
      clearDraft(); setNotice(data.message || "Изменения опубликованы.", "success"); state.view = "dashboard"; render();
    }).catch(function (error) { setNotice(error.message, "error"); render(); });
  }
  function upload() {
    var input = document.getElementById("media-upload"), file = input && input.files[0], status = document.getElementById("upload-status");
    if (!file) { setNotice("Сначала выберите файл.", "error"); return render(); }
    if (file.size > 3 * 1024 * 1024) { setNotice("Файл больше 3 МБ.", "error"); return render(); }
    if (status) status.textContent = "Загрузка…";
    var reader = new FileReader(); reader.onload = function () { request("/api/admin/upload", { method: "POST", body: JSON.stringify({ filename: file.name, dataUrl: reader.result }) }).then(function (data) { state.uploaded = data.path; setNotice("Файл загружен.", "success"); render(); }).catch(function (error) { setNotice(error.message, "error"); render(); }); }; reader.readAsDataURL(file);
  }
  function backup() { var file = new Blob([JSON.stringify(state.content, null, 2)], { type: "application/json" }), link = document.createElement("a"); link.href = URL.createObjectURL(file); link.download = site + "-content-" + new Date().toISOString().slice(0, 10) + ".json"; link.click(); URL.revokeObjectURL(link.href); }

  root.addEventListener("submit", function (event) { event.preventDefault(); if (event.target.id === "login-form") login(event.target); });
  root.addEventListener("input", function (event) {
    if (event.target.id === "record-filter" || event.target.id === "translation-filter") {
      state.filter = event.target.value;
      var phrase = state.filter.toLocaleLowerCase("ru");
      root.querySelectorAll(event.target.id === "record-filter" ? ".record-button" : ".translation-row").forEach(function (item) {
        item.hidden = !!phrase && item.textContent.toLocaleLowerCase("ru").indexOf(phrase) < 0;
      });
      return;
    }
    if (!event.target.dataset.path) return;
    var kind = event.target.dataset.kind, value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    if (kind === "number") value = Number(value);
    if (kind === "lines") value = value.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean);
    if (kind === "json") { try { value = JSON.parse(value || "[]"); event.target.classList.remove("is-invalid"); } catch (_) { event.target.classList.add("is-invalid"); return; } }
    setAt(pathDecode(event.target.dataset.path), value);
    var save = document.querySelector(".save-state"); if (save) save.textContent = "Есть неопубликованные изменения";
  });
  root.addEventListener("change", function (event) {
    if (event.target.id !== "restore-file") return;
    var reader = new FileReader(); reader.onload = function () { try { var data = JSON.parse(reader.result); if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error(); state.content = data; markDirty(); setNotice("Резервная копия загружена в черновик.", "success"); render(); } catch (_) { setNotice("Не удалось прочитать JSON-файл.", "error"); render(); } }; if (event.target.files[0]) reader.readAsText(event.target.files[0]);
  });
  root.addEventListener("click", function (event) {
    var target = event.target.closest("[data-action]"); if (!target) return;
    var action = target.dataset.action;
    if (action === "view") { state.view = target.dataset.view; state.filter = ""; setNotice(null); render(); }
    if (action === "section") { state.view = "section"; state.section = target.dataset.section; state.selected = 0; state.filter = ""; setNotice(null); render(); }
    if (action === "select") { state.selected = Number(target.dataset.index); setNotice(null); render(); }
    if (action === "lang") { state.lang = target.dataset.lang; state.filter = ""; render(); }
    if (action === "add") { var list = state.content[state.section]; var template = list.length ? blankLike(list[0]) : {}; list.push(template); state.selected = list.length - 1; markDirty(); render(); }
    if (action === "remove" && confirm("Удалить выбранную запись?")) { state.content[state.section].splice(state.selected, 1); state.selected = Math.max(0, state.selected - 1); markDirty(); render(); }
    if (action === "duplicate") { var a = state.content[state.section]; a.splice(state.selected + 1, 0, clone(a[state.selected])); state.selected++; markDirty(); render(); }
    if (action === "move-up" && state.selected > 0) { var up = state.content[state.section]; up.splice(state.selected - 1, 0, up.splice(state.selected, 1)[0]); state.selected--; markDirty(); render(); }
    if (action === "move-down" && state.selected < state.content[state.section].length - 1) { var down = state.content[state.section]; down.splice(state.selected + 1, 0, down.splice(state.selected, 1)[0]); state.selected++; markDirty(); render(); }
    if (action === "add-field") { var obj = getAt(pathDecode(target.dataset.path)); var key = prompt("Системное имя нового поля (латиницей):"); if (key && obj && typeof obj === "object" && !Array.isArray(obj)) { obj[key] = ""; markDirty(); render(); } }
    if (action === "add-translation") { var tkey = prompt("Ключ текста, например home.subtitle:"); if (tkey) { state.content._i18n = state.content._i18n || {}; state.content._i18n[state.lang] = state.content._i18n[state.lang] || {}; state.content._i18n[state.lang][tkey] = ""; markDirty(); render(); } }
    if (action === "remove-translation" && confirm("Удалить этот текст?")) { delete state.content._i18n[state.lang][target.dataset.key]; markDirty(); render(); }
    if (action === "reset-section" && confirm("Очистить весь раздел?")) { state.content[state.section] = Array.isArray(state.content[state.section]) ? [] : {}; markDirty(); render(); }
    if (action === "apply-json") { try { var parsed = JSON.parse(document.getElementById("advanced-json").value); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); state.content = parsed; markDirty(); setNotice("JSON принят в черновик.", "success"); render(); } catch (_) { setNotice("В JSON есть ошибка. Проверьте скобки, кавычки и запятые.", "error"); render(); } }
    if (action === "publish") publish();
    if (action === "upload") upload();
    if (action === "copy-upload") { navigator.clipboard.writeText(state.uploaded); setNotice("Адрес скопирован.", "success"); render(); }
    if (action === "backup") backup();
    if (action === "restore-draft") { try { state.content = JSON.parse(localStorage.getItem(draftKey)).content; state.dirty = true; setNotice("Черновик восстановлен.", "success"); render(); } catch (_) {} }
    if (action === "discard-draft") { clearDraft(); render(); }
    if (action === "toggle-nav") document.getElementById("admin-nav").classList.toggle("is-open");
    if (action === "logout") { sessionStorage.removeItem(tokenKey); state.token = ""; state.content = null; render(); }
  });
  window.addEventListener("beforeunload", function (event) { if (state.dirty) { event.preventDefault(); event.returnValue = ""; } });
  if (state.token) loadContent(); else render();
})();
