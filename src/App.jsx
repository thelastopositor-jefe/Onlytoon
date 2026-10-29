import React, { useState, useEffect, useMemo } from 'react';
import { CAROUSEL_ITEMS } from './data/carouselData';
import JobsSection from './components/JobsSection';
const TOONKNIGHT_LOGO = '/images/logo/toonknight.png';
import { auth, googleProvider, signInWithPopup, signOut, db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, onSnapshot } from 'firebase/firestore';
import { 
  Search, Heart, Bookmark, Share2, Play, Plus, CheckCircle, XCircle, 
  Trash2, ShieldCheck, User, Bell, ExternalLink, MessageSquare, ThumbsUp, 
  Tv, Film, Sparkles, Filter, ChevronLeft, ChevronRight, X, LogIn, Upload, Menu, Flag
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DE ADMINISTRADORES
// ==========================================
const ADMIN_EMAILS = ['roman82ap@gmail.com', 'thelastopositor@gmail.com'];
const GENRES_LIST = ['Acción', 'Aventura', 'Ciencia ficción', 'Fantasía', 'Fantasía oscura', 'Drama', 'Comedia', 'Terror', 'Suspenso', 'Infantil', 'Adulto', 'Social', 'Musical', 'Romance'];
const PROJECT_CATEGORIES = ['Cortometraje', 'Largometraje', 'Serie', 'Tráiler', 'Musical', 'Crowdfunding', 'Tutoriales', 'Making of'];

// Normaliza tildes, mayúsculas y espacios para comparar etiquetas de la interfaz
// con los valores internos que pueden estar guardados en Firestore.
const normalizeFilterText = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const GENRE_ALIASES = {
  accion: 'accion',
  aventura: 'aventura',
  'ciencia ficcion': 'scifi',
  scifi: 'scifi',
  fantasia: 'fantasia',
  'fantasia oscura': 'fantasia oscura',
  drama: 'drama',
  comedia: 'comedia',
  terror: 'terror',
  suspenso: 'suspenso',
  infantil: 'infantil',
  adulto: 'adulto',
  social: 'social',
  musical: 'musical',
  romance: 'romance'
};

const normalizeGenre = (value) => {
  const normalized = normalizeFilterText(value);
  return GENRE_ALIASES[normalized] || normalized;
};

// ==========================================
// DATOS MOCK INICIALES
// ==========================================
const INITIAL_PROJECTS = [
  {
    id: 'proj_1',
    title: 'Los gigantes del hielo',
    creator: 'Luna Norte Studio',
    creatorEmail: 'lunanorte@gmail.com',
    status: 'approved',
    youtubeId: 'L_LUpnjgPso',
    patreonUrl: 'https://patreon.com/lunanorte',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    type: '3D',
    genre: 'Fantasía',
    format: 'Cortometraje',
    year: '2026',
    duration: '12:48',
    description: 'Un viaje místico a través de valles helados donde seres de proporciones titánicas despiertan tras siglos de letargo.',
    isFeatured: true,
    likesCount: 342,
    seasons: [],
    rejectionReason: ''
  },
  {
    id: 'proj_2',
    title: 'Órbita interior',
    creator: 'Martín Ochoa',
    creatorEmail: 'martin@ochoa.com',
    status: 'approved',
    youtubeId: 'dQw4w9WgXcQ',
    patreonUrl: 'https://patreon.com/martinochoa',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    type: 'IA',
    genre: 'Musical',
    format: 'Musical',
    year: '2025',
    duration: '08:20',
    description: 'Exploración psicodélica y sensorial generada mediante inteligencia artificial sintética en sinfonía con ritmos synthwave.',
    isFeatured: true,
    likesCount: 189,
    seasons: [],
    rejectionReason: ''
  },
  {
    id: 'proj_3',
    title: 'Archipiélago violeta',
    creator: 'Luna Norte Studio',
    creatorEmail: 'lunanorte@gmail.com',
    status: 'approved',
    youtubeId: 'L_LUpnjgPso',
    patreonUrl: 'https://patreon.com/lunanorte',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    type: '2D',
    genre: 'Ciencia ficción',
    format: 'Serie',
    year: '2024',
    duration: '22:14',
    description: 'Una historia sobre paisajes imposibles, memoria perdida y la belleza de volver a empezar en las nubes.',
    isFeatured: true,
    likesCount: 512,
    seasons: [
      {
        seasonNumber: 1,
        episodes: [
          { title: 'Capítulo 1: El despertar de la bruma', youtubeId: 'L_LUpnjgPso', duration: '22:14' },
          { title: 'Capítulo 2: Vientos de cristal', youtubeId: 'dQw4w9WgXcQ', duration: '19:40' }
        ]
      }
    ],
    rejectionReason: ''
  },
  {
    id: 'proj_4',
    title: 'Neón, capítulo cero',
    creator: 'Marea Films',
    creatorEmail: 'marea@films.com',
    status: 'approved',
    youtubeId: 'dQw4w9WgXcQ',
    patreonUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    type: 'IA',
    genre: 'Acción',
    format: 'Tráiler',
    year: '2025',
    duration: '04:56',
    description: 'Sumergidos en los oscuros callejones cyber-noir de la metrópoli.',
    isFeatured: false,
    likesCount: 95,
    seasons: [],
    rejectionReason: ''
  },
  {
    id: 'proj_5',
    title: 'Último tren a casa',
    creator: 'Taller Bruma',
    creatorEmail: 'bruma@taller.com',
    status: 'approved',
    youtubeId: 'L_LUpnjgPso',
    patreonUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    type: 'Stop Motion',
    genre: 'Drama',
    format: 'Cortometraje',
    year: '2026',
    duration: '16:03',
    description: 'Artesanía física y marionetas de arcilla en un trayecto nocturno nostálgico.',
    isFeatured: false,
    likesCount: 220,
    seasons: [],
    rejectionReason: ''
  },
  {
    id: 'proj_6',
    title: 'Proyecto en revisión',
    creator: 'Alex Rivera',
    creatorEmail: 'alex@rivera.com',
    status: 'pending',
    youtubeId: 'dQw4w9WgXcQ',
    patreonUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    type: '2D',
    genre: 'Aventura',
    format: 'Cortometraje',
    year: '2026',
    duration: '07:15',
    description: 'Un experimento de animación tradicional en blanco y negro esperando aprobación.',
    isFeatured: false,
    likesCount: 0,
    seasons: [],
    rejectionReason: ''
  }
];

const PRODUCTS_DATA = [
  {
    id: 'prod_1',
    title: 'Blender 3D - Suite Completa',
    category: 'Software',
    price: 'Gratis / Open Source',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Herramienta integral para modelado, esculpido, rigging, animación 2D/3D y renderizado.',
    link: 'https://www.blender.org/'
  },
  {
    id: 'prod_2',
    title: 'Wacom Cintiq Pro 16',
    category: 'Hardware',
    price: '1,499.00 €',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    description: 'Pantalla interactiva con resolución 4K y precisión de lápiz Pro Pen 2 para ilustradores profesionales.',
    link: 'https://www.wacom.com/'
  },
  {
    id: 'prod_3',
    title: 'Toon Boom Harmony Premium',
    category: 'Software',
    price: '49.00 € / mes',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    description: 'El estándar de la industria global para la producción de animación 2D cut-out y tradicional.',
    link: 'https://www.toonboom.com/'
  },
  {
    id: 'prod_4',
    title: 'Dragonframe 5 - Stop Motion',
    category: 'Software',
    price: '325.00 €',
    image: 'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?auto=format&fit=crop&w=800&q=80',
    description: 'Software profesional de captura fotográfica e iluminación para largometrajes de Stop Motion.',
    link: 'https://www.dragonframe.com/'
  }
];

const INITIAL_FORUM_TOPICS = [
  {
    id: 'topic_1',
    title: '¿Qué software recomendáis para empezar en animación 2D tradicional?',
    category: 'Herramientas',
    authorName: 'Elena Ruiz',
    authorEmail: 'elena@gmail.com',
    createdAt: 'Hace 2 horas',
    content: 'Hola a todos. Estoy comenzando mis primeros estudios en animación frame a frame. ¿Me recomiendan Clip Studio Paint, Krita o saltar directo a Toon Boom?',
    likes: 24,
    comments: [
      { id: 'c1', author: 'Carlos V.', text: 'Krita es totalmente gratuito y genial para practicar los 12 principios.', createdAt: 'Hace 1 hora' },
      { id: 'c2', author: 'Luna Norte', text: 'Clip Studio EX tiene muy buena línea de tiempo para rotoscopia.', createdAt: 'Hace 30 min' }
    ]
  },
  {
    id: 'topic_2',
    title: 'Buscamos animador 3D/Rigger para cortometraje de fantasía',
    category: 'Colaboraciones',
    authorName: 'Martín Ochoa',
    authorEmail: 'martin@ochoa.com',
    createdAt: 'Ayer',
    content: 'Estamos en fase de preproducción para un proyecto de 10 minutos en Blender. Interesados responder con portafolio o Demo Reel.',
    likes: 15,
    comments: []
  }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  // --- Estados de Aplicación ---
  const [activeTab, setActiveTab] = useState('explorar'); // 'explorar', 'productos', 'comunidad', 'perfil', 'admin'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('onlytoon_user') || localStorage.getItem('onlytoons_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.warn('No se pudo recuperar la sesión guardada:', error);
      localStorage.removeItem('onlytoon_user');
      localStorage.removeItem('onlytoons_user');
      return null;
    }
  });

  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [forumTopics, setForumTopics] = useState(INITIAL_FORUM_TOPICS);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({ title: '', category: 'Software', subtype: '', techniques: [], uses: [], software: [], price: '', image: '', description: '', link: '', isAffiliate: false });
  const [productCategoryFilter, setProductCategoryFilter] = useState('Todos');
  const [productTechniqueFilter, setProductTechniqueFilter] = useState('Todos');
  const [productUseFilter, setProductUseFilter] = useState('Todos');
  const [productSubtypeFilter, setProductSubtypeFilter] = useState('Todos');
  const [educationItems, setEducationItems] = useState([]);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [educationForm, setEducationForm] = useState({ title: '', provider: '', url: '', price: 'Gratis', image: '', description: '', techniques: [], topics: [], software: [] });
  const [educationTechniqueFilter, setEducationTechniqueFilter] = useState('Todos');
  const [educationTopicFilter, setEducationTopicFilter] = useState('Todos');
  const [educationSoftwareFilter, setEducationSoftwareFilter] = useState('Todos');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (!snapshot.empty) {
        setProducts(snapshot.docs.map(productDoc => ({ ...productDoc.data(), id: productDoc.id })));
      } else if (isAdmin) {
        // Inicializa una sola vez la colección para que los productos de ejemplo también puedan editarse y eliminarse de forma persistente.
        try {
          await Promise.all(PRODUCTS_DATA.map(product => setDoc(doc(db, 'products', product.id), product, { merge: true })));
        } catch (error) {
          console.error('No se pudieron inicializar los productos:', error);
        }
      }
    }, (error) => console.error('Error al sincronizar productos:', error));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'education'), snapshot => setEducationItems(snapshot.docs.map(item => ({ ...item.data(), id: item.id }))), error => console.error('Error al sincronizar cursos:', error));
    return () => unsubscribe();
  }, []);

  // Mantiene los proyectos sincronizados en tiempo real, incluidos los mensajes de moderación.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), snapshot => {
      setProjects(snapshot.docs.map(projectDoc => ({ ...projectDoc.data(), id: projectDoc.id })));
    }, error => console.error('Error al sincronizar proyectos desde Firestore:', error));
    return () => unsubscribe();
  }, []);

  // Las discusiones se leen de Firestore; los datos de ejemplo solo sirven mientras carga.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'discussions'), (snapshot) => {
      const topics = snapshot.docs.map(topicDoc => ({ ...topicDoc.data(), id: topicDoc.id }));
      topics.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setForumTopics(topics);
    }, (error) => {
      console.error('Error al sincronizar las discusiones:', error);
    });
    return () => unsubscribe();
  }, []);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Derechos de autor');
  const [reportDetails, setReportDetails] = useState('');
  const [legalPage, setLegalPage] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [seasons, setSeasons] = useState([{ seasonNumber: 1, episodes: [{ title: 'Episodio 1', youtubeUrl: '', episodeNumber: 1 }] }]);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

  // Modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPublishWarning, setShowPublishWarning] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({ title: '', description: '', year: '', youtubeUrl: '', type: '2D', format: 'Cortometraje', duration: '05:00', patreonUrl: '', campaignUrl: '' });
  const [editProjectGenres, setEditProjectGenres] = useState([]);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', bio: '', banner: '', photo: '', patreonUrl: '', kofiUrl: '', websiteUrl: '', contactEmail: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedForumTopic, setSelectedForumTopic] = useState(null);

  // ==========================================
  // ESTADO Y EFECTO DEL CARRUSEL (ÚNICO)
  // ==========================================
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prevIndex) => 
        prevIndex === CAROUSEL_ITEMS.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Buscador y Filtros (Únicos)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos'); // 2D, 3D, Stop Motion, IA
  const [filterGenre, setFilterGenre] = useState('Todos'); // Acción, Fantasía, etc.
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterFormat, setFilterFormat] = useState('Todos'); // Cortometraje, Serie, etc.

  // Formulario Nuevo Proyecto
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    creator: user?.name || '',
    youtubeUrl: '',
    patreonUrl: '',
    type: '2D',
    genre: 'Acción',
    format: 'Cortometraje',
    year: '2026',
    duration: '05:00',
    description: '',
    campaignUrl: ''
  });

  // Formulario Rechazo Admin
  const [rejectionNote, setRejectionNote] = useState({});

  // Formulario Nuevo Tema Foro
  const [newTopicForm, setNewTopicForm] = useState({
    title: '',
    category: 'Herramientas',
    content: ''
  });
  const [newCommentText, setNewCommentText] = useState('');

  // --- Verificación si es Administrador ---
  const isAdmin = useMemo(() => {
    return Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  }, [user]);

  // Proyectos Destacados para el Carrusel
  const featuredProjects = useMemo(() => {
    return projects.filter(p => p.status === 'approved' && p.isFeatured);
  }, [projects]);

  // Proyectos Aprobados y Filtrados para la Rejilla
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (p.status !== 'approved') return false;

      // Filtro de Búsqueda
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchTitle = String(p.title || '').toLowerCase().includes(query);
        const matchCreator = String(p.creator || p.creatorName || '').toLowerCase().includes(query);
        if (!matchTitle && !matchCreator) return false;
      }

      // Filtros desplegables. El campo type representa la técnica de animación
      // (2D, 3D, Stop Motion o IA); format representa el formato del proyecto.
      if (filterType !== 'Todos' && normalizeFilterText(p.type) !== normalizeFilterText(filterType)) return false;

      // Firestore puede guardar el género como etiqueta visible ("Ciencia ficción")
      // o como código interno ("scifi"). También admitimos el campo genres como array.
      if (filterGenre !== 'Todos') {
        const targetGenre = normalizeGenre(filterGenre);
        const projectGenres = [
          ...(Array.isArray(p.genres) ? p.genres : []),
          ...(p.genre != null ? [p.genre] : [])
        ];
        const matchesGenre = projectGenres.some(genre => normalizeGenre(genre) === targetGenre);
        if (!matchesGenre) return false;
      }

      if (filterYear !== 'Todos' && normalizeFilterText(p.year) !== normalizeFilterText(filterYear)) return false;

      if (filterFormat !== 'Todos') {
        const projectFormat = normalizeFilterText(p.format);
        const targetFormat = normalizeFilterText(filterFormat);
        const matchesFormat = targetFormat === 'crowdfunding'
          ? (projectFormat === 'crowdfunding' || Boolean(String(p.campaignUrl || '').trim()))
          : (projectFormat === targetFormat || (targetFormat === 'cortometraje' && !projectFormat));
        if (!matchesFormat) return false;
      }

      return true;
    });
  }, [projects, searchQuery, filterType, filterGenre, filterYear, filterFormat]);

  // --- Manejadores de Eventos ---
  const handleToggleFavorite = async (projectId) => {
    if (!user?.id) {
      setShowAuthModal(true);
      return;
    }
    const alreadyFavorite = (user.favorites || []).includes(projectId);
    const nextFavorites = alreadyFavorite
      ? (user.favorites || []).filter(id => id !== projectId)
      : [...(user.favorites || []), projectId];
    const nextUser = { ...user, favorites: nextFavorites };
    setUser(nextUser);
    localStorage.setItem('onlytoon_user', JSON.stringify(nextUser));
    try {
      await setDoc(doc(db, 'users', user.id), {
        favorites: alreadyFavorite ? arrayRemove(projectId) : arrayUnion(projectId)
      }, { merge: true });
    } catch (error) {
      console.error('Error al guardar favoritos:', error);
      alert('No se pudieron sincronizar los favoritos con Firestore.');
    }
  };

  const handleLikeProject = async (projectId) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p));
    setSelectedProject(current => current?.id === projectId ? { ...current, likesCount: (current.likesCount || 0) + 1 } : current);
    try {
      await updateDoc(doc(db, 'projects', projectId), { likesCount: increment(1) });
    } catch (error) {
      console.error('Error al guardar el me gusta:', error);
      alert('No se pudo guardar el me gusta en Firestore.');
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(current => {
      if (current.includes(genre)) return current.filter(item => item !== genre);
      if (current.length >= 3) { alert('Solo puedes seleccionar un máximo de 3 géneros.'); return current; }
      return [...current, genre];
    });
  };

  const handleAddEpisode = (seasonIndex) => {
    setSeasons(current => current.map((season, idx) => idx !== seasonIndex ? season : ({
      ...season, episodes: [...season.episodes, { title: `Episodio ${season.episodes.length + 1}`, youtubeUrl: '', episodeNumber: season.episodes.length + 1 }]
    })));
  };

  const handleEpisodeChange = (seasonIndex, episodeIndex, field, value) => {
    setSeasons(current => current.map((season, idx) => idx !== seasonIndex ? season : ({
      ...season, episodes: season.episodes.map((episode, epIdx) => epIdx !== episodeIndex ? episode : ({ ...episode, [field]: value }))
    })));
  };

  const handleAddSeason = () => {
    setSeasons(current => [...current, { seasonNumber: current.length + 1, episodes: [{ title: 'Episodio 1', youtubeUrl: '', episodeNumber: 1 }] }]);
  };

  const handleShareProject = async (project) => {
    const shareText = `${project.title} — ${project.creator || project.creatorName || 'ToonKnight'}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?project=${encodeURIComponent(project.id)}`;
    try {
      if (navigator.share) await navigator.share({ title: project.title, text: shareText, url: shareUrl });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(shareUrl); alert('Enlace directo al vídeo copiado.'); }
      else window.prompt('Copia el enlace al vídeo:', shareUrl);
    } catch (error) { if (error?.name !== 'AbortError') console.error('No se pudo compartir el proyecto:', error); }
  };

  // Abre automáticamente el proyecto cuando alguien entra mediante un enlace compartido.
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('project');
    if (!projectId || !projects.length) return;
    const sharedProject = projects.find(project => project.id === projectId && project.status === 'approved');
    if (sharedProject) setSelectedProject(current => current?.id === projectId ? current : sharedProject);
  }, [projects]);

  const extractYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : 'dQw4w9WgXcQ';
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();

    // La publicación requiere una sesión para guardar la autoría correctamente.
    if (!user?.id || !user?.email) {
      alert('Inicia sesión con Google antes de publicar un proyecto.');
      setShowAuthModal(true);
      return;
    }

    const title = newProjectForm.title.trim();
    if (!title) {
      alert('Escribe un título para el proyecto.');
      return;
    }

    const isSeries = newProjectForm.format === 'Serie';
    if (isSeries && (!seasons.length || seasons.some(season => !season.episodes.length || season.episodes.some(ep => !ep.title.trim() || !ep.youtubeUrl.trim())))) {
      alert('Completa el título y el enlace de YouTube de todos los episodios antes de enviar la serie.');
      return;
    }
    if (!isSeries && !newProjectForm.youtubeUrl.trim()) { alert('Añade un enlace de YouTube para el proyecto.'); return; }
    const normalizedSeasons = isSeries ? seasons.map((season, seasonIndex) => ({
      seasonNumber: seasonIndex + 1,
      episodes: season.episodes.map((ep, episodeIndex) => ({
        title: ep.title.trim(), episodeNumber: Number(ep.episodeNumber) || episodeIndex + 1,
        youtubeId: extractYoutubeId(ep.youtubeUrl.trim()), thumbnail: `https://img.youtube.com/vi/${extractYoutubeId(ep.youtubeUrl.trim())}/hqdefault.jpg`
      }))
    })) : [];
    const firstEpisodeId = isSeries ? normalizedSeasons[0]?.episodes[0]?.youtubeId : extractYoutubeId(newProjectForm.youtubeUrl.trim());
    const ytId = firstEpisodeId || extractYoutubeId(newProjectForm.youtubeUrl.trim());
    const genres = selectedGenres.length ? selectedGenres : [newProjectForm.genre || 'Acción'];
    const createdAt = new Date().toISOString();
    const projectPayload = {
      title,
      creator: newProjectForm.creator?.trim() || user.name || 'Anónimo',
      creatorName: newProjectForm.creator?.trim() || user.name || 'Anónimo',
      creatorId: user.id,
      creatorEmail: user.email,
      creatorPhoto: user.photo || '',
      creatorBio: user.bio || '',
      creatorPatreon: user.patreonUrl || newProjectForm.patreonUrl || '',
      creatorKofi: user.kofiUrl || '',
      creatorWeb: user.websiteUrl || '',
      status: 'pending',
      youtubeId: ytId,
      patreonUrl: newProjectForm.patreonUrl || '',
      campaignUrl: (newProjectForm.campaignUrl || '').trim(),
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      type: newProjectForm.type || '2D',
      genre: genres[0],
      genres,
      format: newProjectForm.format || 'Cortometraje',
      year: newProjectForm.year || String(new Date().getFullYear()),
      duration: newProjectForm.duration || '05:00',
      description: newProjectForm.description.trim(),
      isFeatured: false,
      likesCount: 0,
      // Los episodios viven dentro de seasons[].episodes[].
      seasons: isSeries ? normalizedSeasons : [{ seasonNumber: 1, episodes: [{ title, episodeNumber: 1, youtubeId: ytId, duration: newProjectForm.duration || '05:00' }] }],
      createdAt,
      rejectionReason: ''
    };

    try {
      const docRef = await addDoc(collection(db, 'projects'), projectPayload);
      const createdProject = { id: docRef.id, ...projectPayload };

      setProjects(prevProjects => [createdProject, ...prevProjects]);
      setShowSubmitModal(false);
      setSelectedGenres([]);
      setSeasons([{ seasonNumber: 1, episodes: [{ title: 'Episodio 1', youtubeUrl: '', episodeNumber: 1 }] }]);
      setNewProjectForm({
        title: '',
        creator: user.name || '',
        youtubeUrl: '',
        patreonUrl: '',
        type: '2D',
        genre: 'Acción',
        format: 'Cortometraje',
        year: String(new Date().getFullYear()),
        duration: '05:00',
        description: '',
        campaignUrl: ''
      });
      alert('¡Proyecto enviado a revisión y guardado en Firestore!');
    } catch (error) {
      console.error('Error al guardar el proyecto en Firestore:', error);
      alert('No se pudo publicar el proyecto. Comprueba tu conexión y las reglas de seguridad de Firestore e inténtalo de nuevo.');
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!selectedProject?.id) return;
    try {
      await addDoc(collection(db, 'reports'), {
        projectId: selectedProject.id,
        projectTitle: selectedProject.title || 'Proyecto sin título',
        youtubeId: selectedProject.youtubeId || '',
        reason: reportReason,
        details: reportDetails.trim(),
        reporterUid: user?.id || null,
        reporterEmail: user?.email || null,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setShowReportModal(false);
      setReportDetails('');
      alert('Gracias. Hemos recibido la denuncia para revisión.');
    } catch (error) {
      console.error('No se pudo guardar la denuncia:', error);
      alert('No se pudo enviar la denuncia. Comprueba las reglas de seguridad de Firestore para la colección reports.');
    }
  };

  // Acciones de Moderación Admin
  const handleApproveProject = async (id) => {
    try { await updateDoc(doc(db, 'projects', id), { status: 'approved' }); setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p)); }
    catch (error) { console.error('Error al aprobar el proyecto:', error); alert('No se pudo guardar la aprobación en Firestore.'); }
  };

  const handleRejectProject = (id) => {
    const reason = (rejectionNote[id] || '').trim() || 'El contenido no cumple con nuestras directrices comunitarias.';
    updateDoc(doc(db, 'projects', id), { status: 'rejected', rejectionReason: reason, moderatorMessage: reason, moderatedAt: new Date().toISOString() })
      .then(() => setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected', rejectionReason: reason, moderatorMessage: reason } : p)))
      .catch(error => { console.error('Error al rechazar el proyecto:', error); alert('No se pudo guardar el rechazo en Firestore.'); });
  };

  // Elimina el documento del proyecto en Firestore y sincroniza la interfaz.
  const handleDeleteProject = async (projectId) => {
    if (!isAdmin) {
      alert('No tienes permisos para eliminar proyectos.');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este proyecto? Esta acción no se puede deshacer.')) return;

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        alert('Este proyecto no existe en la colección projects de Firestore. No se ha eliminado ningún documento.');
        return;
      }
      await deleteDoc(projectRef);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      setSelectedProject(current => current?.id === projectId ? null : current);
      alert('Proyecto eliminado de Firestore.');
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      alert('No se pudo eliminar el proyecto. Comprueba las reglas de seguridad de Firestore y vuelve a intentarlo.');
    }
  };

  // Los episodios de ToonKnight están organizados dentro de seasons[].episodes[].
  // Como los episodios actuales no tienen id propio, se identifican por sus índices.
  const handleDeleteEpisode = async (projectId, seasonIndex, episodeIndex) => {
    if (!isAdmin) {
      alert('No tienes permisos para eliminar episodios.');
      return;
    }

    if (!window.confirm('¿Seguro que deseas eliminar este episodio? Esta acción no se puede deshacer.')) return;

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) {
        alert('No se encontró este proyecto en Firestore.');
        return;
      }

      const projectData = projectSnap.data();
      const seasons = Array.isArray(projectData.seasons) ? projectData.seasons : [];
      if (!seasons[seasonIndex] || !Array.isArray(seasons[seasonIndex].episodes) || !seasons[seasonIndex].episodes[episodeIndex]) {
        alert('No se encontró el episodio que quieres eliminar.');
        return;
      }

      const updatedSeasons = seasons.map((season, idx) => idx === seasonIndex
        ? { ...season, episodes: season.episodes.filter((_, epIdx) => epIdx !== episodeIndex) }
        : season
      );

      await updateDoc(projectRef, { seasons: updatedSeasons });
      setProjects(prevProjects => prevProjects.map(project => project.id === projectId ? { ...project, seasons: updatedSeasons } : project));
      setSelectedProject(current => current?.id === projectId ? { ...current, seasons: updatedSeasons } : current);
      alert('Episodio eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar el episodio:', error);
      alert('No se pudo eliminar el episodio. Comprueba las reglas de seguridad de Firestore y vuelve a intentarlo.');
    }
  };

  const handleOpenEditProject = (project) => {
    const genres = Array.isArray(project.genres) && project.genres.length
      ? project.genres
      : (project.genre ? [project.genre] : []);
    setEditProjectGenres(genres.slice(0, 3));
    setEditProjectForm({
      title: project.title || '',
      description: project.description || '',
      year: String(project.year || new Date().getFullYear()),
      youtubeUrl: project.youtubeId ? `https://www.youtube.com/watch?v=${project.youtubeId}` : '',
      type: project.type || '2D',
      format: project.format || 'Cortometraje',
      duration: project.duration || '05:00',
      patreonUrl: project.patreonUrl || '',
      campaignUrl: project.campaignUrl || ''
    });
    setEditingProject(project);
  };

  const handleSaveEditedProject = async (e) => {
    e.preventDefault();
    if (!editingProject || !user?.id || (editingProject.creatorId !== user.id && editingProject.creatorEmail !== user.email && !isAdmin)) { alert('No tienes permiso para editar este proyecto.'); return; }
    const ytId = editProjectForm.youtubeUrl.trim() ? extractYoutubeId(editProjectForm.youtubeUrl.trim()) : editingProject.youtubeId;
    const genres = editProjectGenres.length ? editProjectGenres : [editProjectForm.genre || editingProject.genre || 'Acción'];
    const updates = {
      title: editProjectForm.title.trim(),
      description: editProjectForm.description.trim(),
      year: String(editProjectForm.year),
      youtubeId: ytId,
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      type: editProjectForm.type || '2D',
      format: editProjectForm.format || 'Cortometraje',
      genre: genres[0],
      genres,
      duration: editProjectForm.duration || '05:00',
      patreonUrl: editProjectForm.patreonUrl.trim(),
      campaignUrl: editProjectForm.campaignUrl.trim()
    };
    if (!updates.title) { alert('El título es obligatorio.'); return; }
    if (editProjectForm.youtubeUrl.trim() && !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(editProjectForm.youtubeUrl.trim())) { alert('Introduce un enlace válido de YouTube.'); return; }
    try {
      await updateDoc(doc(db, 'projects', editingProject.id), updates);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...updates } : p));
      setSelectedProject(prev => prev?.id === editingProject.id ? { ...prev, ...updates } : prev);
      setEditingProject(null);
      alert('Proyecto actualizado correctamente.');
    } catch (error) { console.error('Error al editar proyecto:', error); alert('No se pudo editar el proyecto.'); }
  };

  const handleDeleteOwnProject = async (project) => {
    if (!user?.id || (project.creatorId !== user.id && project.creatorEmail !== user.email && !isAdmin)) { alert('Solo puedes eliminar tus propios proyectos.'); return; }
    if (!window.confirm('¿Quieres eliminar este proyecto? Esta acción no se puede deshacer.')) return;
    try {
      await deleteDoc(doc(db, 'projects', project.id));
      setProjects(prev => prev.filter(p => p.id !== project.id));
      setSelectedProject(null);
      alert('Proyecto eliminado.');
    } catch (error) { console.error('Error al eliminar proyecto:', error); alert('No se pudo eliminar el proyecto.'); }
  };

  useEffect(() => {
    if (!selectedProject?.id) return;
    const projectId = selectedProject.id;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p));
    setSelectedProject(prev => prev?.id === projectId ? { ...prev, viewsCount: (prev.viewsCount || 0) + 1 } : prev);
    updateDoc(doc(db, 'projects', projectId), { viewsCount: increment(1) })
      .catch(error => console.error('No se pudo registrar la visita:', error));
  }, [selectedProject?.id]);

  const handleToggleFeatured = async (id) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    const isFeatured = !project.isFeatured;
    try { await updateDoc(doc(db, 'projects', id), { isFeatured }); setProjects(prev => prev.map(p => p.id === id ? { ...p, isFeatured } : p)); }
    catch (error) { console.error('Error al actualizar destacado:', error); alert('No se pudo guardar el cambio en Firestore.'); }
  };

  // Administración de productos (solo administradores).
  const openNewProduct = () => {
    if (!isAdmin) return alert('Solo los administradores pueden gestionar productos.');
    setEditingProductId(null);
    setProductForm({ title: '', category: 'Software', subtype: '', techniques: [], uses: [], software: [], price: '', image: '', description: '', link: '', isAffiliate: false });
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    if (!isAdmin) return alert('Solo los administradores pueden gestionar productos.');
    setEditingProductId(product.id);
    setProductForm({ title: product.title || '', category: product.category || 'Software', subtype: product.subtype || '', techniques: product.techniques || [], uses: product.uses || [], software: product.software || [], price: product.price || '', image: product.image || '', description: product.description || '', link: product.link || '', isAffiliate: Boolean(product.isAffiliate) });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return alert('No tienes permisos para gestionar productos.');
    const payload = { ...productForm, title: productForm.title.trim(), description: productForm.description.trim(), updatedAt: new Date().toISOString() };
    if (!payload.title || !payload.link) return alert('El título y el enlace del producto son obligatorios.');
    const productId = editingProductId || `product_${Date.now()}`;
    try {
      await setDoc(doc(db, 'products', productId), payload, { merge: true });
      setProducts(prev => editingProductId ? prev.map(item => item.id === productId ? { ...payload, id: productId } : item) : [...prev, { ...payload, id: productId }]);
      setShowProductModal(false);
      alert(editingProductId ? 'Producto actualizado.' : 'Producto agregado.');
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('No se pudo guardar el producto. Revisa las reglas de Firestore.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!isAdmin) return alert('Solo los administradores pueden gestionar productos.');
    if (!window.confirm(`¿Eliminar el producto «${product.title}»?`)) return;
    try {
      await deleteDoc(doc(db, 'products', product.id));
      setProducts(prev => prev.filter(item => item.id !== product.id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('No se pudo eliminar el producto. Revisa las reglas de Firestore.');
    }
  };

  const toggleArrayValue = (form, setForm, field, value) => setForm(current => ({ ...current, [field]: current[field].includes(value) ? current[field].filter(item => item !== value) : [...current[field], value] }));
  const openNewEducation = () => { if (!isAdmin) return; setEditingEducationId(null); setEducationForm({ title: '', provider: '', url: '', price: 'Gratis', image: '', description: '', techniques: [], topics: [], software: [] }); setShowEducationModal(true); };
  const openEditEducation = item => { setEditingEducationId(item.id); setEducationForm({ title: item.title || '', provider: item.provider || '', url: item.url || '', price: item.price || 'Gratis', image: item.image || '', description: item.description || '', techniques: item.techniques || [], topics: item.topics || [], software: item.software || [] }); setShowEducationModal(true); };
  const handleSaveEducation = async e => { e.preventDefault(); if (!isAdmin) return; const payload = { ...educationForm, title: educationForm.title.trim(), updatedAt: new Date().toISOString() }; if (!payload.title || !payload.url) return alert('El título y el enlace del curso son obligatorios.'); const id = editingEducationId || `course_${Date.now()}`; try { await setDoc(doc(db, 'education', id), payload, { merge: true }); setEducationItems(prev => editingEducationId ? prev.map(item => item.id === id ? { ...payload, id } : item) : [...prev, { ...payload, id }]); setShowEducationModal(false); } catch (error) { console.error('Error al guardar curso:', error); alert('No se pudo guardar el curso. Revisa las reglas de Firestore.'); } };
  const handleDeleteEducation = async item => { if (!isAdmin || !window.confirm(`¿Eliminar el curso «${item.title}»?`)) return; try { await deleteDoc(doc(db, 'education', item.id)); setEducationItems(prev => prev.filter(course => course.id !== item.id)); } catch (error) { console.error(error); alert('No se pudo eliminar el curso.'); } };

  const handleDeleteTopic = async (topic) => {
    if (!user?.id) return setShowAuthModal(true);
    if (!isAdmin && topic.authorId !== user.id && topic.authorEmail !== user.email) {
      alert('Solo puedes eliminar tus propios temas del foro.');
      return;
    }
    if (!window.confirm(`¿Eliminar el tema «${topic.title}»? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteDoc(doc(db, 'discussions', topic.id));
      setForumTopics(prev => prev.filter(item => item.id !== topic.id));
      setSelectedForumTopic(current => current?.id === topic.id ? null : current);
    } catch (error) {
      console.error('Error al eliminar tema:', error);
      alert('No se pudo eliminar el tema. Revisa las reglas de Firestore.');
    }
  };

  const handleSendContact = async (e) => {
    e.preventDefault();
    const payload = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      subject: contactForm.subject.trim(),
      message: contactForm.message.trim()
    };
    if (!payload.name || !payload.email || !payload.message) {
      alert('Completa tu nombre, correo y mensaje.');
      return;
    }

    setSendingContact(true);
    try {
      // El titular confirma que contacto@toonknight.com ya está operativo. Verificar el envío real mediante FormSubmit antes de publicar.
      const response = await fetch('https://formsubmit.co/ajax/contacto@toonknight.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          _subject: payload.subject || 'Nuevo mensaje desde ToonKnight',
          _replyto: payload.email,
          _captcha: 'false'
        })
      });

      let result = null;
      try {
        result = await response.json();
      } catch {
        // Una respuesta no JSON no debe interpretarse como un envío confirmado.
      }

      if (!response.ok || !result || result.success === false || result.success === 'false') {
        console.error('Respuesta de FormSubmit:', { status: response.status, result });
        throw new Error(result?.message || `El servicio de correo respondió con HTTP ${response.status}`);
      }

      setContactForm({ name: '', email: '', subject: '', message: '' });
      setShowContactModal(false);
      alert('FormSubmit ha aceptado el mensaje. Comprueba que llegó a contacto@toonknight.com, incluida la carpeta de spam.');
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error);
      alert('FormSubmit no confirmó el envío. Si es la primera vez que usas este correo, revisa si FormSubmit te envió un mensaje de activación y confírmalo. Si ya está activado, abre la consola del navegador para ver el error exacto.');
    } finally {
      setSendingContact(false);
    }
  };

  // Foro
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      setShowAuthModal(true);
      return;
    }
    const topicPayload = {
      title: newTopicForm.title.trim(),
      category: newTopicForm.category,
      authorName: user.name || 'Usuario',
      authorId: user.id,
      authorEmail: user.email,
      createdAt: new Date().toISOString(),
      content: newTopicForm.content.trim(),
      likes: 0,
      comments: []
    };
    if (!topicPayload.title || !topicPayload.content) {
      alert('Completa el título y el contenido de la discusión.');
      return;
    }
    try {
      await addDoc(collection(db, 'discussions'), topicPayload);
      setShowNewTopicModal(false);
      setNewTopicForm({ title: '', category: 'Herramientas', content: '' });
    } catch (error) {
      console.error('Error al crear la discusión:', error);
      alert('No se pudo publicar la discusión. Comprueba las reglas de Firestore.');
    }
  };

  const handleAddComment = async (topicId) => {
    const text = newCommentText.trim();
    if (!text || !user?.id) {
      if (!user?.id) setShowAuthModal(true);
      return;
    }
    const comment = {
      author: user.name || 'Usuario',
      authorId: user.id,
      text,
      createdAt: new Date().toISOString()
    };
    try {
      // Subcolección escalable para comentarios: discussions/{topicId}/comments.
      const commentRef = await addDoc(collection(db, 'discussions', topicId, 'comments'), comment);
      const savedComment = { ...comment, id: commentRef.id };
      // También se mantiene un resumen embebido para que la vista actual pueda leer comentarios
      // desde el documento principal; la subcolección permite escalar a muchos comentarios.
      await updateDoc(doc(db, 'discussions', topicId), { comments: arrayUnion(savedComment) });
      setForumTopics(prev => prev.map(topic => topic.id === topicId
        ? { ...topic, comments: [...(topic.comments || []), savedComment] }
        : topic));
      setSelectedForumTopic(current => current?.id === topicId
        ? { ...current, comments: [...(current.comments || []), savedComment] }
        : current);
      setNewCommentText('');
    } catch (error) {
      console.error('Error al guardar el comentario:', error);
      alert('No se pudo guardar el comentario en Firestore.');
    }
  };

  // ==========================================
  // AUTENTICACIÓN REAL CON FIREBASE + GOOGLE
  // ==========================================
  // --- INICIO DE SESIÓN CON GOOGLE Y FIRESTORE ---
  const processGoogleUser = async (firebaseUser) => {
    const email = (firebaseUser.email || '').toLowerCase();
    if (!email) {
      alert('La cuenta de Google no tiene un correo electrónico disponible.');
      return;
    }

    const isAdmin = ADMIN_EMAILS.includes(email);
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const existingData = userSnap.exists() ? userSnap.data() : {};
    const loggedUser = {
      id: firebaseUser.uid,
      name: existingData.name || firebaseUser.displayName || email.split('@')[0],
      email,
      photo: firebaseUser.photoURL || existingData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      banner: existingData.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: existingData.bio ?? '¡Hola! Soy creador en ToonKnight.',
      patreonUrl: existingData.patreonUrl ?? '',
      kofiUrl: existingData.kofiUrl ?? '',
      websiteUrl: existingData.websiteUrl ?? '',
      contactEmail: existingData.contactEmail || email,
      favorites: Array.isArray(existingData.favorites) ? existingData.favorites : [],
      role: isAdmin ? 'admin' : (existingData.role || 'user'),
      createdAt: existingData.createdAt || new Date().toISOString()
    };

    await setDoc(userRef, loggedUser, { merge: true });

    setUser(loggedUser);
    localStorage.setItem('onlytoon_user', JSON.stringify(loggedUser));
    setShowAuthModal(false);

    if (isAdmin) {
      alert('¡Bienvenido de nuevo, Román! Panel de Administrador activado.');
    } else {
      alert(`¡Sesión iniciada con éxito, ${loggedUser.name}!`);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processGoogleUser(result.user);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      console.error('Código:', error?.code);
      console.error('Mensaje:', error?.message);

      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }

      if (error?.code === 'auth/popup-blocked') {
        alert('El navegador bloqueó la ventana de Google. Permite las ventanas emergentes para este sitio e inténtalo de nuevo.');
        return;
      }

      if (error?.code === 'auth/unauthorized-domain') {
        alert('Este dominio no está autorizado en Firebase Authentication. Añade el dominio actual en Firebase > Authentication > Settings > Authorized domains.');
        return;
      }

      alert(`No se pudo iniciar sesión con Google.\n\n${error?.code || error?.message || 'Error desconocido'}`);
    }
  };

  // Abre el editor precargando los datos actuales del perfil.
  const handleOpenEditProfile = () => {
    if (!user) return;
    setProfileForm({
      name: user.name || '',
      bio: user.bio || '',
      banner: user.banner || '',
      photo: user.photo || '',
      patreonUrl: user.patreonUrl || '',
      kofiUrl: user.kofiUrl || '',
      websiteUrl: user.websiteUrl || '',
      contactEmail: user.contactEmail || user.email || ''
    });
    setShowEditProfileModal(true);
  };

  // Guarda únicamente los campos editables en Firestore y sincroniza la sesión local.
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      alert('No se ha encontrado el identificador de tu cuenta. Cierra sesión y vuelve a entrar.');
      return;
    }

    const updatedData = {
      name: profileForm.name.trim(),
      bio: profileForm.bio.trim(),
      banner: profileForm.banner.trim(),
      photo: profileForm.photo.trim(),
      patreonUrl: profileForm.patreonUrl.trim(),
      kofiUrl: profileForm.kofiUrl.trim(),
      websiteUrl: profileForm.websiteUrl.trim(),
      contactEmail: profileForm.contactEmail.trim()
    };

    if (!updatedData.name) {
      alert('El nombre no puede estar vacío.');
      return;
    }

    try {
      setIsSavingProfile(true);
      const userRef = doc(db, 'users', user.id);
      await setDoc(userRef, { ...updatedData, id: user.id, email: user.email }, { merge: true });
      const newUserData = { ...user, ...updatedData };
      setUser(newUserData);
      localStorage.setItem('onlytoon_user', JSON.stringify(newUserData));
      const ownedProjects = projects.filter(p => p.creatorId === user.id || p.creatorEmail === user.email);
      await Promise.all(ownedProjects.map(p => updateDoc(doc(db, 'projects', p.id), {
        creator: updatedData.name, creatorName: updatedData.name,
        creatorPhoto: updatedData.photo, creatorBio: updatedData.bio
      }).catch(err => console.error('No se pudo sincronizar el creador del proyecto:', err))));
      setProjects(prev => prev.map(p => (p.creatorId === user.id || p.creatorEmail === user.email)
        ? { ...p, creator: updatedData.name, creatorName: updatedData.name, creatorPhoto: updatedData.photo, creatorBio: updatedData.bio } : p));
      const ownedTopics = forumTopics.filter(t => t.authorId === user.id || t.authorEmail === user.email);
      await Promise.all(ownedTopics.map(t => {
        const comments = (t.comments || []).map(c => c.authorId === user.id ? { ...c, author: updatedData.name } : c);
        return updateDoc(doc(db, 'discussions', t.id), { authorName: updatedData.name, comments })
          .catch(err => console.error('No se pudo sincronizar el nombre en el foro:', err));
      }));
      setForumTopics(prev => prev.map(t => ({
        ...t,
        ...(t.authorId === user.id || t.authorEmail === user.email ? { authorName: updatedData.name } : {}),
        comments: (t.comments || []).map(c => c.authorId === user.id ? { ...c, author: updatedData.name } : c)
      })));
      setSelectedProject(current => current && (current.creatorId === user.id || current.creatorEmail === user.email)
        ? { ...current, creator: updatedData.name, creatorName: updatedData.name } : current);
      setShowEditProfileModal(false);
      alert('¡Perfil actualizado con éxito en la nube!');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      alert('Hubo un error al actualizar el perfil. Comprueba tu conexión y las reglas de Firestore.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('onlytoon_user');
      localStorage.removeItem('onlytoons_user');
      setActiveTab('explorar');
      alert('Has cerrado sesión correctamente.');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('No se pudo cerrar la sesión correctamente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* ==========================================
          TOPBAR / NAVEGACIÓN RESPONSIVA
      ========================================== */}
      <header className="sticky top-0 z-40 bg-[#161618]/95 backdrop-blur-md border-b border-[#2e2e34] px-3 sm:px-4 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Logo */}
        <button
          type="button"
          onClick={() => { setActiveTab('explorar'); setMobileMenuOpen(false); }}
          className="flex items-center gap-2 cursor-pointer shrink-0 min-w-0"
          aria-label="ToonKnight, ir a explorar"
        >
          <img
            src={TOONKNIGHT_LOGO}
            alt="ToonKnight — Animación Independiente"
            className="h-14 sm:h-16 w-auto max-w-[48vw] object-contain"
          />
        </button>

        {/* Buscador central: solo escritorio */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos, técnicas o estudios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1a1e] border border-[#2e2e34] text-sm rounded-full pl-10 pr-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white">Limpiar</button>}
          </div>
        </div>

        {/* Navegación de escritorio */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
          <button onClick={() => setActiveTab('explorar')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'explorar' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Explorar</button>
          <button onClick={() => setActiveTab('productos')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'productos' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Productos</button>
          <button onClick={() => setActiveTab('educacion')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'educacion' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Aprender</button>
          <button onClick={() => setActiveTab('comunidad')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'comunidad' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Comunidad</button>
          <button onClick={() => setActiveTab('empleo')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'empleo' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Empleo</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${activeTab === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'text-amber-400 hover:bg-amber-500/10'}`}><ShieldCheck className="w-4 h-4" /><span>Moderación</span></button>}
        </nav>

        {/* Acciones y menú móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => { setShowPublishWarning(true); setMobileMenuOpen(false); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Publicar</span>
          </button>
          {user ? (
            <button onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#2e2e34] hover:border-blue-500 shrink-0" title={user.name} aria-label="Mi perfil">
              <img src={user.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={user.name || 'Perfil'} className="w-full h-full object-cover" />
            </button>
          ) : (
            <button onClick={handleGoogleLogin} className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white px-1.5 sm:px-3 py-2 flex items-center gap-1.5 whitespace-nowrap" aria-label="Iniciar sesión">
              <LogIn className="w-4 h-4" /><span className="hidden lg:inline">Iniciar sesión</span>
            </button>
          )}
          {user && <button type="button" onClick={handleLogout} className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-2.5 py-2 rounded-lg border border-[#2e2e34] hover:bg-[#222226] whitespace-nowrap"><LogIn className="w-4 h-4 rotate-180" />Cerrar sesión</button>}
          <button type="button" onClick={() => setMobileMenuOpen(open => !open)} className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#222226]" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menú desplegable móvil */}
      {mobileMenuOpen && (
        <nav className="md:hidden sticky top-[57px] z-30 bg-[#161618] border-b border-[#2e2e34] px-4 py-3 shadow-xl space-y-1">
          {[['explorar', 'Explorar'], ['productos', 'Productos'], ['educacion', 'Aprender'], ['comunidad', 'Comunidad'], ['empleo', 'Empleo y colaboraciones']].map(([tab, label]) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`block w-full text-left px-3 py-3 rounded-lg text-sm font-medium ${activeTab === tab ? 'bg-[#222226] text-blue-400' : 'text-gray-200 hover:bg-[#222226]'}`}>{label}</button>
          ))}
          {isAdmin && <button onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-amber-400 hover:bg-[#222226]">Moderación</button>}
          {user && <button onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-blue-400 hover:bg-[#222226]">Mi perfil</button>}
          {user && <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#222226] hover:text-white">Cerrar sesión</button>}
          {!user && <button onClick={() => { setMobileMenuOpen(false); handleGoogleLogin(); }} className="block w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-[#222226]">Iniciar sesión con Google</button>}
          <div className="px-3 pt-2 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Buscar proyectos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1e] border border-[#2e2e34] text-sm rounded-xl pl-9 pr-3 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        </nav>
      )}

      {/* ==========================================
          CONTENIDO PRINCIPAL (CAMBIO DE PESTAÑAS)
      ========================================== */}
      <main className="flex-1">

        {/* ------------------------------------------
            PESTAÑA 1: EXPLORAR (HOME)
        ------------------------------------------ */}
        {activeTab === 'explorar' && (
          <div className="space-y-8 sm:space-y-12 pb-10 sm:pb-16 w-full overflow-x-hidden">
            
            {/* HERO / CARRUSEL DESTACADO */}
            {CAROUSEL_ITEMS.length > 0 && (
              <section className="relative w-full bg-black sm:h-[440px] lg:h-[560px] sm:bg-[#1a1a1e] overflow-hidden border-b border-[#2e2e34]">
                {/* Imagen de fondo nítida con gradiente solo en la izquierda */}
<div className="relative aspect-video w-full sm:absolute sm:inset-0 sm:aspect-auto sm:h-full">
  <img 
    src={CAROUSEL_ITEMS[heroIndex]?.thumbnail} 
    alt={CAROUSEL_ITEMS[heroIndex]?.title} 
    className="w-full h-full object-contain sm:object-cover opacity-100 scale-100"
  />
  {/* Gradiente más suave: deja ver mejor la imagen sin perder legibilidad del texto */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/55 via-transparent to-transparent sm:bg-gradient-to-r sm:from-[#121212]/75 sm:via-[#121212]/35 sm:to-transparent" />
</div>

                {/* Contenido Hero */}
                <div className="relative max-w-7xl mx-auto h-auto sm:h-full px-4 sm:px-6 lg:px-12 pt-5 sm:pt-0 flex flex-col justify-start sm:justify-end pb-7 sm:pb-12">
                  <div className="max-w-2xl space-y-4">
                    <span className="text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 inline-block">
                      {CAROUSEL_ITEMS[heroIndex]?.category || 'DESTACADO'}
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
                      {CAROUSEL_ITEMS[heroIndex]?.title}
                    </h1>
                    <p className="text-gray-300 text-sm lg:text-base line-clamp-2 leading-relaxed">
                      {CAROUSEL_ITEMS[heroIndex]?.tagline}
                    </p>

                    <div className="pt-2 flex items-center gap-4">
                      <a 
                        href={CAROUSEL_ITEMS[heroIndex]?.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        {CAROUSEL_ITEMS[heroIndex]?.linkText || 'Ver proyecto'}
                      </a>
                    </div>
                  </div>

                  {/* Controles del Carrusel */}
                  <div className="absolute right-4 top-4 sm:right-6 sm:top-auto sm:bottom-12 flex items-center gap-4 bg-[#1a1a1e]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#2e2e34]">
                    <span className="text-xs font-mono text-gray-400">
                      0{heroIndex + 1} / 0{CAROUSEL_ITEMS.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setHeroIndex((prev) => (prev === 0 ? CAROUSEL_ITEMS.length - 1 : prev - 1))}
                        className="p-1.5 hover:bg-[#2e2e34] rounded-full text-gray-300 hover:text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setHeroIndex((prev) => (prev === CAROUSEL_ITEMS.length - 1 ? 0 : prev + 1))}
                        className="p-1.5 hover:bg-[#2e2e34] rounded-full text-gray-300 hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECCIÓN "LO MÁS RECIENTE" (LISTA NUMERADA) */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
              <div>
                <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">RECIÉN PUBLICADOS</span>
                <h2 className="text-2xl font-bold text-white">Lo más reciente</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.filter(p => p.status === 'approved').slice(0, 4).map((item, idx) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedProject(item)}
                    className="bg-[#1a1a1e] hover:bg-[#222226] border border-[#2e2e34] p-3.5 rounded-xl flex items-center gap-4 cursor-pointer transition-all hover:border-gray-600 group"
                  >
                    <span className="text-xl font-bold text-gray-500 group-hover:text-blue-400 font-mono">
                      0{idx + 1}
                    </span>
                    <img src={item.thumbnail} alt={item.title} className="w-16 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">{item.creator} • {item.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* BARRA DE FILTROS DESPLEGABLES */}
            <section className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
              <div className="bg-[#1a1a1e] border border-[#2e2e34] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  
                  {/* Filtro Animación */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Animación</label>
                    <select 
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todos">Todos</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="Stop Motion">Stop Motion</option>
                      <option value="IA">IA</option>
                    </select>
                  </div>

                  {/* Filtro Género */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Género</label>
                    <select 
                      value={filterGenre}
                      onChange={(e) => setFilterGenre(e.target.value)}
                      className="bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Acción">Acción</option>
                      <option value="Aventura">Aventura</option>
                      <option value="Ciencia ficción">Ciencia ficción</option>
                      <option value="Fantasía">Fantasía</option>
                      <option value="Drama">Drama</option>
                      <option value="Comedia">Comedia</option>
                      <option value="Terror">Terror</option>
                      <option value="Musical">Musical</option>
                      <option value="Romance">Romance</option>
                      {GENRES_LIST.filter(g => !['Acción','Aventura','Ciencia ficción','Fantasía','Drama','Comedia','Terror','Musical'].includes(g)).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  {/* Filtro Año */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Año</label>
                    <select 
                      value={filterYear}
                      onChange={(e) => setFilterYear(e.target.value)}
                      className="bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todos">Todos</option>
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                    </select>
                  </div>

                  {/* Filtro Formato Proyecto */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Proyecto</label>
                    <select 
                      value={filterFormat}
                      onChange={(e) => setFilterFormat(e.target.value)}
                      className="bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Cortometraje">Cortometraje</option>
                      <option value="Largometraje">Largometraje</option>
                      <option value="Serie">Serie</option>
                      <option value="Tráiler">Tráiler</option>
                      <option value="Musical">Musical</option>
                      <option value="Crowdfunding">Crowdfunding / Kickstarter</option>
                      <option value="Tutoriales">Tutoriales</option>
                      <option value="Making of">Making of</option>
                    </select>
                  </div>
                </div>

                {/* Limpiar Filtros */}
                {(filterType !== 'Todos' || filterGenre !== 'Todos' || filterYear !== 'Todos' || filterFormat !== 'Todos') && (
                  <button 
                    onClick={() => {
                      setFilterType('Todos');
                      setFilterGenre('Todos');
                      setFilterYear('Todos');
                      setFilterFormat('Todos');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>

              {/* Contado de proyectos */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{filteredProjects.length} proyectos encontrados</span>
              </div>

              {/* REJILLA DE PROYECTOS (VIDEO GRID) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="bg-[#1a1a1e] border border-[#2e2e34] rounded-xl overflow-hidden group hover:border-gray-500 transition-all flex flex-col justify-between"
                  >
                    {/* Miniatura con Duración */}
                    <div 
                      onClick={() => setSelectedProject(project)} 
                      className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                    >
                      <img 
                        src={project.thumbnail} 
                        alt={project.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {project.duration}
                      </span>
                      <span className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
                        {(project.viewsCount || 0).toLocaleString('es-ES')} visitas
                      </span>

                      {/* Botón Admin para Borrado Rápido */}
                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar proyecto inmediatamente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Metadatos */}
                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 
                          onClick={() => setSelectedProject(project)}
                          className="text-base font-bold text-white group-hover:text-blue-400 cursor-pointer truncate transition-colors"
                        >
                          {project.title}
                        </h3>
                        <p className="text-xs text-gray-400 truncate">{project.creator}</p>
                      </div>

                      {/* Badges de Categoría */}
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[10px] font-bold bg-[#222226] text-gray-300 px-2 py-0.5 rounded border border-[#2e2e34]">
                          {project.type}
                        </span>
                        <span className="text-[10px] font-bold bg-[#222226] text-gray-300 px-2 py-0.5 rounded border border-[#2e2e34]">
                          {project.format}
                        </span>
                        {(project.campaignUrl || normalizeFilterText(project.format) === 'crowdfunding') && <span className="text-[10px] font-bold bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-800/70">En campaña</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 2: PRODUCTOS Y RECURSOS
        ------------------------------------------ */}
        {activeTab === 'productos' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">RECURSOS RECOMENDADOS</span>
              <h1 className="text-3xl font-bold text-white">Software y Hardware para Animación</h1>
              <p className="text-gray-400 text-sm mt-1">Software, hardware y accesorios seleccionados para creadores.</p>
              {isAdmin && <button onClick={openNewProduct} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2"><Plus className="w-4 h-4" />Agregar producto</button>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-[#2e2e34] bg-[#1a1a1e] p-4">
              <label className="text-xs text-gray-400">Categoría<select value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option><option>Software</option><option>Hardware</option><option>Accesorio</option></select></label>
              <label className="text-xs text-gray-400">Técnica<select value={productTechniqueFilter} onChange={e => setProductTechniqueFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['2D','3D','Stop Motion','IA','Híbrido'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="text-xs text-gray-400">Uso<select value={productUseFilter} onChange={e => setProductUseFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['Animación','Modelado','Dibujo','Escultura','Rigging','Texturizado','Renderizado','Composición','Edición','Iluminación','Stop motion','Captura de movimiento','Preproducción','Storyboard','Entornos','Audio'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="text-xs text-gray-400">Tipo de equipo / subtipo<select value={productSubtypeFilter} onChange={e => setProductSubtypeFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['Tableta con pantalla','Tableta sin pantalla','Tableta autónoma','Lápiz digital','Cámara','Objetivo','Trípode','Plataforma giratoria','Kit de iluminación','Marioneta','Armadura para stop motion','Set / decorado','Impresora 3D','Escáner 3D','Capturadora','Micrófono','Ordenador','Monitor','Almacenamiento','Accesorio'].map(x => <option key={x}>{x}</option>)}</select></label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.filter(prod => (productCategoryFilter === 'Todos' || prod.category === productCategoryFilter) && (productTechniqueFilter === 'Todos' || (prod.techniques || []).includes(productTechniqueFilter) || (productTechniqueFilter === '2D' && /2d/i.test(prod.title + ' ' + prod.description)) || (productTechniqueFilter === '3D' && /3d/i.test(prod.title + ' ' + prod.description))) && (productUseFilter === 'Todos' || (prod.uses || []).includes(productUseFilter)) && (productSubtypeFilter === 'Todos' || prod.subtype === productSubtypeFilter)).map((prod) => (
                <div key={prod.id} className="bg-[#1a1a1e] border border-[#2e2e34] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gray-500 transition-all">
                  <div>
                    <img src={prod.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'} alt={prod.title} className="w-full h-44 object-cover" />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          {prod.category}
                        </span>
                        <span className="text-xs font-semibold text-gray-300">{prod.price}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">{prod.title}</h3>
                      {prod.isAffiliate && <p className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2">Enlace de afiliado · ToonKnight podría recibir una comisión si compras a través de este enlace.</p>}
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{prod.description}</p>
                      <div className="flex flex-wrap gap-1">{[...(prod.techniques || []), ...(prod.uses || []), ...(prod.subtype ? [prod.subtype] : [])].map(tag => <span key={tag} className="text-[10px] rounded-full bg-[#292930] px-2 py-1 text-gray-300">{tag}</span>)}</div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 space-y-2">
                    <a 
                      href={prod.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-[#222226] hover:bg-blue-600 text-gray-200 hover:text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-[#2e2e34] transition-all"
                    >
                      <span>Obtener recurso</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {isAdmin && <div className="grid grid-cols-2 gap-2"><button onClick={() => openEditProduct(prod)} className="rounded-lg border border-blue-500/30 bg-blue-500/10 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/20">Editar</button><button onClick={() => handleDeleteProduct(prod)} className="rounded-lg border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20">Eliminar</button></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA: APRENDER / EDUCACIÓN
        ------------------------------------------ */}
        {activeTab === 'educacion' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div><span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">FORMACIÓN PARA CREADORES</span><h1 className="text-3xl font-bold text-white">Aprender animación</h1><p className="text-sm text-gray-400 mt-1">Cursos, tutoriales y recursos formativos gratuitos y de pago, clasificados por técnica, especialidad y software.</p>{isAdmin && <button onClick={openNewEducation} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2"><Plus className="w-4 h-4"/>Agregar curso</button>}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-[#2e2e34] bg-[#1a1a1e] p-4">
              <label className="text-xs text-gray-400">Técnica<select value={educationTechniqueFilter} onChange={e => setEducationTechniqueFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['2D','3D','Stop Motion','IA','Híbrido'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="text-xs text-gray-400">Especialidad<select value={educationTopicFilter} onChange={e => setEducationTopicFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['Dibujo','Animación','Modelado','Escultura','Rigging','Texturizado','Entornos','Iluminación','Renderizado','Composición','Edición','Storyboard','Diseño de personajes','Fondos','Layout','Anatomía','Guion','Preproducción','Producción','Postproducción','Stop motion','Impresión 3D','Marionetas y armaduras','Fotografía','IA generativa','Efectos visuales'].map(x => <option key={x}>{x}</option>)}</select></label>
              <label className="text-xs text-gray-400">Software utilizado<select value={educationSoftwareFilter} onChange={e => setEducationSoftwareFilter(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-lg p-2 text-white"><option>Todos</option>{['Blender','Maya','3ds Max','Cinema 4D','Houdini','ZBrush','Substance 3D Painter','Substance 3D Designer','Adobe Photoshop','Adobe Illustrator','Adobe Animate','After Effects','Premiere Pro','Toon Boom Harmony','Storyboard Pro','TVPaint','Krita','OpenToonz','Clip Studio Paint','Moho','Spine','Live2D Cubism','Dragonframe','Stop Motion Studio','DaVinci Resolve','Unreal Engine','Unity','Godot','Marvelous Designer','Houdini','ComfyUI','Stable Diffusion','Runway','Midjourney','Autodesk MotionBuilder','iClone','Character Creator','Procreate','Grease Pencil','Nuke','Aseprite','Synfig','Pencil2D','TupiTube','Audacity','Reaper','Otro'].map(x => <option key={x}>{x}</option>)}</select></label>
            </div>
            {educationItems.filter(item => (educationTechniqueFilter === 'Todos' || (item.techniques || []).includes(educationTechniqueFilter)) && (educationTopicFilter === 'Todos' || (item.topics || []).includes(educationTopicFilter)) && (educationSoftwareFilter === 'Todos' || (item.software || []).includes(educationSoftwareFilter))).length ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{educationItems.filter(item => (educationTechniqueFilter === 'Todos' || (item.techniques || []).includes(educationTechniqueFilter)) && (educationTopicFilter === 'Todos' || (item.topics || []).includes(educationTopicFilter)) && (educationSoftwareFilter === 'Todos' || (item.software || []).includes(educationSoftwareFilter))).map(item => <article key={item.id} className="bg-[#1a1a1e] border border-[#2e2e34] rounded-2xl overflow-hidden flex flex-col">{item.image && <img src={item.image} alt={item.title} className="w-full h-44 object-cover"/>}<div className="p-5 flex-1 space-y-3"><div className="flex justify-between gap-2"><span className="text-[10px] rounded-full bg-blue-500/10 text-blue-300 px-2 py-1">{item.price || 'Consultar precio'}</span><span className="text-xs text-gray-400">{item.provider}</span></div><h3 className="text-lg font-bold text-white">{item.title}</h3><p className="text-sm text-gray-400">{item.description}</p>{[...(item.techniques || []), ...(item.topics || []), ...(item.software || [])].map(tag => <span key={tag} className="inline-block text-[10px] rounded-full bg-[#292930] px-2 py-1 mr-1 mb-1 text-gray-300">{tag}</span>)}</div><div className="p-5 pt-0 flex gap-2"><a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 hover:bg-blue-500 rounded-xl py-2.5 text-sm font-semibold text-white">Ver curso <ExternalLink className="inline w-3 h-3"/></a>{isAdmin && <><button onClick={() => openEditEducation(item)} className="px-3 rounded-lg bg-blue-500/10 text-blue-300 text-xs">Editar</button><button onClick={() => handleDeleteEducation(item)} className="px-3 rounded-lg bg-red-500/10 text-red-300 text-xs">Eliminar</button></>}</div></article>)}</div> : <p className="text-sm text-gray-500 rounded-2xl border border-dashed border-[#2e2e34] p-8 text-center">Aún no hay cursos con estos filtros. {isAdmin ? 'Agrega el primero desde el botón superior.' : 'Vuelve más tarde para descubrir nuevos recursos.'}</p>}
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 3: COMUNIDAD Y FORO
        ------------------------------------------ */}
        {/* ------------------------------------------
            PESTAÑA: EMPLEO Y COLABORACIONES
        ------------------------------------------ */}
        {activeTab === 'empleo' && (
          <JobsSection user={user} isAdmin={isAdmin} onLogin={handleGoogleLogin} />
        )}

        {activeTab === 'comunidad' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">FORO Y DISCUSIÓN</span>
                <h1 className="text-3xl font-bold text-white">Comunidad de Creadores</h1>
                <p className="text-gray-400 text-sm mt-1">Resuelve dudas, encuentra colaboradores y comparte tus procesos.</p>
              </div>

              <button 
                onClick={() => setShowNewTopicModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                Crear nuevo tema
              </button>
            </div>

            {/* Vista Lista de Temas o Vista Detallada */}
            {!selectedForumTopic ? (
              <div className="space-y-4">
                {forumTopics.map((topic) => (
                  <div 
                    key={topic.id}
                    onClick={() => setSelectedForumTopic(topic)}
                    className="bg-[#1a1a1e] hover:bg-[#222226] border border-[#2e2e34] p-5 rounded-2xl cursor-pointer transition-all hover:border-gray-500 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        {topic.category}
                      </span>
                      <span className="text-xs text-gray-500">{topic.createdAt}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white hover:text-blue-400 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{topic.content}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2e2e34] text-xs text-gray-400">
                      <span>Por <strong className="text-gray-300">{topic.authorName}</strong></span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {topic.likes}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {(topic.comments || []).length} comentarios</span>
                      </div>
                    </div>
                    {(isAdmin || (user && (topic.authorId === user.id || topic.authorEmail === user.email))) && <div className="flex justify-end"><button onClick={(event) => { event.stopPropagation(); handleDeleteTopic(topic); }} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" />Eliminar tema</button></div>}
                  </div>
                ))}
              </div>
            ) : (
              /* Vista Detallada de un Tema */
              <div className="bg-[#1a1a1e] border border-[#2e2e34] p-6 lg:p-8 rounded-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3"><button 
                  onClick={() => setSelectedForumTopic(null)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver al listado de temas
                </button>{(isAdmin || (user && (selectedForumTopic.authorId === user.id || selectedForumTopic.authorEmail === user.email))) && <button onClick={() => handleDeleteTopic(selectedForumTopic)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20"><Trash2 className="w-3.5 h-3.5" />Eliminar tema</button>}</div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    {selectedForumTopic.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{selectedForumTopic.title}</h2>
                  <p className="text-xs text-gray-400">Publicado por {selectedForumTopic.authorName} • {selectedForumTopic.createdAt}</p>
                </div>

                <div className="p-4 bg-[#121212] rounded-xl border border-[#2e2e34] text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                  {selectedForumTopic.content}
                </div>

                {/* Sección Comentarios */}
                <div className="space-y-4 pt-4 border-t border-[#2e2e34]">
                  <h4 className="text-base font-bold text-white">Respuestas ({(selectedForumTopic.comments || []).length})</h4>

                  <div className="space-y-3">
                    {(selectedForumTopic.comments || []).map((comment) => (
                      <div key={comment.id} className="bg-[#222226] p-3.5 rounded-xl border border-[#2e2e34] space-y-1">
                        <div className="flex justify-between text-xs text-gray-400">
                          <strong className="text-gray-200">{comment.author}</strong>
                          <span>{comment.createdAt}</span>
                        </div>
                        <p className="text-xs text-gray-300">{comment.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Escribir Comentario */}
                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text"
                      placeholder="Escribe tu respuesta..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="flex-1 bg-[#121212] border border-[#2e2e34] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button 
                      onClick={() => handleAddComment(selectedForumTopic.id)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 rounded-xl"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 4: PERFIL DE USUARIO
        ------------------------------------------ */}
        {activeTab === 'perfil' && user && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            {/* Banner del Perfil */}
            <div className="relative h-48 rounded-xl overflow-hidden shadow-lg bg-gray-800">
              <img
                src={user?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Información principal del usuario */}
            <div className="relative px-6 pb-6 bg-gray-900 rounded-b-xl border border-gray-800 shadow-xl -mt-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 mb-4 gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <img
                    src={user?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={user?.name || 'Usuario'}
                    className="w-28 h-28 rounded-full border-4 border-gray-900 object-cover shadow-2xl"
                  />
                  <div className="mt-2 sm:mt-0">
                    <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                      {user?.name}
                      {ADMIN_EMAILS.includes(user?.email?.toLowerCase()) && (
                        <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                          Administrador
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center sm:justify-end mb-4">
                <button
                  onClick={handleOpenEditProfile}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
                >
                  Editar perfil
                </button>
              </div>

              {user?.bio && (
                <p className="text-sm text-gray-300 whitespace-pre-line mb-4">{user.bio}</p>
              )}
              {user?.patreonUrl && (
                <a href={user.patreonUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 mb-4">
                  <ExternalLink className="w-4 h-4" /> Mi Patreon
                </a>
              )}

              {/* Estadísticas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-center">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <span className="block text-2xl font-bold text-purple-400">
                    {user?.favorites?.length || 0}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Favoritos</span>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <span className="block text-2xl font-bold text-blue-400">
                    {projects.filter(p => p.creatorId === user?.id || (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase()).length}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Proyectos Subidos</span>
                </div>
              </div>
            </div>

            {/* Mis Favoritos */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>❤️</span> Mis Proyectos Favoritos
              </h2>

              {user?.favorites && user.favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects
                    .filter(proj => user.favorites.includes(proj.id))
                    .map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 items-center cursor-pointer hover:border-purple-500/50 transition-colors"
                      >
                        <img
                          src={proj.thumbnail || proj.image}
                          alt={proj.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white text-sm truncate">{proj.title}</h3>
                          <p className="text-gray-400 text-xs">{proj.genre}</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Aún no tienes proyectos guardados en favoritos.</p>
              )}
            </div>

            {/* Mis Proyectos Subidos */}
            <div className="pt-6 border-t border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎬</span> Mis Proyectos Subidos
              </h2>

              {projects.filter(p => p.creatorId === user?.id || (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase()).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects
                    .filter(p => p.creatorId === user?.id || (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase())
                    .map(proj => (
                      <div
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 items-center cursor-pointer hover:border-blue-500/50 transition-colors"
                      >
                        <img
                          src={proj.thumbnail || proj.image}
                          alt={proj.title}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-white text-sm truncate">{proj.title}</h3>
                            {proj.status === 'approved' && (
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full shrink-0">Aprobado</span>
                            )}
                            {proj.status === 'pending' && (
                              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">Pendiente</span>
                            )}
                            {proj.status === 'rejected' && (
                              <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">Rechazado</span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">{proj.genre} • {proj.format}</p>
                          {proj.status === 'rejected' && (proj.moderatorMessage || proj.rejectionReason) && <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-xs text-red-200"><strong>Mensaje del moderador:</strong> {proj.moderatorMessage || proj.rejectionReason}</p>}
                          {proj.status === 'approved' && proj.moderatorMessage && <p className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2 text-xs text-emerald-200"><strong>Mensaje del moderador:</strong> {proj.moderatorMessage}</p>}
                          <div className="flex flex-wrap gap-2 mt-3" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditProject(proj)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-600/30 transition-colors"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOwnProject(proj)}
                              className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold hover:bg-red-600/30 transition-colors"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Todavía no has subido ningún proyecto.</p>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 5: PANEL DE MODERACIÓN ADMIN
        ------------------------------------------ */}
        {activeTab === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-base font-bold text-amber-400">Panel de Control Administrador</h2>
                <p className="text-xs text-amber-300/80">Revisa los contenidos en cola de aprobación antes de que sean visibles en la plataforma.</p>
              </div>
            </div>

            {/* Proyectos Pendientes */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Proyectos Pendientes ({projects.filter(p => p.status === 'pending').length})</h3>

              <div className="space-y-4">
                {projects.filter(p => p.status === 'pending').map((proj) => (
                  <div key={proj.id} className="bg-[#1a1a1e] border border-[#2e2e34] p-5 rounded-2xl flex flex-col md:flex-row gap-6 justify-between">
                    <div className="flex gap-4">
                      <img src={proj.thumbnail} alt={proj.title} className="w-32 h-20 object-cover rounded-xl" />
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">{proj.title}</h4>
                        <p className="text-xs text-gray-400">Por {proj.creator} ({proj.creatorEmail})</p>
                        <p className="text-xs text-gray-300 line-clamp-2">{proj.description}</p>
                        <div className="flex gap-2 pt-1">
                          <span className="text-[10px] bg-[#222226] text-gray-300 px-2 py-0.5 rounded">{proj.type}</span>
                          <span className="text-[10px] bg-[#222226] text-gray-300 px-2 py-0.5 rounded">{proj.format}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones de Moderación */}
                    <div className="flex flex-col justify-between gap-3 min-w-[240px]">
                      <button 
                        onClick={() => handleApproveProject(proj.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprobar y publicar
                      </button>

                      <div className="space-y-1.5">
                        <input 
                          type="text" 
                          placeholder="Mensaje para el usuario (se guardará al aprobar o rechazar)..."
                          value={rejectionNote[proj.id] || ''}
                          onChange={(e) => setRejectionNote({ ...rejectionNote, [proj.id]: e.target.value })}
                          className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleRejectProject(proj.id)}
                          className="w-full bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Rechazar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODAL DE REPRODUCCIÓN / DETALLE DE PROYECTO
      ========================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-y-auto shadow-2xl my-auto">
            {/* 1. Reproductor principal */}
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedProject.youtubeId || ''}?autoplay=1`}
                title={selectedProject.title || 'Reproductor de ToonKnight'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setSelectedProject(null)}
                aria-label="Cerrar detalle del proyecto"
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-7 lg:px-8 space-y-6">
              {/* 2. Título, interacción y géneros */}
              <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedProject.title}</h2>
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedProject.year || '2026'} <span className="mx-1">•</span> {selectedProject.format || selectedProject.type || 'Proyecto'} <span className="mx-1">•</span> {selectedProject.viewsCount || 0} visitas
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(selectedProject.genres || [selectedProject.genre].filter(Boolean)).map(genre => (
                      <span key={genre} className="px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-semibold">{genre}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleLikeProject(selectedProject.id)}
                    className="bg-[#222226] hover:bg-[#2e2e34] text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-[#2e2e34] flex items-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-current" /> Me gusta · {selectedProject.likesCount || 0}
                  </button>
                  {(user?.id && (selectedProject.creatorId === user.id || selectedProject.creatorEmail === user.email || isAdmin)) && <>
                    <button onClick={() => handleOpenEditProject(selectedProject)} className="bg-[#222226] hover:bg-blue-700 text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-[#2e2e34]">Editar</button>
                    <button onClick={() => handleDeleteOwnProject(selectedProject)} className="bg-red-900/70 hover:bg-red-700 text-white text-xs font-bold px-3 py-2.5 rounded-xl border border-red-800">Eliminar</button>
                  </>}
                  <button onClick={() => handleShareProject(selectedProject)} title="Compartir proyecto" className="bg-[#222226] hover:bg-[#2e2e34] text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-[#2e2e34] flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                  <button onClick={() => { setReportReason('Derechos de autor'); setReportDetails(''); setShowReportModal(true); }} title="Denunciar este proyecto" className="bg-red-950/50 hover:bg-red-900/70 text-red-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-red-900/70 flex items-center gap-1.5"><Flag className="w-4 h-4" /> Denunciar</button>
                  <button
                    onClick={() => handleToggleFavorite(selectedProject.id)}
                    title="Guardar en favoritos"
                    aria-label="Guardar en favoritos"
                    className={`p-2.5 rounded-xl border border-[#2e2e34] transition-colors ${user?.favorites?.includes(selectedProject.id) ? 'bg-blue-600 text-white' : 'bg-[#222226] text-gray-300'}`}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </section>

              <p className="text-sm text-gray-300 leading-relaxed bg-[#121212] p-4 rounded-xl border border-[#2e2e34]">
                {selectedProject.description}
              </p>

              {selectedProject.campaignUrl && <section className="rounded-xl border border-amber-700/50 bg-amber-950/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="text-sm font-bold text-amber-300">Este proyecto está en una campaña de crowdfunding</p><p className="text-xs text-gray-300 mt-1">La campaña se gestiona en una plataforma externa a ToonKnight.</p></div><a href={selectedProject.campaignUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-xs font-bold text-white">Ver campaña <ExternalLink className="w-3.5 h-3.5" /></a></section>}

              {/* 3. Tarjeta del creador: destacada antes de temporadas */}
              <section className="bg-[#1c1c22] border border-[#34343d] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={selectedProject.creatorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={`Avatar de ${selectedProject.creatorName || selectedProject.creator || 'creador'}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500/70 shrink-0"
                />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold mb-1">Conoce al creador</p>
                  <h3 className="text-lg font-bold text-white">{selectedProject.creatorName || selectedProject.creator || 'Creador de ToonKnight'}</h3>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{selectedProject.creatorBio || 'Creador de contenido en ToonKnight.'}</p>
                  <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                    {(selectedProject.creatorPatreon || selectedProject.patreonUrl) && (
                      <a href={selectedProject.creatorPatreon || selectedProject.patreonUrl} target="_blank" rel="noopener noreferrer" className="bg-[#ff424d] hover:bg-[#e63946] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                        Apoyar en Patreon ↗
                      </a>
                    )}
                    {selectedProject.creatorKofi && (
                      <a href={selectedProject.creatorKofi} target="_blank" rel="noopener noreferrer" className="bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Ko-fi ↗</a>
                    )}
                    {selectedProject.creatorWeb && (
                      <a href={selectedProject.creatorWeb} target="_blank" rel="noopener noreferrer" className="bg-[#2a2a32] hover:bg-[#363640] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">Sitio web ↗</a>
                    )}
                  </div>
                </div>
              </section>

              {/* 4. Temporadas y episodios */}
              {selectedProject.format === 'Serie' && selectedProject.seasons?.length > 0 && (
                <section className="space-y-4 pt-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Temporadas y episodios</h3>
                  <div className="flex flex-wrap gap-2 border-b border-[#2e2e34] pb-3">
                    {selectedProject.seasons.map((season, idx) => (
                      <button key={season.seasonNumber || idx} type="button" onClick={() => setActiveSeasonIndex(idx)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${activeSeasonIndex === idx ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#222226] border-[#2e2e34] text-gray-300 hover:bg-[#2e2e34]'}`}>
                        Temporada {season.seasonNumber || idx + 1}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(selectedProject.seasons[Math.min(activeSeasonIndex, selectedProject.seasons.length - 1)]?.episodes || []).map((ep, idx) => (
                      <div key={ep.id || `${selectedProject.id}-s${activeSeasonIndex}-e${idx}`} className={`p-3 rounded-xl flex items-center gap-3 transition-colors border ${selectedProject.youtubeId === ep.youtubeId ? 'bg-blue-950/40 border-blue-600' : 'bg-[#222226] hover:bg-[#2e2e34] border-[#2e2e34]'}`}>
                        <button type="button" onClick={() => setSelectedProject(current => current ? { ...current, youtubeId: ep.youtubeId } : current)} className="flex-1 min-w-0 text-left flex items-center gap-3">
                          <img src={ep.thumbnail || (ep.youtubeId ? `https://img.youtube.com/vi/${ep.youtubeId}/mqdefault.jpg` : selectedProject.thumbnail)} alt="" className="w-24 aspect-video object-cover rounded-lg bg-black" />
                          <span className="min-w-0"><span className="block text-[10px] text-blue-400 font-bold uppercase">Episodio {ep.episodeNumber || idx + 1}</span><span className="block text-xs font-bold text-gray-200 mt-1">{ep.title || `Episodio ${idx + 1}`}</span><span className="block text-[10px] text-gray-400 mt-1">Reproducir episodio</span></span>
                        </button>
                        {isAdmin && <button type="button" onClick={() => handleDeleteEpisode(selectedProject.id, Math.min(activeSeasonIndex, selectedProject.seasons.length - 1), idx)} title="Eliminar episodio" aria-label={`Eliminar episodio ${ep.title || idx + 1}`} className="shrink-0 p-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. Otros proyectos: al final de la vista */}
              {projects.filter(project => project.id !== selectedProject.id && (
                (selectedProject.creatorId && project.creatorId === selectedProject.creatorId) ||
                ((project.creatorEmail || '').toLowerCase() && (project.creatorEmail || '').toLowerCase() === (selectedProject.creatorEmail || '').toLowerCase()) ||
                (!selectedProject.creatorId && !selectedProject.creatorEmail && (project.creatorName || project.creator) === (selectedProject.creatorName || selectedProject.creator))
              )).length > 0 && (
                <section className="border-t border-[#2e2e34] pt-5 space-y-3">
                  <h3 className="text-sm font-bold text-white">Más proyectos de este creador</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.filter(project => project.id !== selectedProject.id && (
                      (selectedProject.creatorId && project.creatorId === selectedProject.creatorId) ||
                      ((project.creatorEmail || '').toLowerCase() && (project.creatorEmail || '').toLowerCase() === (selectedProject.creatorEmail || '').toLowerCase()) ||
                      (!selectedProject.creatorId && !selectedProject.creatorEmail && (project.creatorName || project.creator) === (selectedProject.creatorName || selectedProject.creator))
                    )).map(project => (
                      <button key={project.id} type="button" onClick={() => { setSelectedProject(project); setActiveSeasonIndex(0); }} className="bg-[#222226] hover:bg-[#2e2e34] border border-[#2e2e34] rounded-xl p-3 text-left flex gap-3 items-center transition-colors">
                        <img src={project.thumbnail || (project.youtubeId ? `https://img.youtube.com/vi/${project.youtubeId}/mqdefault.jpg` : '')} alt="" className="w-24 aspect-video object-cover rounded-lg bg-black" />
                        <span className="min-w-0"><span className="block text-sm font-semibold text-white truncate">{project.title}</span><span className="block text-xs text-gray-400 mt-1">{project.format || project.type || 'Proyecto'}</span></span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedProject && (
        <div className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="bg-[#161618] border border-red-900/70 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><h2 id="report-title" className="text-xl font-bold text-white">Denunciar proyecto</h2><p className="text-sm text-gray-400 mt-1">La denuncia se refiere a «{selectedProject.title}».</p></div><button type="button" onClick={() => setShowReportModal(false)} aria-label="Cerrar denuncia" className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSubmitReport} className="space-y-4">
              <label className="block text-xs font-bold text-gray-300">Motivo de la denuncia<select value={reportReason} onChange={e => setReportReason(e.target.value)} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white"><option>Derechos de autor</option><option>Contenido ilegal</option><option>Contenido sexual o violento inapropiado</option><option>Spam o enlace engañoso</option><option>El vídeo no corresponde al proyecto</option><option>Otro motivo</option></select></label>
              <label className="block text-xs font-bold text-gray-300">Detalles (opcional)<textarea rows={4} maxLength={1500} value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Explica brevemente el problema y, si procede, aporta contexto." className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
              <p className="text-[11px] text-gray-500">Usa esta función de buena fe. Se enviarán el identificador del proyecto, el motivo y los detalles; si has iniciado sesión, también se asociará tu cuenta a la denuncia.</p>
              <div className="flex gap-3"><button type="button" onClick={() => setShowReportModal(false)} className="flex-1 bg-[#222226] hover:bg-[#2e2e34] text-gray-200 py-3 rounded-xl">Cancelar</button><button type="submit" className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-xl">Enviar denuncia</button></div>
            </form>
          </div>
        </div>
      )}

      {showPublishWarning && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div role="alertdialog" aria-modal="true" className="bg-[#161618] border border-amber-500/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3"><ShieldCheck className="w-7 h-7 text-amber-400" /><h2 className="text-xl font-bold text-white">Antes de publicar tu proyecto</h2></div>
            <p className="text-sm text-gray-300 leading-relaxed">Asegúrate de que tienes los derechos necesarios sobre el contenido y que los enlaces funcionan. La publicación quedará pendiente de revisión antes de aparecer públicamente. No publiques material ilegal, ofensivo o que infrinja derechos de terceros.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowPublishWarning(false)} className="flex-1 bg-[#222226] hover:bg-[#2e2e34] text-gray-200 font-semibold py-3 rounded-xl">Cancelar</button>
              <button onClick={() => { setShowPublishWarning(false); setShowSubmitModal(true); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl">Entendido, continuar</button>
            </div>
          </div>
        </div>
      )}
      {editingProject && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveEditedProject} className="bg-[#161618] border border-[#2e2e34] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 lg:p-8 space-y-4 my-auto">
            <h2 className="text-xl font-bold text-white">Editar proyecto</h2>
            <label className="block text-xs text-gray-400">Título<input required value={editProjectForm.title} onChange={e => setEditProjectForm({ ...editProjectForm, title: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Enlace de YouTube<input type="url" value={editProjectForm.youtubeUrl} onChange={e => setEditProjectForm({ ...editProjectForm, youtubeUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs text-gray-400">Técnica
                <select value={editProjectForm.type} onChange={e => setEditProjectForm({ ...editProjectForm, type: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white">
                  <option value="2D">2D</option><option value="3D">3D</option><option value="Stop Motion">Stop Motion</option><option value="IA">IA</option>
                </select>
              </label>
              <label className="block text-xs text-gray-400">Categoría de proyecto
                <select value={editProjectForm.format} onChange={e => setEditProjectForm({ ...editProjectForm, format: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white">
                  <option value="Cortometraje">Cortometraje</option><option value="Largometraje">Largometraje</option><option value="Serie">Serie</option><option value="Tráiler">Tráiler</option><option value="Musical">Musical</option><option value="Crowdfunding">Crowdfunding / Kickstarter</option><option value="Tutoriales">Tutoriales</option><option value="Making of">Making of</option>
                </select>
              </label>
              <label className="block text-xs text-gray-400">Año de realización
                <input type="number" min="1900" max="2100" required value={editProjectForm.year} onChange={e => setEditProjectForm({ ...editProjectForm, year: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" />
              </label>
              <label className="block text-xs text-gray-400">Duración
                <input value={editProjectForm.duration} onChange={e => setEditProjectForm({ ...editProjectForm, duration: e.target.value })} placeholder="05:00" className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" />
              </label>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Géneros (hasta 3)</label>
              <div className="flex flex-wrap gap-2">
                {GENRES_LIST.map(genre => {
                  const isSelected = editProjectGenres.includes(genre);
                  return <button key={genre} type="button" onClick={() => setEditProjectGenres(current => isSelected ? current.filter(item => item !== genre) : (current.length < 3 ? [...current, genre] : current))} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}>{genre}{isSelected ? ' ✓' : ''}</button>;
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-2">{editProjectGenres.length}/3 géneros seleccionados</p>
            </div>
            <label className="block text-xs text-gray-400">Enlace de Patreon (opcional)<input type="url" value={editProjectForm.patreonUrl} onChange={e => setEditProjectForm({ ...editProjectForm, patreonUrl: e.target.value })} placeholder="https://www.patreon.com/..." className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Enlace de campaña (Kickstarter u otra plataforma, opcional)<input type="url" value={editProjectForm.campaignUrl} onChange={e => setEditProjectForm({ ...editProjectForm, campaignUrl: e.target.value })} placeholder="https://www.kickstarter.com/..." className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Descripción<textarea rows={4} value={editProjectForm.description} onChange={e => setEditProjectForm({ ...editProjectForm, description: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <div className="flex gap-3"><button type="button" onClick={() => setEditingProject(null)} className="flex-1 bg-[#222226] hover:bg-[#2e2e34] text-gray-200 py-3 rounded-xl">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold">Guardar cambios</button></div>
          </form>
        </div>
      )}

      {/* ==========================================
          MODAL PUBLICAR TRABAJO
      ========================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Publica tu trabajo</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Título del proyecto</label>
                <input 
                  type="text" 
                  required
                  value={newProjectForm.title}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {newProjectForm.format !== 'Serie' && <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Enlace de YouTube</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newProjectForm.youtubeUrl}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, youtubeUrl: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Técnica</label>
                  <select 
                    value={newProjectForm.type}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, type: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="Stop Motion">Stop Motion</option>
                    <option value="IA">IA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">Proyecto</label>
                  <select 
                    value={newProjectForm.format}
                    onChange={(e) => setNewProjectForm({ ...newProjectForm, format: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="Cortometraje">Cortometraje</option>
                    <option value="Largometraje">Largometraje</option>
                    <option value="Serie">Serie</option>
                    <option value="Tráiler">Tráiler</option>
                    <option value="Musical">Musical</option>
                    <option value="Crowdfunding">Crowdfunding / Kickstarter</option>
                    <option value="Tutoriales">Tutoriales</option>
                    <option value="Making of">Making of</option>
                  </select>
                </div>
              </div>

              <label className="block text-xs font-bold text-gray-400">Enlace de campaña de crowdfunding (opcional)
                <input type="url" value={newProjectForm.campaignUrl} onChange={e => setNewProjectForm({ ...newProjectForm, campaignUrl: e.target.value })} placeholder="https://www.kickstarter.com/... o enlace de otra campaña" className="mt-1 w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3.5 py-2.5 text-white" />
                <span className="block mt-1 text-[10px] text-gray-500">Si añades un enlace, el proyecto también aparecerá en el filtro Crowdfunding / Kickstarter.</span>
              </label>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-2">Selecciona hasta 3 géneros</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES_LIST.map(genre => { const isSelected = selectedGenres.includes(genre); return <button key={genre} type="button" onClick={() => toggleGenre(genre)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'}`}>{genre}{isSelected ? ' ✓' : ''}</button>; })}
                </div>
                <p className="text-[10px] text-gray-500 mt-2">{selectedGenres.length}/3 géneros seleccionados</p>
              </div>

              {newProjectForm.format === 'Serie' && (
                <div className="space-y-4 border border-[#2e2e34] bg-[#121212] p-4 rounded-2xl">
                  <h3 className="text-sm font-bold text-white">Temporadas y episodios</h3>
                  {seasons.map((season, seasonIndex) => <div key={season.seasonNumber} className="space-y-3 border-b border-[#2e2e34] pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xs font-bold text-blue-300">Temporada {season.seasonNumber}</h4>
                      {seasons.length > 1 && <button
                        type="button"
                        onClick={() => setSeasons(current => current.filter((_, idx) => idx !== seasonIndex).map((item, idx) => ({ ...item, seasonNumber: idx + 1 })))}
                        className="text-[10px] font-semibold text-red-300 hover:text-red-200 border border-red-500/30 rounded-lg px-2.5 py-1.5"
                        aria-label={`Eliminar temporada ${season.seasonNumber}`}
                      >Eliminar temporada</button>}
                    </div>
                    {season.episodes.map((episode, episodeIndex) => <div key={`${season.seasonNumber}-${episodeIndex}`} className="grid grid-cols-1 sm:grid-cols-6 gap-2 p-3 rounded-xl bg-[#1a1a1e]">
                      <div className="sm:col-span-1"><label className="text-[10px] text-gray-400 block mb-1">N.º</label><input type="number" min="1" required value={episode.episodeNumber} onChange={e => handleEpisodeChange(seasonIndex, episodeIndex, 'episodeNumber', e.target.value)} className="w-full bg-[#121212] border border-[#2e2e34] rounded-lg px-2 py-2 text-xs text-white" /></div>
                      <div className="sm:col-span-2"><label className="text-[10px] text-gray-400 block mb-1">Título del episodio</label><input type="text" required value={episode.title} onChange={e => handleEpisodeChange(seasonIndex, episodeIndex, 'title', e.target.value)} className="w-full bg-[#121212] border border-[#2e2e34] rounded-lg px-2 py-2 text-xs text-white" /></div>
                      <div className="sm:col-span-3"><label className="text-[10px] text-gray-400 block mb-1">Enlace de YouTube</label><input type="url" required placeholder="https://youtube.com/watch?v=..." value={episode.youtubeUrl} onChange={e => handleEpisodeChange(seasonIndex, episodeIndex, 'youtubeUrl', e.target.value)} className="w-full bg-[#121212] border border-[#2e2e34] rounded-lg px-2 py-2 text-xs text-white" /></div>
                      <div className="sm:col-span-6 flex justify-end">{season.episodes.length > 1 && <button type="button" onClick={() => setSeasons(current => current.map((item, idx) => idx !== seasonIndex ? item : ({ ...item, episodes: item.episodes.filter((_, epIdx) => epIdx !== episodeIndex) })))} className="text-[10px] text-red-300 hover:text-red-200">Eliminar episodio</button>}</div>
                    </div>)}
                    <button type="button" onClick={() => handleAddEpisode(seasonIndex)} className="text-xs font-bold text-blue-300 hover:text-blue-200">+ Añadir episodio</button>
                  </div>)}
                  <button type="button" onClick={handleAddSeason} className="w-full border border-dashed border-blue-500/50 text-blue-300 hover:bg-blue-600/10 rounded-xl py-2.5 text-xs font-bold">+ Añadir temporada</button>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Año de realización</label>
                <input type="number" min="1900" max="2100" required value={newProjectForm.year}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, year: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Descripción</label>
                <textarea 
                  rows={3}
                  value={newProjectForm.description}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                Enviar a revisión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL NUEVO TEMA FORO
      ========================================== */}
      {showNewTopicModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-lg rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Crear nuevo tema en el foro</h2>
              <button onClick={() => setShowNewTopicModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Título de la discusión</label>
                <input 
                  type="text" 
                  required
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Categoría</label>
                <select 
                  value={newTopicForm.category}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, category: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="Herramientas">Herramientas</option>
                  <option value="Consultas">Consultas</option>
                  <option value="Procesos">Procesos</option>
                  <option value="Colaboraciones">Colaboraciones</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Contenido</label>
                <textarea 
                  rows={4}
                  required
                  value={newTopicForm.content}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, content: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-xs rounded-xl p-3 text-white focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                Publicar discusión
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE EDICIÓN DEL PERFIL
      ========================================== */}
      {showEditProfileModal && user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-2xl rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Editar perfil</h2>
                <p className="text-xs text-gray-400 mt-1">Los cambios se guardarán en tu cuenta de ToonKnight.</p>
              </div>
              <button type="button" onClick={() => setShowEditProfileModal(false)} className="text-gray-400 hover:text-white" aria-label="Cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Nombre público</label>
                <input type="text" required maxLength={80} value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Biografía</label>
                <textarea rows={4} maxLength={500} value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Cuéntale a la comunidad quién eres..."
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">URL de la foto de perfil</label>
                <input type="url" value={profileForm.photo}
                  onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">URL del banner</label>
                <input type="url" value={profileForm.banner}
                  onChange={(e) => setProfileForm({ ...profileForm, banner: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Enlace de Patreon</label>
                <input type="url" value={profileForm.patreonUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, patreonUrl: e.target.value })}
                  placeholder="https://www.patreon.com/tuusuario"
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Enlace de Ko-fi</label>
                <input type="url" value={profileForm.kofiUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, kofiUrl: e.target.value })}
                  placeholder="https://ko-fi.com/tuusuario"
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Sitio web / portafolio</label>
                <input type="url" value={profileForm.websiteUrl}
                  onChange={(e) => setProfileForm({ ...profileForm, websiteUrl: e.target.value })}
                  placeholder="https://tusitio.com"
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">Correo de contacto público</label>
                <input type="email" value={profileForm.contactEmail}
                  onChange={(e) => setProfileForm({ ...profileForm, contactEmail: e.target.value })}
                  placeholder="contacto@ejemplo.com"
                  className="w-full bg-[#121212] border border-[#2e2e34] text-sm rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-500" />
                <p className="text-[11px] text-gray-500 mt-1">Este correo es independiente del correo usado para iniciar sesión.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 bg-[#222226] hover:bg-[#2e2e34] text-gray-200 font-semibold py-3 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={isSavingProfile}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-3 rounded-xl">
                  {isSavingProfile ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMINISTRACIÓN DE PRODUCTOS */}
      {showProductModal && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-xl rounded-3xl p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">{editingProductId ? 'Editar producto' : 'Agregar producto'}</h2><button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white" aria-label="Cerrar"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div><label className="block text-xs text-gray-400 mb-1">Nombre del producto *</label><input required value={productForm.title} onChange={e => setProductForm({...productForm,title:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><label className="block text-xs text-gray-400 mb-1">Categoría *</label><select value={productForm.category} onChange={e => setProductForm({...productForm,category:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white"><option>Software</option><option>Hardware</option><option>Accesorio</option></select></div><div><label className="block text-xs text-gray-400 mb-1">Precio</label><input value={productForm.price} onChange={e => setProductForm({...productForm,price:e.target.value})} placeholder="Ej. Gratis o 29 €" className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" /></div></div>
              <div><label className="block text-xs text-gray-400 mb-1">Subtipo físico (opcional)</label><select value={productForm.subtype} onChange={e => setProductForm({...productForm,subtype:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white"><option value="">Sin subtipo</option>{['Tableta con pantalla','Tableta sin pantalla','Tableta autónoma','Lápiz digital','Cámara','Objetivo','Trípode','Plataforma giratoria','Kit de iluminación','Marioneta','Armadura para stop motion','Set / decorado','Impresora 3D','Escáner 3D','Capturadora','Micrófono','Ordenador','Monitor','Almacenamiento','Accesorio'].map(x => <option key={x}>{x}</option>)}</select></div>
              <div><label className="block text-xs text-gray-400 mb-1">Técnicas (puedes elegir varias)</label><div className="flex flex-wrap gap-2">{['2D','3D','Stop Motion','IA','Híbrido'].map(x => <label key={x} className="text-xs text-gray-300 flex gap-1 items-center"><input type="checkbox" checked={productForm.techniques.includes(x)} onChange={() => toggleArrayValue(productForm,setProductForm,'techniques',x)}/>{x}</label>)}</div></div>
              <div><label className="block text-xs text-gray-400 mb-1">Usos / especialidades</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">{['Animación','Modelado','Dibujo','Escultura','Rigging','Texturizado','Renderizado','Composición','Edición','Iluminación','Stop motion','Captura de movimiento','Preproducción','Storyboard','Entornos','Audio','Diseño de personajes','Impresión 3D','Fotografía','IA generativa'].map(x => <label key={x} className="text-xs text-gray-300 flex gap-1 items-center"><input type="checkbox" checked={productForm.uses.includes(x)} onChange={() => toggleArrayValue(productForm,setProductForm,'uses',x)}/>{x}</label>)}</div></div>
              <div><label className="block text-xs text-gray-400 mb-1">URL de imagen</label><input type="url" value={productForm.image} onChange={e => setProductForm({...productForm,image:e.target.value})} placeholder="https://..." className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              <div><label className="block text-xs text-gray-400 mb-1">Enlace del producto *</label><input required type="url" value={productForm.link} onChange={e => setProductForm({...productForm,link:e.target.value})} placeholder="https://..." className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              <label className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 cursor-pointer"><input type="checkbox" checked={Boolean(productForm.isAffiliate)} onChange={e => setProductForm({...productForm, isAffiliate: e.target.checked})} className="mt-1 accent-amber-400"/><span><span className="block text-sm font-semibold text-white">Este es un enlace de afiliado</span><span className="block text-xs text-gray-400 mt-1">Márcalo solo si ToonKnight puede recibir una comisión u otra compensación por compras o registros a través de este enlace. La web mostrará una indicación junto al producto.</span></span></label>
              <div><label className="block text-xs text-gray-400 mb-1">Descripción</label><textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm,description:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" /></div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-bold text-white">Guardar producto</button>
            </form>
          </div>
        </div>
      )}

      {showEducationModal && isAdmin && <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"><div className="bg-[#161618] border border-[#2e2e34] w-full max-w-2xl rounded-3xl p-6 space-y-5 my-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-white">{editingEducationId ? 'Editar curso' : 'Agregar curso'}</h2><button onClick={() => setShowEducationModal(false)}><X className="w-5 h-5"/></button></div><form onSubmit={handleSaveEducation} className="space-y-3"><input required placeholder="Título del curso *" value={educationForm.title} onChange={e => setEducationForm({...educationForm,title:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/><div className="grid sm:grid-cols-2 gap-3"><input placeholder="Academia / profesor" value={educationForm.provider} onChange={e => setEducationForm({...educationForm,provider:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/><input placeholder="Gratis, 25 €, suscripción…" value={educationForm.price} onChange={e => setEducationForm({...educationForm,price:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/></div><input required type="url" placeholder="Enlace del curso *" value={educationForm.url} onChange={e => setEducationForm({...educationForm,url:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/><input type="url" placeholder="URL de imagen (opcional)" value={educationForm.image} onChange={e => setEducationForm({...educationForm,image:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/><textarea rows={3} placeholder="Descripción del curso" value={educationForm.description} onChange={e => setEducationForm({...educationForm,description:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-sm text-white"/>{[['Técnicas','techniques',['2D','3D','Stop Motion','IA','Híbrido']],['Especialidades','topics',['Dibujo','Animación','Modelado','Escultura','Rigging','Texturizado','Entornos','Iluminación','Renderizado','Composición','Edición','Storyboard','Diseño de personajes','Fondos','Layout','Anatomía','Guion','Preproducción','Producción','Postproducción','Stop motion','Impresión 3D','Marionetas y armaduras','Fotografía','IA generativa','Efectos visuales']],['Software utilizado','software',['Blender','Maya','3ds Max','Cinema 4D','Houdini','ZBrush','Substance 3D Painter','Substance 3D Designer','Photoshop','Illustrator','Adobe Animate','After Effects','Premiere Pro','Toon Boom Harmony','Storyboard Pro','TVPaint','Krita','OpenToonz','Clip Studio Paint','Moho','Spine','Live2D Cubism','Dragonframe','Stop Motion Studio','DaVinci Resolve','Unreal Engine','Unity','Godot','Marvelous Designer','ComfyUI','Stable Diffusion','Runway','Midjourney','MotionBuilder','iClone','Character Creator','Procreate','Nuke','Aseprite','Synfig','Pencil2D','TupiTube','Audacity','Reaper','Otro']]].map(([label,field,options]) => <div key={field}><p className="text-xs text-gray-400 mb-2">{label} (selección múltiple)</p><div className="flex flex-wrap gap-x-3 gap-y-2 max-h-28 overflow-y-auto">{options.map(x => <label key={x} className="text-xs text-gray-300 flex items-center gap-1"><input type="checkbox" checked={educationForm[field].includes(x)} onChange={() => toggleArrayValue(educationForm,setEducationForm,field,x)}/>{x}</label>)}</div></div>)}<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 text-sm font-bold text-white">Guardar curso</button></form></div></div>}

      {/* MODAL DE CONTACTO: envía el mensaje desde la web sin mostrar el destinatario */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-white">Contacta con ToonKnight</h2><p className="text-xs text-gray-400 mt-1">Envíanos tu consulta mediante este formulario.</p><p className="text-xs text-gray-300 mt-2">Correo de contacto: <a className="text-blue-300 underline" href="mailto:contacto@toonknight.com">contacto@toonknight.com</a></p></div><button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-white" aria-label="Cerrar"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSendContact} className="space-y-3">
              <input required placeholder="Tu nombre" value={contactForm.name} onChange={e => setContactForm({...contactForm,name:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" />
              <input required type="email" placeholder="Tu correo para responderte" value={contactForm.email} onChange={e => setContactForm({...contactForm,email:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" />
              <input placeholder="Asunto (opcional)" value={contactForm.subject} onChange={e => setContactForm({...contactForm,subject:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" />
              <textarea required rows={5} placeholder="Escribe tu mensaje..." value={contactForm.message} onChange={e => setContactForm({...contactForm,message:e.target.value})} className="w-full bg-[#121212] border border-[#2e2e34] rounded-xl px-3 py-2.5 text-sm text-white" />
              <p className="text-[11px] leading-relaxed text-gray-500">Usaremos los datos que facilites para responder a tu consulta. El envío se procesa mediante FormSubmit. Consulta la <button type="button" onClick={() => { setShowContactModal(false); setLegalPage('privacidad'); }} className="text-blue-300 underline">política de privacidad</button>.</p>
              <button disabled={sendingContact} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 rounded-xl py-3 text-sm font-bold text-white">{sendingContact ? 'Enviando...' : 'Enviar mensaje'}</button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DE AUTENTICACIÓN GOOGLE
      ========================================== */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-md rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Iniciar sesión en ToonKnight</h2>
                <p className="text-xs text-gray-400 mt-1">Usa tu cuenta de Google para continuar.</p>
              </div>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 transition-colors"
            >
              <span className="text-lg font-extrabold">G</span>
              Continuar con Google
            </button>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed">
              El acceso se realiza mediante Firebase Authentication y la ventana oficial de Google.
            </p>
          </div>
        </div>
      )}

      {legalPage && (
        <div className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="legal-page-title" className="bg-[#161618] border border-[#34343d] w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5"><div><p className="text-xs uppercase tracking-widest text-blue-300 font-bold">ToonKnight · toonknight.com</p><h2 id="legal-page-title" className="text-2xl font-black text-white mt-1">{({ aviso: 'Aviso legal', privacidad: 'Política de privacidad', cookies: 'Política de cookies', condiciones: 'Condiciones de uso', transparencia: 'Transparencia comercial' })[legalPage]}</h2></div><button onClick={() => setLegalPage('')} aria-label="Cerrar página legal" className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button></div>
            <div className="rounded-xl border border-amber-700/50 bg-amber-950/25 p-3 mb-5 text-sm text-amber-200"><strong>Borrador pendiente de completar.</strong> Antes de publicar la web, sustituye los campos entre corchetes y verifica que el texto coincide con la configuración y los servicios realmente activos.</div>
            <div className="space-y-4 text-sm leading-relaxed text-gray-300">
              {legalPage === 'aviso' && <>
                <h3 className="text-white font-bold">1. Titular y contacto</h3>
                <p>Titular: Roman Arias Pinto, persona física que desarrolla la actividad por cuenta propia (autónomo). Nombre comercial: ToonKnight. Sitio web: https://toonknight.com. Correo de contacto: contacto@toonknight.com. Domicilio o dirección legal exigible: Madrid, España — [COMPLETAR DIRECCIÓN POSTAL ANTES DE PUBLICAR].</p>
                <h3 className="text-white font-bold">2. Objeto del sitio</h3>
                <p>ToonKnight es un catálogo y una comunidad para descubrir proyectos de animación. Los vídeos se muestran mediante enlaces o reproductores de YouTube; ToonKnight no afirma ser titular de los vídeos ni alojarlos en sus propios servidores.</p>
                <h3 className="text-white font-bold">3. Propiedad intelectual y comunicaciones</h3>
                <p>Los vídeos, imágenes, marcas y materiales pertenecen a sus respectivos titulares. La inclusión de una ficha no implica patrocinio, afiliación ni aprobación por parte de sus titulares. Para comunicar una posible infracción, contenido ilícito o error, utiliza contacto@toonknight.com o el formulario de contacto.</p>
                <h3 className="text-white font-bold">4. Enlaces de terceros y actividad comercial</h3>
                <p>La web puede enlazar a YouTube, Kickstarter u otras plataformas de crowdfunding, Patreon, cursos y productos. Esos servicios se rigen por sus propias condiciones. Algunos enlaces de productos pueden ser enlaces de afiliado; se indicará junto al enlace cuando corresponda.</p>
                <h3 className="text-white font-bold">5. Estado del documento</h3>
                <p>Este texto es un borrador personalizado. Debe completarse el domicilio que corresponda y comprobarse que la información describe el sitio desplegado antes de considerarlo definitivo.</p>
              </>}
              {legalPage === 'privacidad' && <>
                <h3 className="text-white font-bold">1. Responsable y contacto</h3>
                <p>Responsable: Roman Arias Pinto, persona física autónoma. Contacto de privacidad: contacto@toonknight.com. Domicilio legal: Madrid, España — [COMPLETAR DIRECCIÓN POSTAL ANTES DE PUBLICAR].</p>
                <h3 className="text-white font-bold">2. Datos que pueden tratarse</h3>
                <p>Según las funciones utilizadas, pueden tratarse identificadores y datos básicos de la cuenta de Google, datos del perfil, favoritos, proyectos enviados, comentarios, interacciones, denuncias, mensajes de contacto y datos técnicos necesarios para seguridad y funcionamiento. Evita publicar datos sensibles o datos personales de terceros en perfiles, comentarios o denuncias.</p>
                <h3 className="text-white font-bold">3. Finalidades y bases jurídicas</h3>
                <p>Los datos se utilizan para crear y mantener cuentas, mostrar perfiles, gestionar favoritos y publicaciones, moderar comentarios y denuncias, responder consultas y proteger el servicio. La base jurídica debe asignarse por operación concreta: ejecución del servicio solicitado, consentimiento cuando proceda, cumplimiento de obligaciones legales o interés legítimo debidamente evaluado para seguridad y moderación. No se utilizarán los datos para una finalidad incompatible con la informada.</p>
                <h3 className="text-white font-bold">4. Proveedores y servicios externos</h3>
                <p>La web utiliza Google Authentication y Firebase/Firestore para autenticación y datos, Vercel para alojamiento y FormSubmit para procesar el formulario de contacto. El formulario está configurado para enviar los mensajes a contacto@toonknight.com; debe probarse el envío real y confirmarse la entrega antes del lanzamiento. Las miniaturas pueden solicitarse a servidores de YouTube/Google y el reproductor se carga al abrir un proyecto. Deben verificarse las condiciones, los acuerdos de tratamiento y las posibles transferencias internacionales de cada proveedor antes del lanzamiento.</p>
                <h3 className="text-white font-bold">5. Conservación</h3>
                <p>Los datos de cuenta se conservarán mientras la cuenta esté activa y durante el tiempo adicional estrictamente necesario para atender obligaciones o reclamaciones. Los mensajes de contacto y las denuncias se conservarán durante el tiempo necesario para responder, moderar, documentar la actuación y atender posibles reclamaciones; deben fijarse y aplicarse plazos internos concretos antes del lanzamiento. Los registros técnicos se conservarán según la configuración real de los proveedores y las necesidades de seguridad, que deben verificarse.</p>
                <h3 className="text-white font-bold">6. Derechos</h3>
                <p>Puedes solicitar acceso, rectificación, supresión, oposición, limitación y portabilidad cuando proceda escribiendo a contacto@toonknight.com. También puedes retirar un consentimiento cuando el tratamiento se base en él y presentar una reclamación ante la Agencia Española de Protección de Datos. La solicitud puede requerir verificar razonablemente tu identidad.</p>
                <h3 className="text-white font-bold">7. Menores y seguridad</h3>
                <p>El servicio está dirigido al público general, pero no se ha definido todavía un procedimiento específico para usuarios menores. No publiques información privada de menores ni de terceros. Antes del lanzamiento deben revisarse la edad mínima de uso, la moderación y la configuración de acceso.</p>
              </>}
              {legalPage === 'cookies' && <>
                <h3 className="text-white font-bold">1. Estado de la auditoría</h3>
                <p>ToonKnight utiliza almacenamiento local del navegador (localStorage) y se conecta a servicios de Google/Firebase y YouTube. Las miniaturas pueden descargarse desde YouTube antes de abrir el reproductor. No se ha completado una auditoría del sitio desplegado para inventariar todas las cookies, identificadores, finalidades, proveedores, duraciones y transferencias.</p>
                <h3 className="text-white font-bold">2. Consentimiento</h3>
                <p>Las tecnologías estrictamente necesarias deben distinguirse de las que requieren consentimiento. Cuando sea exigible, las tecnologías no necesarias deberán permanecer bloqueadas hasta obtener consentimiento válido y se ofrecerán opciones de aceptar y rechazar con igual visibilidad, además de una forma sencilla de cambiar la elección.</p>
                <h3 className="text-white font-bold">3. Gestión de preferencias</h3>
                <p>El sitio todavía debe incorporar o verificar el mecanismo real para gestionar y retirar preferencias. Hasta que se realice la auditoría e implementación, esta política no debe considerarse un inventario definitivo ni prueba de que exista un gestor de consentimiento.</p>
              </>}
              {legalPage === 'condiciones' && <>
                <h3 className="text-white font-bold">1. Uso del servicio</h3>
                <p>Las personas usuarias deben utilizar ToonKnight de forma lícita, respetar los derechos de terceros y abstenerse de publicar spam, amenazas, enlaces maliciosos, suplantaciones o contenido ilícito.</p>
                <h3 className="text-white font-bold">2. Cuentas y contenido de usuarios</h3>
                <p>Quien envíe un proyecto declara que la información aportada es correcta y que tiene derecho o autorización para compartir los textos, imágenes y enlaces que facilite. La inclusión en el catálogo no supone que ToonKnight sea titular del proyecto ni que garantice su calidad o disponibilidad.</p>
                <h3 className="text-white font-bold">3. Comentarios, moderación y denuncias</h3>
                <p>Los comentarios y denuncias deben realizarse de buena fe. ToonKnight podrá revisar, ocultar o retirar contenido de acuerdo con la ley y las reglas de la comunidad, y podrá limitar cuentas en caso de abuso. Las denuncias no garantizan la retirada automática del vídeo original de YouTube; cuando corresponda, se dirigirá la reclamación al titular de la plataforma o del contenido. Contacto: contacto@toonknight.com.</p>
                <h3 className="text-white font-bold">4. Servicios de terceros</h3>
                <p>YouTube, Google, plataformas de crowdfunding, Patreon, vendedores y proveedores de cursos tienen sus propias condiciones. ToonKnight no controla sus servicios, contenido, disponibilidad, compras ni políticas de privacidad.</p>
                <h3 className="text-white font-bold">5. Disponibilidad y cambios</h3>
                <p>El catálogo puede cambiar y el servicio puede sufrir interrupciones. Estas condiciones deberán actualizarse si se habilitan pagos, cursos propios, suscripciones u otras funciones comerciales.</p>
              </>}
              {legalPage === 'transparencia' && <>
                <h3 className="text-white font-bold">1. Enlaces de afiliados</h3>
                <p>ToonKnight puede incluir enlaces de afiliado. Si compras mediante uno de esos enlaces, el titular de ToonKnight podría recibir una comisión sin coste adicional para ti, salvo que se indique expresamente lo contrario. Los enlaces de afiliado deben identificarse claramente junto al producto o recomendación correspondiente; esta nota general no sustituye esa indicación.</p>
                <h3 className="text-white font-bold">2. Apoyo voluntario</h3>
                <p>En el futuro, ToonKnight podría aceptar apoyo voluntario mediante Patreon u otra plataforma externa. Los pagos, cuotas y condiciones serán los de la plataforma y se informarán antes de solicitar el apoyo.</p>
                <h3 className="text-white font-bold">3. Cursos y productos</h3>
                <p>ToonKnight contempla enlaces a cursos de terceros y la posibilidad de ofrecer cursos propios en el futuro. Si se habilitan ventas propias, se publicará antes de la compra la información exigible sobre el vendedor, precio total, impuestos, pago, entrega, desistimiento y reclamaciones, según corresponda.</p>
                <h3 className="text-white font-bold">4. Publicidad de YouTube</h3>
                <p>Los vídeos se reproducen mediante YouTube y esa plataforma puede mostrar anuncios conforme a sus propias condiciones. ToonKnight no afirma insertar ni controlar los anuncios que aparecen dentro del reproductor de YouTube.</p>
              </>}
            </div>
            <div className="flex justify-end mt-7"><button onClick={() => setLegalPage('')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl">Cerrar</button></div>
          </section>
        </div>
      )}

      {/* FOOTER GLOBAL */}
      <footer className="bg-[#161618] border-t border-[#2e2e34] py-8 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">TOONKNIGHT</span>
            <span>— Historias que cobran vida.</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"><button onClick={() => setShowContactModal(true)} className="text-blue-300 hover:text-white font-semibold">Contacto</button><button onClick={() => setLegalPage('aviso')} className="hover:text-white">Aviso legal</button><button onClick={() => setLegalPage('privacidad')} className="hover:text-white">Privacidad</button><button onClick={() => setLegalPage('cookies')} className="hover:text-white">Cookies</button><button onClick={() => setLegalPage('condiciones')} className="hover:text-white">Condiciones</button><button onClick={() => setLegalPage('transparencia')} className="hover:text-white">Transparencia</button><p>© 2026 ToonKnight. Todos los derechos reservados.</p></div>
        </div>
      </footer>

    </div>
  );
}