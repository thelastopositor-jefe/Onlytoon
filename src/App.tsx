import React, { useState } from 'react';
import { Project, CommunityPost, ProductItem } from './types';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { Products } from './pages/Products';
import { Community } from './pages/Community';
import { Profile } from './pages/Profile';

// Datos iniciales de prueba para el MVP
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Cyberpunk Chronicles: Episode 1',
    synopsis: 'En un futuro distópico, un hacker solitario descubre una anomalía en la red que amenaza con colapsar los sectores flotantes de la megalópolis.',
    type: '3D',
    genre: ['Sci-Fi', 'Acción'],
    year: 2026,
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    creator: 'Studio Neon',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    likes: 342,
    patreonUrl: 'https://patreon.com',
    episodes: [
      { id: 'e1', title: 'Episodio 1: Despertar', duration: '12:45', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' },
      { id: 'e2', title: 'Episodio 2: La Red Oculta', duration: '15:20', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400' }
    ]
  },
  {
    id: '2',
    title: 'El Viaje de Kibo',
    synopsis: 'Un tierno cortometraje sobre un pequeño espíritu del bosque que emprende un largo viaje para encontrar la fuente de la luz eterna.',
    type: '2D',
    genre: ['Fantasía', 'Drama'],
    year: 2025,
    bannerUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200',
    creator: 'Kibo Animation',
    creatorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    likes: 890,
    patreonUrl: 'https://patreon.com'
  }
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'p1',
    name: 'Blender 3D (Guía Avanzada)',
    description: 'El software de código abierto estándar de la industria para modelado, rigging y animación 3D.',
    category: 'Software',
    image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=600',
    affiliateUrl: 'https://blender.org'
  },
  {
    id: 'p2',
    name: 'Tableta Gráfica Pro X',
    description: 'Superficie de dibujo con alta sensibilidad a la presión ideal para animadores 2D y artistas de concept art.',
    category: 'Hardware',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600',
    affiliateUrl: 'https://example.com'
  }
];

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'c1',
    title: '¿Qué motor de renderizado prefieren para proyectos 3D independientes?',
    category: 'Herramientas',
    content: 'Hola a todos, estoy evaluando opciones entre Cycles y Eevee para optimizar tiempos de entrega en mi serie animada. ¿Cuáles son sus experiencias?',
    author: 'Carlos Animation',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    date: 'Hace 2 horas',
    commentsCount: 14,
    likes: 28
  }
];

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'watch' | 'products' | 'community' | 'profile'>('home');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [userProjects, setUserProjects] = useState<Project[]>([INITIAL_PROJECTS[0]]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['2']);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [products] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);

  // Manejador para cambiar a la vista de reproducción
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('watch');
  };

  // Manejador de favoritos
  const handleToggleFavorite = (projectId: string) => {
    setFavoriteIds((prev) => 
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  // Crear nuevo proyecto (con Patreon obligatorio)
  const handleCreateProject = (projectData: {
    title: string;
    synopsis: string;
    type: string;
    genre: string[];
    year: number;
    bannerUrl: string;
    patreonUrl: string;
  }) => {
    const newProj: Project = {
      id: Date.now().toString(),
      ...projectData,
      creator: 'Alex Creador',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      likes: 0,
      episodes: [
        {
          id: 'ep-1',
          title: projectData.title,
          duration: '10:00',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: projectData.bannerUrl
        }
      ]
    };

    setProjects([newProj, ...projects]);
    setUserProjects([newProj, ...userProjects]);
    alert('¡Proyecto publicado con éxito!');
  };

  // Eliminar proyecto del usuario
  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setUserProjects(userProjects.filter(p => p.id !== projectId));
  };

  // Agregar post a la comunidad
  const handleAddPost = (postData: { title: string; category: string; content: string }) => {
    const newPost: CommunityPost = {
      id: Date.now().toString(),
      ...postData,
      author: 'Alex Creador',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      date: 'Justo ahora',
      commentsCount: 0,
      likes: 0
    };
    setPosts([newPost, ...posts]);
  };

  const favoriteProjects = projects.filter(p => favoriteIds.includes(p.id));

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans flex flex-col justify-between">
      {/* Barra de Navegación Superior */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span 
              onClick={() => setCurrentView('home')} 
              className="text-xl font-black tracking-tight text-black cursor-pointer flex items-center gap-2"
            >
              🎬 OnlyToons
            </span>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <button onClick={() => setCurrentView('home')} className={`hover:text-black transition-colors ${currentView === 'home' ? 'text-black font-bold' : ''}`}>Explorar</button>
              <button onClick={() => setCurrentView('products')} className={`hover:text-black transition-colors ${currentView === 'products' ? 'text-black font-bold' : ''}`}>Productos</button>
              <button onClick={() => setCurrentView('community')} className={`hover:text-black transition-colors ${currentView === 'community' ? 'text-black font-bold' : ''}`}>Comunidad</button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-full text-xs font-bold transition-colors"
            >
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" alt="Perfil" className="w-5 h-5 rounded-full object-cover" />
              Mi Perfil
            </button>
          </div>
        </div>
      </header>

      {/* Renderizado condicional de vistas */}
      <main className="flex-grow">
        {currentView === 'home' && (
          <Home projects={projects} onSelectProject={handleSelectProject} />
        )}
        {currentView === 'watch' && selectedProject && (
          <Watch 
            project={selectedProject} 
            onBack={() => setCurrentView('home')} 
            onToggleFavorite={handleToggleFavorite}
            isFavorite={favoriteIds.includes(selectedProject.id)}
          />
        )}
        {currentView === 'products' && (
          <Products products={products} />
        )}
        {currentView === 'community' && (
          <Community posts={posts} onAddPost={handleAddPost} />
        )}
        {currentView === 'profile' && (
          <Profile 
            userProjects={userProjects}
            favoriteProjects={favoriteProjects}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
      </main>

      {/* Pie de página institucional */}
      <footer className="bg-white border-t border-gray-200 py-8 px-6 text-center text-xs text-gray-400">
        <p>© 2026 OnlyToons. Plataforma independiente para creadores de animación.</p>
      </footer>
    </div>
  );
}

export default App;
