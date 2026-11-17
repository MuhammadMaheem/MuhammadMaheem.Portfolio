/* Admin preview: when the admin panel opens the site with ?adm-preview=1, show its unpublished draft.
   Only affects the browser that holds the draft in localStorage; regular visitors never have one. */
(function () {
  try {
    if (!/[?&]adm-preview=1/.test(location.search)) { return; }
    var draft = localStorage.getItem('adm.preview');
    if (draft) { window.SITE = JSON.parse(draft); }
    document.title = '[Preview] ' + document.title;
  } catch (e) { /* no draft available: show the published site */ }
})();
