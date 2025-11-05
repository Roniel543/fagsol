import dynamic from 'next/dynamic';

const CourseDetailPage = dynamic(() => import('@/features/academy/pages/CourseDetailPage'), { ssr: false });

export default function Page() {
    return <CourseDetailPage />;
}


