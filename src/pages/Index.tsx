import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, LogIn, Shield, Users, BarChart3, AlertTriangle } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Se o usuário estiver logado, redirecione para o dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLoginClick = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-lg">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            ThreatPulse
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Sistema avançado de monitoramento e análise de segurança para proteção proativa de sua infraestrutura digital.
          </p>
          
          <Alert className="max-w-2xl mx-auto mb-8">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Sistema em demonstração:</strong> Este é um sistema de demonstração. 
              Para acessar todas as funcionalidades, você precisa estar logado ou criar uma conta.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8" onClick={handleLoginClick}>
              <LogIn className="mr-2 h-5 w-5" />
              Fazer Login / Criar Conta
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Saiba Mais
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Monitoramento 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Vigilância contínua de ameaças em tempo real com alertas instantâneos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Analytics Avançado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Análise detalhada de padrões e tendências de segurança.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Gestão de Alertas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Sistema inteligente de classificação e resposta a incidentes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-lg">Controle de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Gerenciamento granular de usuários e permissões.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 ThreatPulse. Sistema de demonstração para fins educacionais.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
