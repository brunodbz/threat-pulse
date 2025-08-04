# Deploy do ThreatPulse Dashboard

## Instruções para Deploy com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Configuração do Supabase (projeto criado e configurado)

### Configuração do Supabase

Antes do deploy, certifique-se de que as configurações estão corretas no Supabase:

1. **Desabilitar confirmação de email** (para evitar problemas de login):
   - Acesse o painel do Supabase: https://supabase.com/dashboard/project/pmvbdzzlylfsltwcdfqg/auth/providers
   - Vá em Authentication > Settings
   - Desmarque "Enable email confirmations"

2. **Configurar URLs de redirecionamento**:
   - Acesse Authentication > URL Configuration
   - Site URL: `http://localhost` (ou seu domínio de produção)
   - Redirect URLs: adicione as URLs onde a aplicação será acessada

### Deploy Simples

```bash
# Clone o repositório (se necessário)
git clone <seu-repositorio>
cd threatpulse-dashboard

# Construir e executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar a aplicação
docker-compose down
```

### Deploy Manual com Docker

```bash
# Construir a imagem
docker build -t threatpulse-dashboard .

# Executar o container
docker run -d \
  --name threatpulse \
  -p 80:80 \
  --restart unless-stopped \
  threatpulse-dashboard

# Verificar status
docker ps

# Ver logs
docker logs threatpulse
```

### Verificação da Aplicação

Após o deploy, acesse:
- **Aplicação**: http://localhost (ou seu domínio)
- **Health Check**: http://localhost/health

### Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Atualizar aplicação
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f threatpulse-dashboard

# Limpar recursos Docker (cuidado!)
docker system prune -a
```

### Estrutura dos Arquivos

- `Dockerfile`: Configuração da imagem Docker
- `docker-compose.yml`: Orquestração dos serviços
- `nginx.conf`: Configuração do servidor web

### Problemas Comuns

1. **Erro 404 em rotas**: 
   - Verifique se o nginx.conf está configurado para SPAs (`try_files`)

2. **Problemas de autenticação**:
   - Verifique se a confirmação de email está desabilitada no Supabase
   - Confirme as URLs de redirecionamento

3. **Container não inicia**:
   - Verifique os logs: `docker-compose logs`
   - Confirme se as portas não estão em uso

### Monitoramento

- Health check automático configurado
- Logs estruturados para debug
- Restart automático em caso de falha

### Segurança

- Headers de segurança configurados
- Rate limiting implementado
- Compressão Gzip habilitada
- Cache otimizado para assets estáticos