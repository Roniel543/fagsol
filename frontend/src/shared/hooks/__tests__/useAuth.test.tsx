import { authAPI } from '@/shared/services/api';
import * as tokenStorage from '@/shared/utils/tokenStorage';
import { act, renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../useAuth';

// Mock dependencies
jest.mock('@/shared/services/api');
jest.mock('@/shared/utils/tokenStorage');
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

const mockAuthAPI = authAPI as jest.Mocked<typeof authAPI>;
const mockTokenStorage = tokenStorage as jest.Mocked<typeof tokenStorage>;

describe('useAuth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTokenStorage.getUserData.mockReturnValue(null);
        mockTokenStorage.migrateTokensFromLocalStorage.mockReturnValue(undefined);
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AuthProvider>{children}</AuthProvider>
    );

    it('debe inicializar sin usuario', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe hacer login exitosamente', async () => {
        const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User', role: 'student', is_active: true };
        const mockTokens = { access: 'access-token', refresh: 'refresh-token' };
        const mockResponse = {
            success: true,
            user: mockUser,
            tokens: mockTokens,
        };

        mockAuthAPI.login.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            const response = await result.current.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(response.success).toBe(true);
        });

        expect(mockTokenStorage.setTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
        expect(mockTokenStorage.setUserData).toHaveBeenCalledWith(mockUser);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('debe manejar error en login', async () => {
        const mockResponse = {
            success: false,
            message: 'Credenciales inválidas',
        };

        mockAuthAPI.login.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            const response = await result.current.login({
                email: 'test@example.com',
                password: 'wrong',
            });

            expect(response.success).toBe(false);
        });

        expect(mockTokenStorage.setTokens).not.toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });

    it('debe hacer logout correctamente', async () => {
        mockAuthAPI.logout.mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(mockAuthAPI.logout).toHaveBeenCalled();
        expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
        expect(result.current.user).toBeNull();
    });

    it('debe cargar usuario existente al inicializar', async () => {
        const mockUser = { id: 1, email: 'test@example.com', first_name: 'Test', last_name: 'User', role: 'student', is_active: true };
        mockTokenStorage.getUserData.mockReturnValue(mockUser);

        // Mock sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn().mockReturnValue('access-token'),
            },
            writable: true,
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });
});

