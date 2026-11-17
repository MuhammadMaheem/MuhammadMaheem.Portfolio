// Client-side image preparation: resize, re-encode, and name files for the repo.
const MAX_BYTES = 2.4 * 1024 * 1024; // the API takes at most 3 MB; base64 must fit a 4.5 MB request

export async function prepareImage(file, { maxWidth = 1600 } = {}) {
  if (/image\/gif/.test(file.type) && file.size <= MAX_BYTES) { return { blob: file, ext: 'gif' }; }
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bmp.width);
  const w = Math.max(1, Math.round(bmp.width * scale));
  const hgt = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = hgt;
  canvas.getContext('2d').drawImage(bmp, 0, 0, w, hgt);
  bmp.close && bmp.close();
  for (const q of [0.86, 0.78, 0.68, 0.55]) {
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', q));
    if (blob && blob.type === 'image/webp' && blob.size <= MAX_BYTES) { return { blob, ext: 'webp' }; }
  }
  const jpg = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.7));
  if (jpg && jpg.size <= MAX_BYTES) { return { blob: jpg, ext: 'jpg' }; }
  throw new Error('Image is too large even after compressing');
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// next free "NN-name.ext" inside screenshots/<folder>/ given the paths already used
export function nextName(folder, baseName, ext, used) {
  const clean = String(baseName || 'shot').replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'shot';
  for (let n = 1; n < 200; n++) {
    const rel = 'screenshots/' + folder + '/' + String(n).padStart(2, '0') + '-' + clean + '.' + ext;
    if (!used.has(rel)) { return rel; }
  }
  throw new Error('Too many images in one folder');
}
