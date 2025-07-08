import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { state } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-slate-800 text-white p-2 rounded-lg">
              <User className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-800">MenStyle</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-slate-600 hover:text-slate-800 transition-colors">
              Início
            </Link>
            <Link to="/products" className="text-slate-600 hover:text-slate-800 transition-colors">
              Produtos
            </Link>
            <Link to="/products?category=Camisas" className="text-slate-600 hover:text-slate-800 transition-colors">
              Camisas
            </Link>
            <Link to="/products?category=Calças" className="text-slate-600 hover:text-slate-800 transition-colors">
              Calças
            </Link>
            <Link to="/products?category=Polos" className="text-slate-600 hover:text-slate-800 transition-colors">
              Polos
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-slate-600 hover:text-slate-800 transition-colors">
              <User className="h-6 w-6" />
            </Link>
            <Link to="/cart" className="relative text-slate-600 hover:text-slate-800 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {state.itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-600 hover:text-slate-800 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200">
          <div className="px-4 py-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>
          <nav className="px-4 py-2 space-y-2">
            <Link
              to="/"
              className="block py-2 text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/products"
              className="block py-2 text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Produtos
            </Link>
            <Link
              to="/products?category=Camisas"
              className="block py-2 text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Camisas
            </Link>
            <Link
              to="/products?category=Calças"
              className="block py-2 text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Calças
            </Link>
            <Link
              to="/products?category=Polos"
              className="block py-2 text-slate-600 hover:text-slate-800 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Polos
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}