(function () {
  "use strict";
  function apply(data) {
    if (!data || typeof data !== "object") throw new Error("Invalid CMS data");
    if (data._i18n) {
      window.I18N = window.I18N || {};
      Object.keys(data._i18n).forEach(function (lang) {
        window.I18N[lang] = Object.assign({}, window.I18N[lang] || {}, data._i18n[lang] || {});
      });
    }
    if (Array.isArray(data._archive)) window.WAMS_ARCHIVE = data._archive.slice();
    window.CONTENT = data;
    return data;
  }
  function load(url) {
    return fetch(url, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("CMS unavailable");
      return response.json();
    }).then(apply);
  }
  window.CMS_READY = load("/api/content").catch(function () {
    return load("data/site-content.json");
  }).catch(function () {
    return window.CONTENT;
  });
})();
