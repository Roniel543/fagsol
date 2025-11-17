import React from 'react';
export { AnimatedCounter } from './AnimatedCounter';
export { AuthBackground } from './AuthBackground';
export { Badge, CleanProcessBadge, PurityBadge, RecoveryBadge } from './Badge';
export { CoursePlaceholder } from './CoursePlaceholder';
export { default as Footer } from './Footer';
export { default as Header } from './Header';
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
    error?: string;
    className?: string;
}

export function Input({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    error,
    className = '',
}: InputProps) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-primary-white mb-1">
                    {label}
                    {required && <span className="text-status-error ml-1">*</span>}
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
                className={`appearance-none relative block w-full px-4 py-3 border ${error ? 'border-status-error' : 'border-secondary-medium-gray'
                    } placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm`}
            />
            {error && (
                <p className="mt-1 text-sm text-status-error">{error}</p>
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
    error?: string;
    className?: string;
}

export function Select({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    error,
    className = '',
}: SelectProps) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-primary-white mb-1">
                    {label}
                    {required && <span className="text-status-error ml-1">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`block w-full px-4 py-3 border ${error ? 'border-status-error' : 'border-secondary-medium-gray'
                    } placeholder-secondary-light-gray text-primary-white bg-secondary-dark-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange sm:text-sm`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-secondary-dark-gray">
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-status-error">{error}</p>
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
