'use client';

import { Button, Input, LoadingSpinner, PasswordInput, Select } from '@/shared/components';
import { useToast } from '@/shared/components/Toast';
import { useCreateUser, useUpdateUser } from '@/shared/hooks/useAdminUsers';
import { CreateUserRequest, UpdateUserRequest, getUserById } from '@/shared/services/adminUsers';
import { useCallback, useEffect, useState } from 'react';

interface UserFormProps {
    userId?: number; // Si existe, es edición; si no, es creación
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function UserForm({ userId, onSuccess, onCancel }: UserFormProps) {
    const [formData, setFormData] = useState<CreateUserRequest>({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'student',
        phone: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [loadingUser, setLoadingUser] = useState(!!userId);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(!userId); // Mostrar campo de contraseña solo al crear

    const { createUser, isCreating } = useCreateUser();
    const { updateUser, isUpdating } = useUpdateUser();
    const { showToast } = useToast();

    const loadUser = useCallback(async () => {
        if (!userId) return;
        try {
            setLoadingUser(true);
            const response = await getUserById(userId);
            if (response.success && response.data) {
                const user = response.data;
                setFormData({
                    email: user.email || '',
                    password: '', // No cargar contraseña
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    role: (user.role as 'student' | 'teacher' | 'admin') || 'student',
                    phone: user.phone || '',
                    is_active: user.is_active,
                });
            }
        } catch (err: any) {
            setError(err.message || 'Error al cargar el usuario');
            showToast(err.message || 'Error al cargar el usuario', 'error');
        } finally {
            setLoadingUser(false);
        }
    }, [userId, showToast]);

    useEffect(() => {
        if (userId) {
            loadUser();
        }
    }, [userId, loadUser]);

    const validateField = (name: string, value: any): string => {
        switch (name) {
            case 'email':
                if (!value || value.trim().length === 0) {
                    return 'El email es requerido';
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    return 'El email no es válido';
                }
                return '';
            case 'password':
                if (!userId && (!value || value.length < 6)) {
                    return 'La contraseña debe tener al menos 6 caracteres';
                }
                if (userId && value && value.length < 6) {
                    return 'La contraseña debe tener al menos 6 caracteres';
                }
                return '';
            case 'first_name':
                if (!value || value.trim().length < 2) {
                    return 'El nombre debe tener al menos 2 caracteres';
                }
                return '';
            case 'last_name':
                if (!value || value.trim().length < 2) {
                    return 'El apellido debe tener al menos 2 caracteres';
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newValue = name === 'is_active' ? (e.target as HTMLInputElement).checked : (name === 'phone' ? value || '' : value);

        setFormData((prev) => ({
            ...prev,
            [name]: newValue,
        }));

        // Validar campo en tiempo real
        const error = validateField(name, newValue);
        setErrors((prev) => ({
            ...prev,
            [name]: error,
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        Object.keys(formData).forEach((key) => {
            if (key === 'password' && userId && !formData.password) {
                // Contraseña opcional al editar
                return;
            }
            const error = validateField(key, formData[key as keyof CreateUserRequest]);
            if (error) {
                newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Por favor, corrige los errores en el formulario', 'error');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (userId) {
                // Editar usuario
                const updateData: UpdateUserRequest = {
                    email: formData.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: formData.role,
                    phone: formData.phone ? formData.phone : undefined,
                    is_active: formData.is_active,
                };

                // Solo incluir contraseña si se proporcionó
                if (formData.password) {
                    updateData.password = formData.password;
                }

                await updateUser(userId, updateData);
                showToast('Usuario actualizado exitosamente', 'success');
            } else {
                // Crear usuario
                await createUser(formData);
                showToast('Usuario creado exitosamente', 'success');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            const errorMessage = err.message || (userId ? 'Error al actualizar el usuario' : 'Error al crear el usuario');
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <p className="ml-4 text-gray-700 font-medium">Cargando usuario...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-800 font-semibold px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={errors.email}
                    variant="light"
                />

                {(!userId || showPassword) && (
                    <PasswordInput
                        label={userId ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!userId}
                        error={errors.password}
                        variant="light"
                    />
                )}

                {userId && !showPassword && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Contraseña
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                        //onClick={() => setShowPassword(true)}
                        >
                            Cambiar Contraseña
                        </Button>
                    </div>
                )}

                <Input
                    label="Nombre"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    error={errors.first_name}
                    variant="light"
                />

                <Input
                    label="Apellido"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    error={errors.last_name}
                    variant="light"
                />

                <Input
                    label="Teléfono (opcional)"
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    error={errors.phone}
                    variant="light"
                />

                <Select
                    label="Rol"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    options={[
                        { value: 'student', label: 'Estudiante' },
                        { value: 'teacher', label: 'Instructor' },
                        { value: 'admin', label: 'Administrador' },
                    ]}
                    error={errors.role}
                    variant="light"
                />

                {userId && (
                    <div>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
                            />
                            <span className="text-sm font-semibold text-gray-900">Usuario activo</span>
                        </label>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading || isCreating || isUpdating}
                    disabled={loading || isCreating || isUpdating}
                >
                    {userId ? 'Actualizar Usuario' : 'Crear Usuario'}
                </Button>
            </div>
        </form>
    );
}

