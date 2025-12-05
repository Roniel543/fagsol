'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className = '' }: FeatureCardProps) {
    return (
        <div className={`group bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sm:p-8 hover:border-primary-orange/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-orange/10 ${className}`}>
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary-orange/10 rounded-xl group-hover:bg-primary-orange/20 transition-colors duration-300">
                <Icon className="w-8 h-8 text-primary-orange" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-orange transition-colors duration-300">
                {title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
                {description}
            </p>
        </div>
    );
}


