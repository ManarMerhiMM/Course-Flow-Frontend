import type { FieldErrors, FormState } from './types.ts';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const STUDENT_EMAIL_RE = /^[^\s@]+@students\.rhu\.edu\.lb$/i;

const ADVISOR_EMAIL_RE = /^[^\s@]+@rhu\.edu\.lb$/i;


// The study plan must be an Excel file (read in n8n with Extract from File).
export const ALLOWED_STUDY_PLAN_EXTENSIONS = ['.xlsx', '.xls'];

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ALLOWED_STUDY_PLAN_EXTENSIONS.some((ext) => name.endsWith(ext));
}

export function computeErrors(f: FormState): FieldErrors {
  const next: FieldErrors = {};

  if (!f.fullName.trim()) {
    next.fullName = 'Enter your full name.';
  }

  if (!f.studentId.trim()) {
    next.studentId = 'Enter your student ID.';
  } else if (!/^\d{5,10}$/.test(f.studentId.trim())) {
    next.studentId = 'Student ID should be 5–10 digits.';
  }

  if (!f.mobile.trim()) {
    next.mobile = 'Enter a mobile number.';
  } else if (!/^[0-9+\-\s]{7,15}$/.test(f.mobile.trim())) {
    next.mobile = 'Enter a valid phone number.';
  }

  if (!f.degreeTrack) {
    next.degreeTrack = 'Select your degree track.';
  }

  if (!f.major) {
    next.major = f.degreeTrack
      ? 'Select your major.'
      : 'Select a degree track first.';
  }

  if (!f.semester) {
    next.semester = 'Select the semester.';
  }

  if (!f.year.trim()) {
    next.year = 'Enter the academic year.';
  } else if (!/^\d{4}-\d{4}$/.test(f.year.trim())) {
    next.year = 'Use the format YYYY-YYYY.';
  }

  if (!f.studyPlanFile) {
    next.studyPlanFile = 'Upload your study plan.';
  } else if (!isExcelFile(f.studyPlanFile)) {
    next.studyPlanFile = 'Upload an Excel file (.xlsx or .xls).';
  }

  if (!f.email.trim()) {
    next.email = 'Enter your RHU student email.';
  } else if (!STUDENT_EMAIL_RE.test(f.email.trim())) {
    next.email = 'Must end in @students.rhu.edu.lb';
  }

  if (!f.advisorEmail.trim()) {
    next.advisorEmail = "Enter your advisor's email.";
  } else if (!ADVISOR_EMAIL_RE.test(f.advisorEmail.trim())) {
    next.advisorEmail = 'Must end in @rhu.edu.lb';
  }

  return next;
}