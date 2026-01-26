# Canvas grade import/export
A JavaScript-based improvement for de built-in grade import/export functionality in Canvas.
It is deployed via a Canvas theme with custom JavaScript that injects the module the correct pages within Canvas, see `inject-prod.js`.

## Local development
To develop the module locally, start the development server:
```shell
npm i
npm run start
```
Two output files are generated: `import.js` for the grade import page and `export.js` for the gradebook page.

To test the result in Canvas, run the appropriate injection script in the browser console, e.g.
```js
const s = document.createElement("script");
s.type = "text/javascript";
s.src = "http://localhost:8080/import.js";
$("head").append(s);
```