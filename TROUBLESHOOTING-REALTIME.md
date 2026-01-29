# 🔧 Troubleshooting - Realtime não está funcionando

## ✅ Checklist de Diagnóstico

Siga estes passos **EM ORDEM** para identificar o problema:

---

## 📝 PASSO 1: Executar o SQL para Habilitar Realtime

**ISSO É OBRIGATÓRIO!** Sem isso, o realtime NÃO funcionará.

1. Acesse o SQL Editor do Supabase:
   ```
   https://supabase-supabase.jgxfrn.easypanel.host/project/_/sql
   ```

2. Copie e cole o conteúdo do arquivo `enable-realtime.sql`

3. Clique em **RUN** para executar

4. Você deve ver uma mensagem de sucesso e uma lista das tabelas com realtime habilitado

---

## 🔍 PASSO 2: Verificar se o Realtime foi Habilitado

Execute este SQL no SQL Editor para confirmar:

```sql
SELECT 
  schemaname,
  tablename
FROM 
  pg_publication_tables
WHERE 
  pubname = 'supabase_realtime'
ORDER BY 
  tablename;
```

**Resultado esperado:** Você deve ver estas 4 tabelas:
- ✅ appointments
- ✅ conversations
- ✅ customers
- ✅ messages

Se não aparecer todas as 4 tabelas, execute o `enable-realtime.sql` novamente!

---

## 🌐 PASSO 3: Verificar Conexão no Console do Navegador

1. Abra o seu dashboard no navegador
2. Pressione **F12** para abrir o Console do DevTools
3. Recarregue a página (F5)
4. Procure por mensagens com emojis 📡 e 🔄

### ✅ Sinais de que está funcionando:

```
📡 Status da conexão (appointments): SUBSCRIBED
📡 Status da conexão (customers): SUBSCRIBED
📡 Status da conexão (conversations): SUBSCRIBED
```

### ❌ Sinais de problema:

```
📡 Status da conexão: CLOSED
📡 Status da conexão: CHANNEL_ERROR
📡 Status da conexão: TIMED_OUT
```

---

## 🧪 PASSO 4: Testar Atualizações em Tempo Real

### Teste Simples:

1. Abra **duas janelas** do navegador lado a lado
2. Em ambas, navegue para `/dashboard/customers`
3. No SQL Editor do Supabase, execute:
   ```sql
   INSERT INTO customers (name, email, phone) 
   VALUES ('Teste Realtime', 'teste@example.com', '(11) 99999-9999');
   ```
4. **Veja se o novo cliente aparece automaticamente nas duas janelas SEM apertar F5**

### Se aparecer:
✅ **Realtime está funcionando!** Você pode deletar o cliente de teste:
```sql
DELETE FROM customers WHERE email = 'teste@example.com';
```

### Se NÃO aparecer:
❌ Continue para o próximo passo...

---

## 🔐 PASSO 5: Verificar Variáveis de Ambiente

Verifique se o arquivo `.env.local` existe e tem as variáveis corretas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase-supabase.jgxfrn.easypanel.host
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

**⚠️ IMPORTANTE:** Se você alterou o `.env.local`, você PRECISA reiniciar o servidor Next.js!

```powershell
# Pare o servidor (Ctrl + C no terminal)
# Depois inicie novamente:
npm run dev
```

---

## 🔌 PASSO 6: Verificar Configuração do Supabase (Painel)

1. Acesse: `https://supabase-supabase.jgxfrn.easypanel.host/project/_/database/replication`

2. Procure pela publicação `supabase_realtime`

3. Verifique se as 4 tabelas estão listadas:
   - appointments
   - conversations  
   - customers
   - messages

4. Certifique-se que todos os eventos estão marcados:
   - ✅ INSERT
   - ✅ UPDATE
   - ✅ DELETE

---

## 🌍 PASSO 7: Verificar Firewall/Rede

O Realtime usa **WebSockets**. Algumas redes bloqueiam WebSockets.

### Teste de Conexão WebSocket:

Abra o Console do navegador e execute:

```javascript
const supabase = createClient()
const channel = supabase.channel('test')
  .subscribe((status) => {
    console.log('Status:', status)
  })
```

Se o status ficar em `CLOSED` ou `CHANNEL_ERROR`, pode ser problema de rede.

### Soluções:
- Tente em outra rede (ex: 4G do celular)
- Desative VPN/Proxy temporariamente
- Verifique se o firewall da empresa está bloqueando WebSockets

---

## 📊 PASSO 8: Verificar Logs Detalhados

No Console do navegador, você deve ver logs como:

### Quando a página carrega:
```
📡 Status da conexão (appointments): SUBSCRIBED
```

### Quando há uma mudança nos dados:
```
🔄 Realtime - Cliente atualizado: {
  eventType: "INSERT",
  new: { id: "...", name: "João", ... },
  old: {},
  ...
}
```

Se você **NÃO** vê esses logs, há um problema na configuração do cliente.

---

## 🔄 PASSO 9: Limpar Cache e Reiniciar

Às vezes o problema é cache antigo:

```powershell
# No terminal do projeto:

# 1. Limpar cache do Next.js
rm -r .next

# 2. Reinstalar dependências
npm install

# 3. Reiniciar o servidor
npm run dev
```

---

## 🆘 PASSO 10: Verificação Final

Se **NADA** funcionou até aqui, copie os logs do console e me envie. Procure por:

1. Qualquer mensagem de erro em vermelho
2. Os status das conexões (📡)
3. Se há algum payload sendo recebido (🔄)

---

## ✨ Comandos Úteis para Debug

### Verificar conexões ativas no console:

```javascript
// No Console do navegador
console.log('Canais ativos:', supabase.getChannels())
```

### Forçar reconexão:

```javascript
// No Console do navegador
const channels = supabase.getChannels()
channels.forEach(ch => ch.unsubscribe())
window.location.reload()
```

---

## 📞 Mensagens de Status Possíveis

| Status | Significado |
|--------|-------------|
| `SUBSCRIBING` | Tentando se conectar... (normal por alguns segundos) |
| `SUBSCRIBED` | ✅ Conectado e funcionando! |
| `CLOSED` | ❌ Conexão fechada (problema de rede ou config) |
| `CHANNEL_ERROR` | ❌ Erro no canal (verificar SQL/permissões) |
| `TIMED_OUT` | ❌ Timeout (problema de rede) |

---

## 🎯 Resumo Rápido

1. ✅ Execute o `enable-realtime.sql` no Supabase
2. ✅ Verifique se as 4 tabelas aparecem na query de verificação
3. ✅ Abra o Console (F12) e procure por "SUBSCRIBED"
4. ✅ Teste inserindo dados pelo SQL Editor
5. ✅ Se não funcionar, reinicie o servidor Next.js
6. ✅ Limpe o cache se necessário

---

**Última atualização:** 28 de Janeiro de 2026
