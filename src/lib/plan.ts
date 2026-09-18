import type { PlanCourse, ProposedPlan } from './types.ts';

export function normalizePlan(data: unknown): ProposedPlan {
  const raw = (data ?? {}) as Record<string, unknown>;

  const rawCourses = Array.isArray(raw.courses) ? raw.courses : [];

  const courses: PlanCourse[] = rawCourses.map((course) => {
    const c = (course ?? {}) as Record<string, unknown>;

    return {
      code: String(c.code ?? ''),
      title: String(c.title ?? ''),
      days: String(c.days ?? ''),
      time: String(c.time ?? ''),
      instructor: String(c.instructor ?? ''),
      room: String(c.room ?? ''),
      credits: Number(c.credits ?? 0) || 0,
    };
  });

  const totalCredits =
    typeof raw.totalCredits === 'number'
      ? raw.totalCredits
      : courses.reduce((sum, course) => sum + course.credits, 0);

  return {
    courses,
    totalCredits,
  };
}

// The per-execution Wait-node link n8n sends alongside the plan:
//
// { "courses": [...], "totalCredits": 17, "RespondURL": "..." }
//
// Kept separate from the plan so it is never sent back inside "plan".
export function extractRespondUrl(data: unknown): string | null {
  const raw = (data ?? {}) as Record<string, unknown>;
  const url = typeof raw.RespondURL === 'string' ? raw.RespondURL.trim() : '';
  return url || null;
}

export async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}