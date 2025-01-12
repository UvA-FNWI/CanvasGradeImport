import {parseFile} from "parseFile";
import {getAssignments} from "canvasApi";
import {Assignment} from "models/Assignment";
import {importGrades} from "importGrades";

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
    <div class="control-group" style="display: ${sheetNames.length === 1 ? 'none' : 'block'}">
      <label class="control-label" for="sheetSelector">Sheet: </label>
      <div class="controls">
        <select id="sheetSelector">
          ${sheetNames.map((n,i) => `<option ${i === 0 ? "selected" : ""} value="${n}">${n}</option>`).join("")}
        </select>
      </div>
    </div>
    <table>
      <thead style="text-align: left"><tr>
        <th>Column</th>
        <th>Target assignment</th>
      </tr></thead>
      <tbody id="columnMapping" />
    </table>
    <div style="margin-top: 20px; margin-bottom: 20px;">
      <button class="btn btn-primary" id="startImport">Import data</button>
    </div>
    <div id="progress" style="font-style: italic"></div>
    <ul id="errorList"></ul>
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

  resetProgress();
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
  const { progress, errorList } = resetProgress();
  const studentIndex = choices.filter(c => c.targetId === -1)[0].index;
  button.disabled = true;

  const submissions = choices
    .filter(c => c.targetId > 0)
    .flatMap(c => rows.filter(r => !!r[c.index]).map(r => ({
      grade: r[c.index],
      assignmentId: c.targetId,
      studentId: r[studentIndex]
    })));

  const { success, errors } = await importGrades(submissions,
      p => `Importing grade ${p} out of ${submissions.length}`);

  button.disabled = false;
  if (errors.length === 0) {
    progress.innerText = `${success} grades imported successfully`;
  } else {
    progress.innerText = `${success} grades imported, ${errors.length} errors:`;
  }
  errorList.innerHTML = errors.map(e => `<li>${e}</li>`).join("");
}

function resetProgress() {
  const progress = document.getElementById("progress");
  const errorList = document.getElementById("errorList");
  progress.innerText = "";
  errorList.innerHTML = "";
  return { progress, errorList };
}