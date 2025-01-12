import {courseId, getAssignments, getSections, getStudents, getSubmissions} from "canvasApi";
import {utils, writeFile} from '../node_modules/xlsx/dist/xlsx.mini.min';

const button = document.querySelector("button[data-position-target='export_btn']");
button.addEventListener("click", () => setTimeout(() => {
  const target = $("span[data-position-content='export_btn'] ul");
  if (!target.length) return;

  const class1 = target.find("li > span").attr("class")
  const class2 = target.find("li > span > span > span").attr("class")

  target.prepend(`<li id="excelExport">
    <span class='${class1}'>
      <span>
        <span id="excelExportMenuItem" class='${class2}'>
          Export to Excel
        </span>
      </span>
    </span>
  <li>`);

  document.getElementById("excelExport").addEventListener("click", async () => {
    const item = document.getElementById("excelExportMenuItem");

    item.innerText = "Exporting to Excel...";
    item.style.fontStyle = "italic";
    (item.parentNode.parentNode as HTMLElement).style.pointerEvents = "none";

    const sections = await getSections();
    const students = await getStudents();
    const assignments = await getAssignments();
    const submissions = await getSubmissions();

    const studentMap = new Map(students.map(s => [s.id, s]));
    const sectionNames = new Map(sections.map(s => [s.id, s.name]));

    const rows = submissions.map(group => [
      studentMap.get(group.user_id)?.sis_user_id,
      studentMap.get(group.user_id)?.sortable_name,
      sectionNames.get(group.section_id),
      ...assignments.map(a => group.submissions.filter(s => s.assignment_id === a.id)[0]?.grade)
    ]);

    const header = ["Student ID", "Name", "Section", ...assignments.map(a => a.name)];

    const sheet = utils.aoa_to_sheet([header, ...rows]);
    const book = utils.book_new();
    utils.book_append_sheet(book, sheet, "Grade export");
    writeFile(book, `grade_export_${courseId}.xlsx`);

    item.innerText = "Export to Excel";
    item.style.fontStyle = "inherit";
    (item.parentNode.parentNode as HTMLElement).style.pointerEvents = "inherit";
  });
}, 100));