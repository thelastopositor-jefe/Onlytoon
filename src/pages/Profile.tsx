import React, { useState } from 'react';
import { Project } from '../types';

interface ProfileProps {
  userProjects: Project[];
  favoriteProjects: Project[];
  onSelectProject: (project: project) => void;
  onCreateProject: (projectData: {
    title: string;
    synopsis: string;
    type: string;
    genre: string[];
    year: number;
    bannerUrl: string;
    patreonUrl: string;
  }) => void;
  onDeleteProject: (projectId: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({
  userProjects,
  favoriteProjects,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<'myProjects' | 'favorites'>('myProjects');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados del formulario para crear proyecto
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [type, setType] = useState('3D');
  const [genreInput, setGenreInput] = useState('Sci-Fi');
  const [year, setYear] = useState(2026);
  const [bannerUrl, setBannerUrl] = useState('');
  const [patreonUrl, setPatreonUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !synopsis || !bannerUrl || !patreonUrl) {
      alert('Por favor completa todos los campos obligatorios, incluyendo el enlace de Patreon.');
      return;
    }

    onCreateProject({
      title,
      synopsis,
      type,
      genre: [genreInput],
      year,
      bannerUrl,
      patreonUrl,
    });

    // Limpiar formulario y cerrar modal
    setTitle('');
    setSynopsis('');
    setBannerUrl('');
    setPatreonUrl('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 pb-16">
      {/* Cabecera del Perfil */}
      <div className="bg-white border-b border-gray-200 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" 
              alt="Avatar de Usuario" 
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-500 shadow-sm bg-gray-200"
            />
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Alex Creador</h1>
              <p className="text-sm text-gray-500 mt-0.5">Animador independiente y amante del 3D</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-600 font-medium">
                <span>👁️ 12.4k vistas</span>
                <span>❤️ 1.4k likes</span>
                <span>🔖 {favoriteProjects.length} favoritos</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
          >
            ➕ Crear proyecto
          </button>
        </div>
      </div>

      {/* Pestañas de Navegación del Perfil */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex border-b border-gray-200 gap-8">
          <button
            onClick={() => setActiveTab('myProjects')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'myProjects' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Mis Proyectos ({userProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
              activeTab === 'favorites' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Favoritos Guardados ({favoriteProjects.length})
          </button>
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="mt-8">
          {activeTab === 'myProjects' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userProjects.length > 0 ? (
                userProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer" onClick={() => onSelectProject(project)}>
                        <img src={project.bannerUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md font-medium">
                          {project.type}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-base text-gray-900 line-clamp-1">{project.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.synopsis}</p>
                      </div>
                    </div>
                    <div className="p-4 pt-0 flex items-center justify-between border-t border-gray-100 mt-4">
                      <a href={project.patreonUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF424D] font-bold hover:underline">
                        Patreon ↗
                      </a>
                      <button 
                        onClick={() => onDeleteProject(project.id)}
                        className="text-xs text-red-500 font-medium hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                  Aún no has subido ningún proyecto. ¡Haz clic en "Crear proyecto" para empezar!
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteProjects.length > 0 ? (
                favoriteProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                  >
                    <div className="relative aspect-video bg-gray-100 overflow-hidden">
                      <img src={project.bannerUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-base text-gray-900 line-clamp-1">{project.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.synopsis}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
                  No tienes proyectos guardados en favoritos todavía.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal para Crear Proyecto (Con enlace obligatorio de Patreon) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subir nuevo proyecto de animación</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título del Proyecto</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Ej. Cyberpunk Chronicles" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Tipo</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-purple-500"
                  >
                    <option value="3D">3D</option>
                    <option value="2D">2D</option>
                    <option value="Stop Motion">Stop Motion</option>
                    <option value="Experimental">Experimental</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Año</label>
                  <input 
                    type="number" 
                    value={year} 
                    onChange={(e) => setYear(Number(e.target.value))} 
                    required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Género principal</label>
                <input 
                  type="text" 
                  value={genreInput} 
                  onChange={(e) => setGenreInput(e.target.value)} 
                  placeholder="Ej. Sci-Fi, Fantasía, Comedia" 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL de la Miniatura / Banner (Imagen)</label>
                <input 
                  type="url" 
                  value={bannerUrl} 
                  onChange={(e) => setBannerUrl(e.target.value)} 
                  placeholder="https://images.unsplash.com/..." 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-600 mb-1">Enlace de Apoyo (Patreon) *Obligatorio*</label>
                <input 
                  type="url" 
                  value={patreonUrl} 
                  onChange={(e) => setPatreonUrl(e.target.value)} 
                  placeholder="https://patreon.com/tu_usuario" 
                  required 
                  className="w-full bg-red-50/50 border border-red-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Este enlace se mostrará con un botón directo en tu reproductor.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sinopsis</label>
                <textarea 
                  value={synopsis} 
                  onChange={(e) => setSynopsis(e.target.value)} 
                  placeholder="De qué trata tu animación..." 
                  rows={3} 
                  required 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:border-purple-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Publicar proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
