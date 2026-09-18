export const DEGREE_TRACKS = ['Bachelor', 'Master'] as const;
export const SEMESTERS = ['Fall', 'Spring', 'Summer'] as const;
export const TIME_BLOCKS = ['Morning', 'Afternoon'] as const;
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

// ---------------------------------------------------------------------------
// Review reasons
// ---------------------------------------------------------------------------
//
// These are sent as the "feedback" field to n8n.
//
// If "Other" is selected, only the student's additional details are sent.

export const CHANGE_REASONS = [
  'I need different courses.',
  'There is a time conflict.',
  'The schedule does not match my preferred times.',
  'The schedule does not match my days-to-avoid preferences.',
  'I need a different number of credits.',
  'Other',
] as const;
