// ---------------------------------------------------------------------------
// Majors
// ---------------------------------------------------------------------------

export interface MajorOption {
  major: string;
  college: string;
}

export const UNDERGRAD_MAJORS: MajorOption[] = [
  { major: 'Computer Science', college: 'College of Arts and Sciences' },
  { major: 'Graphic Design', college: 'College of Arts and Sciences' },
  { major: 'Accounting', college: 'College of Business Administration' },
  {
    major: 'Business Information Technology Management',
    college: 'College of Business Administration',
  },
  { major: 'Management', college: 'College of Business Administration' },
  {
    major: 'Human Resources Management',
    college: 'College of Business Administration',
  },
  {
    major: 'Marketing and Advertising',
    college: 'College of Business Administration',
  },
  {
    major: 'Finance and Banking',
    college: 'College of Business Administration',
  },
  {
    major: 'Civil and Environmental Engineering',
    college: 'College of Engineering',
  },
  { major: 'Biomedical Engineering', college: 'College of Engineering' },
  {
    major: 'Computer and Communications Engineering',
    college: 'College of Engineering',
  },
  { major: 'Electrical Engineering', college: 'College of Engineering' },
  { major: 'Mechanical Engineering', college: 'College of Engineering' },
  { major: 'Mechatronics Engineering', college: 'College of Engineering' },
];

export const GRAD_MAJORS: MajorOption[] = [
  {
    major: 'MBA - General Track',
    college: 'College of Business Administration',
  },
  {
    major: 'MBA - Oil and Gas Management',
    college: 'College of Business Administration',
  },
  {
    major: 'Civil and Environmental Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Biomedical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Computer and Communications Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Electrical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Mechanical Engineering (MS)',
    college: 'College of Engineering',
  },
  {
    major: 'Mechatronics Engineering (MS)',
    college: 'College of Engineering',
  },
];

export function majorsForTrack(track: string): MajorOption[] {
  if (track === 'Bachelor') return UNDERGRAD_MAJORS;
  if (track === 'Master') return GRAD_MAJORS;
  return [];
}

export function getCollege(major: string): string {
  return (
    [...UNDERGRAD_MAJORS, ...GRAD_MAJORS].find((m) => m.major === major)
      ?.college ?? ''
  );
}
