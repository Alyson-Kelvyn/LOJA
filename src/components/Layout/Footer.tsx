import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-amber-500 text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">MenStyle</span>
            </div>
            <p className="text-slate-300 mb-4">
              Sua loja de roupas masculinas com estilo e qualidade. 
              Oferecemos as melhores peças para o homem moderno.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm font-bold">f</span>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm font-bold">@</span>
              </div>
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-amber-500 transition-colors cursor-pointer">
                <span className="text-sm font-bold">in</span>
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-slate-300 hover:text-white transition-colors">Início</a></li>
              <li><a href="/products" className="text-slate-300 hover:text-white transition-colors">Produtos</a></li>
              <li><a href="/products?category=Camisas" className="text-slate-300 hover:text-white transition-colors">Camisas</a></li>
              <li><a href="/products?category=Calças" className="text-slate-300 hover:text-white transition-colors">Calças</a></li>
              <li><a href="/products?category=Polos" className="text-slate-300 hover:text-white transition-colors">Polos</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-500" />
                <span className="text-slate-300">(85) 99401-5283</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-500" />
                <span className="text-slate-300">contato@menstyle.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                <span className="text-slate-300">Fortaleza, CE</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-300">
            &copy; 2024 MenStyle. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}