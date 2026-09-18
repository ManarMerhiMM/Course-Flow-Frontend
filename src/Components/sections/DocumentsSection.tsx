import type { ChangeEvent } from 'react';
import '../../CSS/DocumentsSection.css';
import Section from '../Section.tsx';
import { ALLOWED_STUDY_PLAN_EXTENSIONS } from '../../lib/validation.ts';
import type { FileKey, FormState, ShowError } from '../../lib/types.ts';

interface DocumentsSectionProps {
  form: FormState;
  showError: ShowError;
  onFileChange: (key: FileKey) => (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: (key: FileKey) => void;
}

// Extensions plus MIME types, so the OS file picker filters to Excel files.
const STUDY_PLAN_ACCEPT = [
  ...ALLOWED_STUDY_PLAN_EXTENSIONS,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
].join(',');

export default function DocumentsSection({
  form,
  showError,
  onFileChange,
  onClearFile,
}: DocumentsSectionProps) {
  return (
    <Section
      num="02"
      title="Documents"
      hint="Upload your study plan as an Excel file (.xlsx or .xls)."
    >
      <div className="cf-field cf-field--full">
        <label className="cf-label" htmlFor="studyPlanFile">
          Your study plan (Excel)
        </label>

        <input
          key={form.studyPlanFile ? 'study-plan-has-file' : 'study-plan-empty'}
          id="studyPlanFile"
          type="file"
          className={`cf-input ${
            showError('studyPlanFile') ? 'cf-input--error' : ''
          }`}
          onChange={onFileChange('studyPlanFile')}
          accept={STUDY_PLAN_ACCEPT}
        />

        {showError('studyPlanFile') && (
          <span className="cf-error-text">{showError('studyPlanFile')}</span>
        )}

        {form.studyPlanFile ? (
          <div className="cf-chip-row">
            <span className="cf-chip">
              {form.studyPlanFile.name}

              <button
                type="button"
                className="cf-chip-remove"
                aria-label="Remove study plan file"
                onClick={() => onClearFile('studyPlanFile')}
              >
                ×
              </button>
            </span>
          </div>
        ) : (
          <p className="cf-empty-note">No file selected yet.</p>
        )}
      </div>
    </Section>
  );
}
