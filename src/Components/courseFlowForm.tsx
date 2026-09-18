import { useState } from 'react';
import type { SubmitEvent, KeyboardEvent, ChangeEvent } from 'react';

// Base styles (tokens + shared primitives) must load before component CSS
// so component-level rules win ties in the cascade.
import '../CSS/courseFlowForm.css';

import Hero from './Hero.tsx';
import Footer from './Footer.tsx';
import CourseForm from './CourseForm.tsx';
import ReviewScreen from './ReviewScreen.tsx';
import ApprovedScreen from './ApprovedScreen.tsx';

import {
  SUBMIT_WEBHOOK_URL,
  REQUEST_CHANGES_WEBHOOK_URL,
  APPROVE_WEBHOOK_URL,
} from '../lib/config.ts';
import { getCollege } from '../lib/majors.ts';
import { initialState } from '../lib/formState.ts';
import { computeErrors } from '../lib/validation.ts';
import { normalizePlan, postJson } from '../lib/plan.ts';
import type {
  FieldErrors,
  FileKey,
  FormState,
  Phase,
  ProposedPlan,
  ToggleKey,
  Touched,
} from '../lib/types.ts';

export default function CourseFlowForm() {
  const [phase, setPhase] = useState<Phase>('form');
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>(initialState);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [touched, setTouched] = useState<Touched>({});

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const [courseDraft, setCourseDraft] = useState('');

  const [preferenceDraft, setPreferenceDraft] = useState('');

  const [plan, setPlan] = useState<ProposedPlan | null>(null);

  const [selectedReason, setSelectedReason] = useState('');

  const [otherReason, setOtherReason] = useState('');

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
    touched[key] || attemptedSubmit ? errors[key] : undefined;

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

  const toggleInArray = (key: ToggleKey, value: string) => {
    const current = form[key];

    const nextArr = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    setField(key, nextArr);
  };

  const handleFileChange =
    (key: FileKey) => (e: ChangeEvent<HTMLInputElement>) => {
      setField(key, e.target.files?.[0] ?? null);
    };

  const clearFile = (key: FileKey) => {
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

  const handleCourseKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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

    setField('otherPreferences', [...form.otherPreferences, text]);

    setPreferenceDraft('');
  };

  const removePreference = (text: string) => {
    setField(
      'otherPreferences',
      form.otherPreferences.filter((p) => p !== text),
    );
  };

  const handlePreferenceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPreference();
    }
  };

  // -------------------------------------------------------------------------
  // Review reason inputs (previously inline in the review JSX)
  // -------------------------------------------------------------------------

  const handleReasonChange = (value: string) => {
    setSelectedReason(value);
    setErrorMessage(null);

    if (value !== 'Other') {
      setOtherReason('');
    }
  };

  const handleOtherReasonChange = (value: string) => {
    setOtherReason(value);
    setErrorMessage(null);
  };

  // -------------------------------------------------------------------------
  // Initial submission
  // -------------------------------------------------------------------------

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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
      payload.append('fullName', form.fullName.trim());
      payload.append('studentId', form.studentId.trim());
      payload.append('mobile', form.mobile.trim());
      payload.append('degreeTrack', form.degreeTrack);
      payload.append('major', form.major);
      payload.append('college', getCollege(form.major));
      payload.append('semester', form.semester);
      payload.append('year', form.year.trim());
      payload.append('email', form.email.trim());
      payload.append('advisorEmail', form.advisorEmail.trim());

      payload.append('courses', JSON.stringify(form.courses));

      payload.append('preferredTimes', JSON.stringify(form.preferredTimes));

      payload.append('daysToAvoid', JSON.stringify(form.daysToAvoid));

      payload.append(
        'otherPreferences',
        JSON.stringify(form.otherPreferences),
      );

      payload.append('submittedAt', new Date().toISOString());

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

      const response = await fetch(SUBMIT_WEBHOOK_URL, {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
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
      setErrorMessage('The request-changes workflow is not configured.');
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

      const response = await postJson(REQUEST_CHANGES_WEBHOOK_URL, {
        action: 'request_changes',
        plan,
        feedback,
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
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
      setErrorMessage('The approval workflow is not configured.');
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

      const response = await postJson(APPROVE_WEBHOOK_URL, {
        action: 'approve',
        plan,
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
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
  // Approved / sent screen
  // -------------------------------------------------------------------------

  if (phase === 'approved') {
    return (
      <div className="cf">
        <ApprovedScreen
          plan={plan}
          advisorEmail={form.advisorEmail}
          onRestart={restart}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Review screen
  // -------------------------------------------------------------------------

  if (phase === 'review' && plan) {
    return (
      <div className="cf">
        <ReviewScreen
          plan={plan}
          busy={busy}
          errorMessage={errorMessage}
          selectedReason={selectedReason}
          otherReason={otherReason}
          onReasonChange={handleReasonChange}
          onOtherReasonChange={handleOtherReasonChange}
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
        />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Form screen: Hero -> Form -> Footer
  // -------------------------------------------------------------------------

  return (
    <div className="cf">
      <Hero
        title="Build next semester's schedule with ease."
        description="Tell us your plan and preferences once. Course Flow drafts a conflict-free schedule you can review and refine right here, then sends it to your advisor once you're happy with it."
      />

      <CourseForm
        form={form}
        busy={busy}
        errorMessage={errorMessage}
        showError={showError}
        setField={setField}
        onSubmit={handleSubmit}
        onDegreeTrackChange={handleDegreeTrackChange}
        onFileChange={handleFileChange}
        onClearFile={clearFile}
        courseDraft={courseDraft}
        onCourseDraftChange={setCourseDraft}
        onCourseKeyDown={handleCourseKeyDown}
        onAddCourse={addCourse}
        onRemoveCourse={removeCourse}
        onToggle={toggleInArray}
        preferenceDraft={preferenceDraft}
        onPreferenceDraftChange={setPreferenceDraft}
        onPreferenceKeyDown={handlePreferenceKeyDown}
        onAddPreference={addPreference}
        onRemovePreference={removePreference}
      />

      <Footer />
    </div>
  );
}
