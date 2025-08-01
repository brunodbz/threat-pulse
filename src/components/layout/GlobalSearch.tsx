import React, { useState, useRef, useEffect } from 'react';
import { Search, User, AlertTriangle, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'user' | 'alert' | 'event' | 'setting';
  description?: string;
  path: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'João Silva',
    type: 'user',
    description: 'Administrador',
    path: '/users'
  },
  {
    id: '2',
    title: 'Maria Santos',
    type: 'user', 
    description: 'Analista',
    path: '/users'
  },
  {
    id: '3',
    title: 'Tentativa de login suspeita',
    type: 'alert',
    description: 'Múltiplas tentativas de login falharam',
    path: '/alerts'
  },
  {
    id: '4',
    title: 'Configurações de segurança',
    type: 'setting',
    description: 'Alterar configurações do sistema',
    path: '/settings'
  },
  {
    id: '5',
    title: 'Evento de segurança crítico',
    type: 'event',
    description: 'Acesso não autorizado detectado',
    path: '/dashboard'
  }
];

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      // Filtrar resultados baseado na query
      const filtered = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    setQuery('');
    setIsOpen(false);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'alert':
        return <AlertTriangle className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'setting':
        return <Settings className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'user':
        return 'Usuário';
      case 'alert':
        return 'Alerta';
      case 'event':
        return 'Evento';
      case 'setting':
        return 'Configuração';
      default:
        return '';
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar eventos, usuários, alertas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-80"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 py-1">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          {results.map((result) => (
            <Button
              key={result.id}
              variant="ghost"
              className="w-full justify-start p-3 h-auto text-left hover:bg-accent"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{result.title}</p>
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  {result.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {result.description}
                    </p>
                  )}
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="p-4 text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum resultado encontrado para "{query}"</p>
          </div>
        </div>
      )}
    </div>
  );
}