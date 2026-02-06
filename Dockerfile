# ---- Base Node image ----
FROM node:18-alpine

# ---- Tạo thư mục làm việc ----
WORKDIR /app

# ---- Copy toàn bộ code vào container ----
COPY . .

# ---- Chuyển vào package editor-sample ----
WORKDIR /app

# ---- Cài đặt dependencies ----
RUN npm install --force

# ---- Expose port cho Vite ----
EXPOSE 5173

# ---- Chạy Vite server ----
CMD ["npx", "vite", "--host", "0.0.0.0"]
