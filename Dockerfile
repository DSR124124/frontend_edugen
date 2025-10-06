# Dockerfile para React + Vite
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Exponer puerto 4173 (puerto por defecto de vite preview)
EXPOSE 4173

# Comando para servir la aplicación
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
