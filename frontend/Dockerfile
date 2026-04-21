FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Khai báo biến môi trường build-time
ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next.js standalone không cần BACKEND_URL ở runtime vì đã được bake vào lúc build cho client-side
# Nhưng vẫn giữ lại cho server-side logic nếu cần
ENV BACKEND_URL=$BACKEND_URL

# Copy thư mục public để phục vụ ảnh và assets (KHẮC PHỤC LỖI MẤT ẢNH)
COPY --from=builder /app/public ./public

# Copy output standalone và static files (TỐI ƯU DUNG LƯỢNG & ĐỘ ỔN ĐỊNH)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Chạy trực tiếp bằng server.js (Chuẩn Standalone của Next.js)
CMD ["node", "server.js"]