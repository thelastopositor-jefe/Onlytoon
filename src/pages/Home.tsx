import React, { useState } from 'react';
import { Project } from '../types';

interface HomeProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const Home: React.FC<HomeProps> = ({ projects, onSelectProject }) => {
  // Estado para los filtros avanzados
  const [selectedType, setSelectedType] = useState<string>('Todos');
  const [selectedGenre, setSelectedGenre] = useState<string>('Todos');
  const [selectedYear, setSelectedYear] = useState<string>('Todos');

  // Estado del Carrusel (Hero Section)
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroProjects = projects.slice(0, 5); // Tomamos hasta 5 proyectos para el carrusel

  // Filtrado de proyectos para la cuadrícula
  const filteredProjects = projects.filter((project) => {
    const matchesType = selectedType === 'Todos' || project.type === selectedType;
    const matchesGenre = selectedGenre === 'Todos' || project.genre.includes(selectedGenre);
    const matchesYear = selectedYear === 'Todos' || project.year.toString() === selectedYear;
    return matchesType && matchesGenre && matchesYear;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 pb-16">
      {/* 1. Carrusel Principal (Hero Section) */}
      {heroProjects.length > 0 && (
        <section className="relative w-full h-[450px] bg-black overflow-hidden shadow-lg">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-all duration-700"
            style={{ backgroundImage: `url(${heroProjects[currentSlide].bannerUrl})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto h-full px-6 flex flex-col justify-end pb-12">
            <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full w-max font-semibold mb-3">
              {heroProjects[currentSlide].type} • {heroProjects[currentSlide].year}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
              {heroProjects[currentSlide].title}
            </h1>
            <p className="text-gray-300 max-w-xl text-sm md:text-base mb-6 line-clamp-2">
              {heroProjects[currentSlide].synopsis}
            </p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onSelectProject(heroProjects[currentSlide])}
                className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors shadow-md flex items-center gap-2"
              >
                ▶ Ver ahora
              </button>
            </div>

            {/* Controles del carrusel */}
            <div className="absolute bottom-6 right-6 flex gap-2">
              {heroProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-white w-6' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. Menús de Búsqueda y Filtros Avanzados */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {/* Filtro Tipo de Animación */}
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="Todos">Tipo: Todos</option>
              <option value="3D">3D</option>
              <option value="2D">2D</option>
              <option value="Stop Motion">Stop Motion</option>
              <option value="Experimental">Experimental</option>
            </select>

            {/* Filtro Género */}
            <select 
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="Todos">Género: Todos</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Drama">Drama</option>
              <option value="Comedia">Comedia</option>
              <option value="Fantasía">Fantasía</option>
            </select>

            {/* Filtro Año */}
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="Todos">Año: Todos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <div className="text-sm text-gray-500 font-medium">
            Mostrando {filteredProjects.length} proyectos
          </div>
        </div>
      </section>

      {/* 3. Sección de Contenido (Grid de Proyectos Recientes) */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Proyectos Recientes</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img 
                  src={project.bannerUrl} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium">
                  {project.type}
                </span>
              </div>
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {project.synopsis}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-medium text-gray-700">
                    <img src={project.creatorAvatar} alt="" className="w-5 h-5 rounded-full object-cover bg-gray-200" />
                    {project.creator}
                  </span>
                  <span>❤️ {project.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
