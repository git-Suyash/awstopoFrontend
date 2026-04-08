import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glow?: 'cyan' | 'indigo' | 'none';
    onClick?: () => void;
}

export default function Card({
    children,
    className = '',
    hover = false,
    glow = 'none',
    onClick,
}: CardProps) {
    const glowClass = glow !== 'none' ? `glow-${glow}` : '';
    const hoverClass = hover ? 'glass-hover cursor-pointer' : '';

    return (
        <div
            className={`glass p-6 ${hoverClass} ${glowClass} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}
