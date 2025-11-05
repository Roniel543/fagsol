export type Enrollment = { id: string; enrolledAt: string };

const STORAGE_KEY = 'enrollments';

export function getEnrollments(): Enrollment[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY) || '[]';
		return JSON.parse(raw);
	} catch {
		return [];
	}
}

export function addEnrollments(courseIds: string[]) {
	if (typeof window === 'undefined') return;
	const now = new Date().toISOString();
	const current = getEnrollments();
	const set = new Map(current.map((e) => [e.id, e] as const));
	for (const id of courseIds) {
		if (!set.has(id)) set.set(id, { id, enrolledAt: now });
	}
	localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set.values())));
}

export function isEnrolled(courseId: string): boolean {
	return getEnrollments().some((e) => e.id === courseId);
}
