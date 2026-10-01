import React, { useState, useEffect } from 'react';
import { Search, X, Activity, Sparkles, Mic, MicOff, ArrowRight } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (category: string) => void;
  onTriggerAnalysis?: () => void;
  onTriggerQuentroV2?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  searchTerm = '',
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onTriggerAnalysis,
  onTriggerQuentroV2,
}) => {
  const [query, setQuery] = useState(searchTerm);

  const {
    isListening,
    isSupported: isVoiceSupported,
    toggleListening,
    error: voiceError,
  } = useVoiceSearch((text) => {
    handleInputChange(text);
  });

  useEffect(() => {
    setQuery(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    const clean = value.trim().toLowerCase();

    // Direct trigger if user typed exact quentrov2
    if (
      clean === 'quentrov2' ||
      clean === 'quentro v2' ||
      clean === 'quentro-v2' ||
      clean === 'quentro2'
    ) {
      if (onTriggerQuentroV2) {
        setQuery('');
        if (typeof setSearchTerm === 'function') {
          setSearchTerm('');
        }
        onTriggerQuentroV2();
        return;
      }
    }

    if (typeof onSearch === 'function') {
      onSearch(value);
    }
    if (typeof setSearchTerm === 'function') {
      setSearchTerm(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim().toLowerCase();
    
    // Trigger quentrov2 when searching
    if (
      clean === 'quentrov2' ||
      clean === 'quentro v2' ||
      clean === 'quentro-v2' ||
      clean === 'quentro2' ||
      clean.includes('quentrov2')
    ) {
      setQuery('');
      if (typeof setSearchTerm === 'function') {
        setSearchTerm('');
      }
      if (onTriggerQuentroV2) {
        onTriggerQuentroV2();
      }
      return;
    }

    // Only trigger analysis when explicitly confirmed
    if (clean === 'analise' || clean === 'análise') {
      setQuery('');
      if (typeof setSearchTerm === 'function') {
        setSearchTerm('');
      }
      if (onTriggerAnalysis) {
        onTriggerAnalysis();
      }
      return;
    }

    if (typeof onSearch === 'function') {
      onSearch(query);
    }
    if (typeof setSearchTerm === 'function') {
      setSearchTerm(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (typeof onSearch === 'function') {
      onSearch('');
    }
    if (typeof setSearchTerm === 'function') {
      setSearchTerm('');
    }
  };

  const isAnalysisMatch = query.trim().toLowerCase().includes('analis');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 -mt-6 sm:-mt-8 relative z-30 space-y-2">
      <form
        onSubmit={handleSubmit}
        id="search-form"
        className={`flex items-center bg-white rounded-full shadow-xl border ${
          isListening ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-gray-200/90'
        } p-1.5 transition-all focus-within:ring-2 focus-within:ring-[#026cdf] focus-within:border-transparent relative`}
      >
        <div className="pl-3 sm:pl-4 text-gray-400">
          <Search className="h-4 sm:h-5 w-4 sm:w-5" />
        </div>

        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            isListening
              ? '🎙️ Ouvindo... Fale o nome do artista ou evento'
              : "Pesquisar artista ou evento (ou clique no microfone)"
          }
          className="flex-1 bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer"
            title="Limpar pesquisa"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Web Speech API Voice Search Button */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 mr-1 rounded-full transition-all cursor-pointer flex items-center justify-center ${
              isListening
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 animate-pulse ring-2 ring-emerald-400'
                : 'text-gray-400 hover:text-[#026cdf] hover:bg-gray-100'
            }`}
            title={isListening ? 'Parar escuta de voz' : 'Buscar por comando de voz'}
          >
            {isListening ? (
              <div className="flex items-center gap-0.5 px-0.5">
                <span className="w-1 h-3 bg-white rounded-full animate-[bounce_0.6s_infinite]" />
                <span className="w-1 h-4 bg-white rounded-full animate-[bounce_0.6s_infinite_0.2s]" />
                <span className="w-1 h-2 bg-white rounded-full animate-[bounce_0.6s_infinite_0.4s]" />
              </div>
            ) : (
              <Mic className="h-4 sm:h-5 w-4 sm:w-5" />
            )}
          </button>
        )}

        <button
          id="search-button"
          type="submit"
          className="flex items-center gap-2 rounded-full bg-black px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition-transform hover:bg-gray-800 active:scale-95 whitespace-nowrap cursor-pointer shadow-md"
        >
          <span>Pesquisar</span>
          <Search className="h-4 w-4 hidden sm:inline" />
        </button>
      </form>

      {/* Voice Listening Feedback Toast */}
      {isListening && (
        <div className="p-2.5 bg-gray-900/95 text-white rounded-2xl shadow-xl border border-emerald-500/40 flex items-center justify-between text-xs font-medium animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Escutando comando de voz:</span>
            <span className="text-emerald-300 font-bold italic truncate max-w-[240px]">
              {query ? `"${query}"` : 'Fale agora...'}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleListening}
            className="px-2.5 py-1 bg-emerald-500 text-gray-950 font-bold rounded-lg text-xs hover:bg-emerald-400 cursor-pointer"
          >
            Concluir
          </button>
        </div>
      )}

      {voiceError && !isListening && (
        <div className="p-2 bg-red-900/90 text-red-200 text-xs rounded-xl text-center border border-red-500/30">
          ⚠️ {voiceError}
        </div>
      )}

      {/* Quick Action when typing "analise" */}
      {isAnalysisMatch && (
        <div className="flex justify-center animate-in fade-in slide-in-from-top-1">
          <button
            type="button"
            id="btn-quick-analise-trigger"
            onClick={() => {
              if (onTriggerAnalysis) onTriggerAnalysis();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-xs shadow-lg hover:shadow-blue-500/25 active:scale-95 transition-all cursor-pointer border border-blue-400/30"
          >
            <Activity className="w-3.5 h-3.5 animate-spin" />
            <span>Comando detectado: Clique aqui para iniciar a <strong>Análise do Site</strong></span>
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          </button>
        </div>
      )}
    </div>
  );
};
