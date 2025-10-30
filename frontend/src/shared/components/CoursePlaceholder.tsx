export function CoursePlaceholder({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
    const iconSize = size === 'small' ? 20 : size === 'large' ? 36 : 28;
    const textSize = size === 'small' ? 'text-xs' : size === 'large' ? 'text-base' : 'text-sm';

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800">
            <div className="flex items-center gap-2 text-zinc-300">
                <svg 
                    width={iconSize} 
                    height={iconSize} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="opacity-80"
                >
                    <path 
                        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                    />
                    <path 
                        d="M4 16l4-4 3 3 5-5 4 4" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                    />
                    <circle cx="9" cy="8" r="1.5" fill="currentColor" />
                </svg>
                <span className={`${textSize} font-medium`}>Sin imagen</span>
            </div>
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,149,0,0.08),transparent_60%)]" />
        </div>
    );
}

export default CoursePlaceholder;

