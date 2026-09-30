import React, { useState } from 'react';
import { Project, Episode } from '../types';

interface WatchProps {
  project: Project;
  onBack: () => void;
  onToggleFavorite: (projectId: string) => void;
  isFavorite: boolean;
}

export const Watch: React.FC<WatchProps> = ({ project, onBack, onToggleFavorite, isFavorite }) => {
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(
    project.episodes && project.episodes.length > 0 ? project.episodes[0] : {
      id: '1',
      title: project.title,
      duration: '10:00',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Ejemplo por defecto
      thumbnail: project.bannerUrl
    }
  );

  const [likesCount, setLikesCount] = useState(project.likes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikesCount(likesCount + 1);
      setHasLiked(true);
    } else {
      setLikesCount(likesCount - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 pb-16">
      {/* Barra superior de navegación interna */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 transition-colors"
        >
          ← Volver al inicio
        </button>
        <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
          {project.type} • {project.year}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Principal: Reproductor y Detalles */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Reproductor Multimedia */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
            <iframe 
              src={currentEpisode.videoUrl} 
              title={currentEpisode.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Título e Interacciones */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="text-sm text-gray-500 mt-1">{currentEpisode.title}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Botón Me Gusta */}
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  hasLiked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>❤️</span> {likesCount}
              </button>

              {/* Botón Favorito */}
              <button 
                onClick={() => onToggleFavorite(project.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  isFavorite ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>🔖</span> {isFavorite ? 'Guardado' : 'Favorito'}
              </button>

              {/* Botón Compartir */}
              <button 
                onClick={() => alert('Enlace copiado al portapapeles')}
                className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                📤 Compartir
              </button>
            </div>
          </div>

          {/* Información del Creador y Botón Patreon */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src={project.creatorAvatar} 
                alt={project.creator} 
                className="w-14 h-14 rounded-full object-cover bg-gray-200 border border-gray-100"
              />
              <div>
                <h3 className="font-bold text-gray-900 text-base">{project.creator}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Creador Independiente de Animación</p>
              </div>
            </div>

            {project.patreonUrl && (
              <a 
                href={project.patreonUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-[#FF424D] text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-[#e03842] transition-colors shadow-md flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                🧡 Apoyar en Patreon
              </a>
            )}
          </div>

          {/* Sinopsis del Proyecto */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">Sinopsis</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{project.synopsis}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.genre.map((g, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-md font-medium">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Lateral: Panel de Episodios (si es serie o tiene varios) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Episodios</span>
              <span className="text-xs font-normal text-gray-500">{project.episodes?.length || 1} disponibles</span>
            </h3>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {project.episodes && project.episodes.length > 0 ? (
                project.episodes.map((ep) => (
                  <div 
                    key={ep.id}
                    onClick={() => setCurrentEpisode(ep)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      currentEpisode.id === ep.id 
                        ? 'border-purple-500 bg-purple-50/50' 
                        : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <img src={ep.thumbnail} alt={ep.title} className="w-24 aspect-video rounded-lg object-cover bg-gray-200" />
                    <div className="flex flex-col justify-center overflow-hidden">
                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{ep.title}</h4>
                      <span className="text-[11px] text-gray-500 mt-0.5">{ep.duration}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-6">Este proyecto cuenta con un contenido único.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
