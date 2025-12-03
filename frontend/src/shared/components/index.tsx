import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
export { AnimatedCounter } from './AnimatedCounter';
export { AuthBackground } from './AuthBackground';
export { Badge, CleanProcessBadge, PurityBadge, RecoveryBadge } from './Badge';
export { CoursePlaceholder } from './CoursePlaceholder';
export { default as Footer } from './Footer';
export { default as Header } from './Header';
export { ImageUploader } from './ImageUploader';
export { MiniCart } from './MiniCart';
export { ProtectedRoute } from './ProtectedRoute';
export { SafeHTML } from './SafeHTML';
export { HeroSkeleton, ProcessSkeleton, SkeletonImage } from './SkeletonComponents';
export { ToastProvider, useToast } from './Toast';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

export function Button({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
}: ButtonProps) {
    const baseClasses = 'font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary-orange hover:bg-primary-orange/90 text-primary-black focus:ring-primary-orange',
        secondary: 'bg-secondary-medium-gray hover:bg-secondary-medium-gray/90 text-primary-white focus:ring-secondary-medium-gray',
        outline: 'border-2 border-primary-orange bg-transparent text-primary-orange hover:bg-primary-orange hover:text-primary-black focus:ring-primary-orange',
        danger: 'bg-status-error hover:bg-status-error/90 text-primary-white focus:ring-status-error',
        success: 'bg-status-success hover:bg-status-success/90 text-primary-white focus:ring-status-success',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {loading ? (
                <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cargando...
                </div>
            ) : (
                children
            )}
        </button>
    );
}

interface InputProps {
    label?: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    variant?: 'dark' | 'light'; // Nueva prop para variante
}

export function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    error,
    className = '',
    variant = 'dark', // Por defecto dark para mantener compatibilidad
}: InputProps) {
    const isLight = variant === 'light';
    const labelClasses = isLight
        ? 'block text-sm font-medium text-gray-900 mb-1'
        : 'block text-sm font-medium text-primary-white mb-1';
    const inputClasses = isLight
        ? `appearance-none relative block w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'
        } placeholder-gray-400 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
        : `appearance-none relative block w-full px-4 py-3 border ${error ? 'border-red-500/50' : 'border-primary-orange/20'
        } placeholder-secondary-light-gray text-primary-white bg-primary-black/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm backdrop-blur-sm transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={name} className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={inputClasses}
            />
            {error && (
                <p className={`mt-1 text-sm ${isLight ? 'text-red-600' : 'text-red-400'}`}>{error}</p>
            )}
        </div>
    );
}

interface PasswordInputProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    showToggle?: boolean; // Si mostrar el botón de mostrar/ocultar
    variant?: 'dark' | 'light'; // Nueva prop para variante
}

export function PasswordInput({
    label,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    className = '',
    showToggle = true,
    variant = 'dark', // Por defecto dark para mantener compatibilidad
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isLight = variant === 'light';

    const labelClasses = isLight
        ? 'block text-sm font-medium text-gray-900 mb-1'
        : 'block text-sm font-medium text-primary-white mb-1';

    const inputClasses = isLight
        ? `appearance-none relative block w-full px-4 py-3 pr-12 border ${error ? 'border-red-300' : 'border-gray-300'
        } placeholder-gray-400 text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm`
        : `appearance-none relative block w-full px-4 py-3 pr-12 border ${error ? 'border-status-error' : 'border-secondary-medium-gray'
        } placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={name} className={labelClasses}>
                    {label}
                    {required && <span className={isLight ? 'text-red-500 ml-1' : 'text-status-error ml-1'}>*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    id={name}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={inputClasses}
                />
                {showToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors focus:outline-none ${isLight
                            ? 'text-gray-500 hover:text-gray-700'
                            : 'text-secondary-light-gray hover:text-primary-white'
                            }`}
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                        {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                        ) : (
                            <Eye className="w-5 h-5" />
                        )}
                    </button>
                )}
            </div>
            {error && (
                <p className={`mt-1 text-sm ${isLight ? 'text-red-600' : 'text-status-error'}`}>{error}</p>
            )}
        </div>
    );
}

interface SelectProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    disabled?: boolean;
    error?: string;
    className?: string;
    variant?: 'dark' | 'light'; // Nueva prop para variante
}

export function Select({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    disabled = false,
    error,
    className = '',
    variant = 'dark', // Por defecto dark para mantener compatibilidad
}: SelectProps) {
    const isLight = variant === 'light';
    const labelClasses = isLight
        ? 'block text-sm font-medium text-gray-900 mb-1'
        : 'block text-sm font-medium text-primary-white mb-1';
    const selectClasses = isLight
        ? `block w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'
        } text-gray-900 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
        : `block w-full px-4 py-3 border ${error ? 'border-red-500/50' : 'border-primary-orange/20'
        } placeholder-secondary-light-gray text-primary-white bg-primary-black/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm backdrop-blur-sm transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

    return (
        <div className={className}>
            {label && (
                <label htmlFor={name} className={labelClasses}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={selectClasses}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className={isLight ? 'bg-white text-gray-900' : 'bg-secondary-dark-gray'}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className={`mt-1 text-sm ${isLight ? 'text-red-600' : 'text-red-400'}`}>{error}</p>
            )}
        </div>
    );
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div className={`bg-secondary-dark-gray border border-secondary-medium-gray rounded-xl p-6 shadow-lg ${className}`}>
            {children}
        </div>
    );
}

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    return (
        <div className={`animate-spin rounded-full border-b-2 border-primary-orange ${sizeClasses[size]} ${className}`}></div>
    );
}

interface SidebarProps {
    children: React.ReactNode;
    className?: string;
}

export function Sidebar({ children, className = '' }: SidebarProps) {
    return (
        <div className={`bg-primary-black text-primary-white min-h-screen w-64 ${className}`}>
            {children}
        </div>
    );
}

interface SidebarItemProps {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    className?: string;
}

export function SidebarItem({ children, active = false, onClick, className = '' }: SidebarItemProps) {
    return (
        <div
            onClick={onClick}
            className={`px-4 py-3 cursor-pointer transition-colors hover:bg-secondary-dark-gray ${active ? 'border-l-4 border-primary-orange bg-secondary-dark-gray' : ''
                } ${className}`}
        >
            {children}
        </div>
    );
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string | React.ReactNode;
    icon?: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'confirm' | 'warning' | 'danger' | 'success';
    isLoading?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    message,
    icon,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    variant = 'confirm',
    isLoading = false,
}: ModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        confirm: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmButton: 'primary',
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmButton: 'primary',
        },
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmButton: 'danger',
        },
        success: {
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            confirmButton: 'success',
        },
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-4 mb-4">
                        {icon && (
                            <div className={`flex-shrink-0 ${style.iconBg} rounded-full p-3`}>
                                <div className={style.iconColor}>
                                    {icon}
                                </div>
                            </div>
                        )}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                            <p className="text-gray-600 leading-relaxed">{message}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={style.confirmButton as any}
                            size="sm"
                            onClick={onConfirm}
                            loading={isLoading}
                            disabled={isLoading}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
