import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../lib/storage';

export function ImageUpload({ value, onChange, className = '' }) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = useCallback(async (file) => {
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('La imagen debe ser menor a 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const url = await uploadImage(file);
            onChange(url);
        } catch (err) {
            console.error('Upload failed:', err);
            setError('Error al subir imagen');
        } finally {
            setUploading(false);
        }
    }, [onChange]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleChange = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className={`relative ${className}`}>
            {value ? (
                // Preview with remove button
                <div className="relative group">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <label className="p-2 bg-white rounded-full cursor-pointer hover:scale-110 transition-transform">
                            <Upload size={18} className="text-gray-700" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={handleRemove}
                            className="p-2 bg-red-500 rounded-full hover:scale-110 transition-transform"
                        >
                            <X size={18} className="text-white" />
                        </button>
                    </div>
                </div>
            ) : (
                // Upload dropzone
                <label
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
            flex flex-col items-center justify-center gap-2 p-6 
            border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-200
            ${dragOver
                            ? 'border-zipp-accent bg-zipp-accent/10 scale-[1.02]'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                        }
          `}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin text-zipp-accent" size={32} />
                            <p className="text-sm text-gray-500">Subiendo...</p>
                        </>
                    ) : (
                        <>
                            <div className={`p-3 rounded-full ${dragOver ? 'bg-zipp-accent/20' : 'bg-gray-100'}`}>
                                <ImageIcon size={24} className={dragOver ? 'text-zipp-accent' : 'text-gray-400'} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    Arrastra una imagen o <span className="text-zipp-accent">click para subir</span>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hasta 5MB</p>
                            </div>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                </label>
            )}

            {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
        </div>
    );
}

// Circular avatar-specific upload
export function AvatarUpload({ value, onChange, size = 'md' }) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
    };

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        if (file.size > 5 * 1024 * 1024) return;

        setUploading(true);
        try {
            const url = await uploadImage(file, 'avatars');
            onChange(url);
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files[0]);
    };

    return (
        <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
        ${sizeClasses[size]} rounded-full cursor-pointer
        relative overflow-hidden group
        ${dragOver ? 'ring-4 ring-zipp-accent ring-offset-2' : ''}
        transition-all duration-200
      `}
        >
            {value ? (
                <>
                    <img src={value} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {uploading ? (
                            <Loader2 className="animate-spin text-white" size={24} />
                        ) : (
                            <Upload className="text-white" size={24} />
                        )}
                    </div>
                </>
            ) : (
                <div className={`
          w-full h-full flex items-center justify-center
          bg-gradient-to-br from-gray-100 to-gray-200
          ${dragOver ? 'from-zipp-accent/20 to-zipp-accent/10' : ''}
        `}>
                    {uploading ? (
                        <Loader2 className="animate-spin text-gray-400" size={28} />
                    ) : (
                        <Upload className={`${dragOver ? 'text-zipp-accent' : 'text-gray-400'}`} size={28} />
                    )}
                </div>
            )}
            <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
            />
        </label>
    );
}
