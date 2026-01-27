if (window.location.pathname.indexOf('/gradebook_upload/new') !== -1 || window.location.pathname.endsWith('/gradebook_uploads')) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://canvastools.datanose.nl/import.js";
    $("head").append(s);
}

if (window.location.pathname.endsWith('/gradebook')) {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://canvastools.datanose.nl/export.js";
    $("head").append(s);
}