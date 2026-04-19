# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npx nest build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app

# Cho phép Coolify (Healthcheck)
RUN apk add --no-cache curl wget


COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 5050

CMD ["npm", "run", "start:prod"]