import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="text-9xl font-bold text-slate-200 select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-slate-400" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-800">Página não encontrada</h1>
          <p className="text-slate-600">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Ir para Início</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Precisa de ajuda? Entre em contato conosco:
          </p>
          <a
            href="tel:+5585994015283"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            (85) 99401-5283
          </a>
        </div>
      </div>
    </div>
  );
}