import type { ChangeEvent, KeyboardEvent, SubmitEvent } from 'react';
import '../CSS/CourseForm.css';
import ErrorBanner from './ErrorBanner.tsx';
import WhoYouAreSection from './sections/WhoYouAreSection.tsx';
import DocumentsSection from './sections/DocumentsSection.tsx';
import DestinationSection from './sections/DestinationSection.tsx';
import CoursesSection from './sections/CoursesSection.tsx';
import PreferencesSection from './sections/PreferencesSection.tsx';
import type {
  FileKey,
  FormState,
  SetField,
  ShowError,
  ToggleKey,
} from '../lib/types.ts';

interface CourseFormProps {
  form: FormState;
  busy: boolean;
  errorMessage: string | null;
  showError: ShowError;
  setField: SetField;
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;

  // 01 — Who you are
  onDegreeTrackChange: (value: string) => void;

  // 02 — Documents
  onFileChange: (key: FileKey) => (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: (key: FileKey) => void;

  // 04 — Courses
  courseDraft: string;
  onCourseDraftChange: (value: string) => void;
  onCourseKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAddCourse: () => void;
  onRemoveCourse: (code: string) => void;

  // 05 — Preferences
  onToggle: (key: ToggleKey, value: string) => void;
  preferenceDraft: string;
  onPreferenceDraftChange: (value: string) => void;
  onPreferenceKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAddPreference: () => void;
  onRemovePreference: (text: string) => void;
}

export default function CourseForm({
  form,
  busy,
  errorMessage,
  showError,
  setField,
  onSubmit,
  onDegreeTrackChange,
  onFileChange,
  onClearFile,
  courseDraft,
  onCourseDraftChange,
  onCourseKeyDown,
  onAddCourse,
  onRemoveCourse,
  onToggle,
  preferenceDraft,
  onPreferenceDraftChange,
  onPreferenceKeyDown,
  onAddPreference,
  onRemovePreference,
}: CourseFormProps) {
  return (
    <form className="cf-main" onSubmit={onSubmit} noValidate>
      {errorMessage && (
        <ErrorBanner title="We couldn't send that." message={errorMessage} />
      )}

      <WhoYouAreSection
        form={form}
        showError={showError}
        setField={setField}
        onDegreeTrackChange={onDegreeTrackChange}
      />

      <DocumentsSection
        form={form}
        showError={showError}
        onFileChange={onFileChange}
        onClearFile={onClearFile}
      />

      <DestinationSection
        form={form}
        showError={showError}
        setField={setField}
      />

      <CoursesSection
        courses={form.courses}
        courseDraft={courseDraft}
        onCourseDraftChange={onCourseDraftChange}
        onCourseKeyDown={onCourseKeyDown}
        onAddCourse={onAddCourse}
        onRemoveCourse={onRemoveCourse}
      />

      <PreferencesSection
        form={form}
        onToggle={onToggle}
        preferenceDraft={preferenceDraft}
        onPreferenceDraftChange={onPreferenceDraftChange}
        onPreferenceKeyDown={onPreferenceKeyDown}
        onAddPreference={onAddPreference}
        onRemovePreference={onRemovePreference}
      />

      {/* Controls — intentionally kept inline, not a component */}
      <div className="cf-submit-row">
        <button type="submit" className="cf-submit-btn" disabled={busy}>
          {busy ? 'Sending…' : 'Send for approval'}
        </button>

        <span className="cf-submit-note">
          You'll review the proposed schedule here before it goes to your
          advisor.
        </span>
      </div>
    </form>
  );
}
