import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';

export default function AdminLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AdminLayout>{children}</AdminLayout>;
}

