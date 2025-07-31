import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Eye, User, Filter, RefreshCw } from 'lucide-react';
import { SecurityEvent } from '@/types/security';
import { mockApi } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

// Função para carregar configurações do localStorage
const loadAlertSettings = () => {
  try {
    const stored = localStorage.getItem('alerts-filters');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar filtros de alertas:', error);
  }
  return {
    source: 'all',
    severity: 'all',
    status: 'all',
    search: ''
  };
};

// Função para salvar filtros no localStorage
const saveAlertFilters = (filters: any) => {
  try {
    localStorage.setItem('alerts-filters', JSON.stringify(filters));
  } catch (error) {
    console.error('Erro ao salvar filtros de alertas:', error);
  }
};

export default function AlertsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => loadAlertSettings());
  const { toast } = useToast();

  // Função para atualizar filtros e salvar no localStorage
  const updateFilters = (newFilters: any) => {
    setFilters(newFilters);
    saveAlertFilters(newFilters);
  };

  useEffect(() => {
    loadEvents();
  }, [filters.source, filters.severity, filters.status]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getEvents({
        source: filters.source === 'all' ? undefined : filters.source || undefined,
        severity: filters.severity === 'all' ? undefined : filters.severity || undefined,
        status: filters.status === 'all' ? undefined : filters.status || undefined
      });
      setEvents(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar alertas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-critical text-white';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-orange-500 text-white';
      case 'low': return 'bg-success text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-critical text-white';
      case 'investigating': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-white';
      case 'false_positive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    event.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  const stats = {
    total: events.length,
    critical: events.filter(e => e.severity === 'critical').length,
    open: events.filter(e => e.status === 'open').length,
    investigating: events.filter(e => e.status === 'investigating').length
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas de Segurança</h1>
          <p className="text-muted-foreground">Monitoramento e gestão de eventos de segurança</p>
        </div>
        <Button onClick={loadEvents} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <Eye className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.open}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investigando</CardTitle>
            <User className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.investigating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Buscar alertas..."
              value={filters.search}
              onChange={(e) => updateFilters({ ...filters, search: e.target.value })}
            />
            
            <Select value={filters.source} onValueChange={(value) => updateFilters({ ...filters, source: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fontes</SelectItem>
                <SelectItem value="elastic">Elastic</SelectItem>
                <SelectItem value="trellix">Trellix</SelectItem>
                <SelectItem value="defender">Defender</SelectItem>
                <SelectItem value="tenable">Tenable</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(value) => updateFilters({ ...filters, severity: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Severidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => updateFilters({ ...filters, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="investigating">Investigando</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
                <SelectItem value="false_positive">Falso Positivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Nenhum alerta encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {event.source}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-3">{event.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{event.timestamp.toLocaleString('pt-BR')}</span>
                      {event.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.assignee}
                        </span>
                      )}
                      {event.details?.ip && (
                        <span>IP: {event.details.ip}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}