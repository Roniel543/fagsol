'use client';

import Header from '@/shared/components/Header';
import { CommitmentSection, HeroSection, ProcessSection } from '../index';

export function HomePage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <HeroSection />
            <ProcessSection />
            <CommitmentSection />
        </main>
    );
}
