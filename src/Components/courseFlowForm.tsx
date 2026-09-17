import { useState } from 'react';
import type { SubmitEvent, KeyboardEvent, ChangeEvent } from 'react';
import '../CourseFlowForm.css';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
//
// Three separate n8n webhooks:
//
//   submit
//     -> initial registration
//     -> multipart/form-data because two files are uploaded
//
//   request_changes
//     -> student disapproves / requests changes
//     -> JSON containing the COMPLETE current plan + feedback
//
//   approve
//     -> student approves the plan
//     -> JSON containing the COMPLETE current plan
//
// Add these to your .env:
//
// VITE_N8N_SUBMIT_WEBHOOK_URL=...
// VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL=...
// VITE_N8N_APPROVE_WEBHOOK_URL=...

const SUBMIT_WEBHOOK_URL =
  import.meta.env.VITE_N8N_SUBMIT_WEBHOOK_URL as string | undefined;

const REQUEST_CHANGES_WEBHOOK_URL =
  import.meta.env.VITE_N8N_REQUEST_CHANGES_WEBHOOK_URL as string | undefined;

const APPROVE_WEBHOOK_URL =
  import.meta.env.VITE_N8N_APPROVE_WEBHOOK_URL as string | undefined;

// ---------------------------------------------------------------------------
// Majors
// ---------------------------------------------------------------------------

interface MajorOption {
  major: string;
  college: string;
}

const UNDERGRAD_MAJORS: MajorOption[] = [
  { major: 'Computer Science', college: 'College of Arts and Sciences' },
  { major: 'Graphic Design', college: 'College of Arts and Sciences' },
  { major: 'Accounting', college: 'College of Business Administration' },
  {
    major: 'Business Information Technology Management',
    college: 'College of Business Administration',
  },
  { major: 'Management', college: 'College of Business Administration' },
  {
    major: 'Human Resources Management',
    college: 'College of Business Administration',
  },
  {
    major: 'Marketing and Advertising',
    college: 'College of Business Administration',
  },
  {
    major: 'Finance and Banking',
    college: 'College of Business Administration',
  },
  {
    major: 'Civil and Environmental Engineering',
    college: 'College of Engineering',
  },
  { major: 'Biomedical Engineering', college: 'College of Engineering' },
  {
    major: 'Computer and Communications Engineering',
    college: 'College of Engineering',
  },
  { major: 'Electrical Engineering', college: 'College of Engineering' },
  { major: 'Mechanical Engineering', college: 'College of Engineering' },
  { major: 'Mechatronics Engineering', college: 'College of Engineering' },
];

const GRAD_MAJORS: MajorOption[] = [
  {
    major: 'MBA - General Track',
    college: 'College of Business Administration',
  },
  {
    major: 'MBA - Oil and Gas Management',
    college: 'College of Business Administration',
  },
  {
    major: 'Civil and Environmental Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Biomedical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Computer and Communications Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Electrical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Mechanical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Mechatronics Engineering (MS)',
    college: 'College of Engineering',
  },
];

function majorsForTrack(track: string): MajorOption[] {
  if (track === 'Bachelor') return UNDERGRAD_MAJORS;
  if (track === 'Master') return GRAD_MAJORS;
  return [];
}

function getCollege(major: string): string {
  return (
    [...UNDERGRAD_MAJORS, ...GRAD_MAJORS].find(
      (m) => m.major === major,
    )?.college ?? ''
  );
}

const DEGREE_TRACKS = ['Bachelor', 'Master'] as const;
const SEMESTERS = ['Fall', 'Spring', 'Summer'] as const;
const TIME_BLOCKS = ['Morning', 'Afternoon'] as const;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormState {
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

type FieldErrors = Partial<Record<keyof FormState, string>>;
type Touched = Partial<Record<keyof FormState, boolean>>;

const initialState: FormState = {
  fullName: '',
  studentId: '',
  mobile: '',
  degreeTrack: '',
  major: '',
  semester: '',
  year: '',
  studyPlanFile: null,
  courseOfferingsFile: null,
  email: '',
  advisorEmail: '',
  courses: [],
  preferredTimes: [],
  daysToAvoid: [],
  otherPreferences: [],
};

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

interface PlanCourse {
  code: string;
  title: string;
  days: string;
  time: string;
  instructor: string;
  room: string;
  credits: number;
}

interface ProposedPlan {
  courses: PlanCourse[];
  totalCredits: number;
}

function normalizePlan(data: unknown): ProposedPlan {
  const raw = (data ?? {}) as Record<string, unknown>;

  const rawCourses = Array.isArray(raw.courses)
    ? raw.courses
    : [];

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

async function postJson(
  url: string,
  body: unknown,
): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function computeErrors(f: FormState): FieldErrors {
  const next: FieldErrors = {};

  if (!f.fullName.trim()) {
    next.fullName = 'Enter your full name.';
  }

  if (!f.studentId.trim()) {
    next.studentId = 'Enter your student ID.';
  } else if (!/^\d{5,10}$/.test(f.studentId.trim())) {
    next.studentId = 'Student ID should be 5–10 digits.';
  }

  if (!f.mobile.trim()) {
    next.mobile = 'Enter a mobile number.';
  } else if (!/^[0-9+\-\s]{7,15}$/.test(f.mobile.trim())) {
    next.mobile = 'Enter a valid phone number.';
  }

  if (!f.degreeTrack) {
    next.degreeTrack = 'Select your degree track.';
  }

  if (!f.major) {
    next.major = f.degreeTrack
      ? 'Select your major.'
      : 'Select a degree track first.';
  }

  if (!f.semester) {
    next.semester = 'Select the semester.';
  }

  if (!f.year.trim()) {
    next.year = 'Enter the academic year.';
  } else if (!/^\d{4}-\d{4}$/.test(f.year.trim())) {
    next.year = 'Use the format YYYY-YYYY.';
  }

  if (!f.studyPlanFile) {
    next.studyPlanFile = 'Upload your study plan.';
  }

  if (!f.courseOfferingsFile) {
    next.courseOfferingsFile =
      'Upload the course offerings document.';
  }

  if (!f.email.trim()) {
    next.email = 'Enter your RHU student email.';
  } else if (!STUDENT_EMAIL_RE.test(f.email.trim())) {
    next.email = 'Must end in @students.rhu.edu.lb';
  }

  if (!f.advisorEmail.trim()) {
    next.advisorEmail = "Enter your advisor's email.";
  } else if (!ADVISOR_EMAIL_RE.test(f.advisorEmail.trim())) {
    next.advisorEmail = 'Must end in @rhu.edu.lb';
  }

  return next;
}

const STUDENT_EMAIL_RE =
  /^[^\s@]+@students\.rhu\.edu\.lb$/i;

const ADVISOR_EMAIL_RE =
  /^[^\s@]+@rhu\.edu\.lb$/i;

// ---------------------------------------------------------------------------
// Review reasons
// ---------------------------------------------------------------------------
//
// These are sent as the "feedback" field to n8n.
//
// If "Other" is selected, only the student's additional details are sent.

const CHANGE_REASONS = [
  'I need different courses.',
  'There is a time conflict.',
  'The schedule does not match my preferred times.',
  'The schedule does not match my days-to-avoid preferences.',
  'I need a different number of credits.',
  'Other',
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Phase = 'form' | 'review' | 'approved';

export default function CourseFlowForm() {
  const [phase, setPhase] = useState<Phase>('form');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormState>(initialState);

  const [errors, setErrors] =
    useState<FieldErrors>({});

  const [touched, setTouched] =
    useState<Touched>({});

  const [attemptedSubmit, setAttemptedSubmit] =
    useState(false);

  const [courseDraft, setCourseDraft] =
    useState('');

  const [preferenceDraft, setPreferenceDraft] =
    useState('');

  const [plan, setPlan] =
    useState<ProposedPlan | null>(null);

  const [selectedReason, setSelectedReason] =
    useState('');

  const [otherReason, setOtherReason] =
    useState('');

  // -------------------------------------------------------------------------
  // Form helpers
  // -------------------------------------------------------------------------

  const setField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    const next = {
      ...form,
      [key]: value,
    };

    setForm(next);
    setErrors(computeErrors(next));

    setTouched((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const showError = <K extends keyof FormState>(
    key: K,
  ): string | undefined =>
    touched[key] || attemptedSubmit
      ? errors[key]
      : undefined;

  const handleDegreeTrackChange = (value: string) => {
    const next = {
      ...form,
      degreeTrack: value,
      major: '',
    };

    setForm(next);
    setErrors(computeErrors(next));

    setTouched((prev) => ({
      ...prev,
      degreeTrack: true,
      major: true,
    }));
  };

  const toggleInArray = (
    key: 'preferredTimes' | 'daysToAvoid',
    value: string,
  ) => {
    const current = form[key];

    const nextArr = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setField(key, nextArr);
  };

  const handleFileChange =
    (key: 'studyPlanFile' | 'courseOfferingsFile') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      setField(key, e.target.files?.[0] ?? null);
    };

  const clearFile = (
    key: 'studyPlanFile' | 'courseOfferingsFile',
  ) => {
    setField(key, null);
  };

  // -------------------------------------------------------------------------
  // Courses
  // -------------------------------------------------------------------------

  const addCourse = () => {
    const code = courseDraft.trim().toUpperCase();

    if (!code) return;

    if (form.courses.includes(code)) {
      setCourseDraft('');
      return;
    }

    setField('courses', [...form.courses, code]);
    setCourseDraft('');
  };

  const removeCourse = (code: string) => {
    setField(
      'courses',
      form.courses.filter((c) => c !== code),
    );
  };

  const handleCourseKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCourse();
    }
  };

  // -------------------------------------------------------------------------
  // Other preferences
  // -------------------------------------------------------------------------

  const addPreference = () => {
    const text = preferenceDraft.trim();

    if (!text) return;

    if (form.otherPreferences.includes(text)) {
      setPreferenceDraft('');
      return;
    }

    setField('otherPreferences', [
      ...form.otherPreferences,
      text,
    ]);

    setPreferenceDraft('');
  };

  const removePreference = (text: string) => {
    setField(
      'otherPreferences',
      form.otherPreferences.filter(
        (p) => p !== text,
      ),
    );
  };

  const handlePreferenceKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPreference();
    }
  };

  // -------------------------------------------------------------------------
  // Initial submission
  // -------------------------------------------------------------------------

  const handleSubmit = async (
    e: SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setAttemptedSubmit(true);

    const validationErrors = computeErrors(form);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!SUBMIT_WEBHOOK_URL) {
      setErrorMessage(
        'Registration is not connected to a workflow yet. Set VITE_N8N_SUBMIT_WEBHOOK_URL in your .env file.',
      );
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      // Multipart because the two uploaded documents are real files.
      const payload = new FormData();

      payload.append('action', 'submit');
      payload.append(
        'fullName',
        form.fullName.trim(),
      );
      payload.append(
        'studentId',
        form.studentId.trim(),
      );
      payload.append(
        'mobile',
        form.mobile.trim(),
      );
      payload.append(
        'degreeTrack',
        form.degreeTrack,
      );
      payload.append(
        'major',
        form.major,
      );
      payload.append(
        'college',
        getCollege(form.major),
      );
      payload.append(
        'semester',
        form.semester,
      );
      payload.append(
        'year',
        form.year.trim(),
      );
      payload.append(
        'email',
        form.email.trim(),
      );
      payload.append(
        'advisorEmail',
        form.advisorEmail.trim(),
      );

      payload.append(
        'courses',
        JSON.stringify(form.courses),
      );

      payload.append(
        'preferredTimes',
        JSON.stringify(form.preferredTimes),
      );

      payload.append(
        'daysToAvoid',
        JSON.stringify(form.daysToAvoid),
      );

      payload.append(
        'otherPreferences',
        JSON.stringify(form.otherPreferences),
      );

      payload.append(
        'submittedAt',
        new Date().toISOString(),
      );

      if (form.studyPlanFile) {
        payload.append(
          'studyPlan',
          form.studyPlanFile,
          form.studyPlanFile.name,
        );
      }

      if (form.courseOfferingsFile) {
        payload.append(
          'courseOfferings',
          form.courseOfferingsFile,
          form.courseOfferingsFile.name,
        );
      }

      const response = await fetch(
        SUBMIT_WEBHOOK_URL,
        {
          method: 'POST',
          body: payload,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Webhook responded with status ${response.status}`,
        );
      }

      // Expected response:
      //
      // {
      //   "courses": [...],
      //   "totalCredits": 17
      // }

      const data = await response.json();

      setPlan(normalizePlan(data));
      setSelectedReason('');
      setOtherReason('');
      setPhase('review');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong sending your request. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Request changes / disapprove
  // -------------------------------------------------------------------------

  const handleRequestChanges = async () => {
    if (!REQUEST_CHANGES_WEBHOOK_URL || !plan) {
      setErrorMessage(
        'The request-changes workflow is not configured.',
      );
      return;
    }

    // eslint-disable-next-line no-useless-assignment
    let feedback = '';

    if (selectedReason === 'Other') {
      feedback = otherReason.trim();
    } else {
      feedback = selectedReason;
    }

    if (!feedback) {
      setErrorMessage(
        selectedReason === 'Other'
          ? 'Please describe what you would like changed.'
          : 'Please select a reason for requesting changes.',
      );
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      // The entire current plan is sent back.
      //
      // No planId.
      // No studentId.
      // No email.
      //
      // Contract:
      //
      // {
      //   "action": "request_changes",
      //   "plan": {
      //     "courses": [...],
      //     "totalCredits": 17
      //   },
      //   "feedback": "..."
      // }

      const response = await postJson(
        REQUEST_CHANGES_WEBHOOK_URL,
        {
          action: 'request_changes',
          plan,
          feedback,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Webhook responded with status ${response.status}`,
        );
      }

      // Expected response:
      //
      // {
      //   "courses": [...],
      //   "totalCredits": 17
      // }

      const data = await response.json();

      setPlan(normalizePlan(data));

      setSelectedReason('');
      setOtherReason('');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not send that feedback. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Approve
  // -------------------------------------------------------------------------

  const handleApprove = async () => {
    if (!APPROVE_WEBHOOK_URL || !plan) {
      setErrorMessage(
        'The approval workflow is not configured.',
      );
      return;
    }

    setBusy(true);
    setErrorMessage(null);

    try {
      // Contract:
      //
      // {
      //   "action": "approve",
      //   "plan": {
      //     "courses": [...],
      //     "totalCredits": 17
      //   }
      // }

      const response = await postJson(
        APPROVE_WEBHOOK_URL,
        {
          action: 'approve',
          plan,
        },
      );

      if (!response.ok) {
        throw new Error(
          `Webhook responded with status ${response.status}`,
        );
      }

      setPhase('approved');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Could not send this plan for approval. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  // -------------------------------------------------------------------------
  // Restart
  // -------------------------------------------------------------------------

  const restart = () => {
    setForm(initialState);
    setErrors({});
    setTouched({});
    setAttemptedSubmit(false);
    setCourseDraft('');
    setPreferenceDraft('');
    setSelectedReason('');
    setOtherReason('');
    setPlan(null);
    setErrorMessage(null);
    setPhase('form');
  };

  // -------------------------------------------------------------------------
  // Reusable plan table
  // -------------------------------------------------------------------------

  const renderPlanTable = () => {
    if (!plan) return null;

    return (
      <>
        <div className="cf-table-wrap">
          <table className="cf-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Days</th>
                <th>Time</th>
                <th>Instructor</th>
                <th>Room</th>
                <th>Cr.</th>
              </tr>
            </thead>

            <tbody>
              {plan.courses.length > 0 ? (
                plan.courses.map((course, index) => (
                  <tr
                    key={`${course.code}-${index}`}
                  >
                    <td>{course.code}</td>
                    <td>{course.title}</td>
                    <td>{course.days}</td>
                    <td>{course.time}</td>
                    <td>{course.instructor}</td>
                    <td>
                      {course.room || '—'}
                    </td>
                    <td>{course.credits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="cf-table-empty"
                  >
                    No courses were returned.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="cf-total-credits">
          Total credits: {plan.totalCredits}
        </p>
      </>
    );
  };

  // -------------------------------------------------------------------------
  // Approved / sent screen
  // -------------------------------------------------------------------------

  if (phase === 'approved') {
    return (
      <div className="cf">
        <div className="cf-hero">
          <div className="cf-hero-inner">
            <div className="cf-wordmark">
              <span className="cf-wordmark-mark">
                RHU
              </span>
              <span className="cf-wordmark-name">
                Course Flow
              </span>
            </div>

            <h1>Your schedule has been sent.</h1>

            <p>
              Your approved schedule has been sent to
              your advisor for review.
            </p>
          </div>
        </div>

        <div className="cf-main">
          <div className="cf-done">
            <div className="cf-sent-badge">
              ✓ Sent to advisor
            </div>

            <h2>
              Your plan is now with your advisor.
            </h2>

            <p>
              The schedule below is the plan you approved
              and sent. You will be emailed once your
              advisor responds.
            </p>

            <div className="cf-sent-plan">
              <div className="cf-section-head">
                <span className="cf-section-num">
                  01
                </span>

                <h2 className="cf-section-title">
                  Sent schedule
                </h2>
              </div>

              {renderPlanTable()}
            </div>

            <div className="cf-advisor-note">
              <strong>Advisor</strong>
              <span>{form.advisorEmail}</span>
            </div>

            <button
              type="button"
              className="cf-restart-btn"
              onClick={restart}
            >
              Submit another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Review screen
  // -------------------------------------------------------------------------

  if (phase === 'review' && plan) {
    const otherSelected =
      selectedReason === 'Other';

    const canRequestChanges =
      Boolean(
        selectedReason &&
          (!otherSelected ||
            otherReason.trim()),
      );

    return (
      <div className="cf">
        <div className="cf-hero">
          <div className="cf-hero-inner">
            <div className="cf-wordmark">
              <span className="cf-wordmark-mark">
                RHU
              </span>

              <span className="cf-wordmark-name">
                Course Flow
              </span>
            </div>

            <h1>
              Here's your proposed schedule.
            </h1>

            <p>
              Review the plan carefully. You can approve
              it or disapprove it and tell Course Flow what
              needs to change.
            </p>
          </div>
        </div>

        <div className="cf-main">
          {errorMessage && (
            <div className="cf-banner cf-banner--error">
              <strong>
                Something went wrong.
              </strong>

              {errorMessage}
            </div>
          )}

          <section className="cf-section">
            <div className="cf-section-head">
              <span className="cf-section-num">
                01
              </span>

              <h2 className="cf-section-title">
                Proposed courses
              </h2>
            </div>

            <p className="cf-section-hint">
              This is the schedule Course Flow generated
              from your study plan, course offerings, and
              preferences.
            </p>

            {renderPlanTable()}
          </section>

          <section className="cf-section">
            <div className="cf-section-head">
              <span className="cf-section-num">
                02
              </span>

              <h2 className="cf-section-title">
                What do you think?
              </h2>
            </div>

            <p className="cf-section-hint">
              If the plan looks good, approve it. If
              something needs to change, disapprove it and
              tell us why.
            </p>

            <div className="cf-decision-grid">
              <button
                type="button"
                className="cf-decision-btn cf-decision-btn--approve"
                onClick={handleApprove}
                disabled={busy}
              >
                <span className="cf-decision-icon">
                  ✓
                </span>

                <span>
                  <strong>Approve plan</strong>
                  <small>
                    Send this schedule to my advisor
                  </small>
                </span>
              </button>

              <div className="cf-disapprove-card">
                <div className="cf-disapprove-heading">
                  <span className="cf-decision-icon">
                    ×
                  </span>

                  <span>
                    <strong>
                      Disapprove & request changes
                    </strong>

                    <small>
                      Tell us what should be different
                    </small>
                  </span>
                </div>

                <div className="cf-reason-list">
                  {CHANGE_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`cf-reason-option ${
                        selectedReason === reason
                          ? 'cf-reason-option--selected'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="changeReason"
                        value={reason}
                        checked={
                          selectedReason === reason
                        }
                        onChange={(e) => {
                          setSelectedReason(
                            e.target.value,
                          );
                          setErrorMessage(null);

                          if (
                            e.target.value !==
                            'Other'
                          ) {
                            setOtherReason('');
                          }
                        }}
                      />

                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {otherSelected && (
                  <div className="cf-field cf-field--full cf-other-reason">
                    <label
                      className="cf-label"
                      htmlFor="otherReason"
                    >
                      Additional details
                    </label>

                    <textarea
                      id="otherReason"
                      className="cf-textarea"
                      value={otherReason}
                      onChange={(e) => {
                        setOtherReason(
                          e.target.value,
                        );
                        setErrorMessage(null);
                      }}
                      placeholder="Tell us what you would like changed..."
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="cf-add-btn cf-request-btn"
                  onClick={handleRequestChanges}
                  disabled={
                    busy || !canRequestChanges
                  }
                >
                  {busy
                    ? 'Sending…'
                    : 'Request changes'}
                </button>
              </div>
            </div>
          </section>

          <div className="cf-submit-row">
            <span className="cf-submit-note">
              Your advisor will only receive the plan
              after you approve it.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Form screen
  // -------------------------------------------------------------------------

  return (
    <div className="cf">
      <div className="cf-hero">
        <div className="cf-hero-inner">
          <div className="cf-wordmark">
            <span className="cf-wordmark-mark">
              RHU
            </span>

            <span className="cf-wordmark-name">
              Course Flow
            </span>
          </div>

          <h1>
            Build next semester's schedule with ease.
          </h1>

          <p>
            Tell us your plan and preferences once.
            Course Flow drafts a conflict-free schedule
            you can review and refine right here, then
            sends it to your advisor once you're happy
            with it.
          </p>
        </div>
      </div>

      <form
        className="cf-main"
        onSubmit={handleSubmit}
        noValidate
      >
        {errorMessage && (
          <div className="cf-banner cf-banner--error">
            <strong>
              We couldn't send that.
            </strong>

            {errorMessage}
          </div>
        )}

        {/* -----------------------------------------------------------------
            01 — Who you are
        ----------------------------------------------------------------- */}

        <section className="cf-section">
          <div className="cf-section-head">
            <span className="cf-section-num">
              01
            </span>

            <h2 className="cf-section-title">
              Who you are
            </h2>
          </div>

          <p className="cf-section-hint">
            Used for referencing
          </p>

          <div className="cf-grid">
            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="fullName"
              >
                Full name
              </label>

              <input
                id="fullName"
                className={`cf-input ${
                  showError('fullName')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.fullName}
                onChange={(e) =>
                  setField(
                    'fullName',
                    e.target.value,
                  )
                }
                placeholder="Manar Merhi"
              />

              {showError('fullName') && (
                <span className="cf-error-text">
                  {showError('fullName')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="studentId"
              >
                Student ID
              </label>

              <input
                id="studentId"
                className={`cf-input ${
                  showError('studentId')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.studentId}
                onChange={(e) =>
                  setField(
                    'studentId',
                    e.target.value,
                  )
                }
                placeholder="20220068"
                inputMode="numeric"
              />

              {showError('studentId') && (
                <span className="cf-error-text">
                  {showError('studentId')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="mobile"
              >
                Mobile
              </label>

              <input
                id="mobile"
                className={`cf-input ${
                  showError('mobile')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.mobile}
                onChange={(e) =>
                  setField(
                    'mobile',
                    e.target.value,
                  )
                }
                placeholder="71 850 368"
                inputMode="tel"
              />

              {showError('mobile') && (
                <span className="cf-error-text">
                  {showError('mobile')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="degreeTrack"
              >
                Degree track
              </label>

              <select
                id="degreeTrack"
                className={`cf-select ${
                  showError('degreeTrack')
                    ? 'cf-select--error'
                    : ''
                }`}
                value={form.degreeTrack}
                onChange={(e) =>
                  handleDegreeTrackChange(
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Select a track
                </option>

                {DEGREE_TRACKS.map((track) => (
                  <option
                    key={track}
                    value={track}
                  >
                    {track}
                  </option>
                ))}
              </select>

              {showError('degreeTrack') && (
                <span className="cf-error-text">
                  {showError('degreeTrack')}
                </span>
              )}
            </div>

            <div className="cf-field cf-field--full">
              <label
                className="cf-label"
                htmlFor="major"
              >
                Major
              </label>

              <select
                id="major"
                className={`cf-select ${
                  showError('major')
                    ? 'cf-select--error'
                    : ''
                }`}
                value={form.major}
                onChange={(e) =>
                  setField(
                    'major',
                    e.target.value,
                  )
                }
                disabled={!form.degreeTrack}
              >
                <option value="">
                  {form.degreeTrack
                    ? 'Select your major'
                    : 'Select a degree track first'}
                </option>

                {majorsForTrack(
                  form.degreeTrack,
                ).map((m) => (
                  <option
                    key={m.major}
                    value={m.major}
                  >
                    {m.major}
                  </option>
                ))}
              </select>

              {showError('major') && (
                <span className="cf-error-text">
                  {showError('major')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="semester"
              >
                Semester
              </label>

              <select
                id="semester"
                className={`cf-select ${
                  showError('semester')
                    ? 'cf-select--error'
                    : ''
                }`}
                value={form.semester}
                onChange={(e) =>
                  setField(
                    'semester',
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Select a semester
                </option>

                {SEMESTERS.map((semester) => (
                  <option
                    key={semester}
                    value={semester}
                  >
                    {semester}
                  </option>
                ))}
              </select>

              {showError('semester') && (
                <span className="cf-error-text">
                  {showError('semester')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="year"
              >
                Academic year
              </label>

              <input
                id="year"
                className={`cf-input ${
                  showError('year')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.year}
                onChange={(e) =>
                  setField(
                    'year',
                    e.target.value,
                  )
                }
                placeholder="2026-2027"
              />

              {showError('year') && (
                <span className="cf-error-text">
                  {showError('year')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------
            02 — Documents
        ----------------------------------------------------------------- */}

        <section className="cf-section">
          <div className="cf-section-head">
            <span className="cf-section-num">
              02
            </span>

            <h2 className="cf-section-title">
              Documents
            </h2>
          </div>

          <p className="cf-section-hint">
            Essential files that Course Flow needs to
            come up with the best plan for you
          </p>

          <div className="cf-field cf-field--full">
            <label
              className="cf-label"
              htmlFor="studyPlanFile"
            >
              Your study plan
            </label>

            <input
              key={
                form.studyPlanFile
                  ? 'study-plan-has-file'
                  : 'study-plan-empty'
              }
              id="studyPlanFile"
              type="file"
              className={`cf-input ${
                showError('studyPlanFile')
                  ? 'cf-input--error'
                  : ''
              }`}
              onChange={handleFileChange(
                'studyPlanFile',
              )}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />

            {showError('studyPlanFile') && (
              <span className="cf-error-text">
                {showError('studyPlanFile')}
              </span>
            )}

            {form.studyPlanFile ? (
              <div className="cf-chip-row">
                <span className="cf-chip">
                  {form.studyPlanFile.name}

                  <button
                    type="button"
                    className="cf-chip-remove"
                    aria-label="Remove study plan file"
                    onClick={() =>
                      clearFile(
                        'studyPlanFile',
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              </div>
            ) : (
              <p className="cf-empty-note">
                No file selected yet.
              </p>
            )}
          </div>

          <div className="cf-field cf-field--full">
            <label
              className="cf-label"
              htmlFor="courseOfferingsFile"
            >
              Next semester's course offerings
            </label>

            <input
              key={
                form.courseOfferingsFile
                  ? 'offerings-has-file'
                  : 'offerings-empty'
              }
              id="courseOfferingsFile"
              type="file"
              className={`cf-input ${
                showError('courseOfferingsFile')
                  ? 'cf-input--error'
                  : ''
              }`}
              onChange={handleFileChange(
                'courseOfferingsFile',
              )}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
            />

            {showError(
              'courseOfferingsFile',
            ) && (
              <span className="cf-error-text">
                {showError(
                  'courseOfferingsFile',
                )}
              </span>
            )}

            {form.courseOfferingsFile ? (
              <div className="cf-chip-row">
                <span className="cf-chip">
                  {form.courseOfferingsFile.name}

                  <button
                    type="button"
                    className="cf-chip-remove"
                    aria-label="Remove course offerings file"
                    onClick={() =>
                      clearFile(
                        'courseOfferingsFile',
                      )
                    }
                  >
                    ×
                  </button>
                </span>
              </div>
            ) : (
              <p className="cf-empty-note">
                No file selected yet.
              </p>
            )}
          </div>
        </section>

        {/* -----------------------------------------------------------------
            03 — Destination
        ----------------------------------------------------------------- */}

        <section className="cf-section">
          <div className="cf-section-head">
            <span className="cf-section-num">
              03
            </span>

            <h2 className="cf-section-title">
              Where the plan should go
            </h2>
          </div>

          <p className="cf-section-hint">
            Your draft schedule is reviewed by you here
            first; your advisor only sees it once you
            approve it.
          </p>

          <div className="cf-grid">
            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="email"
              >
                Your email
              </label>

              <input
                id="email"
                type="email"
                className={`cf-input ${
                  showError('email')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.email}
                onChange={(e) =>
                  setField(
                    'email',
                    e.target.value,
                  )
                }
                placeholder="you@students.rhu.edu.lb"
              />

              {showError('email') && (
                <span className="cf-error-text">
                  {showError('email')}
                </span>
              )}
            </div>

            <div className="cf-field">
              <label
                className="cf-label"
                htmlFor="advisorEmail"
              >
                Advisor's email
              </label>

              <input
                id="advisorEmail"
                type="email"
                className={`cf-input ${
                  showError('advisorEmail')
                    ? 'cf-input--error'
                    : ''
                }`}
                value={form.advisorEmail}
                onChange={(e) =>
                  setField(
                    'advisorEmail',
                    e.target.value,
                  )
                }
                placeholder="advisor@rhu.edu.lb"
              />

              {showError('advisorEmail') && (
                <span className="cf-error-text">
                  {showError('advisorEmail')}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------
            04 — Courses
        ----------------------------------------------------------------- */}

        <section className="cf-section">
          <div className="cf-section-head">
            <span className="cf-section-num">
              04
            </span>

            <h2 className="cf-section-title">
              Courses to consider
            </h2>
          </div>

          <p className="cf-section-hint">
            Optional — list any courses you absolutely
            want in your schedule.
          </p>

          <div className="cf-field cf-field--full">
            <label
              className="cf-label"
              htmlFor="courseDraft"
            >
              Course code
            </label>

            <div className="cf-course-input-row">
              <input
                id="courseDraft"
                className="cf-input"
                value={courseDraft}
                onChange={(e) =>
                  setCourseDraft(
                    e.target.value,
                  )
                }
                onKeyDown={
                  handleCourseKeyDown
                }
                placeholder="e.g. CCEE401"
              />

              <button
                type="button"
                className="cf-add-btn"
                onClick={addCourse}
              >
                Add
              </button>
            </div>

            {form.courses.length > 0 ? (
              <div className="cf-chip-row">
                {form.courses.map((code) => (
                  <span
                    className="cf-chip"
                    key={code}
                  >
                    {code}

                    <button
                      type="button"
                      className="cf-chip-remove"
                      aria-label={`Remove ${code}`}
                      onClick={() =>
                        removeCourse(code)
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="cf-empty-note">
                No courses added — that's fine.
              </p>
            )}
          </div>
        </section>

        {/* -----------------------------------------------------------------
            05 — Preferences
        ----------------------------------------------------------------- */}

        <section className="cf-section">
          <div className="cf-section-head">
            <span className="cf-section-num">
              05
            </span>

            <h2 className="cf-section-title">
              Schedule preferences
            </h2>
          </div>

          <p className="cf-section-hint">
            Optional, but it helps Course Flow choose
            between equally valid schedules.
          </p>

          <div className="cf-field cf-field--full">
            <span className="cf-label">
              Preferred time of day
            </span>

            <div className="cf-checkbox-row">
              {TIME_BLOCKS.map((block) => (
                <label
                  key={block}
                  className={`cf-checkbox ${
                    form.preferredTimes.includes(
                      block,
                    )
                      ? 'cf-checkbox--checked'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.preferredTimes.includes(
                      block,
                    )}
                    onChange={() =>
                      toggleInArray(
                        'preferredTimes',
                        block,
                      )
                    }
                  />

                  {block}
                </label>
              ))}
            </div>
          </div>

          <div className="cf-field cf-field--full">
            <span className="cf-label">
              Days to avoid{' '}
              <span className="cf-label-optional">
                (if possible)
              </span>
            </span>

            <div className="cf-checkbox-row">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className={`cf-checkbox ${
                    form.daysToAvoid.includes(
                      day,
                    )
                      ? 'cf-checkbox--checked'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.daysToAvoid.includes(
                      day,
                    )}
                    onChange={() =>
                      toggleInArray(
                        'daysToAvoid',
                        day,
                      )
                    }
                  />

                  {day}
                </label>
              ))}
            </div>
          </div>

          <div className="cf-field cf-field--full">
            <label
              className="cf-label"
              htmlFor="preferenceDraft"
            >
              Any other preferences{' '}
              <span className="cf-label-optional">
                (optional)
              </span>
            </label>

            <div className="cf-course-input-row">
              <input
                id="preferenceDraft"
                className="cf-input"
                value={preferenceDraft}
                onChange={(e) =>
                  setPreferenceDraft(
                    e.target.value,
                  )
                }
                onKeyDown={
                  handlePreferenceKeyDown
                }
                placeholder="e.g. I work part-time Tuesday and Thursday mornings"
              />

              <button
                type="button"
                className="cf-add-btn"
                onClick={addPreference}
              >
                Add
              </button>
            </div>

            {form.otherPreferences.length > 0 ? (
              <div className="cf-chip-row">
                {form.otherPreferences.map(
                  (preference) => (
                    <span
                      className="cf-chip"
                      key={preference}
                    >
                      {preference}

                      <button
                        type="button"
                        className="cf-chip-remove"
                        aria-label={`Remove preference: ${preference}`}
                        onClick={() =>
                          removePreference(
                            preference,
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="cf-empty-note">
                No other preferences added.
              </p>
            )}
          </div>
        </section>

        <div className="cf-submit-row">
          <button
            type="submit"
            className="cf-submit-btn"
            disabled={busy}
          >
            {busy
              ? 'Sending…'
              : 'Send for approval'}
          </button>

          <span className="cf-submit-note">
            You'll review the proposed schedule here
            before it goes to your advisor.
          </span>
        </div>
      </form>
    </div>
  );
}