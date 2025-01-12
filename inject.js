if (window.location.pathname.indexOf('/gradebook_upload/new') !== -1) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "http://localhost:8081/import.js";
    $("head").append(s);
}

if (window.location.pathname.endsWith('/gradebook')) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "http://localhost:8081/export.js";
    $("head").append(s);
}