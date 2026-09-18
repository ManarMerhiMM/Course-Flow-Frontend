import type { ChangeEvent } from 'react';
import '../../CSS/DocumentsSection.css';
import Section from '../Section.tsx';
import type { FileKey, FormState, ShowError } from '../../lib/types.ts';

interface DocumentsSectionProps {
  form: FormState;
  showError: ShowError;
  onFileChange: (key: FileKey) => (e: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: (key: FileKey) => void;
}

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
      hint="Essential files that Course Flow needs to come up with the best plan for you"
    >
      <div className="cf-field cf-field--full">
        <label className="cf-label" htmlFor="studyPlanFile">
          Your study plan
        </label>

        <input
          key={form.studyPlanFile ? 'study-plan-has-file' : 'study-plan-empty'}
          id="studyPlanFile"
          type="file"
          className={`cf-input ${
            showError('studyPlanFile') ? 'cf-input--error' : ''
          }`}
          onChange={onFileChange('studyPlanFile')}
          accept=".pdf,.docx"
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

      <div className="cf-field cf-field--full">
        <label className="cf-label" htmlFor="courseOfferingsFile">
          Next semester's course offerings
        </label>

        <input
          key={
            form.courseOfferingsFile ? 'offerings-has-file' : 'offerings-empty'
          }
          id="courseOfferingsFile"
          type="file"
          className={`cf-input ${
            showError('courseOfferingsFile') ? 'cf-input--error' : ''
          }`}
          onChange={onFileChange('courseOfferingsFile')}
          accept=".pdf,.docx"
        />

        {showError('courseOfferingsFile') && (
          <span className="cf-error-text">
            {showError('courseOfferingsFile')}
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
                onClick={() => onClearFile('courseOfferingsFile')}
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