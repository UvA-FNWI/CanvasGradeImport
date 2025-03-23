export interface Submission {
  id?: string;
  grade?: string;
  submitted_at?: string;
  posted_grade: string;
  excused?: boolean;
  assignment_id?: number;
}

export interface SubmissionGroup {
  user_id: number;
  section_id: number;
  submissions: Submission[];
}