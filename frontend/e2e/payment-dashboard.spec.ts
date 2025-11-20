/**
 * Tests E2E para el dashboard de pagos
 * 
 * Requiere:
 * - Backend corriendo en http://localhost:8000
 * - Frontend corriendo en http://localhost:3000
 * - Usuario con al menos un pago en el historial
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard de Pagos', () => {
    test.beforeEach(async ({ page }) => {
        // Iniciar sesión
        await page.goto('http://localhost:3000/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Esperar a que el formulario esté visible
        await page.waitForSelector('input[name="email"]', { timeout: 10000 });
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        
        await page.fill('input[name="email"]', 'student@test.com');
        await page.fill('input[name="password"]', 'testpass123');
        
        // Esperar a que el botón esté habilitado y hacer clic
        await page.waitForSelector('button[type="submit"]:not([disabled])', { timeout: 5000 });
        await page.click('button[type="submit"]');
        
        // Esperar a que se complete el login
        await page.waitForURL('**/dashboard', { timeout: 15000 });
    });

    test('debe mostrar el historial de pagos', async ({ page }) => {
        // Ir al dashboard
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        // Hacer clic en la pestaña "Historial de Pagos"
        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        // Verificar que se muestra el título
        await expect(page.locator('text=Historial de Pagos')).toBeVisible();

        // Verificar que se muestra el filtro
        await expect(page.locator('text=Filtrar por estado:')).toBeVisible();

        // Esperar a que se carguen los pagos
        await page.waitForTimeout(2000);

        // Verificar que se muestra al menos un pago o el mensaje de "no hay pagos"
        const paymentList = page.locator('[data-testid="payment-item"]');
        const noPaymentsMessage = page.locator('text=/No hay pagos registrados/i');
        
        const hasPayments = await paymentList.count() > 0;
        const showsNoPayments = await noPaymentsMessage.isVisible();
        
        expect(hasPayments || showsNoPayments).toBeTruthy();
    });

    test('debe filtrar pagos por estado', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        // Ir a la pestaña de pagos
        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        await page.waitForTimeout(2000);

        // Seleccionar filtro "Aprobados"
        const filterSelect = page.locator('select');
        if (await filterSelect.isVisible()) {
            await filterSelect.selectOption('approved');
            
            // Esperar a que se actualice la lista
            await page.waitForTimeout(1000);
            
            // Verificar que solo se muestran pagos aprobados
            const approvedBadges = page.locator('text=Aprobado');
            const rejectedBadges = page.locator('text=Rechazado');
            
            // Si hay pagos, todos deben ser aprobados
            if (await approvedBadges.count() > 0) {
                expect(await rejectedBadges.count()).toBe(0);
            }
        }
    });

    test('debe mostrar detalles de cada pago', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        await page.waitForTimeout(2000);

        // Verificar que los pagos muestran información básica
        // (ID, monto, fecha, estado, cursos)
        const paymentCards = page.locator('text=/Pago #/');
        
        if (await paymentCards.count() > 0) {
            // Verificar que se muestra el monto
            await expect(page.locator('text=/S\\/ \\d+\\.\\d+/').first()).toBeVisible();
            
            // Verificar que se muestra el estado
            const statusBadge = page.locator('text=/Aprobado|Rechazado|Pendiente/').first();
            await expect(statusBadge).toBeVisible();
        }
    });

    test('debe mostrar paginación cuando hay muchos pagos', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        await page.waitForTimeout(2000);

        // Verificar si hay paginación
        const paginationInfo = page.locator('text=/Mostrando.*de.*pagos/i');
        const nextButton = page.locator('button:has-text("Siguiente")');
        const previousButton = page.locator('button:has-text("Anterior")');

        // Si hay más de 10 pagos, debe mostrar paginación
        if (await paginationInfo.isVisible()) {
            // Verificar que los botones de paginación están presentes
            // (pueden estar deshabilitados si es la primera/última página)
            expect(await nextButton.count() + await previousButton.count()).toBeGreaterThan(0);
        }
    });

    test('debe mostrar cursos comprados en cada pago', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        await page.waitForTimeout(2000);

        // Verificar que se muestra la sección de cursos comprados
        const coursesSection = page.locator('text=/Cursos comprados:/i');
        
        if (await coursesSection.count() > 0) {
            // Verificar que se muestran nombres de cursos
            const courseNames = page.locator('text=/Curso|Python|Django/i');
            expect(await courseNames.count()).toBeGreaterThan(0);
        }
    });

    test('debe manejar errores de carga correctamente', async ({ page }) => {
        // Interceptar la petición y forzar un error
        await page.route('**/api/v1/payments/history/**', route => {
            route.fulfill({
                status: 500,
                body: JSON.stringify({ success: false, message: 'Error del servidor' }),
            });
        });

        await page.goto('http://localhost:3000/dashboard');
        await page.waitForLoadState('networkidle');

        const paymentsTab = page.locator('button:has-text("Historial de Pagos")');
        await paymentsTab.click();

        await page.waitForTimeout(2000);

        // Debe mostrar un mensaje de error
        const errorMessage = page.locator('text=/Error al cargar/i');
        await expect(errorMessage).toBeVisible();
    });
});

