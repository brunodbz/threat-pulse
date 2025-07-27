# Security Dashboard - Sistema de Gestão SOC

Um dashboard completo para gestão de segurança corporativa com controle de acesso baseado em roles (RBAC), integração simulada com ferramentas de segurança e visualização em tempo real.

## 🚀 Características Principais

### ✅ Autenticação e Controle de Acesso
- **RBAC (Role-Based Access Control)** com 3 perfis:
  - **Admin**: Acesso total ao sistema
  - **Gestor**: Visualização e exportação de dados
  - **Analista**: Configuração de alertas e integrações
- Login seguro com credenciais demonstrativas
- Sessão persistente com localStorage

### ✅ Dashboard Moderno
- **Visual Profissional**: Tema escuro corporativo com gradientes
- **Cards Interativos**: Métricas principais com animações
- **Tempo Real**: Alertas críticos simulados
- **Responsivo**: Layout adaptável para desktop e mobile

### ✅ Integrações Simuladas
- **Elastic Search**: Eventos de SIEM e análise de logs
- **Trellix**: Detecção de malware e ameaças
- **Microsoft Defender**: Proteção avançada de endpoints
- **Tenable**: Gerenciamento de vulnerabilidades

### ✅ Funcionalidades Implementadas
- **Dashboard Principal**: Métricas, eventos recentes, atividade
- **Sistema de Alertas**: Notificações em tempo real
- **Controle de Permissões**: Filtros baseados no perfil do usuário
- **Sidebar Dinâmica**: Navegação contextual por role
- **Tema Corporativo**: Design system profissional

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** com design system customizado
- **Shadcn/ui** para componentes base
- **Lucide React** para ícones
- **React Router** para navegação

### Autenticação
- Context API para gerenciamento de estado
- LocalStorage para persistência de sessão
- Hook customizado para verificação de permissões

### Dados
- **Mock Data Generator**: Dados realísticos simulados
- **API Simulada**: Funções assíncronas com delay
- **Alertas Tempo Real**: Simulação de eventos críticos

## 🐳 Instalação com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Comandos Rápidos

```bash
# Clonar o projeto
git clone <seu-repo>
cd security-dashboard

# Build e execução com Docker Compose
docker-compose up --build

# Acessar a aplicação
# http://localhost:3000 (aplicação)
# http://localhost:80 (nginx - se habilitado)
```

### Docker - Build Manual

```bash
# Build da imagem
docker build -t security-dashboard .

# Executar container
docker run -p 3000:3000 security-dashboard
```

## 💻 Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 👥 Credenciais de Demonstração

| Perfil | Email | Senha | Permissões |
|--------|-------|-------|------------|
| **Admin** | admin@empresa.com | admin123 | Acesso total |
| **Gestor** | gestor@empresa.com | gestor123 | Visualização + exportação |
| **Analista** | analista@empresa.com | analista123 | Alertas + integrações |

## 🎯 Funcionalidades por Perfil

### Administrador
- ✅ Dashboard completo
- ✅ Gestão de usuários
- ✅ Configuração de alertas
- ✅ Auditoria completa
- ✅ Todas as integrações
- ✅ Exportação de dados

### Gestor
- ✅ Dashboard (somente visualização)
- ❌ Gestão de usuários
- ❌ Configuração de alertas
- ✅ Auditoria (visualização)
- ❌ Integrações
- ✅ Exportação de dados

### Analista
- ✅ Dashboard
- ❌ Gestão de usuários
- ✅ Configuração de alertas
- ✅ Auditoria (visualização)
- ✅ Integrações
- ❌ Exportação de dados

## 🔄 Próximas Implementações

### Em Desenvolvimento
- [ ] **Página de Alertas**: Lista completa com filtros avançados
- [ ] **Analytics Avançado**: Gráficos interativos com Chart.js/Recharts
- [ ] **Gestão de Usuários**: CRUD completo para admins
- [ ] **Auditoria Completa**: Log detalhado com exportação CSV
- [ ] **Integrações Reais**: Conectores para APIs reais
- [ ] **Relatórios PDF**: Geração automática de relatórios
- [ ] **Notificações Telegram**: Integração real com bot

### Funcionalidades Futuras
- [ ] **WebSocket**: Alertas verdadeiramente em tempo real
- [ ] **Machine Learning**: Detecção de anomalias
- [ ] **Multi-tenancy**: Suporte a múltiplas organizações
- [ ] **SSO Integration**: SAML/OAuth2
- [ ] **Mobile App**: Aplicativo nativo
- [ ] **API REST**: Backend completo

## 🔧 Configuração para Produção

### Variáveis de Ambiente
```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.suaempresa.com
VITE_TELEGRAM_BOT_TOKEN=seu_token_aqui
VITE_ENCRYPTION_KEY=chave_super_secreta
```

### Nginx + SSL
```bash
# Configurar certificados SSL
mkdir ssl
# Copiar seus certificados para ./ssl/

# Descomentar configuração HTTPS no nginx.conf
# Atualizar server_name para seu domínio

# Reiniciar containers
docker-compose down
docker-compose up -d
```

## 🔗 Integrações Reais - Guia de Implementação

### Elastic Search
```typescript
// src/services/elastic.ts
export const elasticService = {
  async getEvents() {
    const response = await fetch(`${ELASTIC_URL}/_search`, {
      headers: {
        'Authorization': `ApiKey ${ELASTIC_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: { match_all: {} },
        size: 100
      })
    });
    return response.json();
  }
};
```

### Trellix
```typescript
// src/services/trellix.ts
export const trellixService = {
  async getAlerts() {
    const response = await fetch(`${TRELLIX_API_URL}/alerts`, {
      headers: {
        'X-API-Key': TRELLIX_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

### Microsoft Defender
```typescript
// src/services/defender.ts
export const defenderService = {
  async getIncidents() {
    const response = await fetch(`${GRAPH_API_URL}/security/incidents`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

### Tenable
```typescript
// src/services/tenable.ts
export const tenableService = {
  async getVulnerabilities() {
    const response = await fetch(`${TENABLE_API_URL}/vulns/export`, {
      headers: {
        'X-ApiKeys': `accessKey=${ACCESS_KEY}; secretKey=${SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
};
```

## 📊 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/           # Componentes de autenticação
│   ├── layout/         # Layout e sidebar
│   └── ui/             # Componentes base (shadcn)
├── contexts/           # Context API (auth, themes)
├── data/              # Mock data e simulações
├── hooks/             # Hooks customizados
├── pages/             # Páginas da aplicação
├── services/          # Serviços de API (futuro)
├── types/             # Definições TypeScript
└── utils/             # Utilitários e helpers
```

## 🔒 Segurança

### Implementado
- ✅ Controle de acesso baseado em roles
- ✅ Headers de segurança (nginx)
- ✅ Rate limiting (nginx)
- ✅ Validação de entrada
- ✅ Content Security Policy

### Recomendado para Produção
- [ ] HTTPS obrigatório
- [ ] Autenticação 2FA
- [ ] Logs de auditoria centralizados
- [ ] Monitoramento de segurança
- [ ] Backup automático
- [ ] Rotação de chaves/tokens

## 📈 Performance

### Otimizações Implementadas
- ✅ Code splitting automático (Vite)
- ✅ Lazy loading de componentes
- ✅ Compressão gzip (nginx)
- ✅ Cache de assets estáticos
- ✅ Imagens otimizadas

### Monitoramento
- Health checks (Docker)
- Métricas de performance (futuro)
- Error tracking (futuro)

## 🤝 Contribuição

1. Fork do projeto
2. Criar branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit das mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Entre em contato: security-team@empresa.com
- Documentação: [Wiki do Projeto]

---

**Desenvolvido com ❤️ para equipes de Segurança Corporativa**