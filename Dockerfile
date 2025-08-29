FROM node:18-alpine

WORKDIR /app

# copy đúng thư mục editor-sample
COPY packages/editor-sample/package*.json ./
RUN npm install

COPY packages/editor-sample ./

# build Vite
RUN npm run build

# serve app bằng nginx (production)
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
