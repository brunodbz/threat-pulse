import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Database, Plus, Settings, Activity, AlertCircle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { usePermissions } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  lastSync: Date | null;
  icon: string;
  config: {
    endpoint?: string;
    apiKey?: string;
    accessKey?: string;
    secretKey?: string;
    enabled: boolean;
  };
  metrics: {
    eventsToday: number;
    totalEvents: number;
    errorRate: number;
  };
}

interface ThreatFeed {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastUpdate: Date | null;
  format: 'STIX' | 'CSV' | 'JSON' | 'XML';
  url: string;
  frequency: string;
  indicators: number;
}

const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: '1',
    name: 'Elastic SIEM',
    type: 'SIEM',
    description: 'Elasticsearch Security Information and Event Management',
    status: 'connected',
    lastSync: new Date(),
    icon: '🔍',
    config: {
      endpoint: 'https://elastic.empresa.com:9200',
      apiKey: 'es_***************',
      enabled: true,
    },
    metrics: {
      eventsToday: 1247,
      totalEvents: 45632,
      errorRate: 0.2,
    },
  },
  {
    id: '2',
    name: 'Trellix ESM',
    type: 'EDR',
    description: 'Trellix Endpoint Security Manager',
    status: 'connected',
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    icon: '🛡️',
    config: {
      endpoint: 'https://trellix.empresa.com/api',
      apiKey: 'tx_***************',
      enabled: true,
    },
    metrics: {
      eventsToday: 892,
      totalEvents: 23451,
      errorRate: 0.1,
    },
  },
  {
    id: '3',
    name: 'Microsoft Defender',
    type: 'ATP',
    description: 'Microsoft Defender for Endpoint',
    status: 'error',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: '🔒',
    config: {
      endpoint: 'https://api.securitycenter.microsoft.com',
      apiKey: 'ms_***************',
      enabled: true,
    },
    metrics: {
      eventsToday: 0,
      totalEvents: 15678,
      errorRate: 5.2,
    },
  },
  {
    id: '4',
    name: 'Tenable.io',
    type: 'Vulnerability Scanner',
    description: 'Tenable Vulnerability Management',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000),
    icon: '🔍',
    config: {
      endpoint: 'https://cloud.tenable.com/api',
      apiKey: 'tn_***************',
      enabled: true,
    },
    metrics: {
      eventsToday: 234,
      totalEvents: 8965,
      errorRate: 0.5,
    },
  },
  {
    id: '5',
    name: 'Splunk Enterprise',
    type: 'Log Management',
    description: 'Splunk Enterprise Security',
    status: 'disconnected',
    lastSync: null,
    icon: '📊',
    config: {
      endpoint: '',
      apiKey: '',
      enabled: false,
    },
    metrics: {
      eventsToday: 0,
      totalEvents: 0,
      errorRate: 0,
    },
  },
];

const MOCK_THREAT_FEEDS: ThreatFeed[] = [
  {
    id: '1',
    name: 'MISP Threat Intelligence',
    type: 'MISP Feed',
    description: 'Feed de IOCs do MISP para detecção de ameaças',
    status: 'active',
    lastUpdate: new Date(),
    format: 'STIX',
    url: 'https://misp.empresa.com/feeds/export',
    frequency: '1 hora',
    indicators: 15847
  },
  {
    id: '2',
    name: 'AlienVault OTX',
    type: 'Commercial Feed',
    description: 'Open Threat Exchange da AT&T Cybersecurity',
    status: 'active',
    lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
    format: 'JSON',
    url: 'https://otx.alienvault.com/api/v1/indicators',
    frequency: '30 minutos',
    indicators: 25634
  },
  {
    id: '3',
    name: 'Emerging Threats',
    type: 'Rules Feed',
    description: 'Feed de regras Suricata para IDS/IPS',
    status: 'active',
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    format: 'CSV',
    url: 'https://rules.emergingthreats.net/open/suricata',
    frequency: '6 horas',
    indicators: 8923
  },
  {
    id: '4',
    name: 'VirusTotal Intelligence',
    type: 'Commercial Feed',
    description: 'Feed premium do VirusTotal',
    status: 'error',
    lastUpdate: null,
    format: 'JSON',
    url: 'https://www.virustotal.com/api/v3/intelligence',
    frequency: '15 minutos',
    indicators: 0
  }
];

// Função para carregar feeds do localStorage
const loadThreatFeeds = (): ThreatFeed[] => {
  try {
    const stored = localStorage.getItem('threat-feeds-data');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar feeds:', error);
  }
  return MOCK_THREAT_FEEDS;
};

// Função para salvar feeds no localStorage
const saveThreatFeeds = (feeds: ThreatFeed[]) => {
  try {
    localStorage.setItem('threat-feeds-data', JSON.stringify(feeds));
  } catch (error) {
    console.error('Erro ao salvar feeds:', error);
  }
};

// Função para carregar integrações do localStorage
const loadIntegrations = (): Integration[] => {
  try {
    const stored = localStorage.getItem('integrations-data');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar integrações:', error);
  }
  return MOCK_INTEGRATIONS;
};

// Função para salvar integrações no localStorage
const saveIntegrations = (integrations: Integration[]) => {
  try {
    localStorage.setItem('integrations-data', JSON.stringify(integrations));
  } catch (error) {
    console.error('Erro ao salvar integrações:', error);
  }
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(() => loadIntegrations());
  const [threatFeeds, setThreatFeeds] = useState<ThreatFeed[]>(() => loadThreatFeeds());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedDialogOpen, setFeedDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [editingFeed, setEditingFeed] = useState<ThreatFeed | null>(null);
  const [currentName, setCurrentName] = useState('');
  const permissions = usePermissions();
  const { toast } = useToast();

  // Função para atualizar integrações e salvar no localStorage
  const updateIntegrations = (newIntegrations: Integration[]) => {
    setIntegrations(newIntegrations);
    saveIntegrations(newIntegrations);
  };

  // Função para atualizar feeds e salvar no localStorage
  const updateThreatFeeds = (newFeeds: ThreatFeed[]) => {
    setThreatFeeds(newFeeds);
    saveThreatFeeds(newFeeds);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return 'bg-success text-white';
      case 'disconnected':
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-critical text-white';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected':
      case 'inactive': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'error': return 'Erro';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const handleToggleIntegration = (id: string) => {
    const newIntegrations = integrations.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            config: { ...integration.config, enabled: !integration.config.enabled },
            status: (integration.config.enabled ? 'disconnected' : 'connected') as Integration['status']
          }
        : integration
    );
    updateIntegrations(newIntegrations);
    
    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Sucesso",
      description: `${integration?.name} ${integration?.config.enabled ? 'desabilitada' : 'habilitada'} com sucesso`
    });
  };

  const handleTestConnection = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    toast({
      title: "Teste de Conexão",
      description: `Testando conexão com ${integration?.name}...`
    });
    
    // Simulate test
    setTimeout(() => {
      toast({
        title: "Sucesso",
        description: `Conexão com ${integration?.name} estabelecida com sucesso`
      });
    }, 2000);
  };

  const handleCreateFeed = () => {
    setEditingFeed(null);
    setFeedDialogOpen(true);
  };

  const handleEditFeed = (feed: ThreatFeed) => {
    setEditingFeed(feed);
    setFeedDialogOpen(true);
  };

  const handleSaveFeed = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const url = formData.get('url') as string;
    const format = formData.get('format') as ThreatFeed['format'];
    const frequency = formData.get('frequency') as string;
    const active = formData.get('active') === 'on';

    if (editingFeed) {
      const updatedFeeds = threatFeeds.map(feed => 
        feed.id === editingFeed.id 
          ? { 
              ...feed, 
              name, 
              type, 
              description,
              url,
              format,
              frequency,
              status: (active ? 'active' : 'inactive') as ThreatFeed['status'],
              lastUpdate: new Date()
            }
          : feed
      );
      updateThreatFeeds(updatedFeeds);
      toast({
        title: "Sucesso",
        description: "Feed atualizado com sucesso"
      });
    } else {
      const newFeed: ThreatFeed = {
        id: Date.now().toString(),
        name,
        type,
        description,
        url,
        format,
        frequency,
        status: (active ? 'active' : 'inactive') as ThreatFeed['status'],
        lastUpdate: active ? new Date() : null,
        indicators: 0
      };
      updateThreatFeeds([...threatFeeds, newFeed]);
      toast({
        title: "Sucesso",
        description: "Novo feed criado com sucesso"
      });
    }
    
    setFeedDialogOpen(false);
  };

  const handleDeleteFeed = (id: string) => {
    const feed = threatFeeds.find(f => f.id === id);
    const newFeeds = threatFeeds.filter(f => f.id !== id);
    updateThreatFeeds(newFeeds);
    toast({
      title: "Sucesso",
      description: `${feed?.name} removido com sucesso`
    });
  };

  const handleToggleFeed = (id: string) => {
    const newFeeds = threatFeeds.map(feed => 
      feed.id === id 
        ? { 
            ...feed, 
            status: (feed.status === 'active' ? 'inactive' : 'active') as ThreatFeed['status'],
            lastUpdate: feed.status === 'inactive' ? new Date() : feed.lastUpdate
          }
        : feed
    );
    updateThreatFeeds(newFeeds);
    
    const feed = threatFeeds.find(f => f.id === id);
    toast({
      title: "Sucesso",
      description: `${feed?.name} ${feed?.status === 'active' ? 'desativado' : 'ativado'} com sucesso`
    });
  };

  const handleCreateIntegration = () => {
    setEditingIntegration(null);
    setCurrentName('');
    setDialogOpen(true);
  };

  const handleEditIntegration = (integration: Integration) => {
    setEditingIntegration(integration);
    setCurrentName(integration.name);
    setDialogOpen(true);
  };

  const handleSaveIntegration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string;
    const endpoint = formData.get('endpoint') as string;
    const apiKey = formData.get('apiKey') as string;
    const accessKey = formData.get('accessKey') as string;
    const secretKey = formData.get('secretKey') as string;
    const enabled = formData.get('enabled') === 'on';

    console.log('Salvando integração:', { name, type, description, endpoint, apiKey, accessKey, secretKey, enabled });

    if (editingIntegration) {
      const updatedIntegrations = integrations.map(integration => 
        integration.id === editingIntegration.id 
          ? { 
              ...integration, 
              name, 
              type, 
              description,
              config: { endpoint, apiKey, accessKey, secretKey, enabled },
              status: (enabled ? 'connected' : 'disconnected') as Integration['status'],
              lastSync: new Date()
            }
          : integration
      );
      updateIntegrations(updatedIntegrations);
      toast({
        title: "Sucesso",
        description: "Integração atualizada com sucesso"
      });
    } else {
      const newIntegration: Integration = {
        id: Date.now().toString(),
        name,
        type,
        description,
        status: (enabled ? 'connected' : 'disconnected') as Integration['status'],
        lastSync: enabled ? new Date() : null,
        icon: '🔗',
        config: { endpoint, apiKey, accessKey, secretKey, enabled },
        metrics: {
          eventsToday: 0,
          totalEvents: 0,
          errorRate: 0
        }
      };
      updateIntegrations([...integrations, newIntegration]);
      toast({
        title: "Sucesso",
        description: "Nova integração criada com sucesso"
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    const newIntegrations = integrations.filter(i => i.id !== id);
    updateIntegrations(newIntegrations);
    toast({
      title: "Sucesso",
      description: `${integration?.name} removida com sucesso`
    });
  };

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    errors: integrations.filter(i => i.status === 'error').length,
    totalEvents: integrations.reduce((sum, i) => sum + i.metrics.eventsToday, 0),
  };

  const feedStats = {
    total: threatFeeds.length,
    active: threatFeeds.filter(f => f.status === 'active').length,
    errors: threatFeeds.filter(f => f.status === 'error').length,
    totalIndicators: threatFeeds.reduce((sum, f) => sum + f.indicators, 0),
  };

  if (!permissions.canManageIntegrations) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">Você não tem permissão para gerenciar integrações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">APIs e conectores de segurança</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateIntegration} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? 'Editar Integração' : 'Nova Integração'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveIntegration} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nome da integração"
                    defaultValue={editingIntegration?.name}
                    onChange={(e) => setCurrentName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Input
                    id="type"
                    name="type"
                    placeholder="SIEM, EDR, ATP, etc."
                    defaultValue={editingIntegration?.type}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descrição da integração"
                  defaultValue={editingIntegration?.description}
                />
              </div>
              <div>
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  name="endpoint"
                  placeholder="https://api.exemplo.com"
                  defaultValue={editingIntegration?.config.endpoint}
                  required
                />
              </div>
              {/* Campos específicos para Tenable */}
              {(editingIntegration?.name === 'Tenable.io' || (!editingIntegration && currentName === 'Tenable.io')) ? (
                <>
                  <div>
                    <Label htmlFor="accessKey">Access Key</Label>
                    <Input
                      id="accessKey"
                      name="accessKey"
                      type="password"
                      placeholder="Access Key do Tenable"
                      defaultValue={editingIntegration?.config.accessKey}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      name="secretKey"
                      type="password"
                      placeholder="Secret Key do Tenable"
                      defaultValue={editingIntegration?.config.secretKey}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    name="apiKey"
                    type="password"
                    placeholder="Chave da API"
                    defaultValue={editingIntegration?.config.apiKey}
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  name="enabled"
                  defaultChecked={editingIntegration?.config.enabled}
                />
                <Label htmlFor="enabled">Habilitar integração</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIntegration ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Integrações</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conectadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.connected}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.connected / stats.total) * 100).toFixed(0)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Precisam de atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Eventos processados</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {integration.type}
                    </Badge>
                  </div>
                </div>
                <Badge className={getStatusColor(integration.status)}>
                  {getStatusIcon(integration.status)}
                  <span className="ml-1">{getStatusLabel(integration.status)}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {integration.description}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Eventos Hoje</p>
                  <p className="font-semibold">{integration.metrics.eventsToday.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-semibold">{integration.metrics.totalEvents.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Taxa de Erro</p>
                  <p className={`font-semibold ${integration.metrics.errorRate > 1 ? 'text-critical' : 'text-success'}`}>
                    {integration.metrics.errorRate}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última Sync</p>
                  <p className="font-semibold text-xs">
                    {integration.lastSync 
                      ? integration.lastSync.toLocaleTimeString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>

              {/* Configuration */}
              {integration.config.endpoint && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Endpoint</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded truncate">
                    {integration.config.endpoint}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={integration.config.enabled}
                    onCheckedChange={() => handleToggleIntegration(integration.id)}
                  />
                  <Label className="text-sm">Habilitada</Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(integration.id)}
                    disabled={!integration.config.enabled}
                  >
                    Testar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditIntegration(integration)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration.id)}
                    className="text-critical hover:text-critical"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Threat Intelligence Feeds Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Feeds de Threat Intelligence</h2>
            <p className="text-muted-foreground">Fontes de indicadores de ameaças e IOCs</p>
          </div>
          <Dialog open={feedDialogOpen} onOpenChange={setFeedDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateFeed} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Feed
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingFeed ? 'Editar Feed' : 'Novo Feed de Threat Intelligence'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveFeed} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feed-name">Nome</Label>
                    <Input
                      id="feed-name"
                      name="name"
                      placeholder="Nome do feed"
                      defaultValue={editingFeed?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="feed-type">Tipo</Label>
                    <Input
                      id="feed-type"
                      name="type"
                      placeholder="MISP, Commercial, etc."
                      defaultValue={editingFeed?.type}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="feed-description">Descrição</Label>
                  <Textarea
                    id="feed-description"
                    name="description"
                    placeholder="Descrição do feed"
                    defaultValue={editingFeed?.description}
                  />
                </div>
                <div>
                  <Label htmlFor="feed-url">URL do Feed</Label>
                  <Input
                    id="feed-url"
                    name="url"
                    placeholder="https://feed.exemplo.com/api"
                    defaultValue={editingFeed?.url}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="feed-format">Formato</Label>
                    <select
                      id="feed-format"
                      name="format"
                      className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      defaultValue={editingFeed?.format || 'JSON'}
                      required
                    >
                      <option value="STIX">STIX</option>
                      <option value="JSON">JSON</option>
                      <option value="CSV">CSV</option>
                      <option value="XML">XML</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="feed-frequency">Frequência</Label>
                    <Input
                      id="feed-frequency"
                      name="frequency"
                      placeholder="1 hora, 30 minutos, etc."
                      defaultValue={editingFeed?.frequency}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="feed-active"
                    name="active"
                    defaultChecked={editingFeed?.status === 'active'}
                  />
                  <Label htmlFor="feed-active">Ativar feed</Label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setFeedDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingFeed ? 'Salvar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Feed Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Feeds</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{feedStats.active}</div>
              <p className="text-xs text-muted-foreground">
                {feedStats.total > 0 ? ((feedStats.active / feedStats.total) * 100).toFixed(0) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
              <AlertCircle className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-critical">{feedStats.errors}</div>
              <p className="text-xs text-muted-foreground">Precisam de atenção</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indicadores</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedStats.totalIndicators.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">IOCs disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Threat Feeds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {threatFeeds.map((feed) => (
            <Card key={feed.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🔍</div>
                    <div>
                      <CardTitle className="text-lg">{feed.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {feed.type}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(feed.status)}>
                    {getStatusIcon(feed.status)}
                    <span className="ml-1">{getStatusLabel(feed.status)}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {feed.description}
                </p>

                {/* Feed Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Indicadores</p>
                    <p className="font-semibold">{feed.indicators.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Formato</p>
                    <p className="font-semibold">{feed.format}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Frequência</p>
                    <p className="font-semibold">{feed.frequency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última Atualização</p>
                    <p className="font-semibold text-xs">
                      {feed.lastUpdate 
                        ? feed.lastUpdate.toLocaleTimeString('pt-BR')
                        : 'Nunca'
                      }
                    </p>
                  </div>
                </div>

                {/* Feed URL */}
                <div className="text-sm">
                  <p className="text-muted-foreground">URL</p>
                  <p className="font-mono text-xs bg-muted p-2 rounded truncate">
                    {feed.url}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={feed.status === 'active'}
                      onCheckedChange={() => handleToggleFeed(feed.id)}
                    />
                    <Label className="text-sm">Ativo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFeed(feed)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFeed(feed.id)}
                      className="text-critical hover:text-critical"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}