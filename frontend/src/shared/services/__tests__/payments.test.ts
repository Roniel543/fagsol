/**
 * Tests unitarios para payments.ts
 */

import { getPaymentHistory, createPaymentIntent, processPayment } from '../payments';
import { apiRequest } from '../api';

// Mock del módulo api
jest.mock('../api');

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

describe('payments service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPaymentHistory', () => {
        it('debe obtener el historial de pagos exitosamente', async () => {
            const mockResponse = {
                success: true,
                data: {
                    count: 2,
                    next: null,
                    previous: null,
                    page: 1,
                    page_size: 10,
                    results: [
                        {
                            id: 'pay_123',
                            payment_intent_id: 'pi_123',
                            amount: '150.00',
                            currency: 'PEN',
                            status: 'approved',
                            installments: 1,
                            mercado_pago_payment_id: 'mp_123',
                            created_at: '2024-01-01T12:00:00Z',
                            course_names: ['Curso 1'],
                            course_ids: ['c-001'],
                        },
                    ],
                },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            const result = await getPaymentHistory(1, 10);

            expect(result.success).toBe(true);
            expect(result.data?.count).toBe(2);
            expect(result.data?.results).toHaveLength(1);
            expect(mockApiRequest).toHaveBeenCalledWith(
                '/payments/history/?page=1&page_size=10',
                { method: 'GET' }
            );
        });

        it('debe manejar errores correctamente', async () => {
            mockApiRequest.mockRejectedValue(new Error('Network error'));

            const result = await getPaymentHistory();

            expect(result.success).toBe(false);
            expect(result.message).toContain('Error al obtener el historial');
        });

        it('debe aplicar filtros de estado', async () => {
            const mockResponse = {
                success: true,
                data: {
                    count: 1,
                    next: null,
                    previous: null,
                    page: 1,
                    page_size: 10,
                    results: [],
                },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            await getPaymentHistory(1, 10, 'approved');

            expect(mockApiRequest).toHaveBeenCalledWith(
                '/payments/history/?page=1&page_size=10&status=approved',
                { method: 'GET' }
            );
        });

        it('debe limitar page_size a 100', async () => {
            const mockResponse = {
                success: true,
                data: { count: 0, next: null, previous: null, page: 1, page_size: 100, results: [] },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            await getPaymentHistory(1, 200); // Intentar más de 100

            expect(mockApiRequest).toHaveBeenCalledWith(
                '/payments/history/?page=1&page_size=100',
                { method: 'GET' }
            );
        });
    });

    describe('createPaymentIntent', () => {
        it('debe crear payment intent exitosamente', async () => {
            const mockResponse = {
                success: true,
                data: {
                    id: 'pi_123',
                    total: 150.00,
                    currency: 'PEN',
                    items: [
                        { course_id: 'c-001', course_title: 'Curso 1', price: 150.00 },
                    ],
                    status: 'pending',
                    created_at: '2024-01-01T12:00:00Z',
                },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            const result = await createPaymentIntent(['c-001']);

            expect(result.success).toBe(true);
            expect(result.data?.id).toBe('pi_123');
            expect(result.data?.total).toBe(150.00);
        });

        it('debe validar que courseIds no esté vacío', async () => {
            const result = await createPaymentIntent([]);

            expect(result.success).toBe(false);
            expect(result.message).toContain('No se han seleccionado cursos');
            expect(mockApiRequest).not.toHaveBeenCalled();
        });
    });

    describe('processPayment', () => {
        it('debe procesar pago exitosamente', async () => {
            const mockResponse = {
                success: true,
                data: {
                    payment_id: 'pay_123',
                    status: 'approved',
                    enrollment_ids: ['enroll_1'],
                    amount: 150.00,
                    currency: 'PEN',
                },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            const result = await processPayment(
                'pi_123',
                'token_123',
                'visa',
                1,
                150.00,
                'idempotency_key_123'
            );

            expect(result.success).toBe(true);
            expect(result.data?.payment_id).toBe('pay_123');
            expect(result.data?.status).toBe('approved');
        });

        it('debe generar idempotency key si no se proporciona', async () => {
            const mockResponse = {
                success: true,
                data: { payment_id: 'pay_123', status: 'approved' },
            };

            mockApiRequest.mockResolvedValue(mockResponse);

            await processPayment('pi_123', 'token_123', 'visa', 1, 150.00);

            expect(mockApiRequest).toHaveBeenCalled();
            const callArgs = mockApiRequest.mock.calls[0];
            const headers = callArgs[1]?.headers as Record<string, string> | undefined;
            expect(headers?.['X-Idempotency-Key']).toBeDefined();
        });

        it('debe validar datos requeridos', async () => {
            const result = await processPayment('', '', '', 0, 0);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Datos de pago incompletos');
        });
    });
});

