import React from 'react';
import { cn } from '../../lib/utils';

export function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    "w-full bg-gray-50 border-2 border-transparent focus:bg-white focus:border-zipp-accent rounded-2xl p-4 font-medium outline-none transition-all",
                    error && "border-red-500 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
}
