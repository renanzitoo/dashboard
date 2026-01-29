# Configuração de Atualizações em Tempo Real

Este dashboard utiliza **Supabase Realtime** para atualizar automaticamente os dados sem precisar recarregar a página (F5).

## 📡 Funcionalidades Implementadas

### ✅ Páginas com Realtime Ativo

1. **Dashboard Principal** (`/dashboard`)
   - Estatísticas de agendamentos
   - Contador de clientes
   - Contador de conversas
   - Atualiza quando há mudanças em qualquer uma dessas tabelas

2. **Agendamentos** (`/dashboard/appointments`)
   - Lista completa de agendamentos
   - Atualiza automaticamente ao adicionar, editar ou remover agendamentos

3. **Clientes** (`/dashboard/customers`)
   - Lista de todos os clientes
   - Atualiza automaticamente ao adicionar, editar ou remover clientes

4. **Conversas** (`/dashboard/conversations`)
   - Lista de conversas
   - Atualiza automaticamente ao adicionar, editar ou remover conversas

5. **Detalhes da Conversa** (`/dashboard/conversations/[id]`)
   - Mensagens em tempo real
   - Atualiza quando novas mensagens são enviadas
   - Atualiza quando mensagens são editadas ou removidas
   - Atualiza informações da conversa
   - Atualiza informações do cliente

## ⚙️ Configuração no Supabase

Para que as atualizações em tempo real funcionem, você precisa habilitar o Realtime nas tabelas do Supabase:

### 1. Acesse o Painel do Supabase

Vá para: `https://supabase-supabase.jgxfrn.easypanel.host/project/_/database/publications`

### 2. Habilite o Realtime para as Tabelas

Certifique-se de que as seguintes tabelas estão com o Realtime habilitado:

- ✅ `appointments`
- ✅ `customers`
- ✅ `conversations`
- ✅ `messages`

### 3. Como Habilitar

1. Clique em **Database** no menu lateral
2. Clique em **Replication** ou **Publications**
3. Encontre a publicação `supabase_realtime`
4. Adicione as tabelas acima se ainda não estiverem incluídas
5. Marque todas as operações: `INSERT`, `UPDATE`, `DELETE`

### Ou via SQL:

```sql
-- Habilitar realtime para appointments
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Habilitar realtime para customers
ALTER PUBLICATION supabase_realtime ADD TABLE customers;

-- Habilitar realtime para conversations
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Habilitar realtime para messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

## 🔍 Como Funciona

O sistema utiliza **Supabase Channels** para ouvir mudanças nas tabelas:

```javascript
const channel = supabase
  .channel('nome_do_canal')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'nome_da_tabela' },
    (payload) => {
      // Recarrega os dados automaticamente
    }
  )
  .subscribe()
```

### Eventos Monitorados

- **INSERT**: Quando um novo registro é criado
- **UPDATE**: Quando um registro é atualizado
- **DELETE**: Quando um registro é removido
- **\***: Todos os eventos acima

## 🧪 Como Testar

1. Abra duas janelas do navegador lado a lado
2. Navegue para a mesma página em ambas
3. Em uma janela, adicione/edite/remova um registro diretamente no Supabase
4. A outra janela deve atualizar automaticamente sem F5!

## 🛠️ Troubleshooting

### As atualizações não estão funcionando?

1. **Verifique se o Realtime está habilitado** nas tabelas (veja instruções acima)
2. **Verifique o console do navegador** por erros de conexão
3. **Verifique as credenciais** no arquivo `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Console mostra erro de subscription?

Certifique-se de que:
- O Supabase está acessível
- As permissões RLS (Row Level Security) permitem leitura dos dados
- A publicação `supabase_realtime` existe e inclui as tabelas

### Dados não atualizam instantaneamente?

- Pode haver um pequeno atraso (1-2 segundos)
- Verifique a conexão de internet
- Em ambientes de desenvolvimento local, o realtime pode ser mais lento

## 📊 Monitoramento

Para verificar se as subscriptions estão ativas, você pode:

```javascript
// Adicione isso temporariamente no console do navegador
console.log(supabase.getChannels())
```

Isso mostrará todos os canais ativos e suas subscriptions.

## 🎯 Benefícios

- ✅ **Sem refresh manual**: Dados sempre atualizados
- ✅ **Melhor UX**: Experiência fluida e moderna
- ✅ **Colaboração em tempo real**: Múltiplos usuários veem as mesmas mudanças
- ✅ **Menos carga no servidor**: Apenas as mudanças são enviadas
- ✅ **Notificações instantâneas**: Novos dados aparecem imediatamente

## 📚 Documentação Adicional

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime/postgres-changes)
