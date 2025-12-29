'use client';

type Props = {
    q: string;
    category: string;
    level: string;
    categories: string[];
    provider?: string;
    onChange: (next: { q?: string; category?: string; level?: string; provider?: string }) => void;
};

export function FiltersBar({ q, category, level, categories, provider = '', onChange }: Props) {
    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 w-full min-w-0">
            <input
                value={q}
                onChange={(e) => onChange({ q: e.target.value })}
                placeholder="Buscar cursos..."
                className="w-full sm:flex-1 sm:max-w-md rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm outline-none focus:border-primary-orange min-w-0"
            />
            <div className="flex flex-wrap gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial sm:justify-end">
                <select
                    value={category}
                    onChange={(e) => onChange({ category: e.target.value })}
                    className="flex-1 sm:flex-initial min-w-0 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange text-white"
                >
                    <option value="">Todas las categorías</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={provider}
                    onChange={(e) => onChange({ provider: e.target.value })}
                    className="flex-1 sm:flex-initial min-w-0 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange text-white"
                >
                    <option value="">Todos los proveedores</option>
                    <option value="fagsol">Fagsol</option>
                    <option value="instructor">Instructores</option>
                </select>
                <select
                    value={level}
                    onChange={(e) => onChange({ level: e.target.value })}
                    className="flex-1 sm:flex-initial min-w-0 rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm focus:border-primary-orange text-white"
                >
                    <option value="">Todos los niveles</option>
                    <option value="beginner">Básico</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                </select>
            </div>
        </div>
    );
}

export default FiltersBar;


