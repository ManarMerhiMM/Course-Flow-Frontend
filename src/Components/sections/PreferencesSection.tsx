import type { KeyboardEvent } from 'react';
import '../../CSS/PreferencesSection.css';
import Section from '../Section.tsx';
import { DAYS, TIME_BLOCKS } from '../../lib/constants.ts';
import type { FormState, ToggleKey } from '../../lib/types.ts';

interface PreferencesSectionProps {
  form: FormState;
  onToggle: (key: ToggleKey, value: string) => void;
  preferenceDraft: string;
  onPreferenceDraftChange: (value: string) => void;
  onPreferenceKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAddPreference: () => void;
  onRemovePreference: (text: string) => void;
}

export default function PreferencesSection({
  form,
  onToggle,
  preferenceDraft,
  onPreferenceDraftChange,
  onPreferenceKeyDown,
  onAddPreference,
  onRemovePreference,
}: PreferencesSectionProps) {
  return (
    <Section
      num="05"
      title="Schedule preferences"
      hint="Optional, but it helps Course Flow choose between equally valid schedules."
    >
      <div className="cf-field cf-field--full">
        <span className="cf-label">Preferred time of day</span>

        <div className="cf-checkbox-row">
          {TIME_BLOCKS.map((block) => (
            <label
              key={block}
              className={`cf-checkbox ${
                form.preferredTimes.includes(block) ? 'cf-checkbox--checked' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={form.preferredTimes.includes(block)}
                onChange={() => onToggle('preferredTimes', block)}
              />

              {block}
            </label>
          ))}
        </div>
      </div>

      <div className="cf-field cf-field--full">
        <span className="cf-label">
          Days to avoid{' '}
          <span className="cf-label-optional">(if possible)</span>
        </span>

        <div className="cf-checkbox-row">
          {DAYS.map((day) => (
            <label
              key={day}
              className={`cf-checkbox ${
                form.daysToAvoid.includes(day) ? 'cf-checkbox--checked' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={form.daysToAvoid.includes(day)}
                onChange={() => onToggle('daysToAvoid', day)}
              />

              {day}
            </label>
          ))}
        </div>
      </div>

      <div className="cf-field cf-field--full">
        <label className="cf-label" htmlFor="preferenceDraft">
          Any other preferences{' '}
          <span className="cf-label-optional">(optional)</span>
        </label>

        <div className="cf-course-input-row">
          <input
            id="preferenceDraft"
            className="cf-input"
            value={preferenceDraft}
            onChange={(e) => onPreferenceDraftChange(e.target.value)}
            onKeyDown={onPreferenceKeyDown}
            placeholder="e.g. I work part-time Tuesday and Thursday mornings"
          />

          <button
            type="button"
            className="cf-add-btn"
            onClick={onAddPreference}
          >
            Add
          </button>
        </div>

        {form.otherPreferences.length > 0 ? (
          <div className="cf-chip-row">
            {form.otherPreferences.map((preference) => (
              <span className="cf-chip" key={preference}>
                {preference}

                <button
                  type="button"
                  className="cf-chip-remove"
                  aria-label={`Remove preference: ${preference}`}
                  onClick={() => onRemovePreference(preference)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="cf-empty-note">No other preferences added.</p>
        )}
      </div>
    </Section>
  );
}
