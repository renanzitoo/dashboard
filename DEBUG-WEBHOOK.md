# 🔍 Diagnosticar Problema do Webhook

## Passos para verificar:

### 1. Testar se a rota webhook está funcionando

**Cole no console do navegador (F12):**

```javascript
// Teste 1: Verificar se a rota existe
fetch('https://dashboard-fhpp.vercel.app/api/webhook?table=customers&since=0')
  .then(r => r.json())
  .then(d => console.log('✅ Rota funcionando:', d))
  .catch(e => console.error('❌ Erro:', e))

// Teste 2: Simular um webhook
fetch('https://dashboard-fhpp.vercel.app/api/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    table: 'customers',
    type: 'INSERT',
    record: { id: 'test', name: 'Teste' }
  })
})
  .then(r => r.json())
  .then(d => console.log('✅ POST funcionando:', d))
  .catch(e => console.error('❌ Erro:', e))
```

### 2. Verificar configuração do webhook no Supabase

No Supabase, verifique se:

**URL:** `https://dashboard-fhpp.vercel.app/api/webhook`
**Method:** `POST`
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**⚠️ IMPORTANTE:** O payload do webhook precisa incluir o nome da tabela!

### 3. Configurar o payload corretamente

No Supabase, ao criar o webhook, configure o **Payload** assim:

```json
{
  "table": "customers",
  "type": "{{ operation }}",
  "record": {{ record }}
}
```

**OU** se não tiver campo de payload personalizado, apenas certifique-se que o webhook está enviando dados.

### 4. Ver logs do webhook

Cole isto no console do navegador:

```javascript
// Criar intervalo para verificar
setInterval(async () => {
  const res = await fetch('/api/webhook?table=customers&since=0')
  const data = await res.json()
  console.log('Verificação:', data)
}, 2000)
```

Se retornar `hasChanges: false`, significa que o webhook não está chegando.

---

## 🔧 Possíveis problemas:

### Problema 1: Webhook não está configurado corretamente
**Solução:** Reconfigure no Supabase Database → Webhooks

### Problema 2: Payload está errado
**Solução:** O webhook PRECISA enviar `{ "table": "nome_da_tabela" }`

### Problema 3: A rota não foi deployada
**Solução:** Verifique se fez commit e push do arquivo `/src/app/api/webhook/route.js`

---

## Me diga:

1. **Os testes acima funcionaram?**
2. **Você vê algum erro no console do navegador?**
3. **O webhook aparece como "enviado" no Supabase?**
