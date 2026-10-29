import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const __dirname = resolve(fileURLToPath(new URL('.', import.meta.url)));
const projectsPath = resolve(__dirname, '../data/projects.json');
const projectsData = JSON.parse(readFileSync(projectsPath, 'utf8'));
const applyChanges = process.argv.includes('--apply');
const expectedProjectId = 'onlytoon-82f3f';

if (!Array.isArray(projectsData)) {
  throw new Error('src/data/projects.json debe contener una lista (array).');
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error(
    'Falta GOOGLE_APPLICATION_CREDENTIALS. Configura la ruta local al JSON de la cuenta de servicio de Firebase. No compartas ni subas ese archivo.'
  );
}

const app = initializeApp({
  credential: applicationDefault(),
  projectId: expectedProjectId,
});
const db = getFirestore(app);

function cleanString(value, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function getYouTubeId(value = '') {
  const input = String(value || '').trim();
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return /^[\w-]{11}$/.test(id || '') ? id : '';
    }
    if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;
      const parts = url.pathname.split('/').filter(Boolean);
      const markerIndex = parts.findIndex((part) => ['embed', 'shorts', 'live', 'v'].includes(part));
      const candidate = markerIndex >= 0 ? parts[markerIndex + 1] : '';
      return /^[\w-]{11}$/.test(candidate || '') ? candidate : '';
    }
  } catch {
    // Enlace o ID no válido.
  }
  return '';
}

function getProjectVideoId(project) {
  const direct = getYouTubeId(project.youtubeId || project.url || project.youtubeUrl);
  if (direct) return direct;
  // Algunas series del JSON solo tienen enlaces dentro de seasons[].episodes[].
  for (const season of Array.isArray(project.seasons) ? project.seasons : []) {
    for (const episode of Array.isArray(season?.episodes) ? season.episodes : []) {
      const id = getYouTubeId(episode?.youtubeId || episode?.url || episode?.youtubeUrl || episode?.id);
      if (id) return id;
    }
  }
  return '';
}

function normalizeType(project) {
  const raw = cleanString(project.type || project.projectType, '2D').toLowerCase();
  if (raw.includes('stop')) return 'Stop Motion';
  if (raw.includes('3d')) return '3D';
  if (raw === 'ia' || raw.includes('inteligencia artificial') || raw === 'ai' || raw.startsWith('ai ')) return 'IA';
  if (raw.includes('2d')) return '2D';
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
  const original = cleanString(project.id, '');
  const base = original || cleanString(project.title, `proyecto-${index + 1}`);
  const slug = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  return `seed_${slug || index + 1}`;
}

async function main() {
  let ready = 0;
  let skipped = 0;
  let protectedDocs = 0;
  let existingSeeds = 0;
  const plan = [];

  console.log(`Proyecto Firebase de destino: ${expectedProjectId}`);
  console.log(`Modo: ${applyChanges ? 'APLICAR CAMBIOS' : 'SIMULACIÓN — no se escribirá nada'}`);
  console.log(`Registros en projects.json: ${projectsData.length}`);

  for (let i = 0; i < projectsData.length; i += 1) {
    const project = projectsData[i] || {};
    const title = cleanString(project.title, '');
    const youtubeId = getProjectVideoId(project);
    if (!title || !youtubeId) {
      console.warn(`OMITIDO: ${title || `registro ${i + 1}`} — falta título o enlace/ID válido de YouTube.`);
      skipped += 1;
      continue;
    }

    const documentId = stableDocumentId(project, i);
    const ref = db.collection('projects').doc(documentId);
    const snapshot = await ref.get();
    const existing = snapshot.exists ? snapshot.data() : null;

    if (existing && existing.source !== 'seed') {
      console.warn(`PROTEGIDO: ${title} (${documentId}) — existe un documento que no está marcado source="seed"; no se modifica.`);
      protectedDocs += 1;
      continue;
    }

    const genres = normalizeGenres(project);
    const creator = cleanString(project.creator || project.creatorName || project.channelTitle, 'Creador invitado');
    const payload = {
      title,
      creator,
      creatorName: creator,
      youtubeId,
      url: cleanString(project.url, `https://www.youtube.com/watch?v=${youtubeId}`),
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
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (existing) {
      // Conserva estado, destacado, contadores y datos de moderación de documentos seed ya existentes.
      for (const key of ['status', 'isFeatured', 'likesCount', 'viewsCount', 'createdAt', 'rejectionReason', 'moderatorMessage']) {
        if (Object.prototype.hasOwnProperty.call(existing, key)) payload[key] = existing[key];
      }
      existingSeeds += 1;
    } else {
      payload.status = 'approved';
      payload.isFeatured = Boolean(project.isFeatured);
      payload.likesCount = Number.isFinite(Number(project.likesCount)) ? Number(project.likesCount) : 0;
      payload.createdAt = FieldValue.serverTimestamp();
      payload.rejectionReason = '';
      payload.moderatorMessage = '';
    }

    plan.push({ ref, payload, title, documentId, isExisting: Boolean(existing) });
    ready += 1;
    console.log(`${existing ? 'ACTUALIZARÍA' : 'CREARÍA'}: ${title} (${documentId})`);
  }

  console.log('\nResumen:');
  console.log(`Listos para importar/actualizar: ${ready}`);
  console.log(`Documentos seed existentes que se actualizarían: ${existingSeeds}`);
  console.log(`Omitidos por datos incompletos: ${skipped}`);
  console.log(`Documentos protegidos (no seed): ${protectedDocs}`);

  if (!applyChanges) {
    console.log('\nNo se ha escrito nada. Revisa el resumen y ejecuta con --apply solo si el proyecto y la lista son correctos.');
    return;
  }

  // Escrituras por lotes; 88 registros quedan muy por debajo del límite de Firestore.
  for (let start = 0; start < plan.length; start += 400) {
    const batch = db.batch();
    for (const item of plan.slice(start, start + 400)) {
      batch.set(item.ref, item.payload, { merge: true });
    }
    await batch.commit();
    console.log(`Lote guardado: ${Math.min(start + 400, plan.length)} / ${plan.length}`);
  }
  console.log('Importación completada. No se han borrado documentos ni modificado documentos que no estuvieran marcados source="seed".');
}

main().catch((error) => {
  console.error('Error en importación administrativa:', error);
  process.exitCode = 1;
});
