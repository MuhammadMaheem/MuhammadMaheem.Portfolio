/* Admin preview: when the admin panel opens the site with ?adm-preview=1, show its unpublished draft.
   Only affects the browser that holds the draft in localStorage; regular visitors never have one.
   Unless ?adm-motion=1 is also set, the page runs in reduced-motion mode so the preview stays calm and fast. */
(function () {
  try {
    if (!/[?&]adm-preview=1/.test(location.search)) { return; }
    var draft = localStorage.getItem('adm.preview');
    if (draft) { window.SITE = JSON.parse(draft); }
    document.title = '[Preview] ' + document.title;
    var st = document.createElement('style');
    st.textContent = '.adm-flash{outline:2px solid #00d4ff!important;outline-offset:6px;border-radius:6px}';
    (document.head || document.documentElement).appendChild(st);
    if (!/[?&]adm-motion=1/.test(location.search)) {
      var real = window.matchMedia.bind(window);
      window.matchMedia = function (q) {
        if (/prefers-reduced-motion:\s*reduce/.test(q)) {
          return { matches: true, media: q, onchange: null, addEventListener: function () {}, removeEventListener: function () {}, addListener: function () {}, removeListener: function () {}, dispatchEvent: function () { return false; } };
        }
        return real(q);
      };
    }
  } catch (e) { /* no draft available: show the published site */ }
})();
