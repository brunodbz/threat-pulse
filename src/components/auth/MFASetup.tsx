
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface MFASetupProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: (backupCodes: string[]) => void;
  userEmail: string;
}

export function MFASetup({ isOpen, onClose, onSetupComplete, userEmail }: MFASetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && step === 'setup') {
      generateMFASecret();
    }
  }, [isOpen]);

  const generateMFASecret = async () => {
    // Gerar secret aleatório (32 caracteres base32)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    setSecret(secret);
    
    // Gerar QR Code
    const issuer = 'SecureSOC';
    const label = encodeURIComponent(`${issuer}:${userEmail}`);
    const otpauth = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}`;
    
    try {
      const qrUrl = await QRCode.toDataURL(otpauth);
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar código QR",
        variant: "destructive"
      });
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
      toast({
        title: "Copiado!",
        description: "Código secreto copiado para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao copiar código",
        variant: "destructive"
      });
    }
  };

  const verifyMFACode = () => {
    // Simulação da verificação do código MFA
    // Em produção, isso seria validado no backend
    if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
      // Gerar códigos de backup
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      setBackupCodes(codes);
      setStep('backup');
    } else {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código de 6 dígitos válido",
        variant: "destructive"
      });
    }
  };

  const completeMFASetup = () => {
    localStorage.setItem('mfaEnabled', 'true');
    localStorage.setItem('mfaSecret', secret);
    localStorage.setItem('mfaBackupCodes', JSON.stringify(backupCodes));
    onSetupComplete(backupCodes);
    onClose();
    toast({
      title: "MFA Ativado",
      description: "Autenticação de dois fatores configurada com sucesso"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configurar Autenticação em Dois Fatores
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Configure a autenticação em dois fatores usando um aplicativo authenticator como Google Authenticator, Microsoft Authenticator ou Authy.
            </p>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">1. Escaneie o código QR</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code MFA" className="w-48 h-48" />
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Ou insira manualmente o código:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1 break-all">
                      {secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copySecret}
                      className="shrink-0"
                    >
                      {copiedSecret ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => setStep('verify')}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  2. Verifique o código
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Digite o código de 6 dígitos do seu aplicativo authenticator:
                </p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg font-mono"
                />
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('setup')}>
                Voltar
              </Button>
              <Button onClick={verifyMFACode} disabled={verificationCode.length !== 6}>
                Verificar
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-warning">
                  3. Códigos de Recuperação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Salve estes códigos em um local seguro. Você pode usá-los para acessar sua conta se perder acesso ao seu authenticator.
                </p>
                
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <Badge key={index} variant="outline" className="justify-center font-mono">
                      {code}
                    </Badge>
                  ))}
                </div>
                
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <p className="text-xs text-warning-foreground">
                    ⚠️ Cada código só pode ser usado uma vez. Guarde-os com segurança!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={completeMFASetup} className="w-full">
              Concluir Configuração
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
