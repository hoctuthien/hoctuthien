# Stage 1: Build dự án
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file quản lý package để install trước
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code vào
COPY . .

# Thực hiện build dự án
RUN npm run build

# Stage 2: Chạy dự án (Runtime)
FROM node:20-alpine
WORKDIR /app

# Copy các file cần thiết từ Stage builder sang
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Mở port cho container (khớp với PORT=5050 trong .env của Gấm)
EXPOSE 5050

# Lệnh khởi chạy ứng dụng
# LƯU Ý: Không được có dấu phẩy ở cuối dòng này
CMD ["npm", "run", "start:prod"]