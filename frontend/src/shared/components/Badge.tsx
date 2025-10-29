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
    const baseClasses = 'inline-flex items-center font-semibold rounded-lg transition-all duration-200 border';

    const variantClasses = {
        success: 'bg-green-950/50 text-green-400 border-green-500/30 hover:bg-green-950/70 hover:border-green-500/50',
        error: 'bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-950/70 hover:border-red-500/50',
        warning: 'bg-yellow-950/50 text-yellow-400 border-yellow-500/30 hover:bg-yellow-950/70 hover:border-yellow-500/50',
        info: 'bg-blue-950/50 text-blue-400 border-blue-500/30 hover:bg-blue-950/70 hover:border-blue-500/50',
        primary: 'bg-orange-950/50 text-primary-orange border-primary-orange/30 hover:bg-orange-950/70 hover:border-primary-orange/50',
        secondary: 'bg-gray-900/50 text-gray-300 border-gray-600/30 hover:bg-gray-900/70 hover:border-gray-600/50',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
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
