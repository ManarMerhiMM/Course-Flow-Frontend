import '../CSS/ReviewScreen.css';
import Hero from './Hero.tsx';
import Footer from './Footer.tsx';
import Section from './Section.tsx';
import ErrorBanner from './ErrorBanner.tsx';
import PlanTable from './PlanTable.tsx';
import { CHANGE_REASONS } from '../lib/constants.ts';
import type { ProposedPlan } from '../lib/types.ts';

interface ReviewScreenProps {
  plan: ProposedPlan;
  busy: boolean;
  errorMessage: string | null;
  selectedReason: string;
  otherReason: string;
  onReasonChange: (value: string) => void;
  onOtherReasonChange: (value: string) => void;
  onApprove: () => void;
  onRequestChanges: () => void;
}

export default function ReviewScreen({
  plan,
  busy,
  errorMessage,
  selectedReason,
  otherReason,
  onReasonChange,
  onOtherReasonChange,
  onApprove,
  onRequestChanges,
}: ReviewScreenProps) {
  const otherSelected = selectedReason === 'Other';

  const canRequestChanges = Boolean(
    selectedReason && (!otherSelected || otherReason.trim()),
  );

  return (
    <>
      <Hero
        title="Here's your proposed schedule."
        description="Review the plan carefully. You can approve it or disapprove it and tell Course Flow what needs to change."
      />

      <div className="cf-main">
        {errorMessage && (
          <ErrorBanner title="Something went wrong." message={errorMessage} />
        )}

        <Section
          num="01"
          title="Proposed courses"
          hint="This is the schedule Course Flow generated from your study plan, course offerings, and preferences."
        >
          <PlanTable plan={plan} />
        </Section>

        <Section
          num="02"
          title="What do you think?"
          hint="If the plan looks good, approve it. If something needs to change, disapprove it and tell us why."
        >
          <div className="cf-decision-grid">
            <button
              type="button"
              className="cf-decision-btn cf-decision-btn--approve"
              onClick={onApprove}
              disabled={busy}
            >
              <span className="cf-decision-icon">✓</span>

              <span>
                <strong>Approve plan</strong>
                <small>Send this schedule to my advisor</small>
              </span>
            </button>

            <div className="cf-disapprove-card">
              <div className="cf-disapprove-heading">
                <span className="cf-decision-icon">×</span>

                <span>
                  <strong>Disapprove & request changes</strong>
                  <small>Tell us what should be different</small>
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
                      checked={selectedReason === reason}
                      onChange={(e) => onReasonChange(e.target.value)}
                    />

                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {otherSelected && (
                <div className="cf-field cf-field--full cf-other-reason">
                  <label className="cf-label" htmlFor="otherReason">
                    Additional details
                  </label>

                  <textarea
                    id="otherReason"
                    className="cf-textarea"
                    value={otherReason}
                    onChange={(e) => onOtherReasonChange(e.target.value)}
                    placeholder="Tell us what you would like changed..."
                  />
                </div>
              )}

              <button
                type="button"
                className="cf-add-btn cf-request-btn"
                onClick={onRequestChanges}
                disabled={busy || !canRequestChanges}
              >
                {busy ? 'Sending…' : 'Request changes'}
              </button>
            </div>
          </div>
        </Section>

        <div className="cf-submit-row">
          <span className="cf-submit-note">
            Your advisor will only receive the plan after you approve it.
          </span>
        </div>
      </div>

      <Footer />
    </>
  );
}
