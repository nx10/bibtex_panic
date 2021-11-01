"use strict";
function indexesOf(str, c) {
    const indices = [];
    for (let i = 0; i < str.length; ++i) {
        if (str[i] === c)
            indices.push(i);
    }
    return indices;
}
const ESCAPE_SYMBOLS = {
    '\u00F6': '\"{o}',
    '\u00E4': '\"{ä}',
    '\u00FC': '\"{u}',
};
function findTextPos(lineBreaks, index) {
    let i = 0;
    for (; index >= lineBreaks[i]; ++i) { }
    return {
        line: i,
        char: index - (i > 0 ? lineBreaks[i - 1] + 1 : 0)
    };
}
function check(bibtex) {
    const bibtex_breaks = indexesOf(bibtex, "\n");
    const line_lengths = bibtex_breaks.slice();
    for (let i = 1; i < line_lengths.length; ++i) {
        line_lengths[i] -= bibtex_breaks[i - 1];
    }
    const errors = [];
    bibtex.split("\n").forEach(function (line, line_index) {
        [...line].forEach((c, char_index) => {
            // weird chars
            const cc = c.charCodeAt(0);
            if (cc > 126) {
                errors.push({
                    index: { line: line_index, char: char_index },
                    end_index: { line: line_index, char: char_index + 1 },
                    text: "Weird symbol '" + c + "'",
                });
            }
        });
        // weird latex escape
        const re = /\{\\'\{\\.\}\}/g;
        let m;
        while (m = re.exec(line)) {
            errors.push({
                index: { line: line_index, char: m.index },
                end_index: { line: line_index, char: m.index + 8 },
                text: "Weird escape '" + m[0] + "'",
            });
        }
    });
    const re = /@[a-zA-Z\s]+(\{\s*,)/gm;
    let m;
    while (m = re.exec(bibtex)) {
        const p = findTextPos(bibtex_breaks, m.index);
        errors.push({
            index: p,
            end_index: { line: p.line, char: line_lengths[p.line] },
            text: "Empty ID",
        });
    }
    return errors;
}
// setup
function jumpToLine(editor, i) {
    var t = editor.charCoords({ line: i, ch: 0 }, "local").top;
    var middleHeight = editor.getScrollerElement().offsetHeight / 2;
    editor.scrollTo(null, t - middleHeight - 5);
}
function main() {
    const txt_bibtex = document.getElementById('bibinput');
    const editor = CodeMirror.fromTextArea(txt_bibtex, {
        lineNumbers: true,
        mode: "stex"
    });
    const btn_check = document.getElementById('check');
    const btn_clear = document.getElementById('btn-clear');
    const elem_output = document.getElementById('erroutput');
    btn_check.onclick = () => {
        elem_output.innerHTML = '';
        const errors = check(editor.getValue());
        if (errors.length == 0) {
            const newDiv = document.createElement("a");
            const newContent = document.createTextNode("No errors found.");
            newDiv.appendChild(newContent);
            elem_output === null || elem_output === void 0 ? void 0 : elem_output.appendChild(newDiv);
            return;
        }
        for (let e of errors) {
            const newDiv = document.createElement("a");
            newDiv.classList.add('error-entry');
            const newContent = document.createTextNode(`${e.index.line + 1}, ${e.index.char}: ${e.text}`);
            newDiv.onclick = () => {
                jumpToLine(editor, e.index.line + 2);
            };
            newDiv.appendChild(newContent);
            elem_output === null || elem_output === void 0 ? void 0 : elem_output.appendChild(newDiv);
            elem_output === null || elem_output === void 0 ? void 0 : elem_output.appendChild(document.createElement('br'));
            editor.markText({ line: e.index.line, ch: e.index.char }, e.end_index ? { line: e.end_index.line, ch: e.end_index.char } : { line: e.index.line, ch: e.index.char + 1 }, { className: "styled-background" });
        }
    };
    btn_clear.onclick = () => {
        editor.setValue("");
    };
}
window.onload = function () {
    main();
};
