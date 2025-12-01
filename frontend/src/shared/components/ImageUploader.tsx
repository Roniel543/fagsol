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
}

export function ImageUploader({
    label,
    value,
    onChange,
    imageType,
    recommendedSize,
    className = '',
    error,
}: ImageUploaderProps) {

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
    }, [uploadImage, imageType]);

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

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

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
            <label className="text-sm font-medium text-primary-white mb-2 flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-primary-orange" />
                <span>{label}</span>
            </label>

            {error && (
                <div className="flex items-center space-x-2 text-sm text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {!preview && !isUrlMode && (
                <div
                    className={`
                        relative border-2 border-dashed rounded-lg p-8
                        transition-all duration-300
                        ${dragActive
                            ? 'border-primary-orange bg-primary-orange/10'
                            : 'border-primary-orange/30 bg-primary-black/40 hover:border-primary-orange/50'
                        }
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={uploading}
                    />

                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-amber-500 rounded-lg flex items-center justify-center">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <p className="text-primary-white font-medium mb-2">
                            Arrastra una imagen aquí o haz clic para seleccionar
                        </p>
                        <p className="text-secondary-light-gray text-sm mb-4">
                            Formatos: JPEG, PNG, WebP (máx. 5MB)
                        </p>
                        <div className="flex items-center justify-center space-x-3">
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                onClick={switchToUploadMode}
                                disabled={uploading}
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Imagen
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={switchToUrlMode}
                                disabled={uploading}
                            >
                                <LinkIcon className="w-4 h-4 mr-2" />
                                Usar URL
                            </Button>
                        </div>
                    </div>

                    {uploading && (
                        <div className="absolute inset-0 bg-primary-black/80 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-primary-white text-sm">Subiendo y optimizando...</p>
                                <p className="text-secondary-light-gray text-xs mt-1">{progress}%</p>
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
                            className="flex-1 px-4 py-3 bg-primary-black/40 border border-primary-orange/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-primary-orange text-primary-white placeholder-secondary-light-gray"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleUrlSubmit();
                                }
                            }}
                        />
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={handleUrlSubmit}
                            disabled={!urlInput.trim()}
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
                        >
                            Cancelar
                        </Button>
                    </div>
                    <p className="text-xs text-secondary-light-gray">
                        O puedes{' '}
                        <button
                            type="button"
                            onClick={switchToUploadMode}
                            className="text-primary-orange hover:underline"
                        >
                            subir una imagen desde tu computadora
                        </button>
                    </p>
                </div>
            )}

            {preview && (
                <div className="relative">
                    <div className="relative rounded-lg overflow-hidden border border-primary-orange/20 bg-primary-black/40">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto max-h-64 object-contain"
                            onError={() => {
                                setPreview(null);
                                showToast('❌ Error al cargar la imagen', 'error');
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-secondary-light-gray">
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

