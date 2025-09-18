# Personal Finance Manager

Uma aplicação web completa de gestão financeira pessoal desenvolvida com React, TypeScript e Tailwind CSS, pronta para ser executada em Docker/Unraid com base de dados MariaDB.

## 📋 Funcionalidades

### 💰 Gestão Financeira
- **Dashboard Principal**: Visão geral das finanças com estatísticas em tempo real
- **Transações**: Registo e gestão completa de receitas e despesas
- **Contas**: Gestão de múltiplas contas bancárias e cartões
- **Orçamentos**: Criação e monitorização de orçamentos por categoria
- **Poupanças**: Gestão de objetivos de poupança com metas inteligentes

### 📊 Análise e Relatórios
- **Relatórios Avançados**: Análise detalhada com gráficos interativos
- **Exportação**: Dados exportáveis em CSV, JSON e PDF
- **Análise Preditiva**: Previsões baseadas em IA dos padrões de gastos

### 🤖 Inteligência Artificial
- **Consultor IA**: Recomendações personalizadas de gestão financeira
- **Deteção de Padrões**: Análise automática de comportamentos de gasto
- **Alertas Inteligentes**: Notificações baseadas em regras personalizáveis

### 💼 Investimentos e Ativos
- **Carteira de Investimentos**: Gestão completa de investimentos
- **Gestão de Ativos**: Registo de bens com custos operacionais e documentos
- **Análise de Performance**: Acompanhamento de rentabilidade

### 🔄 Automação
- **Transações Recorrentes**: Automatização de pagamentos regulares
- **Regras de Categorização**: Classificação automática de transações
- **Poupança Automática**: Transfer automáticas para objetivos de poupança

### 📱 Interface e Usabilidade
- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Tema Escuro/Claro**: Interface adaptável às preferências do utilizador
- **Notificações**: Centro de notificações em tempo real
- **Importação/Exportação**: Migração fácil de dados financeiros

### 🔐 Segurança e Dados
- **Autenticação Segura**: Sistema de login protegido
- **Backup Automático**: Cópias de segurança da base de dados
- **Gestão de Dados**: Ferramentas avançadas de administração de dados

## 🛠 Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/UI
- **Base de Dados**: MariaDB
- **Gráficos**: Recharts
- **Roteamento**: React Router
- **Estado**: Context API, React Query
- **Formulários**: React Hook Form com validação Zod

## 🐳 Instalação Docker/Unraid

### Pré-requisitos
- Docker instalado
- Unraid 6.8+ (para utilizadores Unraid)
- MariaDB container em execução

### 1. Configuração MariaDB

Crie um container MariaDB no Unraid:

```bash
# Configurações do Container MariaDB
Nome: mariadb-finance
Repository: mariadb:10.11
Network Type: Custom: br0
Port: 3306:3306

# Variáveis de Ambiente
MYSQL_ROOT_PASSWORD: [password_segura]
MYSQL_DATABASE: personal_finance
MYSQL_USER: finance_user
MYSQL_PASSWORD: [password_utilizador]

# Volumes
/mnt/user/appdata/mariadb:/var/lib/mysql
```

### 2. Instalação da Aplicação no Unraid

1. **Via Community Applications (Recomendado)**:
   - Pesquise por "Personal Finance Manager"
   - Instale e configure as variáveis

2. **Via Docker Run**:

```bash
docker run -d \
  --name=personal-finance \
  --net=bridge \
  -p 8080:80 \
  -v /mnt/user/appdata/personal-finance:/app \
  --restart unless-stopped \
  [seu-dockerhub-username]/personal-finance:latest
```

3. **Via Docker Compose** (para instalação manual):

```yaml
version: '3.8'
services:
  personal-finance:
    image: [seu-dockerhub-username]/personal-finance:latest
    container_name: personal-finance
    ports:
      - "8080:80"
    volumes:
      - /mnt/user/appdata/personal-finance:/app
    restart: unless-stopped
    depends_on:
      - mariadb
    environment:
      - DB_HOST=mariadb
      - DB_PORT=3306
      - DB_NAME=personal_finance
      - DB_USER=finance_user
      - DB_PASSWORD=[password_utilizador]

  mariadb:
    image: mariadb:10.11
    container_name: mariadb-finance
    ports:
      - "3306:3306"
    volumes:
      - /mnt/user/appdata/mariadb:/var/lib/mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=[password_segura]
      - MYSQL_DATABASE=personal_finance
      - MYSQL_USER=finance_user
      - MYSQL_PASSWORD=[password_utilizador]
```

### 3. Configuração Inicial

1. Aceda à aplicação: `http://[IP_UNRAID]:8080`
2. Complete a configuração inicial da base de dados
3. Crie a sua conta de utilizador
4. Configure as suas contas e categorias

## 🔄 Atualização da Aplicação

### Método 1: Via Unraid Interface (Recomendado)

1. Aceda ao **Docker** tab no Unraid
2. Localize o container "personal-finance"
3. Clique em **Update Container**
4. O sistema irá descarregar automaticamente a versão mais recente

### Método 2: Via Linha de Comandos

```bash
# Parar o container
docker stop personal-finance

# Remover o container (os dados permanecem nos volumes)
docker rm personal-finance

# Descarregar a imagem mais recente
docker pull [seu-dockerhub-username]/personal-finance:latest

# Recriar o container com a nova imagem
docker run -d \
  --name=personal-finance \
  --net=bridge \
  -p 8080:80 \
  -v /mnt/user/appdata/personal-finance:/app \
  --restart unless-stopped \
  [seu-dockerhub-username]/personal-finance:latest
```

### Método 3: Webhook Automático (Avançado)

Configure um webhook no GitHub para atualizações automáticas:

1. Instale o plugin **Webhook** no Unraid
2. Configure o endpoint: `http://[IP_UNRAID]:9000/hooks/update-finance`
3. No GitHub, adicione o webhook URL nas definições do repositório
4. As atualizações serão aplicadas automaticamente após cada commit

## 🛠 Desenvolvimento Local

Para desenvolver localmente:

```bash
# Clonar o repositório
git clone [URL_DO_REPOSITORIO]
cd personal-finance-manager

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📊 Estrutura da Base de Dados

A aplicação cria automaticamente as seguintes tabelas:
- `users` - Dados dos utilizadores
- `accounts` - Contas financeiras
- `transactions` - Transações
- `budgets` - Orçamentos
- `savings_goals` - Objetivos de poupança
- `investments` - Investimentos
- `assets` - Ativos e bens
- `categories` - Categorias personalizadas
- `recurring_transactions` - Transações recorrentes
- `notifications` - Centro de notificações

## 🔧 Configuração

A aplicação pode ser configurada através de:
- Interface web (Definições > Configurações)
- Variáveis de ambiente Docker
- Ficheiro de configuração JSON

## 📝 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça fork do projeto
2. Crie uma branch para a funcionalidade (`git checkout -b feature/nova-funcionalidade`)
3. Commit as alterações (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📞 Suporte

Para questões e suporte:
- Abra um issue no GitHub
- Consulte a documentação na aplicação
- Verifique os logs do container para diagnóstico

## 🚀 Roadmap

- [ ] Aplicação mobile nativa
- [ ] Integração com APIs bancárias
- [ ] Análise de mercado em tempo real
- [ ] Relatórios fiscais automáticos
- [ ] Suporte multi-idioma completo