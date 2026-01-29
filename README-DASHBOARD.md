# Dashboard com Next.js, Supabase e shadcn/ui

Dashboard completo para gerenciar agendamentos, clientes e conversas usando Next.js 16, Supabase e shadcn/ui.

## 🚀 Configuração Inicial

### 1. Instalar Dependências

As dependências já foram instaladas. Se precisar reinstalar:

```bash
npm install
```

### 2. Configurar Supabase

#### 2.1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Crie um novo projeto
4. Anote a URL e a Chave Anon (API Key)

#### 2.2. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

#### 2.3. Criar Tabelas no Supabase

Execute os seguintes comandos SQL no SQL Editor do Supabase:

```sql
-- Tabela de Clientes
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Customers
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);

-- Tabela de Agendamentos
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Appointments
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Tabela de Conversas
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Conversations
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status);

-- Tabela de Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 2.4. Configurar Autenticação

1. No painel do Supabase, vá em **Authentication** > **Providers**
2. Habilite **Email** provider
3. Em **Authentication** > **Users**, crie um novo usuário com email e senha para testar

#### 2.5. Habilitar Realtime (Opcional)

1. Vá em **Database** > **Replication**
2. Habilite Realtime para as tabelas: `appointments`, `customers`, `conversations`, `messages`

## 📦 Estrutura do Projeto

```
dashboard-new/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── appointments/
│   │   │   │   └── page.js          # Lista de agendamentos
│   │   │   ├── customers/
│   │   │   │   └── page.js          # Lista de clientes
│   │   │   ├── conversations/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.js      # Detalhes da conversa
│   │   │   │   └── page.js          # Lista de conversas
│   │   │   └── page.js              # Dashboard principal
│   │   ├── login/
│   │   │   └── page.js              # Página de login
│   │   ├── globals.css
│   │   └── layout.js
│   ├── components/
│   │   └── ui/
│   │       ├── button.jsx           # Componente Button
│   │       ├── card.jsx             # Componente Card
│   │       └── input.jsx            # Componente Input
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js            # Cliente Supabase (client-side)
│   │   │   ├── server.js            # Cliente Supabase (server-side)
│   │   │   └── middleware.js        # Middleware Supabase
│   │   └── utils.js                 # Utilitários (cn function)
│   └── middleware.js                # Middleware Next.js
├── .env.local
└── package.json
```

## 🎯 Funcionalidades

### Autenticação
- Login com email e senha
- Proteção de rotas via middleware
- Logout

### Dashboard Principal
- Estatísticas de agendamentos
- Cartões de navegação rápida
- Atualização em tempo real

### Agendamentos
- Lista de todos os agendamentos
- Filtros por status e data
- Atualização em tempo real
- Status: Pendente, Concluído, Cancelado

### Clientes
- Lista de todos os clientes
- Informações de contato
- Atualização em tempo real

### Conversas
- Lista de conversas
- Visualização de mensagens
- Status: Aberta/Fechada
- Atualização de mensagens em tempo real

## 🚀 Executar o Projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## 📱 Rotas da Aplicação

- `/login` - Página de login
- `/dashboard` - Dashboard principal
- `/dashboard/appointments` - Lista de agendamentos
- `/dashboard/customers` - Lista de clientes
- `/dashboard/conversations` - Lista de conversas
- `/dashboard/conversations/[id]` - Detalhes da conversa

## 🔧 Tecnologias Utilizadas

- **Next.js 16** - Framework React
- **Supabase** - Backend as a Service (BaaS)
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones

## 📝 Próximos Passos

1. Adicionar formulários para criar/editar agendamentos
2. Adicionar formulários para criar/editar clientes
3. Implementar envio de mensagens nas conversas
4. Adicionar paginação nas listas
5. Implementar Row Level Security (RLS) no Supabase
6. Adicionar notificações
7. Criar dashboard de métricas avançadas

## 🔒 Segurança

⚠️ **IMPORTANTE**: Atualmente, as tabelas não têm Row Level Security (RLS) ativado. Para produção, você deve:

1. Habilitar RLS em todas as tabelas
2. Criar políticas de acesso apropriadas
3. Implementar autorização baseada em usuário

Exemplo de política RLS:

```sql
-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Criar política (exemplo)
CREATE POLICY "Users can view all customers" ON customers
  FOR SELECT
  USING (true);
```

## 📚 Documentação

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
