"use strict";
const ESCAPE_SYMBOLS = {
    '\u00F6': '\"{o}',
    '\u00E4': '\"{ä}',
    '\u00FC': '\"{u}',
};
function check(bibtex) {
    const errors = [];
    bibtex.split("\n").forEach(function (line, line_index) {
        [...line].forEach((c, char_index) => {
            // weird chars
            const cc = c.charCodeAt(0);
            if (cc > 126) {
                errors.push({
                    line_index: line_index,
                    char_index: char_index,
                    text: "Weird symbol '" + c + "'",
                });
            }
        });
        // weird latex escape
        const re = /\{\\'\{\\.\}\}/g;
        let m;
        while (m = re.exec(line)) {
            errors.push({
                line_index: line_index,
                char_index: m.index,
                text: "Weird escape '" + m[0] + "'",
            });
        }
    });
    return errors;
}
// setup
function main() {
    const txt_bibtex = document.getElementById('bibinput');
    var myCodeMirror = CodeMirror.fromTextArea(txt_bibtex, {
        lineNumbers: true,
        mode: "javascript"
    });
    const btn_check = document.getElementById('check');
    const elem_output = document.getElementById('erroutput');
    btn_check.onclick = () => {
        elem_output.innerHTML = '';
        const errors = check(myCodeMirror.getValue());
        for (let e of errors) {
            const newDiv = document.createElement("code");
            newDiv.classList.add('error-entry');
            const newContent = document.createTextNode(`${e.line_index + 1}, ${e.char_index}: ${e.text}`);
            newDiv.appendChild(newContent);
            elem_output === null || elem_output === void 0 ? void 0 : elem_output.appendChild(newDiv);
            elem_output === null || elem_output === void 0 ? void 0 : elem_output.appendChild(document.createElement('br'));
        }
    };
}
window.onload = function () {
    main();
};
