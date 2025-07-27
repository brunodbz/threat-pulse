import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFoundPage = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-card">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-warning/20 rounded-full p-4">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">404</h1>
            <h2 className="text-xl font-semibold">Página não encontrada</h2>
            <p className="text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              asChild 
              className="w-full bg-gradient-primary hover:opacity-90"
            >
              <a href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao Dashboard
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              asChild 
              className="w-full"
            >
              <a href="/">
                Página Inicial
              </a>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Rota tentada: <code className="bg-muted px-2 py-1 rounded">{location.pathname}</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundPage;