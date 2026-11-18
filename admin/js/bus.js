// One pending instruction for the next editor that opens: "open project X", "add an entry", "import a repo".
// The palette, the preview's click-to-edit and the Overview buttons all use it, so they behave the same way.
let pending = null;
export const queue = (tab, cmd, arg) => { pending = { tab, cmd, arg }; };
export function take(tab) {
  if (pending && pending.tab === tab) { const p = pending; pending = null; return p; }
  return null;
}

// switch tab from anywhere (optionally with an instruction for the editor that opens)
export function goTab(tab, cmd, arg) {
  if (cmd) { queue(tab, cmd, arg); }
  window.dispatchEvent(new CustomEvent('adm:go', { detail: { tab } }));
}
