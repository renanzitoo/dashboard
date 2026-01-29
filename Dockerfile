# Dockerfile para Next.js Dashboard
# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat git
WORKDIR /app

# Clonar o repositório do GitHub
ARG GITHUB_REPO=https://github.com/renanzitoo/dashboard.git
RUN git clone ${GITHUB_REPO} .

# Instalar dependências
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar dependências instaladas
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app .

# Variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED 1

# Build da aplicação Next.js
RUN npm run build

# Stage 3: Runner (Produção)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Copiar arquivos do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Expor porta 3000
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar aplicação
CMD ["node", "server.js"]
