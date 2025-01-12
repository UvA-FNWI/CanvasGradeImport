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

  document.getElementById("excelExport").addEventListener("click", () => {
    const item = document.getElementById("excelExportMenuItem");

    item.innerText = "Exporting to Excel...";
    item.style.fontStyle = "italic";
    (item.parentNode.parentNode as HTMLElement).style.pointerEvents = "none";
  });
}, 100));