import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, Shield, Download, Calendar, FileText, Table } from 'lucide-react';
import { SecurityEvent, DashboardMetrics } from '@/types/security';
import { mockApi } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToCSV, exportToJSON } from '@/utils/exportUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AnalyticsPage() {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [dashboardData, eventsData] = await Promise.all([
        mockApi.getDashboardData(),
        mockApi.getEvents()
      ]);
      setData(dashboardData);
      setEvents(eventsData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    if (!data) return;

    try {
      const exportData = {
        timeRange,
        metrics: data,
        events: events.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          severity: event.severity,
          source: event.source,
          status: event.status,
          timestamp: event.timestamp
        })),
        charts: {
          severityData,
          sourceData,
          trendData,
          statusData
        },
        exportedAt: new Date().toISOString()
      };

      const filename = `analytics-export-${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'pdf':
          exportToPDF(exportData, filename);
          break;
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'json':
          exportToJSON(exportData, filename);
          break;
      }

      toast({
        title: "Sucesso",
        description: `Dados exportados em ${format.toUpperCase()} com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro", 
        description: "Falha ao exportar dados",
        variant: "destructive"
      });
    }
  };

  if (loading || !data) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Process data for charts
  const severityData = [
    { name: 'Crítica', value: events.filter(e => e.severity === 'critical').length, color: '#dc2626' },
    { name: 'Alta', value: events.filter(e => e.severity === 'high').length, color: '#ea580c' },
    { name: 'Média', value: events.filter(e => e.severity === 'medium').length, color: '#ca8a04' },
    { name: 'Baixa', value: events.filter(e => e.severity === 'low').length, color: '#16a34a' },
  ];

  const sourceData = [
    { name: 'Elastic', value: events.filter(e => e.source === 'elastic').length },
    { name: 'Trellix', value: events.filter(e => e.source === 'trellix').length },
    { name: 'Defender', value: events.filter(e => e.source === 'defender').length },
    { name: 'Tenable', value: events.filter(e => e.source === 'tenable').length },
  ];

  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('pt-BR', { month: 'short', day: '2-digit' }),
      alertas: Math.floor(Math.random() * 50) + 10,
      vulnerabilidades: Math.floor(Math.random() * 20) + 5,
    };
  });

  const statusData = [
    { name: 'Abertos', value: events.filter(e => e.status === 'open').length },
    { name: 'Investigando', value: events.filter(e => e.status === 'investigating').length },
    { name: 'Resolvidos', value: events.filter(e => e.status === 'resolved').length },
    { name: 'Falso Positivo', value: events.filter(e => e.status === 'false_positive').length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Relatórios e análises de segurança</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Último dia</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Table className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <Download className="h-4 w-4 mr-2" />
                Exportar JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">+12.3%</span> vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.vulnerabilities.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-critical">+{data.vulnerabilities.critical}</span> críticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos Monitorados</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.assets.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success">{data.assets.online}</span> online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Risco</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.assets.riskScore}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-warning">Médio</span> nível de risco
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alertas" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="vulnerabilidades" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Severidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sources Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Eventos por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vulnerabilidades Críticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total</span>
                <Badge className="bg-critical text-white">{data.vulnerabilities.critical}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Remediadas</span>
                <Badge className="bg-success text-white">{Math.floor(data.vulnerabilities.critical * 0.6)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Pendentes</span>
                <Badge className="bg-warning text-warning-foreground">{Math.floor(data.vulnerabilities.critical * 0.4)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Threat Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Indicadores</span>
                <span className="font-medium">{data.threats.indicators.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bloqueados</span>
                <span className="font-medium text-critical">{data.threats.blocked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Confiança</span>
                <Badge className="bg-primary text-primary-foreground capitalize">{data.threats.confidence}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ativos Conformes</span>
                <span className="font-medium text-success">{data.assets.compliant}</span>
              </div>
              <div className="flex justify-between">
                <span>Não Conformes</span>
                <span className="font-medium text-critical">{data.assets.total - data.assets.compliant}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de Conformidade</span>
                <Badge className="bg-success text-white">
                  {((data.assets.compliant / data.assets.total) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
