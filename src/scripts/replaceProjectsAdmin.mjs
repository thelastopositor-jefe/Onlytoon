import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const here = dirname(fileURLToPath(import.meta.url));
const projectsPath = resolve(here, '../data/projects.json');
const projectsData = JSON.parse(readFileSync(projectsPath, 'utf8'));
const apply = process.argv.includes('--apply');
const replaceAll = process.argv.includes('--replace-all');
const confirmDeleteAll = process.argv.includes('--confirm-delete-all');
const projectId = 'onlytoon-82f3f';

if (!Array.isArray(projectsData)) throw new Error('projects.json debe contener una lista.');
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error('Falta GOOGLE_APPLICATION_CREDENTIALS. Configura una cuenta de servicio autorizada. No subas esa clave a GitHub ni a Vercel.');
}
if (apply && (!replaceAll || !confirmDeleteAll)) {
  throw new Error('Para reemplazar la colección completa debes incluir --apply --replace-all --confirm-delete-all. Sin esos tres argumentos no se escribirá nada.');
}

initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

function cleanString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
function parseYouTubeId(value) {
  const input = String(value ?? '').trim();
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const candidate = url.pathname.split('/').filter(Boolean)[0] || '';
      return /^[\w-]{11}$/.test(candidate) ? candidate : '';
    }
    if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      const queryId = url.searchParams.get('v') || '';
      if (/^[\w-]{11}$/.test(queryId)) return queryId;
      const parts = url.pathname.split('/').filter(Boolean);
      const marker = parts.findIndex((part) => ['embed', 'shorts', 'live', 'v'].includes(part));
      const candidate = marker >= 0 ? (parts[marker + 1] || '') : '';
      return /^[\w-]{11}$/.test(candidate) ? candidate : '';
    }
  } catch { /* No es una URL válida. */ }
  return '';
}
function getProjectVideoId(project) {
  for (const candidate of [project.youtubeId, project.videoId, project.url, project.youtubeUrl]) {
    const id = parseYouTubeId(candidate);
    if (id) return id;
  }
  for (const season of Array.isArray(project.seasons) ? project.seasons : []) {
    for (const episode of Array.isArray(season?.episodes) ? season.episodes : []) {
      // Cada campo se valida por separado: IDs internos como "ref-146" no impiden leer la URL del episodio.
      for (const candidate of [episode?.youtubeId, episode?.videoId, episode?.url, episode?.youtubeUrl, episode?.id]) {
        const id = parseYouTubeId(candidate);
        if (id) return id;
      }
    }
  }
  return '';
}
function normalizeType(project) {
  const raw = cleanString(project.type || project.projectType, '2D').toLowerCase();
  if (raw.includes('stop')) return 'Stop Motion';
  if (raw.includes('3d')) return '3D';
  if (raw === 'ia' || raw.includes('inteligencia artificial') || raw === 'ai' || raw.startsWith('ai ')) return 'IA';
  return '2D';
}
function normalizeFormat(project) {
  const allowed = ['Cortometraje', 'Largometraje', 'Serie', 'Tráiler', 'Musical', 'Crowdfunding', 'Tutoriales', 'Making of'];
  const normalize = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
  const aliases = new Map([
    ['cortometraje', 'Cortometraje'], ['corto', 'Cortometraje'], ['cortos', 'Cortometraje'], ['short film', 'Cortometraje'], ['short films', 'Cortometraje'], ['short', 'Cortometraje'],
    ['largometraje', 'Largometraje'], ['largometrajes', 'Largometraje'], ['pelicula', 'Largometraje'], ['pelicula completa', 'Largometraje'], ['feature film', 'Largometraje'], ['feature', 'Largometraje'], ['full movie', 'Largometraje'],
    ['serie', 'Serie'], ['series', 'Serie'], ['webserie', 'Serie'], ['web series', 'Serie'], ['episodio', 'Serie'], ['episode', 'Serie'],
    ['trailer', 'Tráiler'], ['teaser', 'Tráiler'], ['musical', 'Musical'], ['crowdfunding', 'Crowdfunding'], ['financiacion colectiva', 'Crowdfunding'],
    ['tutorial', 'Tutoriales'], ['tutoriales', 'Tutoriales'], ['how to', 'Tutoriales'], ['making of', 'Making of'], ['making off', 'Making of'], ['behind the scenes', 'Making of'], ['behind the scene', 'Making of'], ['bts', 'Making of'],
  ]);
  for (const value of [project.format, project.projectFormat, project.category, project.projectType, project.type, ...(Array.isArray(project.genres) ? project.genres : [project.genre].filter(Boolean))]) {
    const key = normalize(value);
    if (aliases.has(key)) return aliases.get(key);
    const match = allowed.find((item) => normalize(item) === key);
    if (match) return match;
  }
  const title = normalize(project.title);
  if (/\b(tutorial|tutoriales|how to|como hacer)\b/.test(title)) return 'Tutoriales';
  if (/\b(making of|making off|behind the scenes|behind the scene|bts)\b/.test(title)) return 'Making of';
  if (/\b(crowdfunding|kickstarter|indiegogo)\b/.test(title)) return 'Crowdfunding';
  if (/\b(trailer|teaser)\b/.test(title)) return 'Tráiler';
  if (/\b(serie|series|webserie|web series|episodio|episode)\b/.test(title)) return 'Serie';
  if (/\b(largometraje|feature film|pelicula completa|full movie)\b/.test(title)) return 'Largometraje';
  if (/\bmusical\b/.test(title)) return 'Musical';
  return 'Cortometraje';
}
function normalizeGenres(project) {
  const raw = Array.isArray(project.genres) ? project.genres : (project.genre ? [project.genre] : []);
  const excluded = new Set(['tutorial', 'tutoriales', 'making of', 'making off', 'behind the scenes', 'behind the scene', 'bts']);
  return [...new Set(raw.map((g) => String(g).trim()).filter(Boolean).filter((g) => !excluded.has(g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim())))];
}
function stableDocumentId(project, index) {
  const base = cleanString(project.id, '') || cleanString(project.title, `proyecto-${index + 1}`);
  const slug = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  return `seed_${slug || index + 1}`;
}

// Validar y preparar TODA la lista antes de tocar Firestore.
const target = [];
const ids = new Set();
const errors = [];
for (let i = 0; i < projectsData.length; i += 1) {
  const project = projectsData[i] || {};
  const title = cleanString(project.title, '');
  const youtubeId = getProjectVideoId(project);
  if (!title || !youtubeId) {
    errors.push(`Registro ${i + 1}: ${title || '(sin título)'} — falta título o enlace válido de YouTube.`);
    continue;
  }
  const documentId = stableDocumentId(project, i);
  if (ids.has(documentId)) errors.push(`ID de documento duplicado: ${documentId}`);
  ids.add(documentId);
  const genres = normalizeGenres(project);
  const creator = cleanString(project.creator || project.creatorName || project.channelTitle, 'Creador invitado');
  const url = parseYouTubeId(project.url) ? cleanString(project.url) : `https://www.youtube.com/watch?v=${youtubeId}`;
  target.push({
    documentId,
    title,
    payload: {
      title,
      creator,
      creatorName: creator,
      youtubeId,
      url,
      creatorChannel: cleanString(project.creatorChannel || project.channelUrl, ''),
      patreonUrl: cleanString(project.patreonUrl, ''),
      thumbnail: cleanString(project.thumbnail || project.thumbnailUrl, '') || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      type: normalizeType(project),
      genre: genres[0] || 'General',
      genres,
      format: normalizeFormat(project),
      year: project.year ? String(project.year) : '',
      duration: cleanString(project.duration, '05:00'),
      description: cleanString(project.description, ''),
      seasons: Array.isArray(project.seasons) ? project.seasons : [],
      source: 'seed',
      status: 'approved',
      isFeatured: Boolean(project.isFeatured),
      likesCount: Number.isFinite(Number(project.likesCount)) ? Number(project.likesCount) : 0,
      viewsCount: Number.isFinite(Number(project.viewsCount)) ? Number(project.viewsCount) : 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      rejectionReason: '',
      moderatorMessage: '',
    },
  });
}

console.log(`Proyecto Firebase destino: ${projectId}`);
console.log(`JSON: ${projectsData.length} registros; válidos: ${target.length}; con errores: ${errors.length}`);
if (errors.length) {
  console.error('\nNo se realizará ninguna escritura porque hay registros incompletos o IDs duplicados:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nTítulos que se cargarán:');
  for (const item of target) console.log(`- ${item.title} (${item.documentId})`);
  if (!apply) {
    console.log('\nSIMULACIÓN: no se ha modificado Firestore. Revisa que el proyecto y los títulos sean correctos.');
  } else {
    const snapshot = await db.collection('projects').get();
    const targetIds = new Set(target.map((item) => item.documentId));
    const docsToDelete = snapshot.docs.filter((doc) => !targetIds.has(doc.id));
    const operationCount = docsToDelete.length + target.length;
    if (operationCount > 500) {
      throw new Error(`Se necesitarían ${operationCount} operaciones en un lote (máximo 500). No se ha modificado Firestore; hace falta un procedimiento por lotes.`);
    }
    console.log(`\nREEMPLAZO TOTAL: se eliminarán ${docsToDelete.length} documentos antiguos y se escribirán ${target.length} documentos del JSON.`);
    const batch = db.batch();
    for (const doc of docsToDelete) batch.delete(doc.ref);
    for (const item of target) batch.set(db.collection('projects').doc(item.documentId), item.payload);
    await batch.commit();
    console.log(`COMPLETADO: colección projects reemplazada con ${target.length} proyectos. No se borraron otras colecciones.`);
  }
}
