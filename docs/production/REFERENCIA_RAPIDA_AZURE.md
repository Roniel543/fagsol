# ⚡ Referencia Rápida - Azure Producción

**Guía de consulta rápida para valores, comandos y configuraciones de Azure**

---

## 📋 VALORES IMPORTANTES

### Nombres de Recursos (Producción Actual)

```
Resource Group: fagsol-rs
Storage Account: fagsolmedia2026
Container: fagsol-media
Backend App Service: fagsol-back
Frontend App Service: fagsol-frontend
PostgreSQL Server: fagsol-postgres
Database: fagsol_db
PostgreSQL User: fagsoladmin
Subscription ID: 759b41e8-9b8e-4340-b885-e05e7ec853f7
```

---

## 🔑 VARIABLES DE ENTORNO - BACKEND

### Base de Datos
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=fagsol_db
DB_USER=fagsoladmin
DB_PASSWORD=[TU_PASSWORD]
DB_HOST=fagsol-postgres.postgres.database.azure.com
DB_PORT=5432
```

### Azure Blob Storage
```env
USE_AZURE_STORAGE=True
AZURE_STORAGE_ACCOUNT_NAME=fagsolmedia2026
AZURE_STORAGE_ACCOUNT_KEY=[TU_CLAVE]
AZURE_STORAGE_CONTAINER_NAME=fagsol-media
```

### Django
```env
DEBUG=False
SECRET_KEY=[GENERA_UNA_CLAVE]
ALLOWED_HOSTS=fagsol-back-[ID].azurewebsites.net
CORS_ALLOWED_ORIGINS=https://fagsol-frontend-[ID].azurewebsites.net
```

### Mercado Pago (Producción)
```env
MERCADOPAGO_ACCESS_TOKEN=[TU_ACCESS_TOKEN]
MERCADOPAGO_PUBLIC_KEY=[TU_PUBLIC_KEY]
```

---

## 🔑 VARIABLES DE ENTORNO - FRONTEND

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://fagsol-back-[ID].azurewebsites.net/api/v1
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=[TU_PUBLIC_KEY]
PORT=8080
```

---

## 🛠️ COMANDOS AZURE CLI

### Login
```bash
az login
```

### Ver suscripciones
```bash
az account list --output table
```

### Establecer suscripción
```bash
az account set --subscription "Nombre o ID de suscripción"
```

### Crear Resource Group
```bash
az group create \
  --name fagsol-rs \
  --location centralus
```

### Crear Storage Account
```bash
az storage account create \
  --name fagsolmedia2026 \
  --resource-group fagsol-rg \
  --location centralus \
  --sku Standard_LRS \
  --kind StorageV2
```

### Crear Container
```bash
az storage container create \
  --name fagsol-media \
  --account-name fagsolmedia2026 \
  --public-access blob
```

### Obtener Clave de Storage
```bash
az storage account keys list \
  --account-name fagsolmedia2026 \
  --resource-group fagsol-rg
```

### Crear App Service Plan
```bash
az appservice plan create \
  --name fagsol-plan \
  --resource-group fagsol-rg \
  --sku B1 \
  --is-linux
```

### Crear App Service (Backend)
```bash
az webapp create \
  --name fagsol-back \
  --resource-group fagsol-rs \
  --plan fagsol-plan \
  --runtime "PYTHON:3.12"
```

### Crear App Service (Frontend)
```bash
az webapp create \
  --name fagsol-frontend \
  --resource-group fagsol-rg \
  --plan fagsol-plan \
  --runtime "NODE:20-lts"
```

### Configurar Variables de Entorno (Backend)
```bash
az webapp config appsettings set \
  --name fagsol-back \
  --resource-group fagsol-rs \
  --settings \
    DB_NAME=fagsol_db \
    DB_USER=fagsoladmin \
    USE_AZURE_STORAGE=True \
    AZURE_STORAGE_ACCOUNT_NAME=fagsolmedia2026
```

### Configurar Startup Command (Backend)
```bash
az webapp config set \
  --name fagsol-back \
  --resource-group fagsol-rs \
  --startup-file "bash startup.sh"
```

### Ver Logs (Backend)
```bash
az webapp log tail \
  --name fagsol-back \
  --resource-group fagsol-rs
```

### Crear PostgreSQL Flexible Server
```bash
az postgres flexible-server create \
  --name fagsol-postgres \
  --resource-group fagsol-rg \
  --location centralus \
  --admin-user fagsoladmin \
  --admin-password [TU_PASSWORD] \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --public-access 0.0.0.0-255.255.255.255
```

### Crear Base de Datos
```bash
az postgres flexible-server db create \
  --resource-group fagsol-rg \
  --server-name fagsol-postgres \
  --database-name fagsol_db
```

### Crear Service Principal para GitHub Actions
```bash
az ad sp create-for-rbac \
  --name "fagsol-github-actions" \
  --role contributor \
  --scopes /subscriptions/[SUBSCRIPTION_ID] \
  --sdk-auth
```

---

## 🔍 VERIFICACIÓN RÁPIDA

### URLs de Verificación

```
Backend Health: https://fagsol-back-[ID].azurewebsites.net/api/v1/auth/health/
Backend Swagger: https://fagsol-back-[ID].azurewebsites.net/swagger/
Backend Admin: https://fagsol-back-[ID].azurewebsites.net/admin/
Frontend: https://fagsol-frontend-[ID].azurewebsites.net
```

### Comandos de Verificación

```bash
# Verificar que el backend responde
curl https://fagsol-back-[ID].azurewebsites.net/api/v1/auth/health/

# Verificar logs del backend
az webapp log tail --name fagsol-back --resource-group fagsol-rs

# Verificar estado del App Service
az webapp show --name fagsol-back --resource-group fagsol-rs --query state

# Verificar variables de entorno
az webapp config appsettings list --name fagsol-back --resource-group fagsol-rs
```

---

## 🔐 GENERAR SECRET_KEY DE DJANGO

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## 📊 PUERTOS Y CONFIGURACIONES

### Backend
- **Puerto:** Configurado automáticamente por Azure (variable `PORT`)
- **Workers:** 2 (en `startup.sh`)
- **Timeout:** 180 segundos

### Frontend
- **Puerto:** 8080 (configurado en variables de entorno)
- **Node Version:** 20 LTS

---

## 🚨 COMANDOS DE EMERGENCIA

### Reiniciar App Service
```bash
az webapp restart --name fagsol-back --resource-group fagsol-rs
```

### Detener App Service
```bash
az webapp stop --name fagsol-back --resource-group fagsol-rs
```

### Iniciar App Service
```bash
az webapp start --name fagsol-back --resource-group fagsol-rs
```

### Ver métricas
```bash
az monitor metrics list \
  --resource /subscriptions/759b41e8-9b8e-4340-b885-e05e7ec853f7/resourceGroups/fagsol-rs/providers/Microsoft.Web/sites/fagsol-back \
  --metric "Http2xx,Http5xx"
```

---

## 📝 NOTAS IMPORTANTES

1. **Nombres únicos:** Los nombres de Storage Account y App Services deben ser únicos globalmente
2. **Región:** Usa la misma región para todos los recursos cuando sea posible
3. **Costos:** Monitorea los costos en Azure Portal → Cost Management
4. **Backups:** Configura backups automáticos para PostgreSQL
5. **Seguridad:** Nunca commitees credenciales en el código
6. **Logs:** Los logs se retienen por 7 días por defecto (puedes configurar Application Insights para más tiempo)

---

## 🔗 ENLACES ÚTILES

- [Azure Portal](https://portal.azure.com)
- [Azure CLI Documentation](https://docs.microsoft.com/cli/azure/)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/azure/storage/blobs/)
- [Azure PostgreSQL Documentation](https://docs.microsoft.com/azure/postgresql/)

---

**Última actualización:** 2025-01-XX

