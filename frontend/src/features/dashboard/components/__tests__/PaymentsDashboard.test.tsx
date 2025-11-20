/**
 * Tests unitarios para PaymentsDashboard
 */

import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { PaymentsDashboard } from '../PaymentsDashboard';
import { usePaymentHistory } from '@/shared/hooks/usePaymentHistory';

// Mock del hook
jest.mock('@/shared/hooks/usePaymentHistory');

const mockUsePaymentHistory = usePaymentHistory as jest.MockedFunction<typeof usePaymentHistory>;

describe('PaymentsDashboard', () => {
    const mockPayments = [
        {
            id: 'pay_123',
            payment_intent_id: 'pi_123',
            amount: '150.00',
            currency: 'PEN',
            status: 'approved' as const,
            installments: 1,
            mercado_pago_payment_id: 'mp_123',
            created_at: '2024-01-01T12:00:00Z',
            course_names: ['Curso de Python'],
            course_ids: ['c-001'],
        },
        {
            id: 'pay_456',
            payment_intent_id: 'pi_456',
            amount: '200.00',
            currency: 'PEN',
            status: 'rejected' as const,
            installments: 1,
            mercado_pago_payment_id: null,
            created_at: '2024-01-02T12:00:00Z',
            course_names: ['Curso de Django'],
            course_ids: ['c-002'],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debe mostrar loading mientras carga', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: [],
            isLoading: true,
            isError: false,
            error: null,
            pagination: null,
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText(/Cargando historial de pagos/i)).toBeInTheDocument();
    });

    it('debe mostrar error si falla la carga', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: [],
            isLoading: false,
            isError: true,
            error: 'Error al cargar pagos',
            pagination: null,
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText(/Error al cargar el historial de pagos/i)).toBeInTheDocument();
        expect(screen.getByText('Error al cargar pagos')).toBeInTheDocument();
    });

    it('debe mostrar mensaje cuando no hay pagos', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: [],
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 0,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText(/No hay pagos registrados/i)).toBeInTheDocument();
        expect(screen.getByText(/Explorar Cursos/i)).toBeInTheDocument();
    });

    it('debe mostrar lista de pagos correctamente', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: mockPayments,
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 2,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText('Historial de Pagos')).toBeInTheDocument();
        expect(screen.getByText('2 pagos encontrados')).toBeInTheDocument();
        expect(screen.getByText(/Pago #123/i)).toBeInTheDocument();
        expect(screen.getByText(/Pago #456/i)).toBeInTheDocument();
        expect(screen.getByText('S/ 150.00')).toBeInTheDocument();
        expect(screen.getByText('S/ 200.00')).toBeInTheDocument();
        expect(screen.getByText('Aprobado')).toBeInTheDocument();
        expect(screen.getByText('Rechazado')).toBeInTheDocument();
    });

    it('debe mostrar nombres de cursos comprados', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: mockPayments,
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 2,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText('Curso de Python')).toBeInTheDocument();
        expect(screen.getByText('Curso de Django')).toBeInTheDocument();
    });

    it('debe permitir filtrar por estado', async () => {
        const mockSetStatus = jest.fn();

        mockUsePaymentHistory.mockReturnValue({
            payments: mockPayments,
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 2,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: mockSetStatus,
        });

        render(<PaymentsDashboard />);

        const filterSelect = screen.getByLabelText(/Filtrar por estado/i);
        expect(filterSelect).toBeInTheDocument();

        // Simular cambio de filtro
        filterSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    it('debe mostrar paginación cuando hay más de una página', () => {
        mockUsePaymentHistory.mockReturnValue({
            payments: mockPayments,
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 15,
                next: 'http://example.com/api/v1/payments/history/?page=2',
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText(/Mostrando 1 a 10 de 15 pagos/i)).toBeInTheDocument();
        expect(screen.getByText(/Página 1/i)).toBeInTheDocument();
    });

    it('debe formatear monedas correctamente', () => {
        const usdPayment = {
            ...mockPayments[0],
            amount: '100.00',
            currency: 'USD',
        };

        mockUsePaymentHistory.mockReturnValue({
            payments: [usdPayment],
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 1,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        expect(screen.getByText('$ 100.00')).toBeInTheDocument();
    });

    it('debe manejar amount como string (DRF DecimalField)', () => {
        const paymentWithStringAmount = {
            ...mockPayments[0],
            amount: '150.00', // String en lugar de number
        };

        mockUsePaymentHistory.mockReturnValue({
            payments: [paymentWithStringAmount],
            isLoading: false,
            isError: false,
            error: null,
            pagination: {
                count: 1,
                next: null,
                previous: null,
                page: 1,
                pageSize: 10,
            },
            refetch: jest.fn(),
            setPage: jest.fn(),
            setStatus: jest.fn(),
        });

        render(<PaymentsDashboard />);

        // No debe lanzar error al formatear
        expect(screen.getByText('S/ 150.00')).toBeInTheDocument();
    });
});

