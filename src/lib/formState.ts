import type { FormState } from './types.ts';

export const initialState: FormState = {
  fullName: '',
  studentId: '',
  mobile: '',
  degreeTrack: '',
  major: '',
  semester: '',
  year: '',
  studyPlanFile: null,
  courseOfferingsFile: null,
  email: '',
  advisorEmail: '',
  courses: [],
  preferredTimes: [],
  daysToAvoid: [],
  otherPreferences: [],
};
