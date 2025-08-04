# Setup PostgreSQL Local - ThreatPulse Dashboard

## Configuração Completa com PostgreSQL

O sistema foi configurado para funcionar com PostgreSQL local, oferecendo maior controle e independência do Supabase.

### Opções Disponíveis

#### 1. PostgreSQL Local (Docker) - Recomendado
```bash
# Executar com PostgreSQL local
docker-compose -f docker-compose.local.yml up -d

# Verificar logs
docker-compose -f docker-compose.local.yml logs -f

# Parar
docker-compose -f docker-compose.local.yml down
```

#### 2. Supabase (Original)
Para voltar ao Supabase, edite `src/integrations/supabase/client.ts` e descomente o código original.

### Estrutura do Sistema PostgreSQL

**Serviços:**
- `postgres`: Banco PostgreSQL 15
- `threatpulse-server`: API backend (Node.js + Express)
- `threatpulse-dashboard`: Frontend (React + Nginx)

**Banco de Dados:**
- Database: `threatpulse`
- Usuário: `postgres`
- Senha: `postgres123`
- Porta: `5432`

### Credenciais Padrão

**Admin Default:**
- Email: `admin@threatpulse.com`
- Senha: `admin123`

### Arquitetura

```
Frontend (React) → Backend API (Node.js) → PostgreSQL
     ↓                    ↓                    ↓
   Port 80           Port 3001           Port 5432
```

### Funcionalidades Implementadas

✅ **Autenticação Completa:**
- Login/Logout
- Registro de usuários
- Sessões com JWT
- Reset de senha (simulado)

✅ **Database:**
- Estrutura completa de tabelas
- Triggers automáticos
- Roles e permissões
- Perfis de usuário

✅ **Segurança:**
- Senhas hash com bcrypt
- JWT tokens
- Rate limiting no Nginx
- Headers de segurança

### Comandos Úteis

```bash
# Conectar ao PostgreSQL
docker exec -it threatpulse_postgres_1 psql -U postgres -d threatpulse

# Ver tabelas
\dt

# Ver usuários
SELECT email, created_at FROM auth_users;

# Ver perfis e roles
SELECT p.name, p.email, ur.role 
FROM profiles p 
JOIN user_roles ur ON p.user_id = ur.user_id;

# Backup do banco
docker exec threatpulse_postgres_1 pg_dump -U postgres threatpulse > backup.sql

# Restaurar backup
docker exec -i threatpulse_postgres_1 psql -U postgres threatpulse < backup.sql
```

### Configuração de Produção

**Variáveis de Ambiente:**
```bash
# PostgreSQL
POSTGRES_HOST=seu-postgres-host
POSTGRES_PORT=5432
POSTGRES_DB=threatpulse
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha-segura

# JWT
JWT_SECRET=sua-chave-jwt-super-secreta

# App
NODE_ENV=production
```

**Para produção, altere:**
1. Senhas do PostgreSQL
2. JWT Secret
3. URLs de conexão
4. Configurações de SSL

### Migração de Dados

Se você tem dados no Supabase e quer migrar:

```bash
# 1. Exportar dados do Supabase
# Use o painel do Supabase ou pg_dump

# 2. Importar no PostgreSQL local
docker exec -i threatpulse_postgres_1 psql -U postgres threatpulse < dados_supabase.sql
```

### Monitoramento

**Health Checks:**
- Frontend: `http://localhost/health`
- Backend: `http://localhost:3001/health`
- PostgreSQL: Verificação automática

**Logs:**
```bash
# Todos os serviços
docker-compose -f docker-compose.local.yml logs -f

# Apenas PostgreSQL
docker-compose -f docker-compose.local.yml logs -f postgres

# Apenas backend
docker-compose -f docker-compose.local.yml logs -f threatpulse-server
```

### Troubleshooting

**Problemas Comuns:**

1. **Erro de conexão PostgreSQL:**
   ```bash
   # Verificar se o PostgreSQL está rodando
   docker-compose -f docker-compose.local.yml ps postgres
   ```

2. **Erro de autenticação:**
   ```bash
   # Verificar logs do backend
   docker-compose -f docker-compose.local.yml logs threatpulse-server
   ```

3. **Frontend não carrega:**
   ```bash
   # Verificar se todos os serviços estão up
   docker-compose -f docker-compose.local.yml ps
   ```

4. **Reset completo:**
   ```bash
   # Limpar tudo e recomeçar
   docker-compose -f docker-compose.local.yml down -v
   docker-compose -f docker-compose.local.yml up -d
   ```

### Performance

**Para produção:**
- Configure PostgreSQL com mais memória
- Use conexão pooling
- Configure índices adicionais
- Monitore performance com pgAdmin ou similar

**Configurações recomendadas para PostgreSQL:**
```sql
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Backup e Restauração

**Backup automático:**
```bash
# Criar script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec threatpulse_postgres_1 pg_dump -U postgres threatpulse > backups/threatpulse_$DATE.sql
```

**Restauração:**
```bash
# Restaurar backup específico
docker exec -i threatpulse_postgres_1 psql -U postgres threatpulse < backups/threatpulse_20240804_120000.sql
```

Agora você tem controle total sobre seu banco de dados e pode usar PostgreSQL local sem depender de serviços externos!