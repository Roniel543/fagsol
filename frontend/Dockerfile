# Dockerfile para Next.js Frontend - FagSol Escuela Virtual

FROM node:20-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat

# Variables de entorno
ENV NODE_ENV=development \
    NEXT_TELEMETRY_DISABLED=1

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

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando por defecto (desarrollo)
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]

# Stage para producción (opcional)
FROM base AS production

ENV NODE_ENV=production

RUN npm run build

CMD ["npm", "start"]
