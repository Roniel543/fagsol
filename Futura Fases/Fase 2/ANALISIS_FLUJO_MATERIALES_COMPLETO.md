# 📋 Análisis Completo: Flujo de Materiales - Estado Actual vs Flujo Ideal


### **Fase 2: Soporte para Subida de Archivos (Prioridad Media)**

#### **Backend:**

1. **Modificar Modelo Material:**

```python
# Agregar campo para archivo
class Material(models.Model):
    MATERIAL_TYPE_CHOICES = [
        ('video', 'Video Vimeo'),
        ('link', 'Enlace Externo'),
        ('file', 'Archivo'),  # ✅ NUEVO
    ]
    
    # ... campos existentes ...
    
    # ✅ NUEVO: Campo para archivo
    file = models.FileField(
        upload_to='materials/%Y/%m/%d/',
        blank=True,
        null=True,
        verbose_name="Archivo",
        help_text="PDF, DOCX, etc. (máx. 10MB)"
    )
    
    # Modificar URL para que sea opcional si hay archivo
    url = models.URLField(
        blank=True,  # ✅ Cambiar a opcional
        null=True,
        verbose_name="URL",
        help_text="URL del video de Vimeo, enlace externo, o dejar vacío si hay archivo"
    )
    
    def clean(self):
        # Validar que haya URL o archivo
        if not self.url and not self.file:
            raise ValidationError({
                'url': 'Debe proporcionar una URL o un archivo',
                'file': 'Debe proporcionar una URL o un archivo'
            })
        
        # Validar tamaño de archivo
        if self.file and self.file.size > 10 * 1024 * 1024:  # 10MB
            raise ValidationError({
                'file': 'El archivo no puede ser mayor a 10MB'
            })
```

2. **Crear Endpoint para Subir Archivo:**

```python
# backend/presentation/views/admin_views.py
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdmin])
def upload_material_file(request, material_id):
    """
    Sube un archivo para un material existente.
    POST /api/v1/admin/materials/{material_id}/upload/
    """
    try:
        material = Material.objects.get(id=material_id)
        
        if 'file' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No se proporcionó ningún archivo'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        
        # Validar tipo de archivo
        allowed_types = ['application/pdf', 'application/msword', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        if file.content_type not in allowed_types:
            return Response({
                'success': False,
                'message': 'Tipo de archivo no permitido. Solo PDF y DOCX.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar tamaño
        if file.size > 10 * 1024 * 1024:  # 10MB
            return Response({
                'success': False,
                'message': 'El archivo es demasiado grande. Máximo 10MB.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        material.file = file
        material.material_type = 'file'
        material.save()
        
        return Response({
            'success': True,
            'message': 'Archivo subido exitosamente',
            'data': {
                'file_url': material.file.url,
                'file_name': material.file.name
            }
        }, status=status.HTTP_200_OK)
        
    except Material.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Material no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
```

3. **Configurar Almacenamiento:**

```python
# backend/config/settings.py

# Para desarrollo local
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Para producción (usar S3 o similar)
# DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
# AWS_STORAGE_BUCKET_NAME = 'fagsol-materials'
```

#### **Frontend:**

1. **Modificar MaterialForm para soportar archivos:**

```typescript
// Agregar campo de archivo
<div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-900 mb-1">
        {formData.material_type === 'file' ? 'Archivo' : 'URL'}
    </label>
    {formData.material_type === 'file' ? (
        <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
    ) : (
        <Input
            name="url"
            type="url"
            value={formData.url}
            onChange={handleChange}
            placeholder={formData.material_type === 'video' ? 'https://vimeo.com/...' : 'https://...'}
            required
            error={errors.url}
            variant="light"
        />
    )}
</div>
```

2. **Actualizar MaterialCard para mostrar archivos:**

```typescript
const isFile = material.material_type === 'file';

{isFile && (
    <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-green-500" />
        <a
            href={material.file_url}
            download
            className="text-primary-orange hover:underline"
        >
            Descargar {material.file_name}
        </a>
    </div>
)}
```

---

## 📊 **COMPARACIÓN: Estado Actual vs Ideal**

| Funcionalidad | Estado Actual | Estado Ideal |
|---------------|---------------|--------------|
| **Crear Material (URL)** | ✅ Funciona | ✅ Funciona |
| **Crear Material (Archivo)** | ❌ No existe | ✅ Subir archivo |
| **Ver Materiales (Admin)** | ✅ Funciona | ✅ Funciona |
| **Ver Materiales (Estudiantes)** | ❌ No se muestran | ✅ Se muestran |
| **Descargar Archivos** | ❌ No existe | ✅ Botón descarga |
| **Almacenamiento** | ❌ Solo URLs | ✅ URLs + Archivos |

---

## 🎯 **RECOMENDACIÓN: Flujo Real y Adecuado**

### **Opción 1: Solo URLs (Más Simple - Actual)**

**Ventajas:**
- ✅ Ya está implementado
- ✅ No requiere almacenamiento
- ✅ Escalable (no ocupa espacio del servidor)

**Desventajas:**
- ❌ Depende de servicios externos
- ❌ No se pueden subir PDFs propios
- ❌ No hay control sobre el contenido

**Uso Recomendado:**
- Enlaces a recursos externos (documentación, artículos)
- Videos de Vimeo
- Enlaces a Google Drive, Dropbox, etc.

---

### **Opción 2: URLs + Almacenamiento Local (Recomendado para MVP)**

**Ventajas:**
- ✅ Control total sobre archivos
- ✅ Puedes subir PDFs propios
- ✅ No depende de servicios externos
- ✅ Fácil de implementar

**Desventajas:**
- ⚠️ Ocupa espacio del servidor
- ⚠️ No escala bien para muchos archivos

**Uso Recomendado:**
- PDFs de guías propias
- Documentos complementarios
- Archivos pequeños (< 10MB)

**Implementación:**
- Usar `FileField` de Django
- Almacenar en `media/materials/`
- Servir archivos estáticos en desarrollo
- En producción, usar servidor web (Nginx) o CDN

---

### **Opción 3: URLs + Almacenamiento en la Nube (Recomendado para Producción)**

**Ventajas:**
- ✅ Escalable
- ✅ No ocupa espacio del servidor
- ✅ CDN para descargas rápidas
- ✅ Backup automático

**Desventajas:**
- ⚠️ Requiere configuración adicional
- ⚠️ Costos de almacenamiento
- ⚠️ Más complejo de implementar

**Uso Recomendado:**
- Producción con muchos usuarios
- Archivos grandes
- Necesidad de alta disponibilidad

**Implementación:**
- AWS S3, Google Cloud Storage, o Azure Blob
- Usar `django-storages`
- Configurar CDN (CloudFront, Cloudflare)

---

## ✅ **PLAN DE ACCIÓN RECOMENDADO**

### **Paso 1: Mostrar Materiales Existentes (URGENTE)**
- ⏱️ Tiempo: 2-3 horas
- Prioridad: Alta
- Impacto: Los estudiantes podrán ver materiales que ya existen

### **Paso 2: Agregar Soporte para Archivos (IMPORTANTE)**
- ⏱️ Tiempo: 4-6 horas
- Prioridad: Media
- Impacto: Permite subir PDFs y documentos propios

### **Paso 3: Mejorar Almacenamiento (FUTURO)**
- ⏱️ Tiempo: 8-12 horas
- Prioridad: Baja
- Impacto: Escalabilidad y rendimiento

---

## 📝 **CONCLUSIÓN**

**Estado Actual:**
- ✅ CRUD de materiales funciona (admin)
- ❌ Materiales NO se muestran a estudiantes
- ❌ No se pueden subir archivos

**Flujo Adecuado:**
1. **Corto Plazo:** Mostrar materiales existentes en frontend de estudiantes
2. **Medio Plazo:** Agregar soporte para subir archivos (almacenamiento local)
3. **Largo Plazo:** Migrar a almacenamiento en la nube si es necesario

**Recomendación:**
Empezar con **Paso 1** (mostrar materiales) y luego **Paso 2** (subir archivos con almacenamiento local).

---

**Última actualización:** 2025-01-27  
**Estado:** ⚠️ Funcionalidad Parcial - Requiere Implementación

