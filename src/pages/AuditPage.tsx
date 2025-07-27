import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Download, Filter, RefreshCw, User, Calendar, Globe } from 'lucide-react';
import { AuditLogEntry } from '@/types/security';
import { mockApi } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/contexts/AuthContext';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    search: ''
  });
  const { toast } = useToast();
  const permissions = usePermissions();

  useEffect(() => {
    loadAuditLogs();
  }, [filters.user, filters.action]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getAuditLog({
        user: filters.user || undefined,
        action: filters.action || undefined
      });
      setLogs(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao carregar logs de auditoria",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success text-white';
      case 'failed': return 'bg-critical text-white';
      case 'warning': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Sucesso';
      case 'failed': return 'Falha';
      case 'warning': return 'Aviso';
      default: return status;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.user.toLowerCase().includes(filters.search.toLowerCase()) ||
    log.resource.toLowerCase().includes(filters.search.toLowerCase())
  );

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    failed: logs.filter(l => l.status === 'failed').length,
    warning: logs.filter(l => l.status === 'warning').length
  };

  const uniqueUsers = [...new Set(logs.map(log => log.user))];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  if (!permissions.canViewAuditLog) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground">Você não tem permissão para visualizar os logs de auditoria.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Auditoria</h1>
          <p className="text-muted-foreground">Log de atividades e eventos do sistema</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadAuditLogs} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucessos</CardTitle>
            <FileText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.success}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.success / stats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <FileText className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.failed / stats.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
            <FileText className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.warning}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.warning / stats.total) * 100).toFixed(1)}% do total
            </p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar em logs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
            
            <Select value={filters.user} onValueChange={(value) => setFilters(prev => ({ ...prev, user: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os usuários</SelectItem>
                {uniqueUsers.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {log.timestamp.toLocaleString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{log.action}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          {log.ip}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground max-w-xs truncate" title={log.details}>
                          {log.details}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {filteredLogs.length > 50 && (
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-muted-foreground">
              Mostrando 50 de {filteredLogs.length} registros. Use os filtros para refinar a busca.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}