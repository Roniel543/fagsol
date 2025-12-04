'use client';

import { Button, useToast } from '@/shared/components';
import { useImageUpload } from '@/shared/hooks/useImageUpload';
import { AlertCircle, Image as ImageIcon, Link as LinkIcon, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ImageUploaderProps {
    label: string;
    value?: string;
    onChange: (url: string) => void;
    imageType: 'thumbnail' | 'banner';
    recommendedSize?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
    variant?: 'light' | 'dark'; // Nueva prop para tema
}

export function ImageUploader({
    label,
    value,
    onChange,
    imageType,
    recommendedSize,
    className = '',
    error,
    disabled = false,
    variant = 'dark', // Por defecto dark para mantener compatibilidad
}: ImageUploaderProps) {
    const useLightTheme = variant === 'light';

    const [preview, setPreview] = useState<string | null>(value || null);
    const [isUrlMode, setIsUrlMode] = useState(false);
    const [urlInput, setUrlInput] = useState(value || '');
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Sincronizar preview con value cuando cambia externamente
    useEffect(() => {
        if (value !== urlInput) {
            setPreview(value || null);
            setUrlInput(value || '');
        }
    }, [value, urlInput]);

    const { uploadImage, uploading, progress } = useImageUpload({
        onSuccess: (url) => {
            setPreview(url);
            onChange(url);
            setIsUrlMode(false);
        },
        onError: () => {
            // El error ya se muestra en el toast
        },
    });

    const handleFileSelect = useCallback(async (file: File) => {
        if (disabled) return;

        // Crear preview inmediato desde el archivo local
        const reader = new FileReader();
        reader.onload = (e) => {
            const localPreview = e.target?.result as string;
            setPreview(localPreview);
        };
        reader.readAsDataURL(file);

        // Subir imagen
        const url = await uploadImage(file, imageType);
        if (url) {
            // Una vez subida, actualizar preview con la URL del servidor
            setPreview(url);
            setUrlInput(url);
        } else {
            // Si falla la subida, mantener el preview local pero limpiar si es necesario
            // El error ya se muestra en el toast
        }
    }, [uploadImage, imageType, disabled]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    }, [handleFileSelect, disabled]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleUrlSubmit = () => {
        if (disabled) return;

        if (urlInput.trim()) {
            // Validar URL básica
            try {
                new URL(urlInput);
                setPreview(urlInput);
                onChange(urlInput);
                setIsUrlMode(false);
            } catch {
                // Si no es una URL válida, intentar como ruta relativa
                setPreview(urlInput);
                onChange(urlInput);
                setIsUrlMode(false);
            }
        }
    };

    const handleRemove = () => {
        if (disabled) return;

        setPreview(null);
        setUrlInput('');
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const switchToUrlMode = () => {
        setIsUrlMode(true);
        setTimeout(() => urlInputRef.current?.focus(), 100);
    };

    const switchToUploadMode = () => {
        setIsUrlMode(false);
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <label className={`text-sm font-medium ${useLightTheme ? 'text-gray-900' : 'text-primary-white'} mb-2 flex items-center space-x-2`}>
                <ImageIcon className="w-4 h-4 text-primary-orange" />
                <span>{label}</span>
            </label>

            {error && (
                <div className={`flex items-center space-x-2 text-sm ${useLightTheme ? 'text-red-600' : 'text-red-400'}`}>
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {!preview && !isUrlMode && (
                <div
                    className={`
                        relative border-2 border-dashed rounded-lg p-8
                        transition-all duration-300
                        ${disabled
                            ? useLightTheme
                                ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-50'
                                : 'opacity-50 cursor-not-allowed border-primary-orange/20 bg-primary-black/20'
                            : dragActive
                                ? useLightTheme
                                    ? 'border-primary-orange bg-orange-50'
                                    : 'border-primary-orange bg-primary-orange/10'
                                : useLightTheme
                                    ? 'border-gray-300 bg-gray-50 hover:border-primary-orange hover:bg-gray-100'
                                    : 'border-primary-orange/30 bg-primary-black/40 hover:border-primary-orange/50'
                        }
                    `}
                    onDrop={disabled ? undefined : handleDrop}
                    onDragOver={disabled ? undefined : handleDragOver}
                    onDragLeave={disabled ? undefined : handleDragLeave}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={uploading || disabled}
                    />

                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <p className={`${useLightTheme ? 'text-gray-900' : 'text-primary-white'} font-medium mb-2`}>
                            Arrastra una imagen aquí o haz clic para seleccionar
                        </p>
                        <p className={`${useLightTheme ? 'text-gray-600' : 'text-secondary-light-gray'} text-sm mb-4`}>
                            Formatos: JPEG, PNG, WebP (máx. 5MB)
                        </p>
                        <div className="flex items-center justify-center space-x-3">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={switchToUploadMode}
                                disabled={uploading || disabled}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Imagen
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={switchToUrlMode}
                                disabled={uploading || disabled}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Usar URL
                            </Button>
                        </div>
                    </div>

                    {uploading && (
                        <div className={`absolute inset-0 ${useLightTheme ? 'bg-white/90' : 'bg-primary-black/80'} rounded-lg flex items-center justify-center`}>
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className={`${useLightTheme ? 'text-gray-900' : 'text-primary-white'} text-sm`}>Subiendo y optimizando...</p>
                                <p className={`${useLightTheme ? 'text-gray-600' : 'text-secondary-light-gray'} text-xs mt-1`}>{progress}%</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {isUrlMode && !preview && (
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            ref={urlInputRef}
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://ejemplo.com/imagen.jpg"
                            disabled={disabled}
                            className={`flex-1 px-4 py-3 ${useLightTheme
                                ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'
                                : 'bg-primary-black/40 border border-primary-orange/20 text-primary-white placeholder-secondary-light-gray'
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !disabled) {
                                    handleUrlSubmit();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim() || disabled}
                        >
                            Usar URL
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setIsUrlMode(false);
                                setUrlInput('');
                            }}
                            disabled={disabled}
                        >
                            Cancelar
                        </Button>
                    </div>
                    {!disabled && (
                        <p className={`text-xs ${useLightTheme ? 'text-gray-600' : 'text-secondary-light-gray'}`}>
                            O puedes{' '}
                            <button
                                type="button"
                                onClick={switchToUploadMode}
                                className="text-primary-orange hover:underline"
                            >
                                subir una imagen desde tu computadora
                            </button>
                        </p>
                    )}
                </div>
            )}

            {preview && (
                <div className="relative">
                    <div className={`relative rounded-lg overflow-hidden border ${useLightTheme ? 'border-gray-300 bg-white' : 'border-primary-orange/20 bg-primary-black/40'}`}>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto max-h-64 object-contain"
                            onError={() => {
                                setPreview(null);
                                showToast('❌ Error al cargar la imagen', 'error');
                            }}
                        />
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <p className={`text-xs ${useLightTheme ? 'text-gray-600' : 'text-secondary-light-gray'}`}>
                            {recommendedSize && `Recomendado: ${recommendedSize}`}
                        </p>
                        <div className="flex items-center space-x-2">
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setPreview(null);
                                    setIsUrlMode(true);
                                    setUrlInput(value || '');
                                }}
                                disabled={disabled}
                            >
                                Cambiar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

