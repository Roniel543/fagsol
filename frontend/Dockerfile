# Dockerfile para Next.js Frontend

FROM node:18-alpine

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Variables de entorno
ENV NODE_ENV=development

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./

# Instalar dependencias
RUN npm ci

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 3000

# Usar Next.js con hostname 0.0.0.0 para Docker
ENV NEXT_TELEMETRY_DISABLED=1

# Comando por defecto
CMD ["npm", "run", "dev"]

