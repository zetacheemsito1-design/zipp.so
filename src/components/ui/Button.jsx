import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: "bg-zipp-black text-white hover:bg-zipp-black/80 shadow-xl shadow-zipp-black/20",
    accent: "bg-zipp-accent text-zipp-black hover:brightness-105 shadow-xl shadow-zipp-accent/30",
    outline: "border-2 border-zipp-black/10 text-zipp-black hover:bg-gray-50",
    ghost: "text-zipp-black hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20",
};

const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg",
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    className = '',
    ...props
}) {
    return (
        <button
            className={cn(
                "rounded-full font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading ? <Loader2 className="animate-spin" size={18} /> : children}
        </button>
    );
}
