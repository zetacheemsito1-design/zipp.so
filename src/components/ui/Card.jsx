import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className = '', hover = true, ...props }) {
    return (
        <div
            className={cn(
                "bg-white rounded-3xl border border-gray-100 shadow-sm",
                hover && "transition-all duration-300 hover:shadow-lg hover:border-gray-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={cn("p-6 border-b border-gray-100", className)}>
            {children}
        </div>
    );
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
}
