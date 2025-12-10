import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

export function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

export function generateLinkUrl(id) {
    return `${window.location.origin}/l/${id}`;
}
