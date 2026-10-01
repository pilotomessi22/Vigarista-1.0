import React from 'react';
import { Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import { TicketmasterLogo } from './TicketmasterLogo';
import { ActiveView } from '../types';

interface FooterProps {
  setActiveView: (view: ActiveView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveView }) => {
  return (
    <footer className="w-full bg-[#0d131a] text-gray-400 text-xs pt-10 pb-12 px-4 sm:px-8 border-t border-gray-800">
      <div className="mx-auto max-w-7xl">
        {/* Columns Grid (Exact matching video 00:10 - 00:13) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 pb-10 border-b border-gray-800">
          {/* Col 1: ACESSO RÁPIDO */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Acesso Rápido
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  id="footer-link-minhas-compras"
                  onClick={() => {
                    setActiveView('order-details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left flex items-center gap-1.5"
                >
                  <span>Minhas Compras</span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    #74195357
                  </span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-meu-perfil"
                  onClick={() => {
                    setActiveView('order-details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors"
                >
                  Meu Perfil
                </button>
              </li>
              <li>
                <a href="#suporte" className="hover:text-white transition-colors">
                  Suporte ao Fã
                </a>
              </li>
              <li>
                <a href="#acessibilidade" className="hover:text-white transition-colors">
                  Acessibilidade
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: TERMOS E POLÍTICAS */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Termos e Políticas
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#termos" className="hover:text-white transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#compra" className="hover:text-white transition-colors">
                  Política de Compra
                </a>
              </li>
              <li>
                <a href="#cookies" className="hover:text-white transition-colors">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: SOBRE A TICKETMASTER */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">
              Sobre a Ticketmaster
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#brasil" className="hover:text-white transition-colors">
                  Ticketmaster Brasil
                </a>
              </li>
              <li>
                <a href="#internacional" className="hover:text-white transition-colors">
                  Ticketmaster Internacional
                </a>
              </li>
              <li>
                <a href="#carreiras" className="hover:text-white transition-colors">
                  Trabalhe com a gente
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section with Logo, Social Icons & CNPJ (Matches video 00:11) */}
        <div className="pt-8 flex flex-col items-center text-center space-y-4">
          <div>
            <TicketmasterLogo variant="white" size="lg" />
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-5 text-gray-400">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="hover:text-white transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white transition-colors"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
              className="hover:text-white transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          {/* Copyright & Official CNPJ */}
          <div className="space-y-1 text-gray-500 text-[11px]">
            <p>© 2025 Ticketmaster. Todos os direitos reservados.</p>
            <p className="font-mono">TICKETMASTER BRASIL LTDA – CNPJ 42.789.521/0001-10</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
