
const ESCAPE_SYMBOLS = {
    '\u00F6': '\"{o}',
    '\u00E4': '\"{ä}',
    '\u00FC': '\"{u}',
}

interface TextPos {
    line: number,
    char: number,
}

interface BibError {
    index: TextPos,
    end_index?: TextPos,
    text: string,
}

function check(bibtex: string): BibError[] {

    const errors: BibError[] = [];

    bibtex.split("\n").forEach(function (line, line_index) {
        [...line].forEach((c, char_index) => {

            // weird chars
            const cc = c.charCodeAt(0);
            if (cc > 126) {
                errors.push({
                    index: { line: line_index, char: char_index },
                    end_index: { line: line_index, char: char_index+1 },
                    text: "Weird symbol '" + c + "'",
                })
            }
        });



        // weird latex escape
        const re = /\{\\'\{\\.\}\}/g;

        let m: RegExpExecArray | null;
        while (m = re.exec(line)) {
            errors.push({
                index: { line: line_index, char: m.index },
                end_index: { line: line_index, char: m.index+8 },
                text: "Weird escape '" + m[0] + "'",
            })

        }
    });

    return errors;

}

// setup

function jumpToLine(editor: CodeMirror.Editor, i: number): void { 
    var t = editor.charCoords({line: i, ch: 0}, "local").top; 
    var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
    editor.scrollTo(null, t - middleHeight - 5); 
} 

function main() {

    const txt_bibtex = document.getElementById('bibinput') as HTMLTextAreaElement;

    const editor = CodeMirror.fromTextArea(txt_bibtex, {
        lineNumbers: true,
        mode: "stex"
    });

    const btn_check = document.getElementById('check') as HTMLButtonElement;
    const btn_clear = document.getElementById('btn-clear') as HTMLButtonElement;
    const elem_output = document.getElementById('erroutput') as HTMLElement;

    btn_check.onclick = () => {
        elem_output.innerHTML = '';
        const errors = check(editor.getValue());

        if (errors.length == 0) {
            const newDiv = document.createElement("a");
            const newContent = document.createTextNode("No errors found.");
            newDiv.appendChild(newContent);
            elem_output?.appendChild(newDiv);
            return;
        }

        for (let e of errors) {
            const newDiv = document.createElement("a");
            newDiv.classList.add('error-entry')
            const newContent = document.createTextNode(`${e.index.line + 1}, ${e.index.char}: ${e.text}`);
            newDiv.onclick = () => {
                jumpToLine(editor, e.index.line+2);
            }
            newDiv.appendChild(newContent);
            elem_output?.appendChild(newDiv);
            elem_output?.appendChild(document.createElement('br'));
            
            editor.markText(
                {line: e.index.line, ch: e.index.char}, 
                e.end_index ? {line: e.end_index.line, ch: e.end_index.char} : {line: e.index.line, ch: e.index.char+1}, 
                {className: "styled-background"});
        }
    }

    btn_clear.onclick = () => {
        editor.setValue("");
    }
}

window.onload = function () {
    main();
};