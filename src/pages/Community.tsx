import React, { useState } from 'react';
import { CommunityPost } from '../types';

interface CommunityProps {
  posts: CommunityPost[];
  onAddPost: (post: { title: string; category: string; content: string }) => void;
}

export const Community: React.FC<CommunityProps> = ({ posts, onAddPost }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Estados para el formulario de nuevo post
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Herramientas');
  const [newContent, setNewContent] = useState('');

  const categories = ['Todos', 'Herramientas', 'Proceso', 'Colaboraciones', 'Inspiración'];

  const filteredPosts = posts.filter(
    (post) => selectedCategory === 'Todos' || post.category === selectedCategory
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    onAddPost({
      title: newTitle,
      category: newCategory,
      content: newContent,
    });

    // Limpiar formulario y cerrar modal
    setNewTitle('');
    setNewContent('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 pb-16">
      {/* Cabecera */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Comunidad y Foro</h1>
          <p className="text-sm text-gray-500 mt-2">
            Comparte tus experiencias, aprende sobre herramientas y encuentra colaboradores para tus proyectos de animación.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2 w-full md:w-auto"
        >
          ✍️ Publicar tema
        </button>
      </div>

      {/* Filtros de categoría */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listado de publicaciones del foro */}
      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-4">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div 
              key={post.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full font-semibold">
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  <img src={post.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover bg-gray-200" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span>💬 {post.commentsCount} comentarios</span>
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
            No hay publicaciones en esta categoría todavía. ¡Sé el primero en compartir algo!
          </div>
        )}
      </div>

      {/* Modal para Crear Publicación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Crear nueva publicación</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. ¿Qué software recomiendan para 2D?"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Categoría</label>
                <select 
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="Herramientas">Herramientas</option>
                  <option value="Proceso">Proceso</option>
                  <option value="Colaboraciones">Colaboraciones</option>
                  <option value="Inspiración">Inspiración</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mensaje</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Escribe los detalles de tu consulta o aporte..."
                  rows={4}
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
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
