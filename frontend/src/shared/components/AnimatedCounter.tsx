'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    className?: string;
    startOnView?: boolean;
}

export function AnimatedCounter({ 
    end, 
    duration = 2000, 
    suffix = '', 
    prefix = '',
    decimals = 0,
    className = '',
    startOnView = true 
}: AnimatedCounterProps) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(!startOnView);
    const counterRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!startOnView) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => observer.disconnect();
    }, [startOnView]);

    useEffect(() => {
        if (!isVisible) return;

        const startTime = Date.now();
        const endTime = startTime + duration;

        const updateCounter = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            
            // Easing function para suavizar la animación
            const easeOutQuad = (t: number) => t * (2 - t);
            const easedProgress = easeOutQuad(progress);
            
            const currentCount = decimals > 0 
                ? parseFloat((easedProgress * end).toFixed(decimals))
                : Math.floor(easedProgress * end);
            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(updateCounter);
    }, [isVisible, end, duration]);

    return (
        <span ref={counterRef} className={className}>
            {prefix}{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}
        </span>
    );
}

