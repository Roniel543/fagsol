'use client';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'error' | 'warning' | 'info' | 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function Badge({
    children,
    variant = 'primary',
    size = 'md',
    className = ''
}: BadgeProps) {
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-colors';

    const variantClasses = {
        success: 'bg-green-500 text-white hover:bg-green-600',
        error: 'bg-red-500 text-white hover:bg-red-600',
        warning: 'bg-yellow-500 text-black hover:bg-yellow-600',
        info: 'bg-blue-500 text-white hover:bg-blue-600',
        primary: 'bg-primary-orange text-primary-black hover:bg-primary-orange/90',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    };

    const sizeClasses = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
            {children}
        </span>
    );
}

// Componente específico para estadísticas de recuperación
interface RecoveryBadgeProps {
    percentage: string;
    className?: string;
}

export function RecoveryBadge({ percentage, className = '' }: RecoveryBadgeProps) {
    return (
        <Badge variant="error" size="sm" className={className}>
            {percentage} Recuperación
        </Badge>
    );
}

// Componente específico para procesos limpios
interface CleanProcessBadgeProps {
    text: string;
    className?: string;
}

export function CleanProcessBadge({ text, className = '' }: CleanProcessBadgeProps) {
    return (
        <Badge variant="success" size="sm" className={className}>
            {text}
        </Badge>
    );
}

// Componente específico para pureza
interface PurityBadgeProps {
    percentage: string;
    className?: string;
}

export function PurityBadge({ percentage, className = '' }: PurityBadgeProps) {
    return (
        <Badge variant="info" size="sm" className={className}>
            {percentage} Pureza
        </Badge>
    );
}
