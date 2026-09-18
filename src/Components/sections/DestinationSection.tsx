import '../../CSS/DestinationSection.css';
import Section from '../Section.tsx';
import type { FormState, SetField, ShowError } from '../../lib/types.ts';

interface DestinationSectionProps {
  form: FormState;
  showError: ShowError;
  setField: SetField;
}

export default function DestinationSection({
  form,
  showError,
  setField,
}: DestinationSectionProps) {
  return (
    <Section
      num="03"
      title="Where the plan should go"
      hint="Your draft schedule is reviewed by you here first; your advisor only sees it once you approve it."
    >
      <div className="cf-grid">
        <div className="cf-field">
          <label className="cf-label" htmlFor="email">
            Your email
          </label>

          <input
            id="email"
            type="email"
            className={`cf-input ${
              showError('email') ? 'cf-input--error' : ''
            }`}
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="you@students.rhu.edu.lb"
          />

          {showError('email') && (
            <span className="cf-error-text">{showError('email')}</span>
          )}
        </div>

        <div className="cf-field">
          <label className="cf-label" htmlFor="advisorEmail">
            Advisor's email
          </label>

          <input
            id="advisorEmail"
            type="email"
            className={`cf-input ${
              showError('advisorEmail') ? 'cf-input--error' : ''
            }`}
            value={form.advisorEmail}
            onChange={(e) => setField('advisorEmail', e.target.value)}
            placeholder="advisor@rhu.edu.lb"
          />

          {showError('advisorEmail') && (
            <span className="cf-error-text">{showError('advisorEmail')}</span>
          )}
        </div>
      </div>
    </Section>
  );
}
