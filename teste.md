# Documentação de Arquitetura de Dados - Dashboard

## 📋 Visão Geral

Este documento descreve a arquitetura de dados da aplicação, incluindo a estrutura das tabelas no Supabase e os padrões utilizados para buscar e gerenciar dados.

---

## 🗄️ Esquema das Tabelas

### 1. **Tabela: `appointments`**

Armazena todos os agendamentos da aplicação.

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único do agendamento (UUID)
- `customer_id`: Referência ao cliente que fez o agendamento
- `start_time`: Data e hora de início do agendamento
- `end_time`: Data e hora de término
- `status`: Estado do agendamento (pendente, concluído, cancelado)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Índices Recomendados:**
```sql
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);
CREATE INDEX idx_appointments_status ON appointments(status);
```

---

### 2. **Tabela: `customers`**

Armazena informações dos clientes.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único do cliente (UUID)
- `name`: Nome completo do cliente
- `email`: Endereço de e-mail (único)
- `phone`: Número de telefone
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Índices Recomendados:**
```sql
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
```

---

### 3. **Tabela: `conversations`**

Armazena conversas entre clientes e o sistema.

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único da conversa (UUID)
- `customer_id`: Referência ao cliente
- `status`: Estado da conversa (aberta ou fechada)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

**Índices Recomendados:**
```sql
CREATE INDEX idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX idx_conversations_status ON conversations(status);
```

---

### 4. **Tabela: `messages`**

Armazena mensagens das conversas.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  sender VARCHAR(20) NOT NULL, -- 'bot' ou 'customer'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único da mensagem (UUID)
- `conversation_id`: Referência à conversa
- `sender`: Quem enviou a mensagem (bot ou cliente)
- `content`: Conteúdo da mensagem
- `created_at`: Data de criação

**Índices Recomendados:**
```sql
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

## 🔄 Fluxo de Dados por Página

### **Login Page (`/login`)**

**Objetivo:** Autenticar usuário no Supabase

**Fluxo:**
```
1. Usuário insere email e senha
2. Chama supabase.auth.signInWithPassword()
3. Supabase retorna token de sessão
4. Redireciona para /dashboard
```

**Código:**
```javascript
const { error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

---

### **Dashboard Page (`/dashboard`)**

**Objetivo:** Mostrar estatísticas gerais de agendamentos

**Dados Buscados:**
- Total de agendamentos
- Total de concluídos
- Total de pendentes

**Fluxo de Busca:**
```javascript
// 1. Busca inicial (síncrono)
const { data: appointments } = await supabase
  .from('appointments')
  .select('id, status')
  .order('created_at', { ascending: false });

// 2. Calcula estatísticas
const totalAppointments = appointments?.length || 0;
const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;

// 3. Atualiza estado
setStats({
  total: totalAppointments,
  completed: completedAppointments,
  pending: pendingAppointments,
});
```

**Real-time Subscription:**
```javascript
supabase
  .channel('appointments_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'appointments' }, 
    () => {
      // Recarrega os dados quando há mudanças
      // Atualiza as estatísticas automaticamente
    }
  )
  .subscribe();
```

---

### **Appointments Page (`/dashboard/appointments`)**

**Objetivo:** Listar todos os agendamentos com filtros

**Dados Buscados:**
- Lista completa de agendamentos

**Fluxo de Busca:**
```javascript
// 1. Busca inicial
const { data } = await supabase
  .from('appointments')
  .select('id, start_time, end_time, status, customer_id, created_at')
  .order('start_time', { ascending: false });

setItems(data || []);

// 2. Aplicar filtros localmente
useEffect(() => {
  let filtered = [...items];
  
  if (statusFilter) {
    filtered = filtered.filter(item => item.status === statusFilter);
  }
  
  if (dateFilter) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.start_time).toISOString().split('T')[0];
      return itemDate === dateFilter;
    });
  }
  
  setFilteredItems(filtered);
}, [items, statusFilter, dateFilter]);
```

**Filtros Disponíveis:**
- **Por Data:** Filtra agendamentos de uma data específica
- **Por Status:** Filtra por 'pending', 'completed', ou 'cancelled'

**Real-time Subscription:**
```javascript
supabase
  .channel('appointments_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'appointments' },
    (payload) => {
      // Recarrega a lista de agendamentos
    }
  )
  .subscribe();
```

---

### **Customers Page (`/dashboard/customers`)**

**Objetivo:** Gerenciar lista de clientes

**Dados Buscados:**
- Lista de todos os clientes

**Fluxo de Busca:**
```javascript
const { data } = await supabase
  .from('customers')
  .select('id, name, email, phone, created_at')
  .order('created_at', { ascending: false });

setItems(data || []);
```

**Real-time Subscription:**
```javascript
supabase
  .channel('customers_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'customers' },
    () => {
      // Recarrega a lista de clientes
    }
  )
  .subscribe();
```

---

### **Conversations Page (`/dashboard/conversations`)**

**Objetivo:** Listar conversas entre clientes e o bot

**Dados Buscados:**
- Lista de conversas
- Informações do cliente de cada conversa

**Fluxo de Busca:**
```javascript
// 1. Busca conversas
const { data: conversations } = await supabase
  .from('conversations')
  .select('*')
  .order('created_at', { ascending: false });

setItems(conversations || []);

// 2. Para cada conversa, busca dados do cliente
for (const conv of conversations) {
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', conv.customer_id)
    .maybeSingle();
}
```

**Real-time Subscription:**
```javascript
supabase
  .channel('conversations_updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'conversations' },
    () => {
      // Recarrega lista de conversas
    }
  )
  .subscribe();
```

---

### **Conversation Detail Page (`/dashboard/conversations/[id]`)**

**Objetivo:** Visualizar detalhes de uma conversa e suas mensagens

**Dados Buscados:**
- Dados da conversa
- Informações do cliente
- Todas as mensagens

**Fluxo de Busca:**
```javascript
// 1. Extrai ID da conversa (dynamic route)
const conversationId = resolvedParams?.id;

// 2. Busca conversa
const { data: convData } = await supabase
  .from('conversations')
  .select('*')
  .eq('id', conversationId)
  .maybeSingle();

// 3. Busca cliente
const { data: customerData } = await supabase
  .from('customers')
  .select('*')
  .eq('id', convData.customer_id)
  .maybeSingle();

// 4. Busca mensagens (ordenadas por data)
const { data: messagesData } = await supabase
  .from('messages')
  .select('*')
  .eq('conversation_id', conversationId)
  .order('created_at', { ascending: true });
```

**Real-time Subscription (Mensagens):**
```javascript
supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes',
    { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      setMessages(prev => [...prev, payload.new]);
    }
  )
  .subscribe();
```

---

## 🔗 Relacionamentos entre Tabelas

```
customers
    ↓
    ├→ appointments (1:N) - Um cliente pode ter vários agendamentos
    ├→ conversations (1:N) - Um cliente pode ter várias conversas
```

```
conversations
    ↓
    └→ messages (1:N) - Uma conversa pode ter várias mensagens
```

---

## 📡 Padrões de Busca de Dados

### **1. Busca Síncrona (Inicial)**
```javascript
// Carregamento inicial de dados
const { data, error } = await supabase
  .from('table_name')
  .select('column1, column2')
  .order('created_at', { ascending: false });
```

### **2. Busca com Filtro**
```javascript
// Com condição específica
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('customer_id', customerId)
  .eq('status', 'pending');
```

### **3. Busca Única (Maybe)**
```javascript
// Retorna um objeto ou null (não erro se não encontrar)
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('id', customerId)
  .maybeSingle();
```

### **4. Real-time Subscription (Atualização Automática)**
```javascript
supabase
  .channel('channel_name')
  .on('postgres_changes',
    {
      event: '*', // INSERT, UPDATE, DELETE ou *
      schema: 'public',
      table: 'table_name',
      filter: 'optional_filter' // Ex: 'user_id=eq.123'
    },
    (payload) => {
      // payload.new - dados novos
      // payload.old - dados antigos
      // payload.eventType - tipo de evento
    }
  )
  .subscribe();
```

---

## 🛡️ Autenticação e Autorização

**Arquivo:** `src/lib/supabaseClient.js`

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

**Verificação de Sessão:**
```javascript
const { data: session } = await supabase.auth.getSession();

if (!session?.session) {
  router.push('/login');
  return;
}
```

---

## 🔒 Política de Segurança Recomendada

### **Row Level Security (RLS) - Recomendado para produção**

```sql
-- Exemplo: Usuários só podem ver seus próprios dados
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_auth_policy ON customers
  FOR SELECT
  USING (auth.uid()::text = user_id);
```

---

## 📊 Estatísticas e Agregações

### **Dashboard - Cálculo de Estatísticas**

```javascript
// Estatísticas calculadas no cliente
const totalAppointments = appointments?.length || 0;
const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;
const completionPercentage = Math.round((completedAppointments / totalAppointments) * 100);
```

---

## 🚀 Performance e Otimizações

### **Boas Práticas Implementadas:**

1. **Seleção Específica de Colunas:**
   ```javascript
   // ✅ BOM - Retorna apenas colunas necessárias
   .select('id, status, customer_id')
   
   // ❌ RUIM - Retorna todas as colunas
   .select('*')
   ```

2. **Ordenação:**
   ```javascript
   .order('created_at', { ascending: false })
   ```

3. **Filtros no Banco:**
   ```javascript
   .eq('status', 'completed') // Filtro no Supabase
   ```

4. **Real-time Subscriptions:**
   - Reduz necessidade de polling
   - Atualiza dados automaticamente
   - Melhora experiência do usuário

---

## 📝 Variáveis de Ambiente

**Arquivo:** `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🐛 Tratamento de Erros

### **Padrão Utilizado:**

```javascript
try {
  const { data, error } = await supabase.from('table').select('*');
  
  if (error) {
    console.error('Erro ao buscar dados:', error);
    setError('Mensagem amigável ao usuário');
    return;
  }
  
  setData(data);
} catch (err) {
  console.error('Erro geral:', err);
  setError('Erro ao carregar dados');
}
```

---

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização:** Janeiro 2026
