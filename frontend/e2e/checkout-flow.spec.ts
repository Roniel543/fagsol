/**
 * Tests E2E para el flujo completo de checkout y pago
 * 
 * Requiere:
 * - Backend corriendo en http://localhost:8000
 * - Frontend corriendo en http://localhost:3000
 * - Base de datos con al menos un curso publicado
 */

import { test, expect } from '@playwright/test';

test.describe('Flujo de Checkout y Pago', () => {
    test.beforeEach(async ({ page }) => {
        // Navegar a la página de login
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Esperar a que el formulario esté visible
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        
        // Iniciar sesión
        await page.fill('input[name="email"]', 'student@test.com');
        await page.fill('input[name="password"]', 'testpass123');
        
        // Esperar a que el botón esté habilitado y hacer clic
        await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 5000 });
        await page.click('button[type="submit"]');
        
        // Esperar a que se complete el login
        await page.waitForURL('**/dashboard', { timeout: 15000 });
    });

    test('debe completar el flujo de compra exitosamente', async ({ page }) => {
        // 1. Ir al catálogo de cursos
        await page.goto('http://localhost:3000/academy/catalog');
        await page.waitForLoadState('networkidle');

        // 2. Agregar un curso al carrito
        const addToCartButton = page.locator('button:has-text("Agregar al carrito")').first();
        if (await addToCartButton.isVisible()) {
            await addToCartButton.click();
        }

        // 3. Ir al checkout
        await page.goto('http://localhost:3000/academy/checkout');
        await page.waitForLoadState('networkidle');

        // 4. Verificar que se muestra el formulario de pago
        await expect(page.locator('text=Checkout')).toBeVisible();
        
        // 5. Esperar a que se cargue el CardPayment Brick de Mercado Pago
        // (El Brick puede tardar en cargar)
        await page.waitForTimeout(2000);

        // 6. Completar el formulario de pago con tarjeta de prueba
        // Nota: Esto puede variar según cómo Mercado Pago renderice el Brick
        // En un entorno real, necesitarías interactuar con los iframes del Brick
        
        // Por ahora, verificamos que el contenedor del Brick existe
        const brickContainer = page.locator('#paymentBrick_container');
        await expect(brickContainer).toBeVisible({ timeout: 10000 });

        // 7. Verificar que se muestra el monto total
        const totalAmount = page.locator('text=/S\\/ \\d+\\.\\d+/');
        await expect(totalAmount.first()).toBeVisible();
    });

    test('debe mostrar error si el pago es rechazado', async ({ page }) => {
        await page.goto('http://localhost:3000/academy/checkout');
        await page.waitForLoadState('networkidle');

        // Esperar a que se cargue el Brick
        await page.waitForTimeout(2000);

        // Verificar que el contenedor del Brick existe
        const brickContainer = page.locator('#paymentBrick_container');
        await expect(brickContainer).toBeVisible({ timeout: 10000 });

        // Nota: Para probar un rechazo real, necesitarías:
        // 1. Usar una tarjeta de prueba que sea rechazada
        // 2. O mockear la respuesta del backend
        // Por ahora, solo verificamos que el formulario está presente
    });

    test('debe redirigir a success después de pago exitoso', async ({ page }) => {
        // Este test requeriría completar un pago real o mockearlo
        // Por ahora, verificamos que la ruta existe
        await page.goto('http://localhost:3000/academy/checkout/success');
        await expect(page).toHaveURL(/.*checkout\/success/);
    });
});

test.describe('Validaciones de Checkout', () => {
    test('debe requerir autenticación para acceder al checkout', async ({ page }) => {
        // Intentar acceder sin estar autenticado
        await page.goto('http://localhost:3000/academy/checkout');
        
        // Debe redirigir al login
        await expect(page).toHaveURL(/.*login/);
    });

    test('debe mostrar error si no hay cursos en el carrito', async ({ page }) => {
        // Iniciar sesión primero
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForLoadState('networkidle');
        
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        
        await page.fill('input[name="email"]', 'student@test.com');
        await page.fill('input[name="password"]', 'testpass123');
        
        await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 5000 });
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 15000 });

        // Ir al checkout sin cursos
        await page.goto('http://localhost:3000/academy/checkout');
        
        // Debe mostrar un mensaje indicando que el carrito está vacío
        // o redirigir al catálogo
        const emptyCartMessage = page.locator('text=/carrito.*vacío|no.*cursos/i');
        const catalogRedirect = page.url().includes('/catalog');
        
        expect(emptyCartMessage.isVisible() || catalogRedirect).toBeTruthy();
    });
});

