
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key } from 'lucide-react';

interface MFAVerificationProps {
  onVerificationSuccess: () => void;
  onCancel: () => void;
  userEmail: string;
}

export function MFAVerification({ onVerificationSuccess, onCancel, userEmail }: MFAVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const { toast } = useToast();

  const verifyCode = () => {
    if (useBackupCode) {
      // Verificar código de backup
      const savedBackupCodes = JSON.parse(localStorage.getItem('mfaBackupCodes') || '[]');
      if (savedBackupCodes.includes(backupCode.toUpperCase())) {
        // Remover código usado
        const updatedCodes = savedBackupCodes.filter((code: string) => code !== backupCode.toUpperCase());
        localStorage.setItem('mfaBackupCodes', JSON.stringify(updatedCodes));
        
        onVerificationSuccess();
        toast({
          title: "Acesso autorizado",
          description: "Código de recuperação verificado com sucesso"
        });
      } else {
        toast({
          title: "Código inválido",
          description: "Código de recuperação inválido ou já utilizado",
          variant: "destructive"
        });
      }
    } else {
      // Verificar código do authenticator
      // Em produção, isso seria validado no backend
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        onVerificationSuccess();
        toast({
          title: "Acesso autorizado",
          description: "Código MFA verificado com sucesso"
        });
      } else {
        toast({
          title: "Código inválido",
          description: "Por favor, insira um código de 6 dígitos válido",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Verificação em Dois Fatores</CardTitle>
          <p className="text-sm text-muted-foreground">
            Digite o código do seu aplicativo authenticator
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              {userEmail}
            </Badge>
          </div>

          {!useBackupCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Smartphone className="w-4 h-4" />
                Código do Authenticator
              </div>
              <Input
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="w-4 h-4" />
                Código de Recuperação
              </div>
              <Input
                type="text"
                placeholder="Digite o código de recuperação"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                className="text-center font-mono"
              />
            </div>
          )}

          <Button 
            onClick={verifyCode} 
            className="w-full"
            disabled={useBackupCode ? !backupCode.trim() : verificationCode.length !== 6}
          >
            Verificar
          </Button>

          <div className="text-center">
            <button
              onClick={() => setUseBackupCode(!useBackupCode)}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              {useBackupCode ? 'Usar código do authenticator' : 'Usar código de recuperação'}
            </button>
          </div>

          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
