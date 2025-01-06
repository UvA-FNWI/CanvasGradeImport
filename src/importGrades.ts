import {putSubmission} from "canvasApi";

interface Grade {
  grade: string
  assignmentId: number
  studentId: string
}

export const importGrades = async (grades: Grade[], progress: (p: number) => void) => {
  const errors: string[] = [];
  let success = 0;

  for (let i = 0; i < grades.length; i++) {
    progress(i+1);
    const sub = grades[i];
    const formatted = formatGrade(sub.grade);
    const { error, submission } = await putSubmission(
      sub.assignmentId,
      sub.studentId.toString().padStart(7, "0"),
      {posted_grade: formatted}
    );
    if (error?.status === 404) {
      errors.push(`Student ${sub.studentId} not found`);
    }
    else if (submission && submission.grade !== formatted) {
      errors.push(`Invalid grade for ${sub.studentId}: ${formatted}`);
    } else {
      success++;
    }
  }

  return { success, errors: errors.filter(onlyUnique) };
}

function formatGrade(grade: string) {
  return grade.toString().toLowerCase().replace(",", ".")
    .replace("avv", "complete").replace("nav", "incomplete")
    .replace("pass", "complete").replace("fail", "incomplete");
}

function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}