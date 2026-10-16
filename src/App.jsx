import React, { useState, useEffect, useMemo } from 'react';
import { CAROUSEL_ITEMS } from './data/carouselData';
import onlyToonLogo from './Logo_web.jpg';
import { auth, googleProvider, signInWithPopup, signOut, db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, increment, onSnapshot } from 'firebase/firestore';
import { 
  Search, Heart, Bookmark, Share2, Play, Plus, CheckCircle, XCircle, 
  Trash2, ShieldCheck, User, Bell, ExternalLink, MessageSquare, ThumbsUp, 
  Tv, Film, Sparkles, Filter, ChevronLeft, ChevronRight, X, LogIn, Upload, Menu
} from 'lucide-react';

// ==========================================
// CONFIGURACIÓN DE ADMINISTRADORES Y MAPEO DE GÉNEROS
// ==========================================
const ADMIN_EMAILS = ['roman82ap@gmail.com', 'thelastopositor@gmail.com'];
const GENRES_LIST = ['Acción', 'Aventura', 'Ciencia ficción', 'Fantasía', 'Fantasía oscura', 'Drama', 'Comedia', 'Terror', 'Suspenso', 'Infantil', 'Adulto', 'Social', 'Musical', 'Romance', 'Cinemáticas', 'Bizarro'];
const PROJECT_CATEGORIES = ['Cortometraje', 'Largometraje', 'Serie', 'Tráiler', 'Musical', 'Crowdfunding', 'Tutoriales', 'Making of'];

const GENRE_MAP = {
  'Acción': 'accion',
  'Aventura': 'aventura',
  'Ciencia ficción': 'scifi',
  'Fantasía': 'fantasia',
  'Fantasía oscura': 'fantasia oscura',
  'Drama': 'drama',
  'Comedia': 'comedia',
  'Terror': 'terror',
  'Suspenso': 'suspenso',
  'Infantil': 'infantil',
  'Adulto': 'adulto',
  'Social': 'social',
  'Musical': 'musical',
  'Romance': 'romance',
  'Cinemáticas': 'cinematicas',
  'Bizarro': 'bizarro'
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
    genre: 'fantasia',
    genres: ['fantasia'],
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
    genre: 'musical',
    genres: ['musical'],
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
    genre: 'scifi',
    genres: ['scifi'],
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
    comments: []
  }
];

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
export default function App() {
  // --- Estados de Aplicación ---
  const [activeTab, setActiveTab] = useState('explorar');
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
  const [productForm, setProductForm] = useState({ title: '', category: 'Software', price: '', image: '', description: '', link: '' });
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);

  // --- Verificación si es Administrador ---
  const isAdmin = useMemo(() => {
    return Boolean(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  }, [user]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), async (snapshot) => {
      if (!snapshot.empty) {
        setProducts(snapshot.docs.map(productDoc => ({ ...productDoc.data(), id: productDoc.id })));
      } else if (isAdmin) {
        try {
          await Promise.all(PRODUCTS_DATA.map(product => setDoc(doc(db, 'products', product.id), product, { merge: true })));
        } catch (error) {
          console.error('No se pudieron inicializar los productos:', error);
        }
      }
    }, (error) => console.error('Error al sincronizar productos:', error));
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const projectsList = querySnapshot.docs.map(projectDoc => ({
          ...projectDoc.data(),
          id: projectDoc.id
        }));

        if (isMounted && projectsList.length > 0) {
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
  const [editProjectForm, setEditProjectForm] = useState({ title: '', description: '', year: '', youtubeUrl: '', type: '2D', format: 'Cortometraje', duration: '05:00', patreonUrl: '' });
  const [editProjectGenres, setEditProjectGenres] = useState([]);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '', bio: '', banner: '', photo: '', patreonUrl: '', kofiUrl: '', websiteUrl: '', contactEmail: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedForumTopic, setSelectedForumTopic] = useState(null);

  // Carrusel
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prevIndex) => 
        prevIndex === CAROUSEL_ITEMS.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Buscador y Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterFormat, setFilterFormat] = useState('Todos');

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

  const [rejectionNote, setRejectionNote] = useState({});
  const [newTopicForm, setNewTopicForm] = useState({ title: '', category: 'Herramientas', content: '' });
  const [newCommentText, setNewCommentText] = useState('');

  // Proyectos Destacados para el Carrusel
  const featuredProjects = useMemo(() => {
    return projects.filter(p => p.status === 'approved' && p.isFeatured);
  }, [projects]);

  // PROYECTOS FILTRADOS (CON MAPEO MEJORADO)
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

      // Filtro Animación
      if (filterType !== 'Todos' && p.type !== filterType) return false;

      // Filtro Género
      if (filterGenre !== 'Todos') {
        const targetGenre = GENRE_MAP[filterGenre] || filterGenre.toLowerCase();
        const projectGenre = String(p.genre || '').toLowerCase();
        const projectGenres = Array.isArray(p.genres) 
          ? p.genres.map(g => String(g).toLowerCase()) 
          : [];

        const hasMatch = projectGenre === targetGenre || projectGenres.includes(targetGenre);
        if (!hasMatch) return false;
      }

      // Filtro Año
      if (filterYear !== 'Todos' && String(p.year) !== String(filterYear)) return false;

      // Filtro Formato / Tipo de Proyecto
      if (filterFormat !== 'Todos') {
        const targetFormat = filterFormat.toLowerCase();
        const projectFormat = String(p.format || '').toLowerCase();
        const matchesFormat = projectFormat === targetFormat || (filterFormat === 'Cortometraje' && !p.format);
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
    
    const genresMapped = selectedGenres.map(g => GENRE_MAP[g] || g.toLowerCase());
    const primaryGenre = genresMapped[0] || 'accion';

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
      genre: primaryGenre,
      genres: genresMapped.length ? genresMapped : [primaryGenre],
      format: newProjectForm.format || 'Cortometraje',
      year: newProjectForm.year || String(new Date().getFullYear()),
      duration: newProjectForm.duration || '05:00',
      description: newProjectForm.description.trim(),
      isFeatured: false,
      likesCount: 0,
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
      alert('No se pudo publicar el proyecto. Comprueba tu conexión e inténtalo de nuevo.');
    }
  };

  const handleApproveProject = async (id) => {
    try { 
      await updateDoc(doc(db, 'projects', id), { status: 'approved' }); 
      setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p)); 
    } catch (error) { 
      console.error('Error al aprobar el proyecto:', error); 
    }
  };

  const handleRejectProject = (id) => {
    const reason = rejectionNote[id] || 'El contenido no cumple con nuestras directrices comunitarias.';
    updateDoc(doc(db, 'projects', id), { status: 'rejected', rejectionReason: reason })
      .then(() => setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected', rejectionReason: reason } : p)))
      .catch(error => console.error('Error al rechazar el proyecto:', error));
  };

  const handleDeleteProject = async (projectId) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este proyecto?')) return;

    try {
      const projectRef = doc(db, 'projects', projectId);
      await deleteDoc(projectRef);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
      setSelectedProject(current => current?.id === projectId ? null : current);
      alert('Proyecto eliminado de Firestore.');
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
    }
  };

  const handleDeleteEpisode = async (projectId, seasonIndex, episodeIndex) => {
    if (!isAdmin) return;
    if (!window.confirm('¿Seguro que deseas eliminar este episodio?')) return;

    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      if (!projectSnap.exists()) return;

      const projectData = projectSnap.data();
      const seasons = Array.isArray(projectData.seasons) ? projectData.seasons : [];
      if (!seasons[seasonIndex] || !Array.isArray(seasons[seasonIndex].episodes)) return;

      const updatedSeasons = seasons.map((season, idx) => idx === seasonIndex
        ? { ...season, episodes: season.episodes.filter((_, epIdx) => epIdx !== episodeIndex) }
        : season
      );

      await updateDoc(projectRef, { seasons: updatedSeasons });
      setProjects(prevProjects => prevProjects.map(project => project.id === projectId ? { ...project, seasons: updatedSeasons } : project));
      setSelectedProject(current => current?.id === projectId ? { ...current, seasons: updatedSeasons } : current);
    } catch (error) {
      console.error('Error al eliminar el episodio:', error);
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
      patreonUrl: project.patreonUrl || ''
    });
    setEditingProject(project);
  };

  const handleSaveEditedProject = async (e) => {
    e.preventDefault();
    if (!editingProject || !user?.id) return;
    const ytId = editProjectForm.youtubeUrl.trim() ? extractYoutubeId(editProjectForm.youtubeUrl.trim()) : editingProject.youtubeId;
    const genresMapped = editProjectGenres.map(g => GENRE_MAP[g] || g.toLowerCase());
    const primaryGenre = genresMapped[0] || 'accion';

    const updates = {
      title: editProjectForm.title.trim(),
      description: editProjectForm.description.trim(),
      year: String(editProjectForm.year),
      youtubeId: ytId,
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      type: editProjectForm.type || '2D',
      format: editProjectForm.format || 'Cortometraje',
      genre: primaryGenre,
      genres: genresMapped,
      duration: editProjectForm.duration || '05:00',
      patreonUrl: editProjectForm.patreonUrl.trim()
    };

    try {
      await updateDoc(doc(db, 'projects', editingProject.id), updates);
      setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...updates } : p));
      setSelectedProject(prev => prev?.id === editingProject.id ? { ...prev, ...updates } : prev);
      setEditingProject(null);
      alert('Proyecto actualizado correctamente.');
    } catch (error) { 
      console.error('Error al editar proyecto:', error); 
    }
  };

  const handleDeleteOwnProject = async (project) => {
    if (!user?.id) return;
    if (!window.confirm('¿Quieres eliminar este proyecto?')) return;
    try {
      await deleteDoc(doc(db, 'projects', project.id));
      setProjects(prev => prev.filter(p => p.id !== project.id));
      setSelectedProject(null);
    } catch (error) { 
      console.error('Error al eliminar proyecto:', error); 
    }
  };

  useEffect(() => {
    if (!selectedProject?.id) return;
    const projectId = selectedProject.id;
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, viewsCount: (p.viewsCount || 0) + 1 } : p));
    setSelectedProject(prev => prev?.id === projectId ? { ...prev, viewsCount: (prev.viewsCount || 0) + 1 } : prev);
    updateDoc(doc(db, 'projects', projectId), { viewsCount: increment(1) })
      .catch(error => console.error('No se pudo registrar la visita:', error));
  }, [selectedProject?.id]);

  const openNewProduct = () => {
    if (!isAdmin) return;
    setEditingProductId(null);
    setProductForm({ title: '', category: 'Software', price: '', image: '', description: '', link: '' });
    setShowProductModal(true);
  };

  const openEditProduct = (product) => {
    if (!isAdmin) return;
    setEditingProductId(product.id);
    setProductForm({ title: product.title || '', category: product.category || 'Software', price: product.price || '', image: product.image || '', description: product.description || '', link: product.link || '' });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const payload = { ...productForm, title: productForm.title.trim(), description: productForm.description.trim(), updatedAt: new Date().toISOString() };
    const productId = editingProductId || `product_${Date.now()}`;
    try {
      await setDoc(doc(db, 'products', productId), payload, { merge: true });
      setProducts(prev => editingProductId ? prev.map(item => item.id === productId ? { ...payload, id: productId } : item) : [...prev, { ...payload, id: productId }]);
      setShowProductModal(false);
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!isAdmin) return;
    if (!window.confirm(`¿Eliminar el producto «${product.title}»?`)) return;
    try {
      await deleteDoc(doc(db, 'products', product.id));
      setProducts(prev => prev.filter(item => item.id !== product.id));
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleDeleteTopic = async (topic) => {
    if (!user?.id) return setShowAuthModal(true);
    if (!window.confirm(`¿Eliminar el tema «${topic.title}»?`)) return;
    try {
      await deleteDoc(doc(db, 'discussions', topic.id));
      setForumTopics(prev => prev.filter(item => item.id !== topic.id));
      setSelectedForumTopic(current => current?.id === topic.id ? null : current);
    } catch (error) {
      console.error('Error al eliminar tema:', error);
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
    if (!payload.name || !payload.email || !payload.message) return;

    setSendingContact(true);
    try {
      const response = await fetch('https://formsubmit.co/ajax/thelastopositor@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          subject: payload.subject,
          message: payload.message,
          _subject: payload.subject || 'Nuevo mensaje desde OnlyToon',
          _replyto: payload.email,
          _captcha: 'false'
        })
      });

      if (response.ok) {
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setShowContactModal(false);
        alert('Mensaje enviado con éxito.');
      }
    } catch (error) {
      console.error('Error al enviar mensaje de contacto:', error);
    } finally {
      setSendingContact(false);
    }
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!user?.id) return setShowAuthModal(true);
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
    try {
      await addDoc(collection(db, 'discussions'), topicPayload);
      setShowNewTopicModal(false);
      setNewTopicForm({ title: '', category: 'Herramientas', content: '' });
    } catch (error) {
      console.error('Error al crear la discusión:', error);
    }
  };

  const handleAddComment = async (topicId) => {
    const text = newCommentText.trim();
    if (!text || !user?.id) return;
    const comment = {
      author: user.name || 'Usuario',
      authorId: user.id,
      text,
      createdAt: new Date().toISOString()
    };
    try {
      const commentRef = await addDoc(collection(db, 'discussions', topicId, 'comments'), comment);
      const savedComment = { ...comment, id: commentRef.id };
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
    }
  };

  const processGoogleUser = async (firebaseUser) => {
    const email = (firebaseUser.email || '').toLowerCase();
    if (!email) return;

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
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processGoogleUser(result.user);
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

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
      })));

      setProjects(prev => prev.map(p => (p.creatorId === user.id || p.creatorEmail === user.email)
        ? { ...p, creator: updatedData.name, creatorName: updatedData.name, creatorPhoto: updatedData.photo, creatorBio: updatedData.bio } : p));

      setShowEditProfileModal(false);
      alert('¡Perfil actualizado con éxito!');
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
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
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-gray-100 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* TOPBAR / NAVEGACIÓN RESPONSIVA */}
      <header className="sticky top-0 z-40 bg-[#161618]/95 backdrop-blur-md border-b border-[#2e2e34] px-3 sm:px-4 lg:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4 w-full">
        <button
          type="button"
          onClick={() => { setActiveTab('explorar'); setMobileMenuOpen(false); }}
          className="flex items-center gap-2 cursor-pointer shrink-0 min-w-0"
        >
          <img
            src={onlyToonLogo}
            alt="OnlyToon — Independent Animation"
            className="h-14 sm:h-16 w-auto max-w-[48vw] object-contain"
          />
        </button>

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

        <nav className="hidden md:flex items-center gap-1 lg:gap-2 shrink-0">
          <button onClick={() => setActiveTab('explorar')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'explorar' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Explorar</button>
          <button onClick={() => setActiveTab('productos')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'productos' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Productos</button>
          <button onClick={() => setActiveTab('comunidad')} className={`px-3 py-2 rounded-lg text-sm font-medium ${activeTab === 'comunidad' ? 'bg-[#222226] text-blue-400' : 'text-gray-400 hover:text-white'}`}>Comunidad</button>
          {isAdmin && <button onClick={() => setActiveTab('admin')} className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 ${activeTab === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'text-amber-400 hover:bg-amber-500/10'}`}><ShieldCheck className="w-4 h-4" /><span>Moderación</span></button>}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button onClick={() => { setShowPublishWarning(true); setMobileMenuOpen(false); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-2 rounded-full flex items-center gap-1.5 whitespace-nowrap">
            <Plus className="w-4 h-4" /><span className="hidden sm:inline">Publicar</span>
          </button>
          {user ? (
            <button onClick={() => { setActiveTab('perfil'); setMobileMenuOpen(false); }} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-[#2e2e34] hover:border-blue-500 shrink-0" title={user.name}>
              <img src={user.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} alt={user.name || 'Perfil'} className="w-full h-full object-cover" />
            </button>
          ) : (
            <button onClick={handleGoogleLogin} className="text-xs sm:text-sm font-semibold text-gray-300 hover:text-white px-1.5 sm:px-3 py-2 flex items-center gap-1.5 whitespace-nowrap">
              <LogIn className="w-4 h-4" /><span className="hidden lg:inline">Iniciar sesión</span>
            </button>
          )}
          {user && <button type="button" onClick={handleLogout} className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-white px-2.5 py-2 rounded-lg border border-[#2e2e34] hover:bg-[#222226] whitespace-nowrap"><LogIn className="w-4 h-4 rotate-180" />Cerrar sesión</button>}
          <button type="button" onClick={() => setMobileMenuOpen(open => !open)} className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-[#222226]">
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

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">
        {activeTab === 'explorar' && (
          <div className="space-y-8 sm:space-y-12 pb-10 sm:pb-16 w-full overflow-x-hidden">
            {CAROUSEL_ITEMS.length > 0 && (
              <section className="relative w-full h-[390px] sm:h-[440px] lg:h-[560px] bg-[#1a1a1e] overflow-hidden border-b border-[#2e2e34]">
                <div className="absolute inset-0">
                  <img 
                    src={CAROUSEL_ITEMS[heroIndex]?.thumbnail} 
                    alt={CAROUSEL_ITEMS[heroIndex]?.title} 
                    className="w-full h-full object-cover opacity-100 scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/72 to-transparent" />
                </div>

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
                      {GENRES_LIST.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
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

                  {/* Filtro Proyecto */}
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Proyecto</label>
                    <select 
                      value={filterFormat}
                      onChange={(e) => setFilterFormat(e.target.value)}
                      className="bg-[#121212] border border-[#2e2e34] text-xs rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Todos">Todos</option>
                      {PROJECT_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

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

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{filteredProjects.length} proyectos encontrados</span>
              </div>

              {/* REJILLA DE PROYECTOS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="bg-[#1a1a1e] border border-[#2e2e34] rounded-xl overflow-hidden group hover:border-gray-500 transition-all flex flex-col justify-between"
                  >
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

                      {isAdmin && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

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

        {/* PESTAÑA PRODUCTOS */}
        {activeTab === 'productos' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">RECURSOS RECOMENDADOS</span>
              <h1 className="text-3xl font-bold text-white">Software y Hardware para Animación</h1>
              {isAdmin && <button onClick={openNewProduct} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2"><Plus className="w-4 h-4" />Agregar producto</button>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
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
                      <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{prod.description}</p>
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

        {/* PESTAÑA COMUNIDAD */}
        {activeTab === 'comunidad' && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">FORO Y DISCUSIÓN</span>
                <h1 className="text-3xl font-bold text-white">Comunidad de Creadores</h1>
              </div>

              <button 
                onClick={() => setShowNewTopicModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                Crear nuevo tema
              </button>
            </div>

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
                  </div>
                ))}
              </div>
            ) : (
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

        {/* PESTAÑA PERFIL */}
        {activeTab === 'perfil' && user && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="relative h-48 rounded-xl overflow-hidden shadow-lg bg-gray-800">
              <img
                src={user?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>

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
                      {isAdmin && (
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
            </div>
          </div>
        )}

        {/* PESTAÑA ADMIN */}
        {activeTab === 'admin' && isAdmin && (
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <div>
                <h2 className="text-base font-bold text-amber-400">Panel de Control Administrador</h2>
              </div>
            </div>

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
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-3 min-w-[240px]">
                      <button 
                        onClick={() => handleApproveProject(proj.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> Aprobar y publicar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL REPRODUCTOR */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
          <div className="bg-[#161618] border border-[#2e2e34] w-full max-w-5xl max-h-[92vh] rounded-3xl overflow-y-auto shadow-2xl my-auto">
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
                className="absolute top-4 right-4 bg-black/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-5 sm:px-7 lg:px-8 space-y-6">
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
                  <button onClick={() => handleShareProject(selectedProject)} className="bg-[#222226] hover:bg-[#2e2e34] text-gray-200 text-xs font-bold px-3 py-2.5 rounded-xl border border-[#2e2e34] flex items-center gap-1.5">
                    <Share2 className="w-4 h-4" /> Compartir
                  </button>
                </div>
              </section>

              <p className="text-sm text-gray-300 leading-relaxed bg-[#121212] p-4 rounded-xl border border-[#2e2e34]">
                {selectedProject.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#161618] border-t border-[#2e2e34] py-8 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">ONLYTOON</span>
            <span>— Historias que cobran vida.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowContactModal(true)} className="text-blue-300 hover:text-white font-semibold">Contacto</button>
            <p>© 2026 OnlyToon. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}