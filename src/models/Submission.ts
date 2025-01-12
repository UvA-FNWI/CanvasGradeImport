export interface Submission {
  grade?: string;
  posted_grade: string;
  excuse?: boolean;
  assignment_id?: number;
}

export interface SubmissionGroup {
  user_id: number;
  section_id: number;
  submissions: Submission[];
}