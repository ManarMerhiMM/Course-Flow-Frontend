import '../../CSS/WhoYouAreSection.css';
import Section from '../Section.tsx';
import { DEGREE_TRACKS, SEMESTERS } from '../../lib/constants.ts';
import { majorsForTrack } from '../../lib/majors.ts';
import type { FormState, SetField, ShowError } from '../../lib/types.ts';

interface WhoYouAreSectionProps {
  form: FormState;
  showError: ShowError;
  setField: SetField;
  onDegreeTrackChange: (value: string) => void;
}

export default function WhoYouAreSection({
  form,
  showError,
  setField,
  onDegreeTrackChange,
}: WhoYouAreSectionProps) {
  return (
    <Section num="01" title="Who you are" hint="Used for referencing">
      <div className="cf-grid">
        <div className="cf-field">
          <label className="cf-label" htmlFor="fullName">
            Full name
          </label>

          <input
            id="fullName"
            className={`cf-input ${
              showError('fullName') ? 'cf-input--error' : ''
            }`}
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            placeholder="Manar Merhi"
          />

          {showError('fullName') && (
            <span className="cf-error-text">{showError('fullName')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="studentId">
            Student ID
          </label>

          <input
            id="studentId"
            className={`cf-input ${
              showError('studentId') ? 'cf-input--error' : ''
            }`}
            value={form.studentId}
            onChange={(e) => setField('studentId', e.target.value)}
            placeholder="20220068"
            inputMode="numeric"
          />

          {showError('studentId') && (
            <span className="cf-error-text">{showError('studentId')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="mobile">
            Mobile
          </label>

          <input
            id="mobile"
            className={`cf-input ${
              showError('mobile') ? 'cf-input--error' : ''
            }`}
            value={form.mobile}
            onChange={(e) => setField('mobile', e.target.value)}
            placeholder="71 850 368"
            inputMode="tel"
          />

          {showError('mobile') && (
            <span className="cf-error-text">{showError('mobile')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="degreeTrack">
            Degree track
          </label>

          <select
            id="degreeTrack"
            className={`cf-select ${
              showError('degreeTrack') ? 'cf-select--error' : ''
            }`}
            value={form.degreeTrack}
            onChange={(e) => onDegreeTrackChange(e.target.value)}
          >
            <option value="">Select a track</option>

            {DEGREE_TRACKS.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>

          {showError('degreeTrack') && (
            <span className="cf-error-text">{showError('degreeTrack')}</span>
          )}
        </div>

        <div className="cf-field cf-field--full">
          <label className="cf-label" htmlFor="major">
            Major
          </label>

          <select
            id="major"
            className={`cf-select ${
              showError('major') ? 'cf-select--error' : ''
            }`}
            value={form.major}
            onChange={(e) => setField('major', e.target.value)}
            disabled={!form.degreeTrack}
          >
            <option value="">
              {form.degreeTrack
                ? 'Select your major'
                : 'Select a degree track first'}
            </option>

            {majorsForTrack(form.degreeTrack).map((m) => (
              <option key={m.major} value={m.major}>
                {m.major}
              </option>
            ))}
          </select>

          {showError('major') && (
            <span className="cf-error-text">{showError('major')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="semester">
            Semester
          </label>

          <select
            id="semester"
            className={`cf-select ${
              showError('semester') ? 'cf-select--error' : ''
            }`}
            value={form.semester}
            onChange={(e) => setField('semester', e.target.value)}
          >
            <option value="">Select a semester</option>

            {SEMESTERS.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

          {showError('semester') && (
            <span className="cf-error-text">{showError('semester')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="year">
            Academic year
          </label>

          <input
            id="year"
            className={`cf-input ${
              showError('year') ? 'cf-input--error' : ''
            }`}
            value={form.year}
            onChange={(e) => setField('year', e.target.value)}
            placeholder="2026-2027"
          />

          {showError('year') && (
            <span className="cf-error-text">{showError('year')}</span>
          )}
        </div>
      </div>
    </Section>
  );
}
