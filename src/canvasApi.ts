import {Assignment} from "models/Assignment";
import {Submission, SubmissionGroup} from "models/Submission";
import {Section} from "models/Section";
import {User} from "models/User";

const parts = window.location.pathname.split('/');
const start = parts.indexOf('courses') + 1;
export const courseId = +parts[start];

const base = `/api/v1`;

const token = document.cookie.split(';').filter(c => c.indexOf('_csrf_token') != -1)[0].split('=')[1];
const headers = {
  "Content-Type": "application/json",
  "x-csrf-token": decodeURIComponent(token),
};

async function getCollection<T>(url: string) {
  url += url.includes("?") ? '&per_page=100' : '?per_page=100';
  let results: T[] = [];

  while (url) {
    const res = await fetch(url);
    const link = res.headers.get("Link");
    url = link?.split(',').filter(p => p.includes('rel="next"'))[0]?.split(';')[0];
    if (url?.startsWith('<')) url = url.slice(1);
    if (url?.endsWith('>')) url = url.slice(0, url.length - 1);
    results.push(...await res.json() as T[]);
  }

  return results;
}

export const getAssignments = async () => {
  const assignments = await getCollection<Assignment>(`${base}/courses/${courseId}/assignments`);
  return assignments.filter(a => a.published);
}

export const createAssignment = async (name: string) => {
  const res = await fetch(`${base}/courses/${courseId}/assignments`, {
    method: "POST",
    body: JSON.stringify({ assignment: { name, published: true }}),
    headers
  });
  if (res.status >= 400)
    return { error: res };
  return { assignment: await res.json() as Assignment };
}

export const getSections = () =>
  getCollection<Section>(`${base}/courses/${courseId}/sections`);

export const getStudents = () =>
  getCollection<User>(`${base}/courses/${courseId}/users?enrollment_type[]=student`);

export const getSubmissions = () =>
  getCollection<SubmissionGroup>(`${base}/courses/${courseId}/students/submissions?grouped=true&student_ids[]=all&response_fields[]=assignment_id&exclude_response_fields[]=preview_url&response_fields[]=grade&response_fields[]=excused&response_fields[]=submitted_at`);

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