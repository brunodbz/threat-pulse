import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Clock,
  Globe,
  Monitor,
  Save,
  RefreshCw,
  AlertTriangle,
  Key,
  Users,
  Activity,
  Plus,
  Trash2
} from 'lucide-react';
import { usePermissions } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SettingsConfig {
  general: {
    organizationName: string;
    timezone: string;
    language: string;
    theme: string;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  security: {
    sessionTimeout: number;
    enforceSSO: boolean;
    mfaRequired: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireNumbers: boolean;
      requireSymbols: boolean;
    };
  };
  alerts: {
    emailNotifications: boolean;
    realTimeAlerts: boolean;
    criticalOnly: boolean;
    alertRetention: number;
    escalationRules: boolean;
  };
  integrations: {
    apiRateLimit: number;
    logRetention: number;
    autoRemediation: boolean;
    threatIntelFeeds: boolean;
  };
  monitoring: {
    uptime: boolean;
    performance: boolean;
    errorTracking: boolean;
    auditLogging: boolean;
  };
}

interface DataSource {
  id: string;
  name: string;
  type: 'elastic' | 'trellix' | 'defender' | 'tenable' | 'custom';
  url: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: Date;
}

const DEFAULT_SETTINGS: SettingsConfig = {
  general: {
    organizationName: 'Empresa Exemplo',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    theme: 'dark',
    autoRefresh: true,
    refreshInterval: 30,
  },
  security: {
    sessionTimeout: 480,
    enforceSSO: false,
    mfaRequired: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: true,
    },
  },
  alerts: {
    emailNotifications: true,
    realTimeAlerts: true,
    criticalOnly: false,
    alertRetention: 90,
    escalationRules: true,
  },
  integrations: {
    apiRateLimit: 1000,
    logRetention: 365,
    autoRemediation: false,
    threatIntelFeeds: true,
  },
  monitoring: {
    uptime: true,
    performance: true,
    errorTracking: true,
    auditLogging: true,
  },
};

// Função para carregar configurações do localStorage
const loadSettingsFromStorage = (): SettingsConfig => {
  try {
    const stored = localStorage.getItem('system-settings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  return DEFAULT_SETTINGS;
};

// Função para salvar configurações no localStorage
const saveSettingsToStorage = (settings: SettingsConfig) => {
  try {
    localStorage.setItem('system-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
};

// Função para carregar fontes de dados do localStorage
const loadDataSourcesFromStorage = (): DataSource[] => {
  try {
    const stored = localStorage.getItem('data-sources');
    if (stored) {
      return JSON.parse(stored).map((source: any) => ({
        ...source,
        lastSync: new Date(source.lastSync)
      }));
    }
  } catch (error) {
    console.error('Erro ao carregar fontes de dados:', error);
  }
  return [
    {
      id: '1',
      name: 'Elastic SIEM',
      type: 'elastic',
      url: 'https://elastic.empresa.com',
      status: 'connected',
      lastSync: new Date()
    },
    {
      id: '2', 
      name: 'Microsoft Defender',
      type: 'defender',
      url: 'https://security.microsoft.com',
      status: 'connected',
      lastSync: new Date(Date.now() - 1000 * 60 * 30)
    }
  ];
};

// Função para salvar fontes de dados no localStorage
const saveDataSourcesToStorage = (dataSources: DataSource[]) => {
  try {
    localStorage.setItem('data-sources', JSON.stringify(dataSources));
  } catch (error) {
    console.error('Erro ao salvar fontes de dados:', error);
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsConfig>(() => loadSettingsFromStorage());
  const [saving, setSaving] = useState(false);
  const [dataSources, setDataSources] = useState<DataSource[]>(() => loadDataSourcesFromStorage());
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const permissions = usePermissions();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar no localStorage
      saveSettingsToStorage(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (section: keyof SettingsConfig, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    setSettings(newSettings);
    // Salvar automaticamente no localStorage
    saveSettingsToStorage(newSettings);
  };

  const updatePasswordPolicy = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        passwordPolicy: {
          ...prev.security.passwordPolicy,
          [key]: value,
        },
      },
    }));
  };

  const handleAddDataSource = () => {
    setEditingSource(null);
    setSourceDialogOpen(true);
  };

  const handleEditDataSource = (source: DataSource) => {
    setEditingSource(source);
    setSourceDialogOpen(true);
  };

  const handleSaveDataSource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as DataSource['type'];
    const url = formData.get('url') as string;

    console.log('Salvando fonte de dados:', { name, type, url });

    if (editingSource) {
      const updatedSources = dataSources.map(source => 
        source.id === editingSource.id 
          ? { ...source, name, type, url, lastSync: new Date() }
          : source
      );
      setDataSources(updatedSources);
      saveDataSourcesToStorage(updatedSources);
      toast({
        title: "Sucesso",
        description: "Fonte de dados atualizada com sucesso"
      });
    } else {
      const newSource: DataSource = {
        id: Date.now().toString(),
        name,
        type,
        url,
        status: 'disconnected',
        lastSync: new Date()
      };
      const updatedSources = [...dataSources, newSource];
      setDataSources(updatedSources);
      saveDataSourcesToStorage(updatedSources);
      toast({
        title: "Sucesso", 
        description: "Nova fonte de dados adicionada com sucesso"
      });
    }
    
    setSourceDialogOpen(false);
  };

  const handleDeleteDataSource = (sourceId: string) => {
    const updatedSources = dataSources.filter(source => source.id !== sourceId);
    setDataSources(updatedSources);
    saveDataSourcesToStorage(updatedSources);
    toast({
      title: "Sucesso",
      description: "Fonte de dados removida com sucesso"
    });
  };

  const getStatusColor = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'bg-success text-white';
      case 'disconnected': return 'bg-muted text-muted-foreground';
      case 'error': return 'bg-critical text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: DataSource['status']) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Erro';
      default: return status;
    }
  };

  if (!permissions.canConfigureAlerts) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">Você não tem permissão para acessar as configurações.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Configurações do sistema de segurança</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertas
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Database className="h-4 w-4" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Monitor className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="orgName">Nome da Organização</Label>
                  <Input
                    id="orgName"
                    value={settings.general.organizationName}
                    onChange={(e) => updateSetting('general', 'organizationName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                      <SelectItem value="America/New_York">América/Nova York</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings.general.language}
                    onValueChange={(value) => updateSetting('general', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={settings.general.theme}
                    onValueChange={(value) => updateSetting('general', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualização Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Atualizar dados automaticamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.autoRefresh}
                    onCheckedChange={(checked) => updateSetting('general', 'autoRefresh', checked)}
                  />
                </div>

                {settings.general.autoRefresh && (
                  <div>
                    <Label htmlFor="refreshInterval">Intervalo de Atualização (segundos)</Label>
                    <Input
                      id="refreshInterval"
                      type="number"
                      min="10"
                      max="300"
                      value={settings.general.refreshInterval}
                      onChange={(e) => updateSetting('general', 'refreshInterval', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="30"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Forçar SSO</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir Single Sign-On para todos os usuários
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enforceSSO}
                    onCheckedChange={(checked) => updateSetting('security', 'enforceSSO', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>MFA Obrigatório</Label>
                    <p className="text-sm text-muted-foreground">
                      Exigir autenticação multifator
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.mfaRequired}
                    onCheckedChange={(checked) => updateSetting('security', 'mfaRequired', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Política de Senhas</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="minLength">Comprimento Mínimo</Label>
                    <Input
                      id="minLength"
                      type="number"
                      min="6"
                      max="32"
                      value={settings.security.passwordPolicy.minLength}
                      onChange={(e) => updatePasswordPolicy('minLength', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordPolicy.requireUppercase}
                        onCheckedChange={(checked) => updatePasswordPolicy('requireUppercase', checked)}
                      />
                      <Label>Maiúsculas</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordPolicy.requireNumbers}
                        onCheckedChange={(checked) => updatePasswordPolicy('requireNumbers', checked)}
                      />
                      <Label>Números</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordPolicy.requireSymbols}
                        onCheckedChange={(checked) => updatePasswordPolicy('requireSymbols', checked)}
                      />
                      <Label>Símbolos</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Settings */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.alerts.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('alerts', 'emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Alertas em Tempo Real</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar alertas instantâneos no dashboard
                    </p>
                  </div>
                  <Switch
                    checked={settings.alerts.realTimeAlerts}
                    onCheckedChange={(checked) => updateSetting('alerts', 'realTimeAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Apenas Críticos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar apenas alertas críticos
                    </p>
                  </div>
                  <Switch
                    checked={settings.alerts.criticalOnly}
                    onCheckedChange={(checked) => updateSetting('alerts', 'criticalOnly', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Regras de Escalação</Label>
                    <p className="text-sm text-muted-foreground">
                      Escalar alertas não resolvidos
                    </p>
                  </div>
                  <Switch
                    checked={settings.alerts.escalationRules}
                    onCheckedChange={(checked) => updateSetting('alerts', 'escalationRules', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="alertRetention">Retenção de Alertas (dias)</Label>
                <Input
                  id="alertRetention"
                  type="number"
                  min="7"
                  max="365"
                  value={settings.alerts.alertRetention}
                  onChange={(e) => updateSetting('alerts', 'alertRetention', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Tempo para manter alertas no sistema
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Gerenciar Fontes de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Fontes de Dados Conectadas</h3>
                  <p className="text-sm text-muted-foreground">
                    Gerencie as fontes de dados de segurança integradas
                  </p>
                </div>
                <Dialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddDataSource} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Adicionar Fonte
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingSource ? 'Editar Fonte de Dados' : 'Nova Fonte de Dados'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveDataSource} className="space-y-4">
                      <div>
                        <Label htmlFor="source-name">Nome da Fonte</Label>
                        <Input
                          id="source-name"
                          name="name"
                          placeholder="Ex: Elastic SIEM Principal"
                          defaultValue={editingSource?.name}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="source-type">Tipo</Label>
                        <Select name="type" defaultValue={editingSource?.type}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="elastic">Elastic Stack</SelectItem>
                            <SelectItem value="trellix">Trellix SIEM</SelectItem>
                            <SelectItem value="defender">Microsoft Defender</SelectItem>
                            <SelectItem value="tenable">Tenable</SelectItem>
                            <SelectItem value="custom">Customizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="source-url">URL/Endpoint</Label>
                        <Input
                          id="source-url"
                          name="url"
                          type="url"
                          placeholder="https://siem.empresa.com"
                          defaultValue={editingSource?.url}
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          type="button"
                          variant="outline" 
                          onClick={() => setSourceDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingSource ? 'Salvar' : 'Adicionar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {dataSources.map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{source.name}</h4>
                        <Badge className={getStatusColor(source.status)}>
                          {getStatusLabel(source.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{source.url}</p>
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {source.lastSync.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDataSource(source)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDataSource(source.id)}
                        className="text-critical hover:text-critical"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="apiRateLimit">Limite de Taxa da API (req/min)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    min="100"
                    max="10000"
                    value={settings.integrations.apiRateLimit}
                    onChange={(e) => updateSetting('integrations', 'apiRateLimit', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="logRetention">Retenção de Logs (dias)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    min="30"
                    max="2555"
                    value={settings.integrations.logRetention}
                    onChange={(e) => updateSetting('integrations', 'logRetention', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Remediação Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir respostas automáticas a ameaças
                    </p>
                  </div>
                  <Switch
                    checked={settings.integrations.autoRemediation}
                    onCheckedChange={(checked) => updateSetting('integrations', 'autoRemediation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Feeds de Threat Intelligence</Label>
                    <p className="text-sm text-muted-foreground">
                      Integrar feeds externos de ameaças
                    </p>
                  </div>
                  <Switch
                    checked={settings.integrations.threatIntelFeeds}
                    onCheckedChange={(checked) => updateSetting('integrations', 'threatIntelFeeds', checked)}
                  />
                </div>
              </div>

              {settings.integrations.autoRemediation && (
                <div className="p-4 bg-warning/10 border border-warning rounded-lg">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Atenção</span>
                  </div>
                  <p className="text-sm">
                    A remediação automática pode interferir em operações críticas. 
                    Certifique-se de configurar adequadamente as regras de resposta.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Settings */}
        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Configurações de Monitoramento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Monitoramento de Uptime</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitorar disponibilidade dos serviços
                    </p>
                  </div>
                  <Switch
                    checked={settings.monitoring.uptime}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'uptime', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Monitoramento de Performance</Label>
                    <p className="text-sm text-muted-foreground">
                      Acompanhar métricas de performance
                    </p>
                  </div>
                  <Switch
                    checked={settings.monitoring.performance}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'performance', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rastreamento de Erros</Label>
                    <p className="text-sm text-muted-foreground">
                      Capturar e reportar erros do sistema
                    </p>
                  </div>
                  <Switch
                    checked={settings.monitoring.errorTracking}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'errorTracking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Log de Auditoria</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar todas as atividades dos usuários
                    </p>
                  </div>
                  <Switch
                    checked={settings.monitoring.auditLogging}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'auditLogging', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}