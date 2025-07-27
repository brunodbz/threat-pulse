import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
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
  Activity
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const permissions = usePermissions();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
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
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
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
                Configurações de Integrações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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