// Shared storage for the wall: Google Apps Script backend when a script URL is set.
export async function load(url) {
  const r = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now());
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return (j.posts || []).map(p => ({ ...p, date: Number(p.date) || 0 }));
}

function toBase64(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result).split(',')[1]);
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(file);
  });
}

export async function submit(url, { name, relationship, text, embed, igEmbed, photoDataUrl, videoFile, kind }) {
  const files = [];
  if (photoDataUrl) files.push({ kind: kind === 'screenshot' ? 'screenshot' : 'photo', name: 'photo.jpg', type: 'image/jpeg', data: photoDataUrl.split(',')[1] });
  if (videoFile) files.push({ kind: 'video', name: videoFile.name || 'video.mp4', type: videoFile.type || 'video/mp4', data: await toBase64(videoFile) });
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name, relationship, text, embed, igEmbed, files, kind: kind || '' }) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return { ...j.post, kind: j.post.kind || kind || '', date: Number(j.post.date) || Date.now() };
}

export const VIDEO_LIMIT = 40 * 1024 * 1024; // Apps Script request ceiling, with headroom
