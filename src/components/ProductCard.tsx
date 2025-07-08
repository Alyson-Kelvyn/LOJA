import React from 'react';
import { ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../lib/supabase';
import Button from './UI/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="small"
              onClick={() => onViewDetails(product)}
              className="transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver Detalhes
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => onAddToCart(product)}
              className="transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </div>
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Últimas unidades
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Esgotado
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-slate-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-amber-600">
            {formatPrice(product.price)}
          </div>
          <div className="text-sm text-slate-500">
            Estoque: {product.stock}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md"
            >
              {size}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => onViewDetails(product)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Detalhes
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="flex-1"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {product.stock === 0 ? 'Esgotado' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </div>
  );
}