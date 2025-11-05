# 🎯 Guía de Ejercicios PostgreSQL - Desde PowerShell

## 📡 CONEXIÓN DESDE POWERSHELL

### Opción 1: Conectar al PostgreSQL en Docker

```powershell
# Si tienes PostgreSQL en Docker (como tu proyecto fagsol)
docker exec -it fagsol_db psql -U postgres -d fagsol_db

# O si tienes otra base de datos
docker exec -it fagsol_db psql -U postgres -d northwind
```

### Opción 2: Instalar psql en Windows

Si tienes PostgreSQL instalado localmente:

```powershell
# Conectar directamente
psql -U postgres -d nombre_base_datos

# Con todos los parámetros
psql -h localhost -p 5432 -U postgres -d nombre_base_datos

# Con password (te pedirá la contraseña)
psql -U postgres -W -d nombre_base_datos

# Con password en la línea de comando (menos seguro)
psql -U postgres -d nombre_base_datos -p 5432
```

### Opción 3: Si no tienes psql instalado en Windows

Descarga PostgreSQL para Windows que incluye psql:
- https://www.postgresql.org/download/windows/
- O instala solo el cliente: https://www.postgresql.org/download/windows/

---

## 🔑 COMANDOS BÁSICOS DE psql

Una vez conectado, estos son los comandos útiles (empiezan con `\`):

```sql
-- Listar todas las bases de datos
\l

-- Conectar a otra base de datos
\c nombre_base_datos

-- Listar todas las tablas
\dt

-- Describir estructura de una tabla
\d nombre_tabla

-- Describir con más detalle
\d+ nombre_tabla

-- Listar todas las columnas de todas las tablas
\d+

-- Listar funciones
\df

-- Ver las secuencias
\ds

-- Ver los índices
\di

-- Ver el código SQL de una vista
\d+ nombre_vista

-- Ver el código SQL de una función
\df+ nombre_funcion

-- Cambiar el formato de salida
\x  -- Activa/desactiva formato expandido (vertical)

-- Ver historial de comandos
\s

-- Ejecutar un archivo SQL
\i ruta/al/archivo.sql

-- Exportar resultado a CSV
\copy (SELECT * FROM tabla) TO 'C:/ruta/archivo.csv' CSV HEADER;

-- Ver configuración de timezone
SHOW timezone;

-- Cambiar timezone de sesión
SET timezone = 'America/Lima';

-- Ver todas las configuraciones
SHOW all;

-- Salir de psql
\q
```

---

## 📚 EJERCICIOS PRÁCTICOS

### EJERCICIO 1: Crear Base de Datos y Tablas

```sql
-- Crear base de datos
CREATE DATABASE tienda_prueba;

-- Conectarse a la nueva base de datos
\c tienda_prueba

-- Crear tabla de productos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    categoria VARCHAR(50),
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    CHECK (total >= 0),
    CHECK (estado IN ('pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'))
);

-- Crear tabla de detalle de pedidos
CREATE TABLE detalle_pedidos (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);
```

### EJERCICIO 2: INSERT - Insertar Datos

```sql
-- Insertar productos
INSERT INTO productos (nombre, precio, stock, categoria, descripcion) VALUES
('Laptop HP', 899.99, 15, 'Electrónica', 'Laptop 15 pulgadas, 8GB RAM, 256GB SSD'),
('Mouse Inalámbrico', 25.50, 50, 'Accesorios', 'Mouse ergonómico inalámbrico'),
('Teclado Mecánico', 89.99, 30, 'Accesorios', 'Teclado mecánico RGB'),
('Monitor 24"', 199.99, 20, 'Monitores', 'Monitor Full HD 1920x1080'),
('Webcam HD', 45.00, 40, 'Accesorios', 'Webcam 1080p con micrófono'),
('Audífonos Bluetooth', 79.99, 35, 'Audio', 'Audífonos con cancelación de ruido'),
('Disco Duro Externo 1TB', 65.00, 25, 'Almacenamiento', 'HDD externo USB 3.0'),
('Tablet Android', 299.99, 10, 'Electrónica', 'Tablet 10 pulgadas, 64GB'),
('Cargador USB-C', 15.99, 100, 'Accesorios', 'Cargador rápido 65W'),
('Fundas Laptop', 35.50, 45, 'Accesorios', 'Fundas protectoras varios tamaños');

-- Insertar clientes
INSERT INTO clientes (nombre, email, telefono, direccion) VALUES
('Juan Pérez', 'juan.perez@email.com', '987654321', 'Av. Principal 123, Lima'),
('María García', 'maria.garcia@email.com', '987654322', 'Jr. Los Olivos 456, Lima'),
('Carlos López', 'carlos.lopez@email.com', '987654323', 'Av. Libertad 789, Arequipa'),
('Ana Martínez', 'ana.martinez@email.com', '987654324', 'Calle Real 321, Trujillo'),
('Luis Rodríguez', 'luis.rodriguez@email.com', '987654325', 'Av. Sol 654, Cusco');

-- Insertar pedidos
INSERT INTO pedidos (cliente_id, total, estado) VALUES
(1, 925.49, 'procesando'),
(2, 315.98, 'enviado'),
(3, 124.99, 'pendiente'),
(4, 365.50, 'entregado'),
(1, 199.99, 'procesando');

-- Insertar detalles de pedidos
INSERT INTO detalle_pedidos (pedido_id, producto_id, cantidad, precio_unitario) VALUES
(1, 1, 1, 899.99),  -- Laptop
(1, 2, 1, 25.50),   -- Mouse
(2, 6, 1, 79.99),   -- Audífonos
(2, 9, 2, 15.99),   -- Cargadores
(2, 4, 1, 199.99),  -- Monitor
(3, 5, 2, 45.00),   -- Webcams
(3, 9, 1, 15.99),   -- Cargador
(3, 2, 1, 13.00),   -- Mouse (descuento)
(4, 7, 3, 65.00),   -- Discos duros
(4, 10, 2, 35.50),  -- Fundas
(5, 4, 1, 199.99);  -- Monitor
```

### EJERCICIO 3: SELECT - Consultas Básicas

```sql
-- Ver todos los productos
SELECT * FROM productos;

-- Ver solo columnas específicas
SELECT nombre, precio, stock FROM productos;

-- Filtrar por precio
SELECT nombre, precio FROM productos WHERE precio > 50;

-- Filtrar por categoría
SELECT * FROM productos WHERE categoria = 'Accesorios';

-- Ordenar por precio descendente
SELECT nombre, precio FROM productos ORDER BY precio DESC;

-- Limitar resultados
SELECT * FROM productos ORDER BY precio DESC LIMIT 5;

-- Buscar con LIKE (búsqueda parcial)
SELECT * FROM productos WHERE nombre LIKE '%Laptop%';

-- Buscar con ILIKE (case-insensitive en PostgreSQL)
SELECT * FROM productos WHERE nombre ILIKE '%bluetooth%';

-- Filtrar por rango de precios
SELECT nombre, precio FROM productos 
WHERE precio BETWEEN 20 AND 100;

-- Filtrar con múltiples condiciones
SELECT * FROM productos 
WHERE categoria = 'Accesorios' AND precio < 50 AND stock > 30;

-- Usar IN para múltiples valores
SELECT * FROM productos 
WHERE categoria IN ('Accesorios', 'Audio');

-- Contar registros
SELECT COUNT(*) FROM productos;

-- Contar con condición
SELECT COUNT(*) FROM productos WHERE stock > 20;

-- Sumar valores
SELECT SUM(precio) FROM productos;

-- Promedio
SELECT AVG(precio) FROM productos;

-- Máximo y mínimo
SELECT MAX(precio) as precio_maximo, MIN(precio) as precio_minimo FROM productos;

-- Agrupar por categoría
SELECT categoria, COUNT(*) as cantidad, AVG(precio) as precio_promedio
FROM productos
GROUP BY categoria;
```

### EJERCICIO 4: JOINs - Relaciones entre Tablas

```sql
-- INNER JOIN - Pedidos con información del cliente
SELECT 
    p.id as pedido_id,
    p.fecha_pedido,
    p.total,
    p.estado,
    c.nombre as cliente_nombre,
    c.email as cliente_email
FROM pedidos p
INNER JOIN clientes c ON p.cliente_id = c.id;

-- LEFT JOIN - Todos los clientes y sus pedidos (si tienen)
SELECT 
    c.nombre as cliente,
    c.email,
    COUNT(p.id) as total_pedidos,
    COALESCE(SUM(p.total), 0) as total_gastado
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nombre, c.email;

-- JOIN múltiple - Pedido completo con detalles
SELECT 
    ped.id as pedido_id,
    cli.nombre as cliente,
    prod.nombre as producto,
    dp.cantidad,
    dp.precio_unitario,
    dp.subtotal
FROM pedidos ped
INNER JOIN clientes cli ON ped.cliente_id = cli.id
INNER JOIN detalle_pedidos dp ON ped.id = dp.pedido_id
INNER JOIN productos prod ON dp.producto_id = prod.id
WHERE ped.id = 1;
```

### EJERCICIO 5: Funciones de Fecha

```sql
-- Fecha actual
SELECT NOW(), CURRENT_DATE, CURRENT_TIME;

-- Extraer año, mes, día
SELECT 
    fecha_pedido,
    EXTRACT(YEAR FROM fecha_pedido) as año,
    EXTRACT(MONTH FROM fecha_pedido) as mes,
    EXTRACT(DAY FROM fecha_pedido) as dia
FROM pedidos;

-- Formatear fecha
SELECT 
    fecha_pedido,
    TO_CHAR(fecha_pedido, 'DD/MM/YYYY') as fecha_formateada,
    TO_CHAR(fecha_pedido, 'DD/MM/YYYY HH24:MI:SS') as fecha_completa
FROM pedidos;

-- Pedidos de los últimos 7 días
SELECT * FROM pedidos 
WHERE fecha_pedido >= CURRENT_DATE - INTERVAL '7 days';

-- Diferencia de días
SELECT 
    id,
    fecha_pedido,
    CURRENT_DATE - fecha_pedido::date as dias_desde_pedido
FROM pedidos;

-- Pedidos por mes
SELECT 
    TO_CHAR(fecha_pedido, 'YYYY-MM') as mes,
    COUNT(*) as total_pedidos,
    SUM(total) as total_ventas
FROM pedidos
GROUP BY TO_CHAR(fecha_pedido, 'YYYY-MM')
ORDER BY mes DESC;
```

### EJERCICIO 6: Subconsultas

```sql
-- Productos más caros que el promedio
SELECT nombre, precio 
FROM productos 
WHERE precio > (SELECT AVG(precio) FROM productos);

-- Clientes que nunca han hecho pedidos (con NOT EXISTS)
SELECT nombre, email
FROM clientes c
WHERE NOT EXISTS (
    SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id
);

-- Productos más vendidos (subconsulta correlacionada)
SELECT 
    nombre,
    (SELECT COUNT(*) 
     FROM detalle_pedidos dp 
     WHERE dp.producto_id = productos.id) as veces_vendido
FROM productos
ORDER BY veces_vendido DESC;

-- Clientes con más pedidos
SELECT 
    nombre,
    (SELECT COUNT(*) FROM pedidos WHERE cliente_id = clientes.id) as total_pedidos,
    (SELECT SUM(total) FROM pedidos WHERE cliente_id = clientes.id) as total_gastado
FROM clientes
ORDER BY total_pedidos DESC;
```

### EJERCICIO 7: UPDATE - Actualizar Datos

```sql
-- Actualizar precio de un producto
UPDATE productos 
SET precio = 949.99 
WHERE id = 1;

-- Actualizar stock (restar 5 unidades)
UPDATE productos 
SET stock = stock - 5 
WHERE id = 1;

-- Actualizar múltiples columnas
UPDATE productos 
SET precio = precio * 1.10,  -- Aumentar 10%
    stock = stock + 10
WHERE categoria = 'Accesorios';

-- Actualizar estado de pedidos antiguos
UPDATE pedidos 
SET estado = 'entregado'
WHERE fecha_pedido < CURRENT_DATE - INTERVAL '30 days' 
  AND estado = 'enviado';

-- Usar UPDATE con subconsulta
UPDATE productos 
SET stock = 0
WHERE id IN (
    SELECT producto_id 
    FROM detalle_pedidos 
    GROUP BY producto_id 
    HAVING SUM(cantidad) > 50
);
```

### EJERCICIO 8: DELETE - Eliminar Datos

```sql
-- Eliminar un producto específico (solo si no tiene pedidos)
DELETE FROM productos WHERE id = 10;

-- Eliminar productos sin stock
DELETE FROM productos WHERE stock = 0;

-- Eliminar pedidos cancelados antiguos
DELETE FROM pedidos 
WHERE estado = 'cancelado' 
  AND fecha_pedido < CURRENT_DATE - INTERVAL '90 days';

-- Eliminar con JOIN (pedidos de un cliente específico)
DELETE FROM pedidos 
WHERE cliente_id IN (
    SELECT id FROM clientes WHERE email = 'cliente@email.com'
);
```

### EJERCICIO 9: Funciones Agregadas Avanzadas

```sql
-- GROUP BY con HAVING
SELECT 
    categoria,
    COUNT(*) as cantidad,
    AVG(precio) as precio_promedio,
    MAX(precio) as precio_maximo
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 3;  -- Solo categorías con más de 3 productos

-- Productos más vendidos por cantidad
SELECT 
    p.nombre,
    p.categoria,
    SUM(dp.cantidad) as total_vendido,
    SUM(dp.subtotal) as ingresos_totales
FROM productos p
INNER JOIN detalle_pedidos dp ON p.id = dp.producto_id
GROUP BY p.id, p.nombre, p.categoria
ORDER BY total_vendido DESC;

-- Ventas por cliente con ranking
SELECT 
    c.nombre,
    COUNT(p.id) as total_pedidos,
    SUM(p.total) as total_gastado,
    AVG(p.total) as promedio_pedido,
    RANK() OVER (ORDER BY SUM(p.total) DESC) as ranking
FROM clientes c
INNER JOIN pedidos p ON c.id = p.cliente_id
GROUP BY c.id, c.nombre
ORDER BY total_gastado DESC;
```

### EJERCICIO 10: Window Functions

```sql
-- Agregar número de fila
SELECT 
    nombre,
    precio,
    ROW_NUMBER() OVER (ORDER BY precio DESC) as ranking_precio
FROM productos;

-- Ranking por categoría
SELECT 
    nombre,
    categoria,
    precio,
    RANK() OVER (PARTITION BY categoria ORDER BY precio DESC) as ranking_categoria
FROM productos;

-- Comparar con el anterior (LAG)
SELECT 
    nombre,
    precio,
    LAG(precio) OVER (ORDER BY precio) as precio_anterior,
    precio - LAG(precio) OVER (ORDER BY precio) as diferencia
FROM productos
ORDER BY precio;

-- Suma acumulativa
SELECT 
    nombre,
    precio,
    SUM(precio) OVER (ORDER BY precio) as suma_acumulativa
FROM productos
ORDER BY precio;

-- Promedio móvil (últimos 3 productos)
SELECT 
    nombre,
    precio,
    AVG(precio) OVER (
        ORDER BY precio 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ) as promedio_movil
FROM productos
ORDER BY precio;
```

### EJERCICIO 11: CTEs (Common Table Expressions)

```sql
-- CTE simple
WITH productos_caros AS (
    SELECT * FROM productos WHERE precio > 100
)
SELECT * FROM productos_caros ORDER BY precio DESC;

-- CTE múltiple
WITH 
ventas_totales AS (
    SELECT 
        producto_id,
        SUM(cantidad) as total_vendido,
        SUM(subtotal) as ingresos
    FROM detalle_pedidos
    GROUP BY producto_id
),
productos_top AS (
    SELECT producto_id 
    FROM ventas_totales 
    WHERE total_vendido > 2
)
SELECT 
    p.nombre,
    vt.total_vendido,
    vt.ingresos
FROM productos p
INNER JOIN ventas_totales vt ON p.id = vt.producto_id
INNER JOIN productos_top pt ON p.id = pt.producto_id
ORDER BY vt.ingresos DESC;

-- CTE recursivo (jerarquías)
-- Ejemplo: empleados y jefes
CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    jefe_id INTEGER REFERENCES empleados(id)
);

-- CTE recursivo para encontrar todos los subordinados
WITH RECURSIVE subordinados AS (
    -- Caso base: el empleado inicial
    SELECT id, nombre, jefe_id, 0 as nivel
    FROM empleados
    WHERE id = 1
    
    UNION ALL
    
    -- Caso recursivo: encontrar subordinados
    SELECT e.id, e.nombre, e.jefe_id, s.nivel + 1
    FROM empleados e
    INNER JOIN subordinados s ON e.jefe_id = s.id
)
SELECT * FROM subordinados;
```

### EJERCICIO 12: Arrays y JSON

```sql
-- Crear tabla con arrays
CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    tags TEXT[],
    instructores TEXT[]
);

-- Insertar con arrays
INSERT INTO cursos (nombre, tags, instructores) VALUES
('PostgreSQL Avanzado', 
 ARRAY['sql', 'database', 'postgresql'],
 ARRAY['Juan Pérez', 'María García']),
('JavaScript Moderno',
 ARRAY['javascript', 'es6', 'nodejs'],
 ARRAY['Carlos López']);

-- Consultar arrays
SELECT * FROM cursos WHERE 'sql' = ANY(tags);

SELECT * FROM cursos WHERE tags @> ARRAY['sql', 'database'];

-- Expandir array
SELECT nombre, unnest(tags) as tag FROM cursos;

-- JSON/JSONB
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    config JSONB
);

INSERT INTO configuraciones (usuario_id, config) VALUES
(1, '{"tema": "oscuro", "idioma": "es", "notificaciones": true}'),
(2, '{"tema": "claro", "idioma": "en", "notificaciones": false, "preferencias": {"email": true}}');

-- Consultar JSON
SELECT config->>'tema' as tema FROM configuraciones;

SELECT config->'preferencias'->>'email' FROM configuraciones;

SELECT * FROM configuraciones WHERE config->>'tema' = 'oscuro';

SELECT * FROM configuraciones WHERE config @> '{"notificaciones": true}';
```

### EJERCICIO 13: Índices y Performance

```sql
-- Crear índice simple
CREATE INDEX idx_productos_nombre ON productos(nombre);

-- Crear índice compuesto
CREATE INDEX idx_pedidos_cliente_fecha ON pedidos(cliente_id, fecha_pedido);

-- Crear índice único
CREATE UNIQUE INDEX idx_clientes_email ON clientes(email);

-- Índice parcial (solo para registros activos)
CREATE INDEX idx_productos_activos ON productos(nombre) WHERE activo = true;

-- Ver índices de una tabla
\di productos

-- Analizar performance de query
EXPLAIN ANALYZE 
SELECT * FROM productos WHERE nombre LIKE '%Laptop%';

-- Eliminar índice
DROP INDEX idx_productos_nombre;
```

### EJERCICIO 14: Vistas

```sql
-- Crear vista simple
CREATE VIEW vista_productos_activos AS
SELECT id, nombre, precio, categoria
FROM productos
WHERE activo = true;

-- Usar la vista
SELECT * FROM vista_productos_activos;

-- Crear vista con JOINs
CREATE VIEW vista_ventas_completas AS
SELECT 
    ped.id as pedido_id,
    ped.fecha_pedido,
    ped.total,
    cli.nombre as cliente,
    cli.email,
    STRING_AGG(prod.nombre, ', ') as productos
FROM pedidos ped
INNER JOIN clientes cli ON ped.cliente_id = cli.id
INNER JOIN detalle_pedidos dp ON ped.id = dp.pedido_id
INNER JOIN productos prod ON dp.producto_id = prod.id
GROUP BY ped.id, ped.fecha_pedido, ped.total, cli.nombre, cli.email;

-- Ver vistas
\dv

-- Eliminar vista
DROP VIEW vista_productos_activos;
```

### EJERCICIO 15: Funciones y Procedimientos

```sql
-- Función simple
CREATE OR REPLACE FUNCTION calcular_descuento(precio NUMERIC, porcentaje INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    RETURN precio * (1 - porcentaje::NUMERIC / 100);
END;
$$ LANGUAGE plpgsql;

-- Usar función
SELECT nombre, precio, calcular_descuento(precio, 10) as precio_con_descuento
FROM productos;

-- Función con tabla de retorno
CREATE OR REPLACE FUNCTION productos_por_categoria(cat VARCHAR)
RETURNS TABLE(id INTEGER, nombre VARCHAR, precio NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.nombre, p.precio
    FROM productos p
    WHERE p.categoria = cat;
END;
$$ LANGUAGE plpgsql;

SELECT * FROM productos_por_categoria('Accesorios');

-- Procedimiento almacenado
CREATE OR REPLACE PROCEDURE actualizar_stock(
    producto_id INTEGER,
    cantidad INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE productos 
    SET stock = stock + cantidad 
    WHERE id = producto_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto con id % no encontrado', producto_id;
    END IF;
END;
$$;

-- Ejecutar procedimiento
CALL actualizar_stock(1, 10);
```

---

## 🎯 EJERCICIOS DE PRÁCTICA

### Desafío 1: Reporte de Ventas
Crea un reporte que muestre:
- Total de ventas por mes
- Producto más vendido
- Cliente que más gastó
- Promedio de pedidos por cliente

### Desafío 2: Gestión de Inventario
- Listar productos con stock bajo (< 10 unidades)
- Calcular valor total del inventario
- Productos que nunca se han vendido

### Desafío 3: Análisis de Clientes
- Clientes que han hecho pedidos en el último mes
- Clientes inactivos (sin pedidos en 90 días)
- Valor promedio de pedido por cliente

---

## 💡 TIPS ÚTILES

1. **Usa TRANSACCIONES para pruebas:**
```sql
BEGIN;
-- Tus queries de prueba
ROLLBACK;  -- Deshace los cambios
-- O COMMIT; para confirmar
```

2. **Usa EXPLAIN para optimizar:**
```sql
EXPLAIN ANALYZE SELECT * FROM productos WHERE nombre LIKE '%x%';
```

3. **Exportar resultados:**
```sql
\copy (SELECT * FROM productos) TO 'C:/temp/productos.csv' CSV HEADER;
```

4. **Historial de comandos:**
```sql
\s  -- Ver historial
\s nombre_archivo.sql  -- Guardar historial
```

¡Practica estos ejercicios y verás cómo PostgreSQL es súper potente! 🚀

