FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Đổi sang dùng BACKEND_URL cho khớp với Coolify
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]