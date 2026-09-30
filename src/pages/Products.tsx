import React, { useState } from 'react';
import { ProductItem } from '../types';

interface ProductsProps {
  products: ProductItem[];
}

export const Products: React.FC<ProductsProps> = ({ products }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Software', 'Hardware', 'Accesorios', 'Equipamiento'];

  const filteredProducts = products.filter(
    (product) => selectedCategory === 'Todos' || product.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-gray-900 pb-16">
      {/* Cabecera de la sección */}
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Productos y Herramientas</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-xl">
          Descubre el software, hardware y equipamiento recomendado por y para animadores independientes para potenciar tus proyectos.
        </p>

        {/* Filtros de categoría */}
        <div className="flex flex-wrap gap-2 mt-6">
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

      {/* Grid de Productos */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-md font-medium">
                    {product.category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <a 
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-900 text-white text-center py-2.5 rounded-xl text-xs font-bold hover:bg-black transition-colors block shadow-sm"
                >
                  Ver producto ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
