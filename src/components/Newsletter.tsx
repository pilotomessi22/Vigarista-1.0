import React, { useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setSubmitted(false);
      }, 4000);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#0d3b66] via-[#026cdf] to-[#044389] py-10 px-4 sm:px-6 text-white my-6">
      {/* Background Subtle Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-xl text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
          Inscreva-se para saber as novidades
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-blue-100 font-medium">
          Fique por dentro de pré-vendas e ofertas exclusivas
        </p>

        {submitted ? (
          <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 p-3 text-sm font-semibold text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Obrigado! Seu e-mail foi cadastrado com sucesso.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              id="newsletter-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="flex-1 rounded-md bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-black"
            />
            <button
              id="newsletter-submit-btn"
              type="submit"
              className="rounded-md bg-black px-6 py-2.5 text-sm font-black tracking-wider text-white uppercase transition-all hover:bg-gray-900 active:scale-95"
            >
              Cadastrar
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
