import React, { useState, useEffect, useMemo } from 'react';
import { CAROUSEL_ITEMS } from './data/carouselData';
import { auth, googleProvider, signInWithPopup, signOut, db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, onSnapshot } from 'firebase/firestore';
import { 
  Search, Heart, Bookmark, Share2, Play, Plus, CheckCircle, XCircle, 
  Trash2, ShieldCheck, User, Bell, ExternalLink, MessageSquare, ThumbsUp, 
  Tv, Film, Sparkles, Filter, ChevronLeft, ChevronRight, X, LogIn, Upload, Menu
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DE ADMINISTRADORES
// ==========================================
const ADMIN_EMAILS = ['roman82ap@gmail.com', 'thelastopositor@gmail.com'];
const GENRES_LIST = ['Acción', 'Aventura', 'Ciencia ficción', 'Fantasía', 'Fantasía oscura', 'Drama', 'Comedia', 'Terror', 'Suspenso', 'Infantil', 'Adulto', 'Social', 'Musical'];
const PROJECT_CATEGORIES = ['Cortometraje', 'Largometraje', 'Serie', 'Tráiler', 'Musical', 'Crowdfunding', 'Tutoriales', 'Making of'];

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
  const [forumTopics, setForumTopics] = useState(INITIAL_FORUM_TOPICS);

  // Carga los proyectos guardados en Firestore al iniciar la aplicación.
  // Si la colección está vacía o falla la conexión, se conservan los proyectos de respaldo.
  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectsList = querySnapshot.docs.map(projectDoc => ({
          ...projectDoc.data(),
          id: projectDoc.id
        }));

        if (isMounted) {
          setProjects(projectsList);
        }
      } catch (error) {
        console.error('Error al cargar los proyectos desde Firestore:', error);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
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
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [seasons, setSeasons] = useState([{ seasonNumber: 1, episodes: [{ title: 'Episodio 1', youtubeUrl: '', episodeNumber: 1 }] }]);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);

  // Modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPublishWarning, setShowPublishWarning] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({ title: '', description: '', year: '', youtubeUrl: '' });
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
    description: ''
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

      // Filtros Desplegables
      if (filterType !== 'Todos' && p.type !== filterType) return false;
      if (filterGenre !== 'Todos' && p.genre !== filterGenre) return false;
      if (filterYear !== 'Todos' && p.year !== filterYear) return false;
      if (filterFormat !== 'Todos' && p.format !== filterFormat) return false;

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
    const shareText = `${project.title} — ${project.creator || project.creatorName || 'OnlyToon'}`;
    try {
      if (navigator.share) await navigator.share({ title: project.title, text: shareText, url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(`${shareText} | ${window.location.href}`); alert('Enlace copiado para compartir.'); }
      else alert(shareText);
    } catch (error) { if (error?.name !== 'AbortError') console.error('No se pudo compartir el proyecto:', error); }
  };

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
        description: ''
      });
      alert('¡Proyecto enviado a revisión y guardado en Firestore!');
    } catch (error) {
      console.error('Error al guardar el proyecto en Firestore:', error);
      alert('No se pudo publicar el proyecto. Comprueba tu conexión y las reglas de seguridad de Firestore e inténtalo de nuevo.');
    }
  };

  // Acciones de Moderación Admin
  const handleApproveProject = async (id) => {
    try { await updateDoc(doc(db, 'projects', id), { status: 'approved' }); setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p)); }
    catch (error) { console.error('Error al aprobar el proyecto:', error); alert('No se pudo guardar la aprobación en Firestore.'); }
  };

  const handleRejectProject = (id) => {
    const reason = rejectionNote[id] || 'El contenido no cumple con nuestras directrices comunitarias.';
    updateDoc(doc(db, 'projects', id), { status: 'rejected', rejectionReason: reason })
      .then(() => setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p)))
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

  // Los episodios de OnlyToon están organizados dentro de seasons[].episodes[].
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
    setEditProjectForm({ title: project.title || '', description: project.description || '', year: String(project.year || new Date().getFullYear()), youtubeUrl: project.youtubeId ? `https://www.youtube.com/watch?v=${project.youtubeId}` : '' });
    setEditingProject(project);
  };

  const handleSaveEditedProject = async (e) => {
    e.preventDefault();
    if (!editingProject || !user?.id || (editingProject.creatorId !== user.id && editingProject.creatorEmail !== user.email && !isAdmin)) { alert('No tienes permiso para editar este proyecto.'); return; }
    const ytId = editProjectForm.youtubeUrl.trim() ? extractYoutubeId(editProjectForm.youtubeUrl.trim()) : editingProject.youtubeId;
    const updates = { title: editProjectForm.title.trim(), description: editProjectForm.description.trim(), year: String(editProjectForm.year), youtubeId: ytId, thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` };
    if (!updates.title) { alert('El título es obligatorio.'); return; }
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
      bio: existingData.bio ?? '¡Hola! Soy creador en OnlyToon.',
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
          aria-label="OnlyToon, ir a explorar"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">OT</span>
          <span className="text-lg sm:text-xl font-extrabold tracking-tight whitespace-nowrap">
            ONLY<span className="text-blue-500">TOON</span>
          </span>
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
          <button onClick={() => setActiveTab('comunidad')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'comunidad' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Comunidad</button>
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
          <button type="button" onClick={() => setMobileMenuOpen(open => !open)} className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#222226]" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menú desplegable móvil */}
      {mobileMenuOpen && (
        <nav className="md:hidden sticky top-[57px] z-30 bg-[#161618] border-b border-[#2e2e34] px-4 py-3 shadow-xl space-y-1">
          {[['explorar', 'Explorar'], ['productos', 'Productos'], ['comunidad', 'Comunidad']].map(([tab, label]) => (
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
              <section className="relative w-full h-[390px] sm:h-[440px] lg:h-[560px] bg-[#1a1a1e] overflow-hidden border-b border-[#2e2e34]">
                {/* Imagen de fondo nítida con gradiente solo en la izquierda */}
<div className="absolute inset-0">
  <img 
    src={CAROUSEL_ITEMS[heroIndex]?.thumbnail} 
    alt={CAROUSEL_ITEMS[heroIndex]?.title} 
    className="w-full h-full object-cover opacity-100 scale-100"
  />
  {/* Gradiente lateral izquierdo: mantiene el fondo oscuro solo donde está el texto y se desvanece hacia la derecha */}
  <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/72 to-transparent" />
</div>

                {/* Contenido Hero */}
                <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-12 flex flex-col justify-end pb-7 sm:pb-12">
                  <div className="max-w-2xl space-y-4">
                    <span className="text-xs font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 inline-block">
                      {CAROUSEL_ITEMS[heroIndex]?.category || 'DESTACADO'}
                    </span>
                    <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-none">
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
                  <div className="absolute right-6 bottom-12 flex items-center gap-4 bg-[#1a1a1e]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#2e2e34]">
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
              <p className="text-gray-400 text-sm mt-1">Herramientas seleccionadas para acelerar tu flujo de trabajo de animación.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTS_DATA.map((prod) => (
                <div key={prod.id} className="bg-[#1a1a1e] border border-[#2e2e34] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gray-500 transition-all">
                  <div>
                    <img src={prod.image} alt={prod.title} className="w-full h-44 object-cover" />
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                          {prod.category}
                        </span>
                        <span className="text-xs font-semibold text-gray-300">{prod.price}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-snug">{prod.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{prod.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <a 
                      href={prod.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full bg-[#222226] hover:bg-blue-600 text-gray-200 hover:text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 border border-[#2e2e34] transition-all"
                    >
                      <span>Obtener recurso</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------
            PESTAÑA 3: COMUNIDAD Y FORO
        ------------------------------------------ */}
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
                        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {topic.comments.length} comentarios</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Vista Detallada de un Tema */
              <div className="bg-[#1a1a1e] border border-[#2e2e34] p-6 lg:p-8 rounded-2xl space-y-6">
                <button 
                  onClick={() => setSelectedForumTopic(null)}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Volver al listado de temas
                </button>

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
                  <h4 className="text-base font-bold text-white">Respuestas ({selectedForumTopic.comments.length})</h4>

                  <div className="space-y-3">
                    {selectedForumTopic.comments.map((comment) => (
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
                    {projects.filter(p => (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase()).length}
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

              {projects.filter(p => (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase()).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects
                    .filter(p => (p.authorEmail || p.creatorEmail)?.toLowerCase() === user?.email?.toLowerCase())
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
                          placeholder="Motivo del rechazo..."
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
                src={`https://www.youtube.com/embed/${selectedProject.youtubeId || ''}?autoplay=1`}
                title={selectedProject.title || 'Reproductor de OnlyToon'}
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

              {/* 3. Tarjeta del creador: destacada antes de temporadas */}
              <section className="bg-[#1c1c22] border border-[#34343d] p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={selectedProject.creatorPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={`Avatar de ${selectedProject.creatorName || selectedProject.creator || 'creador'}`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500/70 shrink-0"
                />
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-blue-300 font-bold mb-1">Conoce al creador</p>
                  <h3 className="text-lg font-bold text-white">{selectedProject.creatorName || selectedProject.creator || 'Creador de OnlyToon'}</h3>
                  <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{selectedProject.creatorBio || 'Creador de contenido en OnlyToon.'}</p>
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
          <form onSubmit={handleSaveEditedProject} className="bg-[#161618] border border-[#2e2e34] w-full max-w-lg rounded-3xl p-6 space-y-4 my-auto">
            <h2 className="text-xl font-bold text-white">Editar proyecto</h2>
            <label className="block text-xs text-gray-400">Título<input required value={editProjectForm.title} onChange={e => setEditProjectForm({ ...editProjectForm, title: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Enlace de YouTube<input type="url" value={editProjectForm.youtubeUrl} onChange={e => setEditProjectForm({ ...editProjectForm, youtubeUrl: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Año de realización<input type="number" min="1900" max="2100" required value={editProjectForm.year} onChange={e => setEditProjectForm({ ...editProjectForm, year: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <label className="block text-xs text-gray-400">Descripción<textarea rows={4} value={editProjectForm.description} onChange={e => setEditProjectForm({ ...editProjectForm, description: e.target.value })} className="mt-1 w-full bg-[#121212] border border-[#2e2e34] rounded-xl p-3 text-white" /></label>
            <div className="flex gap-3"><button type="button" onClick={() => setEditingProject(null)} className="flex-1 bg-[#222226] py-3 rounded-xl">Cancelar</button><button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold">Guardar cambios</button></div>
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
                    <option value="Crowdfunding">Crowdfunding</option>
                    <option value="Tutoriales">Tutoriales</option>
                    <option value="Making of">Making of</option>
                  </select>
                </div>
              </div>

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
                    <h4 className="text-xs font-bold text-blue-300">Temporada {season.seasonNumber}</h4>
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
                <p className="text-xs text-gray-400 mt-1">Los cambios se guardarán en tu cuenta de OnlyToon.</p>
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

      {/* ==========================================
          MODAL DE AUTENTICACIÓN GOOGLE
      ========================================== */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-md rounded-3xl p-6 lg:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Iniciar sesión en OnlyToon</h2>
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

      {/* FOOTER GLOBAL */}
      <footer className="bg-[#161618] border-t border-[#2e2e34] py-8 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ONLYTOON</span>
            <span>— Historias que cobran vida.</span>
          </div>
          <p>© 2026 OnlyToon. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
}