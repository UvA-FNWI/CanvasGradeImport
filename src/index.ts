import {parseFile} from "parseFile";
import {getAssignments, putSubmission} from "canvasApi";
import {Assignment} from "models/Assignment";

$('p').remove();
$('.ic-Form-actions').remove();
$('label.ic-Label').text("Choose an Excel or comma-separated file to upload:")

let assignments: Assignment[] = [];
getAssignments().then(res => assignments = res);

const fileEl = document.querySelector("#gradebook_upload_uploaded_data") as HTMLInputElement;
fileEl.addEventListener("change", () => {
  if (fileEl.files.length === 1) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = new Uint8Array(<ArrayBuffer>e.target.result);
      renderImportSteps(data);
    }
    reader.readAsArrayBuffer(fileEl.files[0]);
  }
})

function renderImportSteps(data: Uint8Array) {
  const { sheetNames, readSheet } = parseFile(data);

  $('#new_gradebook_upload').parent().append(`
    <div style="display: ${sheetNames.length === 1 ? 'none' : 'block'}">
      Sheet: <select id="sheetSelector">
        ${sheetNames.map((n,i) => `<option selected="${i === 0}" value="${n}">${n}</option>`).join("")}
      </select>
    </div>
    <table>
      <thead style="text-align: left"><tr>
        <th>Column</th>
        <th>Target</th>
      </tr></thead>
      <tbody id="columnMapping" />
    </table>
    <div>
      <button class="btn btn-primary" id="startImport">Import data</button>
    </div>
    <div id="progress" style="font-style: italic"></div>
  `);

  const selector = document.getElementById("sheetSelector") as HTMLSelectElement;

  const readAndUpdate = () => {
    const {columns} = readSheet(selector.value);
    updateColumnMapping(columns);
  };

  selector.addEventListener("change", readAndUpdate);
  readAndUpdate();

  document.getElementById("startImport").addEventListener("click", () => startImport(readSheet(selector.value)));
}

function updateColumnMapping(columns: string[]) {
  const el = document.getElementById("columnMapping");
  const cols = columns.map((c, index) => ({ index, value: c.toLowerCase() }));
  let studentId = cols.filter(c => c.value.includes("student id")
    || c.value.includes("student number") || c.value.includes("studentnummer"))[0]?.index;
  if (!studentId)
    studentId = cols.filter(c => c.value.includes("student"))[0]?.index;

  el.innerHTML = columns.map((c,i) => `<tr>
    <td>${c}</td>
    <td>
      <select id="mapping_${i}">
        <option value="0"></option>
        <option value="-1" ${studentId === i ? "selected" : ""}>[student id]</option>
        ${assignments.map(a => `<option value="${a.id}" ${a.name.toLowerCase() === c ? "selected" : ""}>${a.name}</option>`)}
      </select>
    </td>
  </tr>`).join("");
}

async function startImport({ columns, rows }: { columns: string[], rows: string[][] }) {
  const choices = columns.map((_, i) => ({
    index: i,
    targetId: +(document.getElementById(`mapping_${i}`) as HTMLSelectElement).value,
  }));
  if (choices.filter(c => c.targetId === -1).length !== 1) {
    alert("Choose exactly one student ID column");
    return;
  }
  const button = document.getElementById("startImport") as HTMLButtonElement;
  const progress = document.getElementById("progress");
  const studentIndex = choices.filter(c => c.targetId === -1)[0].index;
  button.disabled = true;

  const submissions = choices
    .filter(c => c.targetId > 0)
    .flatMap(c => rows.filter(r => !!r[c.index]).map(r => ({
      grade: formatGrade(r[c.index]),
      assignmentId: c.targetId,
      studentId: r[studentIndex].toString().padStart(7, "0")
    })));

  let errors = 0;

  for (let i = 0; i < submissions.length; i++) {
    progress.innerText = `Importing grade ${i + 1} out of ${submissions.length}`;
    const sub = submissions[i];
    try {
      await putSubmission(sub.assignmentId, sub.studentId, {posted_grade: sub.grade});
    } catch {
      errors++;
    }
  }

  button.disabled = false;
  if (errors === 0) {
    progress.innerText = `${submissions.length} grades imported successfully`;
  } else {
    progress.innerText = `${submissions.length} grades imported, ${errors} errors`;
  }
}

function formatGrade(grade: string) {
  return grade.toString().toLowerCase().replace(",", ".")
    .replace("avv", "complete").replace("nav", "incomplete")
    .replace("pass", "complete").replace("fail", "incomplete");
}