import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

export default function Input({
    label,
    error,
    icon,
    className = '',
    id,
    ...props
}: InputProps) {
    const inputId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-300">
                        {icon}
                    </span>
                )}
                <input
                    id={inputId}
                    className={`w-full bg-dark-700/80 border ${error ? 'border-accent-red/50' : 'border-dark-400/50'
                        } rounded-xl px-4 py-3 text-sm text-dark-100 placeholder-dark-300 focus:outline-none focus:border-accent-indigo/60 focus:ring-1 focus:ring-accent-indigo/30 transition-all duration-200 ${icon ? 'pl-10' : ''
                        }`}
                    placeholder=" "
                    {...props}
                />
                <label
                    htmlFor={inputId}
                    className={`absolute left-${icon ? '10' : '4'} top-3 text-sm text-dark-300 transition-all duration-200 pointer-events-none
            peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-accent-cyan`}
                >
                    {label}
                </label>
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-accent-red flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
