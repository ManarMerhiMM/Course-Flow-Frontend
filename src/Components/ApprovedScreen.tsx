import '../CSS/ApprovedScreen.css';
import Hero from './Hero.tsx';
import Footer from './Footer.tsx';
import SectionHeader from './SectionHeader.tsx';
import PlanTable from './PlanTable.tsx';
import type { ProposedPlan } from '../lib/types.ts';

interface ApprovedScreenProps {
  plan: ProposedPlan | null;
  advisorEmail: string;
  onRestart: () => void;
}

export default function ApprovedScreen({
  plan,
  advisorEmail,
  onRestart,
}: ApprovedScreenProps) {
  return (
    <>
      <Hero
        title="Your schedule has been sent."
        description="Your approved schedule has been sent to your advisor for review."
      />

      <div className="cf-main">
        <div className="cf-done">
          <div className="cf-sent-badge">✓ Sent to advisor</div>

          <h2>Your plan is now with your advisor.</h2>

          <p className="cf-close-note">
            You will be notified by email when the advisor responds, you can
            close this.
          </p>

          <p>The schedule below is the plan you approved and sent.</p>

          <div className="cf-sent-plan">
            <SectionHeader num="01" title="Sent schedule" />
            <PlanTable plan={plan} />
          </div>

          <div className="cf-advisor-note">
            <strong>Advisor</strong>
            <span>{advisorEmail}</span>
          </div>

          <button type="button" className="cf-restart-btn" onClick={onRestart}>
            Submit another request
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
