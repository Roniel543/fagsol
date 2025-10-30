'use client';

import { Course } from '@/shared/types';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    course: Course;
};

export function CourseCard({ course }: Props) {
    return (
        <div className="group rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-primary-orange transition-colors">
            <Link href={`/academy/course/${course.slug}`} className="block">
                <div className="relative aspect-[16/9] bg-zinc-800">
                    {course.thumbnailUrl ? (
                        <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
                            <div className="flex items-center gap-2 text-zinc-300">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                                    <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M4 16l4-4 3 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="9" cy="8" r="1.5" fill="currentColor" />
                                </svg>
                                <span className="text-sm font-medium">Sin imagen</span>
                            </div>
                            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,149,0,0.08),transparent_60%)]" />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-primary-orange font-semibold">{course.category}</div>
                        <span
                            className={
                                'text-[10px] px-2 py-0.5 rounded-full border ' +
                                (course.provider === 'fagsol'
                                    ? 'border-primary-orange text-primary-orange'
                                    : 'border-zinc-600 text-gray-300')
                            }
                        >
                            {course.provider === 'fagsol' ? 'Fagsol' : 'Instructor'}
                        </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-primary-white leading-snug line-clamp-2">{course.title}</h3>
                    {course.subtitle && (
                        <p className="mt-1 text-sm text-gray-300 line-clamp-2">{course.subtitle}</p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-300">
                        <span>{course.level}</span>
                        <span>•</span>
                        <span>{course.hours} h</span>
                        <span>•</span>
                        <span>{course.lessons} lecciones</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                        <div className="text-sm text-gray-300">⭐ {course.rating.toFixed(1)} ({course.ratingsCount})</div>
                        <div className="text-right">
                            {course.discountPrice ? (
                                <>
                                    <div className="text-primary-orange font-bold">S/ {course.discountPrice}</div>
                                    <div className="text-gray-400 line-through text-xs">S/ {course.price}</div>
                                </>
                            ) : (
                                <div className="text-primary-orange font-bold">S/ {course.price}</div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default CourseCard;


