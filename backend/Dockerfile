# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./

# Ép cài tất cả bao gồm cả devDependencies để có Nest CLI mà build
RUN npm install --include=dev

COPY . .

# Build dự án (dùng npx cho chắc cú)
RUN npx nest build

# Stage 2: Run
FROM node:20-alpine
WORKDIR /app

# Chỉ copy những thứ cần để chạy, bỏ qua rác build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 5050

CMD ["npm", "run", "start:prod"]