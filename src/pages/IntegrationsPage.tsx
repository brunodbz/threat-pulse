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

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(MOCK_INTEGRATIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [currentName, setCurrentName] = useState('');
  const permissions = usePermissions();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-success text-white';
      case 'disconnected': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-critical text-white';
      case 'pending': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === id 
        ? { 
            ...integration, 
            config: { ...integration.config, enabled: !integration.config.enabled },
            status: integration.config.enabled ? 'disconnected' : 'connected'
          }
        : integration
    ));
    
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
      setIntegrations(prev => prev.map(integration => 
        integration.id === editingIntegration.id 
          ? { 
              ...integration, 
              name, 
              type, 
              description,
              config: { endpoint, apiKey, accessKey, secretKey, enabled },
              status: enabled ? 'connected' : 'disconnected',
              lastSync: new Date()
            }
          : integration
      ));
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
        status: enabled ? 'connected' : 'disconnected',
        lastSync: enabled ? new Date() : null,
        icon: '🔗',
        config: { endpoint, apiKey, accessKey, secretKey, enabled },
        metrics: {
          eventsToday: 0,
          totalEvents: 0,
          errorRate: 0
        }
      };
      setIntegrations(prev => [...prev, newIntegration]);
      toast({
        title: "Sucesso",
        description: "Nova integração criada com sucesso"
      });
    }
    
    setDialogOpen(false);
  };

  const handleDeleteIntegration = (id: string) => {
    const integration = integrations.find(i => i.id === id);
    setIntegrations(prev => prev.filter(i => i.id !== id));
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
    </div>
  );
}