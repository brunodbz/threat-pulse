import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Dashboard de Segurança",
      });
    } else {
      setError('Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-gradient-primary rounded-full p-4 shadow-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Security Dashboard
            </h1>
            <p className="text-muted-foreground">
              Sistema de Gestão de Segurança Corporativa
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader className="space-y-2">
            <h2 className="text-xl font-semibold text-center">Fazer Login</h2>
            <p className="text-sm text-muted-foreground text-center">
              Acesse o painel de controle
            </p>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 transition-fast"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 pr-10 transition-fast"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-smooth shadow-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Credenciais de demonstração */}
        <Card className="bg-muted/10 border-muted/20">
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 text-sm">Credenciais de Demonstração:</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span className="font-medium">Admin:</span>
                <span>admin@empresa.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Gestor:</span>
                <span>gestor@empresa.com / gestor123</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Analista:</span>
                <span>analista@empresa.com / analista123</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}