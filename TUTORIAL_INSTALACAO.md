# Tutorial de Instalação - Security Dashboard

## 📋 Pré-requisitos

### Opção 1: Instalação com Docker (Recomendado)
- [Docker](https://docs.docker.com/get-docker/) versão 20.10 ou superior
- [Docker Compose](https://docs.docker.com/compose/install/) versão 2.0 ou superior

### Opção 2: Instalação Local
- [Node.js](https://nodejs.org/) versão 18 ou superior
- npm (incluído com Node.js) ou yarn

## 🚀 Método 1: Instalação com Docker (Mais Fácil)

### Passo 1: Clonar o repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### Passo 2: Executar com Docker Compose
```bash
# Construir e executar os containers
docker-compose up -d

# Para ver os logs em tempo real
docker-compose logs -f
```

### Passo 3: Acessar a aplicação
- Abra seu navegador e acesse: `http://localhost:3000`
- Com nginx (se habilitado): `http://localhost:80`

### Comandos úteis do Docker
```bash
# Parar os containers
docker-compose down

# Reconstruir após mudanças
docker-compose up --build -d

# Ver status dos containers
docker-compose ps

# Ver logs de um serviço específico
docker-compose logs security-dashboard
```

## 🛠️ Método 2: Instalação Local

### Passo 1: Clonar o repositório
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_PROJETO>
```

### Passo 2: Instalar dependências
```bash
# Usando npm
npm install

# Ou usando yarn
yarn install
```

### Passo 3: Executar em modo desenvolvimento
```bash
# Usando npm
npm run dev

# Ou usando yarn
yarn dev
```

### Passo 4: Acessar a aplicação
- Abra seu navegador e acesse: `http://localhost:8080`

### Comandos disponíveis
```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Cria build de produção
npm run preview      # Visualiza build de produção

# Linting
npm run lint         # Verifica código
```

## 🔐 Credenciais de Demo

### Admin
- **Email:** admin@security.com
- **Senha:** admin123

### Manager
- **Email:** manager@security.com
- **Senha:** manager123

### Analyst
- **Email:** analyst@security.com
- **Senha:** analyst123

## 🗂️ Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── auth/           # Componentes de autenticação
│   ├── layout/         # Layout e navegação
│   ├── profile/        # Perfil do usuário
│   └── ui/             # Componentes de interface
├── contexts/           # Contextos React
├── hooks/              # Hooks customizados
├── pages/              # Páginas da aplicação
├── types/              # Definições TypeScript
├── utils/              # Utilitários
└── data/               # Dados mock
```

## 🔧 Configurações Avançadas

### Configuração do Nginx (Opcional)
Se quiser usar o nginx como proxy reverso:

1. Descomente as linhas do nginx no `docker-compose.yml`
2. Configure o SSL se necessário
3. Ajuste o `nginx.conf` conforme suas necessidades

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto se precisar de configurações específicas:

```env
NODE_ENV=production
PORT=3000
```

## 📱 Funcionalidades Principais

- **Dashboard de Segurança:** Visão geral com métricas e alertas
- **Sistema de Alertas:** Monitoramento em tempo real
- **Controle de Acesso:** RBAC com diferentes níveis de permissão
- **Integrações:** Simulação de integração com ferramentas de segurança
- **Análise de Dados:** Gráficos e relatórios de segurança
- **Gestão de Usuários:** Administração de usuários e perfis

## 🐛 Solução de Problemas

### Erro de porta ocupada
```bash
# Verificar processo usando a porta
lsof -i :3000

# Matar processo se necessário
kill -9 <PID>
```

### Problemas com Docker
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir imagem do zero
docker-compose build --no-cache
```

### Problemas com dependências
```bash
# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

- **Documentação:** README.md
- **Issues:** Use o sistema de issues do repositório
- **Logs:** Verifique os logs do container ou console do navegador

## 🎯 Próximos Passos

1. Faça login com uma das credenciais de demo
2. Explore o dashboard principal
3. Teste as diferentes funcionalidades
4. Configure integrações conforme necessário
5. Personalize o tema e configurações

---

✅ **Instalação concluída com sucesso!** Sua aplicação Security Dashboard está pronta para uso.