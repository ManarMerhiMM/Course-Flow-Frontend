import '../CSS/PlanTable.css';
import type { ProposedPlan } from '../lib/types.ts';

interface PlanTableProps {
  plan: ProposedPlan | null;
}

export default function PlanTable({ plan }: PlanTableProps) {
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
                <tr key={`${course.code}-${index}`}>
                  <td>{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.days}</td>
                  <td>{course.time}</td>
                  <td>{course.instructor}</td>
                  <td>{course.room || '—'}</td>
                  <td>{course.credits}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="cf-table-empty">
                  No courses were returned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="cf-total-credits">Total credits: {plan.totalCredits}</p>
    </>
  );
}
