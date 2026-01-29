# 1) Build da aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copia as dependências primeiro (para aproveitar cache)
COPY package*.json ./
COPY pnpm-lock.yaml* ./
# Se você usa yarn.lock, substitua pelo yarn.lock

RUN npm install

# Copia todo o código
COPY . .

# Build da aplicação Next.js
RUN npm run build

# 2) Imagem de produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do build
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Expõe a porta que o Next usará
EXPOSE 3000

# Start de produção
CMD ["npm", "start"]
