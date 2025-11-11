import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    getUserData,
    isTokenExpiringSoon,
    setTokens,
    setUserData,
} from '../tokenStorage';

// Mock sessionStorage
const mockSessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
    });
});

describe('tokenStorage', () => {
    describe('setTokens', () => {
        it('debe guardar tokens en sessionStorage', () => {
            setTokens('access-token', 'refresh-token');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('access_token', 'access-token');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('refresh_token', 'refresh-token');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('token_expiry', expect.any(String));
        });
    });

    describe('getAccessToken', () => {
        it('debe obtener el access token', () => {
            mockSessionStorage.getItem.mockReturnValue('access-token');
            expect(getAccessToken()).toBe('access-token');
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('access_token');
        });

        it('debe retornar null si no hay token', () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            expect(getAccessToken()).toBeNull();
        });
    });

    describe('getRefreshToken', () => {
        it('debe obtener el refresh token', () => {
            mockSessionStorage.getItem.mockReturnValue('refresh-token');
            expect(getRefreshToken()).toBe('refresh-token');
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('refresh_token');
        });
    });

    describe('setUserData', () => {
        it('debe guardar datos del usuario', () => {
            const user = { id: 1, email: 'test@example.com' };
            setUserData(user);
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
        });
    });

    describe('getUserData', () => {
        it('debe obtener datos del usuario', () => {
            const user = { id: 1, email: 'test@example.com' };
            mockSessionStorage.getItem.mockReturnValue(JSON.stringify(user));
            expect(getUserData()).toEqual(user);
        });

        it('debe retornar null si no hay datos', () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            expect(getUserData()).toBeNull();
        });
    });

    describe('clearTokens', () => {
        it('debe limpiar todos los tokens', () => {
            clearTokens();
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('access_token');
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('refresh_token');
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('user');
            expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token_expiry');
        });
    });

    describe('isTokenExpiringSoon', () => {
        it('debe retornar true si el token está próximo a expirar', () => {
            const futureTime = Date.now() + (2 * 60 * 1000); // 2 minutos
            mockSessionStorage.getItem.mockReturnValue(futureTime.toString());
            expect(isTokenExpiringSoon()).toBe(true);
        });

        it('debe retornar false si el token no está próximo a expirar', () => {
            const futureTime = Date.now() + (10 * 60 * 1000); // 10 minutos
            mockSessionStorage.getItem.mockReturnValue(futureTime.toString());
            expect(isTokenExpiringSoon()).toBe(false);
        });

        it('debe retornar true si no hay expiración', () => {
            mockSessionStorage.getItem.mockReturnValue(null);
            expect(isTokenExpiringSoon()).toBe(true);
        });
    });
});

