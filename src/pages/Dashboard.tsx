import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Server, 
  TrendingUp, 
  TrendingDown, 
  Eye,
  Download,
  RefreshCw,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi, simulateRealTimeAlert } from '@/data/mockData';
import { DashboardMetrics, SecurityEvent } from '@/types/security';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState<SecurityEvent[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Simulate real-time alerts every 30 seconds
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of getting an alert
        const newAlert = simulateRealTimeAlert();
        setRealtimeAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep only last 5 alerts
        
        toast({
          title: "🚨 Alerta Crítico",
          description: newAlert.title,
          variant: "destructive",
        });
      }
    }, 30000);

    return () => clearInterval(alertInterval);
  }, [toast]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await mockApi.getDashboardData();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-critical text-white';
      case 'high': return 'bg-high text-white';
      case 'medium': return 'bg-medium text-warning-foreground';
      case 'low': return 'bg-low text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'investigating': return <Clock className="h-4 w-4 text-warning" />;
      case 'open': return <AlertTriangle className="h-4 w-4 text-critical" />;
      case 'false_positive': return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'elastic': return 'bg-blue-500 text-white';
      case 'trellix': return 'bg-red-500 text-white';
      case 'defender': return 'bg-green-500 text-white';
      case 'tenable': return 'bg-purple-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  const criticalEvents = metrics.events.filter(e => e.severity === 'critical').length;
  const openEvents = metrics.events.filter(e => e.status === 'open').length;

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Dashboard de Segurança
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo, {user?.name} | Última atualização: {new Date().toLocaleString('pt-BR')}
          </p>
        </div>
        <Button 
          onClick={loadDashboardData} 
          size="sm" 
          className="bg-gradient-primary hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Real-time Alerts */}
      {realtimeAlerts.length > 0 && (
        <Alert className="border-critical bg-critical/10">
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Alertas em Tempo Real:</p>
              {realtimeAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between text-sm">
                  <span>{alert.title}</span>
                  <Badge variant="destructive">
                    {alert.source.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Events */}
        <Card className="bg-gradient-card border-border shadow-card hover:shadow-primary transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.events.length}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className="text-critical">{criticalEvents} críticos</span>
              <span>•</span>
              <span className="text-warning">{openEvents} abertos</span>
            </div>
          </CardContent>
        </Card>

        {/* Vulnerabilities */}
        <Card className="bg-gradient-card border-border shadow-card hover:shadow-primary transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.vulnerabilities.total}</div>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-critical">{metrics.vulnerabilities.critical} críticas</span>
              {metrics.vulnerabilities.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-critical" />
              ) : metrics.vulnerabilities.trend === 'down' ? (
                <TrendingDown className="h-3 w-3 text-success" />
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Assets */}
        <Card className="bg-gradient-card border-border shadow-card hover:shadow-primary transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Server className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.assets.total}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.assets.online} online • Score: {metrics.assets.riskScore}/100
            </div>
          </CardContent>
        </Card>

        {/* Threat Intelligence */}
        <Card className="bg-gradient-card border-border shadow-card hover:shadow-primary transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Intel</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threats.blocked.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {metrics.threats.indicators.toLocaleString()} indicadores • Confiança: {metrics.threats.confidence}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Events by Source */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Eventos por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['elastic', 'trellix', 'defender', 'tenable'].map((source) => {
                const sourceEvents = metrics.events.filter(e => e.source === source);
                const criticalCount = sourceEvents.filter(e => e.severity === 'critical').length;
                
                return (
                  <div key={source} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div className="flex items-center space-x-3">
                      <Badge className={getSourceColor(source)}>
                        {source.toUpperCase()}
                      </Badge>
                      <span className="font-medium capitalize">{source}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {sourceEvents.length} eventos
                      </span>
                      {criticalCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {criticalCount} críticos
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Atividade Recente</span>
              <Button variant="outline" size="sm" onClick={() => navigate('/audit')}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.user} • {activity.resource}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Security Events */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Últimos Eventos de Segurança</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {metrics.events.length} total
              </Badge>
              <Button variant="outline" size="sm" onClick={() => navigate('/alerts')}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Todos
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.events.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-fast">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(event.status)}
                    <Badge className={getSourceColor(event.source)}>
                      {event.source.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {event.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      {event.assignee && (
                        <span className="text-xs text-muted-foreground">
                          Atribuído: {event.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}