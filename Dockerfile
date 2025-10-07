# Dockerfile para frontend (React)
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Construir aplicación
RUN npm run build

# Servir con servidor estático simple
RUN npm install -g serve

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["serve", "-s", "dist", "-p", "3000"]