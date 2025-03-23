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
    else if (submission && submission.grade !== formatted && submission.grade + ".0" !== formatted) {
      errors.push(`Invalid grade for ${sub.studentId}: ${formatted} (imported as ${submission.grade})`);
    } else {
      success++;
    }
  }

  return { success, errors: errors.filter(onlyUnique) };
}

function formatGrade(grade: string) {
  let str = grade.toString().toLowerCase().replace(",", ".")
    .replace("avv", "complete").replace("nav", "incomplete")
    .replace("pass", "complete").replace("fail", "incomplete");
  if (str.includes('.')) {
    while (str.length && str[str.length - 1] == '0') {
      str = str.substring(0, str.length - 1);
    }
    if (str[str.length - 1] == '.') {
      str = str.substring(0, str.length - 1);
    }
  }
  return str;
}

function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}