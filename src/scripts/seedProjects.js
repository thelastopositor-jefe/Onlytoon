import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { readFileSync } from "node:fs";

// Mantén este archivo en la misma ubicación que antes.
// La ruta se resuelve respecto a este archivo: ../data/projects.json
const projectsPath = new URL("../data/projects.json", import.meta.url);
const projectsData = JSON.parse(readFileSync(projectsPath, "utf8"));

const firebaseConfig = {
  apiKey: "AIzaSyC2iexQvY1xjFMjy9qZSRjZsLYkfqGU0uk",
  authDomain: "onlytoon-82f3f.firebaseapp.com",
  projectId: "onlytoon-82f3f",
  storageBucket: "onlytoon-82f3f.firebasestorage.app",
  messagingSenderId: "1049602208943",
  appId: "1:1049602208943:web:a8b9f17768e8dce4e6905a",
  measurementId: "G-XG19QHBTYK",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getYouTubeId(value = "") {
  const input = String(value || "").trim();
  if (/^[\w-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return /^[\w-]{11}$/.test(id || "") ? id : "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && /^[\w-]{11}$/.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      const markerIndex = parts.findIndex((part) =>
        ["embed", "shorts", "live", "v"].includes(part)
      );
      const candidate = markerIndex >= 0 ? parts[markerIndex + 1] : "";
      return /^[\w-]{11}$/.test(candidate || "") ? candidate : "";
    }
  } catch {
    // No era una URL válida; se comprueba abajo si era un ID directo.
  }

  return "";
}

function cleanString(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function normalizeType(project) {
  const raw = cleanString(project.type || project.projectType, "2D").toLowerCase();
  if (raw.includes("stop")) return "Stop Motion";
  if (raw.includes("3d")) return "3D";
  if (raw.includes("ia") || raw.includes("inteligencia artificial")) return "IA";
  return "2D";
}

function normalizeFormat(project) {
  const raw = cleanString(project.format || project.projectFormat, "");
  if (raw) {
    const allowed = [
      "Cortometraje",
      "Largometraje",
      "Serie",
      "Tráiler",
      "Musical",
      "Crowdfunding",
      "Tutoriales",
      "Making of",
    ];
    const match = allowed.find((item) => item.toLowerCase() === raw.toLowerCase());
    if (match) return match;
  }

  const kind = cleanString(project.projectType || project.type, "").toLowerCase();
  if (kind.includes("serie")) return "Serie";
  if (kind.includes("trailer") || kind.includes("tráiler")) return "Tráiler";
  if (kind.includes("largometraje") || kind.includes("película")) return "Largometraje";
  if (kind.includes("musical")) return "Musical";
  return "Cortometraje";
}

function stableDocumentId(project, index) {
  const original = cleanString(project.id, "");
  const base = original || cleanString(project.title, `proyecto-${index + 1}`);
  const slug = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

  return `seed_${slug || index + 1}`;
}

async function seedProjects() {
  if (!Array.isArray(projectsData)) {
    throw new Error("data/projects.json debe contener un array de proyectos.");
  }

  console.log(`Preparando ${projectsData.length} proyectos para OnlyToon...`);

  let imported = 0;
  let skipped = 0;

  for (let index = 0; index < projectsData.length; index += 1) {
    const project = projectsData[index] || {};
    const title = cleanString(project.title, "");
    const youtubeId = getYouTubeId(project.youtubeId || project.url || project.youtubeUrl);

    if (!title) {
      console.warn(`Omitido el registro ${index + 1}: no tiene título.`);
      skipped += 1;
      continue;
    }

    if (!youtubeId) {
      console.warn(
        `Omitido "${title}": no se encontró un ID/enlace de YouTube válido en url, youtubeUrl o youtubeId.`
      );
      skipped += 1;
      continue;
    }

    const genres = Array.isArray(project.genres)
      ? project.genres.map((genre) => String(genre).trim()).filter(Boolean)
      : project.genre
        ? [String(project.genre).trim()]
        : [];

    const creator = cleanString(
      project.creator || project.creatorName || project.channelTitle,
      "Creador invitado"
    );

    const payload = {
      title,
      creator,
      creatorName: creator,
      // No se inventan creatorId ni creatorEmail: estos registros no pertenecen
      // a una cuenta Firebase Auth real.
      status: "approved",
      youtubeId,
      url: cleanString(project.url, `https://www.youtube.com/watch?v=${youtubeId}`),
      creatorChannel: cleanString(project.creatorChannel || project.channelUrl, ""),
      patreonUrl: cleanString(project.patreonUrl, ""),
      thumbnail:
        cleanString(project.thumbnail || project.thumbnailUrl, "") ||
        `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      type: normalizeType(project),
      genre: genres[0] || cleanString(project.genre, "General"),
      genres,
      format: normalizeFormat(project),
      year: String(project.year || new Date().getFullYear()),
      duration: cleanString(project.duration, "05:00"),
      description: cleanString(project.description, ""),
      isFeatured: Boolean(project.isFeatured),
      likesCount: Number.isFinite(Number(project.likesCount)) ? Number(project.likesCount) : 0,
      seasons: Array.isArray(project.seasons) ? project.seasons : [],
      rejectionReason: "",
      source: "seed",
      updatedAt: serverTimestamp(),
    };

    // setDoc con un ID estable hace que volver a ejecutar el seed actualice
    // los mismos documentos en vez de crear duplicados cada vez.
    const documentId = stableDocumentId(project, index);
    try {
      await setDoc(doc(db, "projects", documentId), {
        ...payload,
        createdAt: project.createdAt || serverTimestamp(),
      }, { merge: true });
      console.log(`✓ Publicado: ${title} (${documentId})`);
      imported += 1;
    } catch (error) {
      console.error(`✕ Error al guardar "${title}":`, error);
    }
  }

  console.log(`Carga terminada. Publicados/actualizados: ${imported}. Omitidos: ${skipped}.`);
}

seedProjects().catch((error) => {
  console.error("Falló la carga inicial de proyectos:", error);
  process.exitCode = 1;
});
