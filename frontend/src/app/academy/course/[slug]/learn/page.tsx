import dynamic from 'next/dynamic';

const CourseLearnPage = dynamic(() => import('@/features/academy/pages/CourseLearnPage'), { ssr: false });

export default function Page() {
    return <CourseLearnPage />;
}

