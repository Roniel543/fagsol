import { redirect } from 'next/navigation';

export default function AdminPage() {
    // Redirigir a dashboard - el dashboard es dinámico según el rol
    redirect('/dashboard');
}

