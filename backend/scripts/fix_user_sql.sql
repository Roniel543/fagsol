-- Script SQL para corregir el usuario pedrito@gmail.com
-- Ejecutar directamente en PostgreSQL si es necesario

-- 1. Verificar el estado actual del usuario
SELECT id, username, email, is_active, first_name, last_name 
FROM auth_user 
WHERE email = 'pedrito@gmail.com';

-- 2. Corregir el username si es NULL o diferente al email
UPDATE auth_user 
SET username = 'pedrito@gmail.com' 
WHERE email = 'pedrito@gmail.com' 
  AND (username IS NULL OR username != 'pedrito@gmail.com');

-- 3. Verificar que se corrigió
SELECT id, username, email, is_active 
FROM auth_user 
WHERE email = 'pedrito@gmail.com';

-- 4. Limpiar bloqueos de AXES (si existe la tabla)
-- DELETE FROM axes_accessattempt WHERE username = 'pedrito@gmail.com' OR username IS NULL;
-- DELETE FROM axes_accessfailurelog WHERE username = 'pedrito@gmail.com' OR username IS NULL;

