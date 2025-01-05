if (window.location.pathname.indexOf('/gradebook_upload/new') !== -1) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "http://localhost:8080/import.js";
    $("head").append(s);
}