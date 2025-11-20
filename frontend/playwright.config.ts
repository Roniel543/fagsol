import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * 
 * Para ejecutar los tests:
 * - npx playwright install (primera vez)
 * - npx playwright test
 * - npx playwright test --ui (modo interactivo)
 */
export default defineConfig({
    testDir: './e2e',
    
    /* Ejecutar tests en paralelo */
    fullyParallel: true,
    
    /* Fallar el build en CI si accidentalmente dejaste test.only en el código */
    forbidOnly: !!process.env.CI,
    
    /* Reintentar en CI solo */
    retries: process.env.CI ? 2 : 0,
    
    /* Omitir tests en CI si no hay workers disponibles */
    workers: process.env.CI ? 1 : undefined,
    
    /* Configuración del reporter */
    reporter: 'html',
    
    /* Configuración compartida para todos los proyectos */
    use: {
        /* URL base para usar en acciones como `await page.goto('/')`. */
        baseURL: 'http://localhost:3000',
        
        /* Recopilar trace cuando se repite un test fallido. */
        trace: 'on-first-retry',
        
        /* Screenshot en caso de fallo */
        screenshot: 'only-on-failure',
        
        /* Video en caso de fallo */
        video: 'retain-on-failure',
    },

    /* Configurar proyectos para diferentes navegadores */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        /* Tests en dispositivos móviles */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    /* Ejecutar el servidor de desarrollo antes de los tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});

