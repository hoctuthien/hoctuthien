# Stage 1: Build dự án
FROM node:20-alpine AS builder

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy các file quản lý package để install trước (tận dụng Docker cache)
COPY package*.json ./

# Cài đặt toàn bộ dependencies
RUN npm i

# Copy toàn bộ source code của thư mục backend vào container
COPY . .

# Build dự án NestJS sang thư mục dist (chạy lệnh build trong package.json)
RUN ./node_modules/.bin/nest build

# Stage 2: Chạy dự án (Runtime)
FROM node:20-alpine

WORKDIR /app

# Copy các file cần thiết từ Stage builder sang
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Mở port cho container (thường NestJS là 3000)
EXPOSE 5050

# Lệnh khởi chạy ứng dụng ở chế độ production
CMD ["npm", "run", "start:prod"]