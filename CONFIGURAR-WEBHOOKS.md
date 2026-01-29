# ⚙️ Configurar Database Webhooks no Supabase

## 📋 O que você precisa fazer:

Você já tem o **Database Webhooks** instalado! Agora vamos configurar os webhooks para cada tabela.

---

## 🔧 PASSO 1: Criar Webhooks no Supabase

### 1. Acesse o painel do Supabase:
```
https://supabase-supabase.jgxfrn.easypanel.host/project/_/database/hooks
```

### 2. Para cada tabela, crie um webhook:

#### Webhook para CUSTOMERS:
- **Table**: `customers`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://SEU_DOMINIO/api/webhook`
- **Headers**:
  ```json
  {
    "Content-Type": "application/json"
  }
  ```

#### Webhook para APPOINTMENTS:
- **Table**: `appointments`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://SEU_DOMINIO/api/webhook`

#### Webhook para CONVERSATIONS:
- **Table**: `conversations`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://SEU_DOMINIO/api/webhook`

#### Webhook para MESSAGES:
- **Table**: `messages`
- **Events**: `INSERT`, `UPDATE`, `DELETE`
- **Type**: `HTTP Request`
- **Method**: `POST`
- **URL**: `https://SEU_DOMINIO/api/webhook`

---

## 🌐 PASSO 2: URL do Webhook

### Se estiver em desenvolvimento local:
```
http://localhost:3000/api/webhook
```

### Se já tiver um domínio em produção:
```
https://seu-dominio.com/api/webhook
```

### ⚠️ Importante para desenvolvimento local:
O webhook não funcionará em `localhost` se o Supabase estiver em um servidor externo. 

**Soluções:**
1. Use **ngrok** para expor localhost:
   ```bash
   ngrok http 3000
   ```
   Depois use a URL do ngrok: `https://xxxx.ngrok.io/api/webhook`

2. Deploy em produção (Vercel, Netlify, etc.)

---

## 📝 PASSO 3: Configurar o Payload do Webhook

No Supabase, configure o payload assim:

```json
{
  "table": "{{ table_name }}",
  "type": "{{ operation }}",
  "record": {{ new_record }},
  "old_record": {{ old_record }}
}
```

Ou se preferir mais simples:
```json
{
  "table": "{{ table_name }}",
  "type": "{{ operation }}"
}
```

---

## 🧪 PASSO 4: Testar o Webhook

### 1. Certifique-se que o servidor Next.js está rodando:
```bash
npm run dev
```

### 2. No SQL Editor, insira um teste:
```sql
INSERT INTO customers (name, email) 
VALUES ('Teste Webhook', 'webhook@test.com');
```

### 3. Verifique o console do servidor Next.js:
Você deve ver:
```
🔔 Webhook recebido: { table: 'customers', type: 'INSERT', timestamp: ... }
```

### 4. Delete o teste:
```sql
DELETE FROM customers WHERE email = 'webhook@test.com';
```

---

## 🔄 PASSO 5: Atualizar as Páginas do Dashboard

Agora vou atualizar as páginas para usar o sistema de webhooks.

**Quer que eu atualize as páginas agora?** Digite "atualizar para webhooks"

---

## 📊 Como Funciona:

```
┌─────────────┐
│  Supabase   │
│   Database  │
└──────┬──────┘
       │ Mudança no banco
       ▼
┌─────────────┐
│  Database   │
│  Webhook    │ Envia POST
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Next.js    │
│  /api/webhook│ Recebe e armazena
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Frontend   │ Verifica mudanças
│  Dashboard  │ a cada 2 segundos
└─────────────┘
```

**Vantagens:**
- ✅ Polling leve (só verifica se houve mudança)
- ✅ Atualização rápida (2 segundos após mudança)
- ✅ Não precisa de WebSocket
- ✅ Funciona com qualquer hosting

---

## 🚀 Alternativa: Usar SQL Triggers

Se preferir uma solução mais direta, posso configurar triggers SQL que chamam funções PostgreSQL para notificar mudanças. Me avise!

---

**Próximo passo:** Me diga se você:
1. Já configurou os webhooks no Supabase → Digite "webhooks configurados"
2. Quer que eu atualize as páginas → Digite "atualizar para webhooks"
3. Precisa de ajuda com ngrok para desenvolvimento → Digite "ajuda ngrok"
