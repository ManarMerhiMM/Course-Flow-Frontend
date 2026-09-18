import type { KeyboardEvent } from 'react';
import '../../CSS/CoursesSection.css';
import Section from '../Section.tsx';

interface CoursesSectionProps {
  courses: string[];
  courseDraft: string;
  onCourseDraftChange: (value: string) => void;
  onCourseKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onAddCourse: () => void;
  onRemoveCourse: (code: string) => void;
}

export default function CoursesSection({
  courses,
  courseDraft,
  onCourseDraftChange,
  onCourseKeyDown,
  onAddCourse,
  onRemoveCourse,
}: CoursesSectionProps) {
  return (
    <Section
      num="04"
      title="Courses to consider"
      hint="Optional — list any courses you absolutely want in your schedule."
    >
      <div className="cf-field cf-field--full">
        <label className="cf-label" htmlFor="courseDraft">
          Course code
        </label>

        <div className="cf-course-input-row">
          <input
            id="courseDraft"
            className="cf-input"
            value={courseDraft}
            onChange={(e) => onCourseDraftChange(e.target.value)}
            onKeyDown={onCourseKeyDown}
            placeholder="e.g. CCEE401"
          />

          <button type="button" className="cf-add-btn" onClick={onAddCourse}>
            Add
          </button>
        </div>

        {courses.length > 0 ? (
          <div className="cf-chip-row">
            {courses.map((code) => (
              <span className="cf-chip" key={code}>
                {code}

                <button
                  type="button"
                  className="cf-chip-remove"
                  aria-label={`Remove ${code}`}
                  onClick={() => onRemoveCourse(code)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="cf-empty-note">No courses added — that's fine.</p>
        )}
      </div>
    </Section>
  );
}
