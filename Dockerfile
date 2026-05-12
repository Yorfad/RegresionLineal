# Etapa de construcción (Build)
FROM node:20-alpine as build
WORKDIR /app

# Copiar configuración e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código y construir la aplicación estática
COPY . .
# NOTA: En un despliegue real usando Docker, debes pasar la API Key como un argumento de compilación (ARG)
# para que Vite pueda incrustarla en el bundle de frontend.
RUN npm run build

# Etapa de producción (Servidor Nginx)
FROM nginx:alpine
# Copiar el bundle estático generado por Vite a Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuración básica de Nginx para Single Page Applications (SPA)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
