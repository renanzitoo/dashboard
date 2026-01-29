# 🐳 Deploy com Docker

## ✅ Arquivos criados:

1. **Dockerfile** - Build otimizado com multi-stage
2. **docker-compose.yml** - Orquestração do container
3. **.dockerignore** - Ignorar arquivos desnecessários
4. **.env.docker** - Variáveis de ambiente

---

## 🚀 Como usar:

### Opção 1: Docker Compose (Mais fácil)

```bash
# Build e start em um comando
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

Acesse: `http://localhost:3000`

---

### Opção 2: Docker puro

```bash
# Build da imagem
docker build -t dashboard-nextjs .

# Rodar o container
docker run -d \
  --name dashboard \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://supabase-supabase.jgxfrn.easypanel.host \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui \
  dashboard-nextjs

# Ver logs
docker logs -f dashboard

# Parar
docker stop dashboard
docker rm dashboard
```

---

## 🏗️ Deploy no Easypanel

### 1. Push para o GitHub (já feito)
```bash
git add .
git commit -m "Add Docker support"
git push origin main
```

### 2. No Easypanel:

#### Criar novo serviço:
1. **New Service** → **From GitHub**
2. Conecte seu repositório: `renanzitoo/dashboard`
3. Selecione branch: `main`
4. **Build Type**: Dockerfile
5. **Port**: 3000

#### Variáveis de Ambiente:
```
NEXT_PUBLIC_SUPABASE_URL=https://supabase-supabase.jgxfrn.easypanel.host
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

#### Deploy:
- Clique em **Deploy**
- O Easypanel vai:
  1. Clonar do GitHub
  2. Buildar com Dockerfile
  3. Rodar o container
  4. Expor na porta 3000

---

## 🔧 Configurações do Dockerfile:

### Multi-stage build (3 stages):
1. **deps** - Clona do GitHub e instala dependências
2. **builder** - Faz o build do Next.js
3. **runner** - Imagem final leve (produção)

### Otimizações:
- ✅ Usa Node 20 Alpine (imagem pequena)
- ✅ Build standalone (menor tamanho)
- ✅ Usuário não-root (segurança)
- ✅ Cache de layers do Docker
- ✅ Multi-stage (imagem final ~200MB)

---

## 📝 Comandos úteis:

```bash
# Ver imagens
docker images

# Ver containers rodando
docker ps

# Entrar no container
docker exec -it dashboard sh

# Reconstruir após mudanças
docker-compose up -d --build --force-recreate

# Ver uso de recursos
docker stats dashboard
```

---

## 🌐 Depois do deploy, configure o Webhook:

URL do Webhook no Supabase:
```
https://SEU-DOMINIO-EASYPANEL/api/webhook
```

---

## 🎯 Resumo:

1. ✅ Dockerfile criado e otimizado
2. ✅ docker-compose.yml pronto
3. ✅ next.config.mjs atualizado com `output: 'standalone'`
4. ✅ .dockerignore para build mais rápido

**Agora é só fazer deploy no Easypanel! 🚀**
