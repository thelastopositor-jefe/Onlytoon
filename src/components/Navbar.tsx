import React, { useState } from 'react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: { name: string; email: string; initials: string } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, user, onLogin, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full bg-[#fbf9f5] border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Logotipo */}
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => setCurrentView('home')}
      >
        <div className="bg-black text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-sm">
          <span>🎬</span>
          <span className="tracking-tight text-lg">OnlyToons</span>
        </div>
      </div>

      {/* Buscador Global */}
      <div className="hidden md:flex items-center relative w-96">
        <span className="absolute left-3 text-gray-400">🔍</span>
        <input 
          type="text" 
          placeholder="Buscar videos o creadores" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 shadow-inner"
        />
      </div>

      {/* Navegación y Perfil */}
      <nav className="flex items-center gap-6 text-sm font-medium text-gray-700">
        <button 
          onClick={() => setCurrentView('explore')} 
          className={`hover:text-black transition-colors ${currentView === 'explore' ? 'text-black font-semibold' : ''}`}
        >
          Explorar
        </button>
        <button 
          onClick={() => setCurrentView('products')} 
          className={`hover:text-black transition-colors ${currentView === 'products' ? 'text-black font-semibold' : ''}`}
        >
          Productos
        </button>
        <button 
          onClick={() => setCurrentView('community')} 
          className={`hover:text-black transition-colors ${currentView === 'community' ? 'text-black font-semibold' : ''}`}
        >
          Comunidad
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shadow-md focus:outline-none"
            >
              {user.initials}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button 
                  onClick={() => { setCurrentView('profile'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  👤 Mi perfil
                </button>
                <button 
                  onClick={() => { setCurrentView('create-project'); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  ➕ Crear proyecto
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => { onLogout(); setDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>G</span> Ingresar con Google
          </button>
        )}
      </nav>
    </header>
  );
};