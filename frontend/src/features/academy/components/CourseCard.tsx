'use client';

import { CoursePlaceholder, MultiCurrencyPrice } from '@/shared/components';
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
                        <CoursePlaceholder size="default" />
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-primary-orange font-semibold">{course.category}</div>
                        <span
                            className={
                                'text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ' +
                                (course.provider === 'fagsol'
                                    ? 'border-primary-orange text-primary-orange'
                                    : 'border-blue-500/50 text-blue-400 bg-blue-500/10')
                            }
                            title={course.provider !== 'fagsol' && course.instructor?.name
                                ? `Creado por ${course.instructor.name}`
                                : undefined
                            }
                        >
                            {course.provider === 'fagsol'
                                ? 'Fagsol'
                                : (course.instructor?.name
                                    ? course.instructor.name.length > 15
                                        ? `${course.instructor.name.substring(0, 15)}...`
                                        : course.instructor.name
                                    : 'Instructor')
                            }
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
                                    <MultiCurrencyPrice
                                        priceUsd={course.price_usd || course.price / 3.75}
                                        pricePen={course.discountPrice}
                                        size="sm"
                                        showUsd={false}
                                    />
                                    <div className="text-gray-400 line-through text-xs">
                                        <MultiCurrencyPrice
                                            priceUsd={course.price_usd || course.price / 3.75}
                                            pricePen={course.price}
                                            size="sm"
                                            showUsd={false}
                                        />
                                    </div>
                                </>
                            ) : (
                                <MultiCurrencyPrice
                                    priceUsd={course.price_usd || course.price / 3.75}
                                    pricePen={course.price}
                                    size="sm"
                                    showUsd={false}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

export default CourseCard;


