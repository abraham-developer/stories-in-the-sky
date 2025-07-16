FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./

# Solución específica para el bug de rollup
RUN rm -f package-lock.json
RUN npm cache clean --force
RUN npm install --force

COPY . .
RUN npm run build

FROM nginx:alpine

# Configuración
RUN rm -f /etc/nginx/conf.d/default.conf
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]