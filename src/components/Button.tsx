import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
    primary:
        'bg-gradient-to-r from-accent-indigo to-accent-cyan text-white hover:shadow-lg hover:shadow-accent-indigo/25 active:scale-[0.97]',
    secondary:
        'bg-dark-600 text-dark-100 border border-dark-400 hover:bg-dark-500 hover:border-accent-indigo/30 active:scale-[0.97]',
    outline:
        'bg-transparent border border-accent-indigo/40 text-accent-indigo-light hover:bg-accent-indigo/10 active:scale-[0.97]',
    danger:
        'bg-accent-red/20 text-accent-red border border-accent-red/30 hover:bg-accent-red/30 active:scale-[0.97]',
    ghost:
        'bg-transparent text-dark-200 hover:text-dark-100 hover:bg-dark-600 active:scale-[0.97]',
};

const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <span className="spinner" /> : icon}
            {children}
        </button>
    );
}
