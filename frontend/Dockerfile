# Dockerfile para Next.js Frontend

FROM node:18-alpine

# Variables de entorno
ENV NODE_ENV=development

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm install

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]

