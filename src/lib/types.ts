// ---------------------------------------------------------------------------
// Form types
// ---------------------------------------------------------------------------

export interface FormState {
  fullName: string;
  studentId: string;
  mobile: string;
  degreeTrack: string;
  major: string;
  semester: string;
  year: string;
  studyPlanFile: File | null;
  courseOfferingsFile: File | null;
  email: string;
  advisorEmail: string;
  courses: string[];
  preferredTimes: string[];
  daysToAvoid: string[];
  otherPreferences: string[];
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;
export type Touched = Partial<Record<keyof FormState, boolean>>;

export type FileKey = 'studyPlanFile' | 'courseOfferingsFile';
export type ToggleKey = 'preferredTimes' | 'daysToAvoid';

export type SetField = <K extends keyof FormState>(
  key: K,
  value: FormState[K],
) => void;

export type ShowError = <K extends keyof FormState>(
  key: K,
) => string | undefined;

export type Phase = 'form' | 'review' | 'approved';

// ---------------------------------------------------------------------------
// Plan contract
// ---------------------------------------------------------------------------
//
// This is the ONLY plan structure used by the frontend.
//
// There is intentionally NO planId.
//
// n8n responses for submit/request_changes should be:
//
// {
//   "courses": [
//     {
//       "code": "...",
//       "title": "...",
//       "days": "...",
//       "time": "...",
//       "instructor": "...",
//       "room": "...",
//       "credits": 3
//     }
//   ],
//   "totalCredits": 17
// }
//
// The same object is sent back to n8n for request_changes and approve.

export interface PlanCourse {
  code: string;
  title: string;
  days: string;
  time: string;
  instructor: string;
  room: string;
  credits: number;
}

export interface ProposedPlan {
  courses: PlanCourse[];
  totalCredits: number;
}
