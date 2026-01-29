# 🔧 Como Configurar o Realtime no Easypanel

## 🎯 Objetivo
Fazer o WebSocket do Supabase Realtime funcionar no seu Easypanel.

---

## 📋 PASSO 1: Acessar o Easypanel

1. Acesse seu painel:
   ```
   https://easypanel.jgxfrn.easypanel.host
   ```
   (ou o endereço do seu Easypanel)

2. Faça login

3. Encontre o projeto **Supabase**

---

## 🔍 PASSO 2: Verificar Serviços Ativos

No seu projeto Supabase, verifique quais serviços estão rodando:

### Serviços essenciais do Supabase:
- ✅ `postgres` (banco de dados)
- ✅ `kong` (API Gateway)
- ✅ `auth` (GoTrue - autenticação)
- ✅ `rest` (PostgREST - API REST)
- ✅ `storage` (armazenamento)
- ⚠️ **`realtime`** ← ESTE PRECISA ESTAR ATIVO!

### Como verificar:
- Vá em **Services** ou **Containers**
- Procure por um serviço chamado `realtime` ou `supabase-realtime`

---

## 🚀 PASSO 3: Adicionar o Serviço Realtime

Se o serviço **Realtime** NÃO existir, você tem duas opções:

### Opção A: Reinstalar o Supabase com template completo

1. No Easypanel, vá em **Templates** ou **Marketplace**
2. Procure por **Supabase** (template oficial)
3. Certifique-se de que o template inclui **TODOS os serviços**
4. Reinstale (⚠️ isso pode apagar dados existentes - faça backup!)

### Opção B: Adicionar serviço Realtime manualmente

Se você tem acesso ao **docker-compose** ou **configuração avançada**:

1. No Easypanel, vá até seu projeto Supabase
2. Procure por **Docker Compose** ou **Advanced Settings**
3. Adicione este serviço:

```yaml
realtime:
  image: supabase/realtime:v2.28.32
  container_name: realtime-dev
  depends_on:
    db:
      condition: service_healthy
  restart: unless-stopped
  environment:
    PORT: 4000
    DB_HOST: db
    DB_PORT: 5432
    DB_USER: supabase_admin
    DB_PASSWORD: ${POSTGRES_PASSWORD}
    DB_NAME: postgres
    DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
    DB_ENC_KEY: supabaserealtime
    API_JWT_SECRET: ${JWT_SECRET}
    FLY_ALLOC_ID: fly123
    FLY_APP_NAME: realtime
    SECRET_KEY_BASE: UpNVntn3cDxHJpq99YMc1T1AQgQpc8kfYTuRgBiYa15BLrx8etQoXz3gZv1/u2oq
    ERL_AFLAGS: -proto_dist inet_tcp
    ENABLE_TAILSCALE: "false"
    DNS_NODES: "''"
  command: >
    sh -c "/app/bin/migrate && /app/bin/realtime eval 'Realtime.Release.seeds(Realtime.Repo)' && /app/bin/server"
  ports:
    - "4000:4000"
```

4. Salve e **rebuild/redeploy** o projeto

---

## 🔌 PASSO 4: Configurar o Kong (API Gateway)

O **Kong** precisa rotear as requisições WebSocket para o Realtime:

### Verificar configuração do Kong:

O Kong deve ter uma rota assim:

```yaml
- name: realtime-v1
  url: http://realtime:4000/socket
  routes:
    - name: realtime-v1-route
      strip_path: true
      paths:
        - /realtime/v1/
```

Se você instalou o Supabase por template oficial, isso já deve estar configurado.

---

## 🔐 PASSO 5: Verificar Variáveis de Ambiente

Certifique-se que estas variáveis estão configuradas:

```env
POSTGRES_PASSWORD=sua_senha_postgres
JWT_SECRET=sua_chave_jwt_secreta
ANON_KEY=sua_anon_key
SERVICE_KEY=sua_service_key
```

**Importante:** O `JWT_SECRET` precisa ser o MESMO em todos os serviços!

---

## 🌐 PASSO 6: Verificar SSL/HTTPS

O WebSocket precisa de **WSS** (WebSocket Secure) se sua aplicação usa HTTPS.

### No Easypanel:

1. Vá em **Settings** do projeto
2. Verifique se o **SSL/HTTPS** está habilitado
3. Certifique-se que o certificado está válido

### Teste:

```javascript
// Cole no console do navegador
const ws = new WebSocket('wss://supabase-supabase.jgxfrn.easypanel.host/realtime/v1/websocket?apikey=SUA_ANON_KEY&vsn=1.0.0')
ws.onopen = () => console.log('✅ Conectou!')
ws.onerror = (e) => console.error('❌ Erro:', e)
```

---

## 🧪 PASSO 7: Testar se está Funcionando

### Teste 1: Verificar se o endpoint responde

```bash
curl https://supabase-supabase.jgxfrn.easypanel.host/realtime/v1/
```

**Resultado esperado:** Alguma resposta (não 404)

### Teste 2: No console do navegador

```javascript
const { createClient } = await import('/src/lib/supabase/client.js')
const supabase = createClient()

const channel = supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'customers' },
    (payload) => console.log('🎉 FUNCIONOU!', payload)
  )
  .subscribe((status) => {
    console.log('Status:', status)
    if (status === 'SUBSCRIBED') {
      console.log('✅ REALTIME CONECTADO!')
    }
  })
```

**Se mostrar "SUBSCRIBED"**: ✅ Funcionou!  
**Se mostrar "CHANNEL_ERROR"**: ❌ Ainda não está configurado

---

## 🔧 Troubleshooting

### Erro: "Connection refused"
**Causa:** Serviço Realtime não está rodando  
**Solução:** Inicie o container Realtime

### Erro: "404 Not Found"
**Causa:** Rota não configurada no Kong  
**Solução:** Verifique configuração do Kong

### Erro: "WebSocket closed"
**Causa:** SSL/certificado inválido  
**Solução:** Configure SSL corretamente no Easypanel

### Erro: "Unauthorized"
**Causa:** JWT_SECRET diferente entre serviços  
**Solução:** Certifique-se que JWT_SECRET é igual em todos os containers

---

## 📞 Comandos Úteis (se tiver acesso SSH)

```bash
# Ver logs do Realtime
docker logs supabase-realtime -f

# Ver se o container está rodando
docker ps | grep realtime

# Reiniciar o Realtime
docker restart supabase-realtime

# Ver portas abertas
netstat -tulpn | grep 4000
```

---

## 🎯 Checklist Rápido

- [ ] Serviço Realtime existe no Easypanel
- [ ] Container Realtime está rodando (status: healthy)
- [ ] Porta 4000 está acessível
- [ ] Kong está roteando /realtime/v1/ para o Realtime
- [ ] JWT_SECRET é o mesmo em todos os serviços
- [ ] SSL/HTTPS está configurado
- [ ] Executei o SQL `enable-realtime.sql` no banco
- [ ] Testei a conexão WebSocket

---

## 💡 Dica Final

Se você não tem acesso ao docker-compose ou configurações avançadas:

1. **Contate o administrador** do Easypanel
2. Peça para verificar se o serviço **supabase-realtime** está rodando
3. Se não estiver, peça para adicioná-lo usando o template oficial do Supabase

---

## 📚 Referências

- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Docker Compose Supabase](https://github.com/supabase/supabase/blob/master/docker/docker-compose.yml)

---

**Após configurar, volte e me diga se funcionou! 🚀**
