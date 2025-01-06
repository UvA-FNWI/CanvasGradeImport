import {Assignment} from "models/Assignment";
import {Submission} from "models/Submission";

const parts = window.location.pathname.split('/');
const start = parts.indexOf('courses') + 1;
const courseId = +parts[start];

const base = `/api/v1`;

const token = document.cookie.split(';').filter(c => c.indexOf('_csrf_token') != -1)[0].split('=')[1];
const headers = {
  "Content-Type": "application/json",
  "x-csrf-token": decodeURIComponent(token),
};

export const getAssignments = async () => {
  const res = await fetch(`${base}/courses/${courseId}/assignments`);
  const assignments = await res.json() as Assignment[];
  return assignments.filter(a => a.published);
}

export const putSubmission = async (assignmentId: number, sisUserId: string, submission: Submission) => {
  const res = await fetch(`${base}/courses/${courseId}/assignments/${assignmentId}/submissions/sis_user_id:${sisUserId}`, {
    method: "PUT",
    body: JSON.stringify({ submission }),
    headers
  });
  if (res.status >= 400)
    return { error: res };
  return { submission: await res.json() as Submission };
}