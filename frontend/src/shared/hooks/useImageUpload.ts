'use client';

import { useToast } from '@/shared/components/Toast';
import { uploadCourseImage, UploadImageResponse } from '@/shared/services/courses';
import { useState } from 'react';

interface UseImageUploadOptions {
    onSuccess?: (url: string, metadata?: UploadImageResponse['data']) => void;
    onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const { showToast } = useToast();

    const uploadImage = async (
        file: File,
        imageType: 'thumbnail' | 'banner'
    ): Promise<string | null> => {
        setUploading(true);
        setProgress(0);

        try {
            // Validaciones básicas
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                const error = `El archivo es demasiado grande. Máximo ${maxSize / (1024 * 1024)}MB`;
                showToast(` ${error}`, 'error');
                options.onError?.(error);
                return null;
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                const error = 'Formato no permitido. Solo se aceptan: JPEG, PNG, WebP';
                showToast(` ${error}`, 'error');
                options.onError?.(error);
                return null;
            }

            setProgress(30);

            // Subir imagen
            const response = await uploadCourseImage(file, imageType);
            setProgress(80);

            if (response.success && response.data) {
                setProgress(100);
                showToast('Imagen subida y optimizada exitosamente', 'success');
                options.onSuccess?.(response.data.url, response.data);
                return response.data.url;
            } else {
                const error = response.message || 'Error al subir la imagen';
                showToast(`❌ ${error}`, 'error');
                options.onError?.(error);
                return null;
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Error al subir la imagen';
            showToast(` ${errorMessage}`, 'error');
            options.onError?.(errorMessage);
            return null;
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 500);
        }
    };

    return {
        uploadImage,
        uploading,
        progress,
    };
}

