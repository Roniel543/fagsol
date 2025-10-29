'use client';

import { Header, Footer } from '@/shared/components';
import { 
    CommitmentSection, 
    HeroSection, 
    ProcessSection,
    EducationSection,
    TeacherSection,
    EquipmentSection,
    CoursesPreviewSection,
    ContactSection
} from '../index';

export function HomePage() {
    return (
        <main className="flex min-h-screen flex-col">
            <Header />
            <HeroSection />
            <CoursesPreviewSection />
            <ProcessSection />
            <EquipmentSection />
            <TeacherSection />
            <CommitmentSection />
            <ContactSection />
            <Footer />
        </main>
    );
}
