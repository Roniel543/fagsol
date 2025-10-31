# 🐳 Instalación de Docker - Guía Completa

## 📋 Requisitos Previos

En una máquina **limpia**, solo necesitas instalar **Docker Desktop**. Todo lo demás (Node.js, Python, PostgreSQL, Redis) corre dentro de contenedores Docker.

---

## 🪟 Windows

### Opción 1: Instalación Automática (Recomendada)

1. **Descargar Docker Desktop:**
   - Ir a: https://www.docker.com/products/docker-desktop
   - Click en "Download for Windows"
   - Ejecutar el instalador `Docker Desktop Installer.exe`

2. **Instalar:**
   - Aceptar los términos
   - Marcar "Use WSL 2 instead of Hyper-V" (recomendado si tienes WSL)
   - Click en "Ok" cuando pregunte por reiniciar

3. **Reiniciar la PC** (si lo solicita)

4. **Iniciar Docker Desktop:**
   - Buscar "Docker Desktop" en el menú de inicio
   - Ejecutar la aplicación
   - Esperar a que aparezca el ícono de Docker en la bandeja del sistema
   - Verificar que el ícono muestre "Docker Desktop is running"

5. **Verificar instalación:**
   ```powershell
   docker --version
   docker-compose --version
   ```
   
   Deberías ver algo como:
   ```
   Docker version 24.0.0, build ...
   Docker Compose version v2.20.0
   ```

### Opción 2: Con Chocolatey (si lo tienes)

```powershell
choco install docker-desktop
```

### Requisitos del Sistema

- **Windows 10 64-bit:** Pro, Enterprise, o Education (Build 19041 o superior)
- **Windows 11 64-bit:** Home o Pro version 21H2 o superior
- **WSL 2** (recomendado) o **Hyper-V**
- Al menos **4GB de RAM**
- Virtualización habilitada en BIOS

### Habilitar Virtualización en BIOS

Si Docker no inicia:

1. Reiniciar PC y entrar a BIOS (F2, F10, F12, Del - depende del fabricante)
2. Buscar "Virtualization Technology" o "VT-x"
3. Habilitarla
4. Guardar y salir

---

## 🐧 Linux (Ubuntu/Debian)

### Instalación Rápida

```bash
# Actualizar sistema
sudo apt update

# Instalar dependencias
sudo apt install -y ca-certificates curl gnupg lsb-release

# Agregar clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar repositorio
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar usuario al grupo docker (para no usar sudo)
sudo usermod -aG docker $USER

# Reiniciar sesión o ejecutar:
newgrp docker

# Verificar instalación
docker --version
docker compose version
```

### Alternativa: Docker Desktop para Linux

Descargar desde: https://www.docker.com/products/docker-desktop

---

## 🍎 macOS

### Opción 1: Descargar Docker Desktop

1. Ir a: https://www.docker.com/products/docker-desktop
2. Descargar para Mac (Intel o Apple Silicon según tu Mac)
3. Abrir el archivo `.dmg`
4. Arrastrar Docker a la carpeta Applications
5. Abrir Docker Desktop desde Applications
6. Esperar a que inicie

### Opción 2: Con Homebrew

```bash
brew install --cask docker
```

### Requisitos

- **macOS 10.15** o superior
- Al menos **4GB de RAM**
- VirtualBox anterior a 4.3.30 debe desinstalarse (si está instalado)

---

## ✅ Verificación Post-Instalación

Después de instalar, verifica que todo funcione:

```bash
# Ver versión
docker --version
docker compose version

# Probar Docker
docker run hello-world

# Si ves "Hello from Docker!", ¡funciona!
```

---

## 🐛 Solución de Problemas

### Docker Desktop no inicia (Windows)

1. Verificar que Virtualización esté habilitada en BIOS
2. Verificar que Hyper-V o WSL 2 esté habilitado
3. Ejecutar Docker Desktop como Administrador
4. Revisar logs: `%LOCALAPPDATA%\Docker\log.txt`

### Error: "Cannot connect to Docker daemon"

**Linux:**
```bash
# Iniciar servicio Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verificar que el usuario esté en el grupo docker
groups
# Debe aparecer "docker" en la lista
```

**Windows/Mac:**
- Asegúrate de que Docker Desktop esté corriendo
- Verifica el ícono en la bandeja del sistema

### Error: "Port already in use"

Algo más está usando los puertos. Verifica:

**Windows:**
```powershell
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

**Linux/Mac:**
```bash
lsof -i :3000
lsof -i :8000
```

Si hay procesos, detén los servicios que usan esos puertos.

---

## 📚 Recursos

- **Documentación oficial:** https://docs.docker.com/
- **Docker Desktop:** https://www.docker.com/products/docker-desktop
- **Guía de instalación:** https://docs.docker.com/get-docker/

---

## 🚀 Siguiente Paso

Una vez Docker instalado y funcionando, continúa con:

👉 **Ver:** `INSTRUCCIONES_PC_JEFE.md` o `QUICK_START.md`

