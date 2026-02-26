'use client';

import { Button, SafeHTML } from '@/shared/components';
import { announcementsAPI } from '@/shared/services/api';
import type { Announcement } from '@/shared/types';
import { X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_PREFIX = 'fagsol_announcement_dismissed_';

function getDismissedKey(slug: string): string {
    return `${STORAGE_PREFIX}${slug}`;
}

export function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const load = useCallback(async () => {
        if (typeof window === 'undefined') return;
        setLoading(true);
        try {
            const { success, data } = await announcementsAPI.getActive();
            if (success && data) {
                const key = getDismissedKey(data.slug);
                const dismissed = localStorage.getItem(key) === 'true';
                if (!dismissed) {
                    setAnnouncement(data);
                    setVisible(true);
                }
            }
        } catch {
            // Silently ignore; no announcement to show
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const handleClose = useCallback(() => {
        if (announcement && dontShowAgain) {
            localStorage.setItem(getDismissedKey(announcement.slug), 'true');
        }
        setVisible(false);
    }, [announcement, dontShowAgain]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        if (visible) {
            window.addEventListener('keydown', onKeyDown);
            return () => window.removeEventListener('keydown', onKeyDown);
        }
    }, [visible, handleClose]);

    if (loading || !visible || !announcement) return null;

    return (
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 p-3 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-title"
        >
            <div
                className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-secondary-dark-gray border border-secondary-medium-gray shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-primary-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-orange sm:right-4 sm:top-4"
                    aria-label="Cerrar"
                >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-4 pt-12 sm:p-6 sm:pt-14">
                    {announcement.image_url && (
                        <div className="mb-4 rounded-lg bg-primary-black/30 overflow-hidden">
                            <img
                                src={announcement.image_url}
                                alt=""
                                className="w-full h-auto max-w-full max-h-[70vh] object-contain object-top block"
                            />
                        </div>
                    )}
                    <h2
                        id="announcement-title"
                        className="text-xl font-bold text-primary-white mb-2"
                    >
                        {announcement.title}
                    </h2>
                    {announcement.summary && (
                        <p className="text-secondary-light-gray mb-3 whitespace-pre-line">
                            {announcement.summary}
                        </p>
                    )}
                    {announcement.body && (
                        <div className="text-primary-white/90 mb-4 prose prose-invert prose-sm max-w-none">
                            <SafeHTML html={announcement.body} />
                        </div>
                    )}
                    {announcement.cta_url && announcement.cta_text && (
                        <div className="mb-4">
                            <a
                                href={announcement.cta_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                            >
                                <Button variant="primary" size="md">
                                    {announcement.cta_text}
                                </Button>
                            </a>
                        </div>
                    )}
                </div>

                <div className="shrink-0 border-t border-secondary-medium-gray bg-secondary-dark-gray/95 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-b-xl">
                    <label className="flex items-center gap-2 text-sm text-secondary-light-gray cursor-pointer order-2 sm:order-1">
                        <input
                            type="checkbox"
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                            className="rounded border-secondary-medium-gray bg-primary-black text-primary-orange focus:ring-primary-orange"
                        />
                        No volver a mostrar
                    </label>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleClose}
                        className="order-1 sm:order-2 w-full sm:w-auto"
                    >
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
