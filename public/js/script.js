const defaultProgram =
`#include<stdio.h>
    
int main() {
    printf("Hello World!");

    return 0;
}`;

const handleCodeChange = editor => {
  const codeInBase64 = btoa(editor.getValue());
  location.hash = codeInBase64;
  fetch("/", {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "post",
    body: `{ "code": "${codeInBase64}" }`
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
      if (result.exitCode == 0) {
        statusDiv.classList.replace("red", "green");
        outputEditor.setValue("No errors :)");
      } else {
        statusDiv.classList.replace("green", "red");
        outputEditor.setValue(result.errors.map(elem => elem.split("\n").map(line => line.replace(/^<stdin>:\s*/, '')).join("\n")).join("\n"));
      }
    });
};

const mainCodeEditorOptions = {
  indentUnit: 4,
  indentWithTabs: true,
  theme: "monokai",
  lineNumbers: true,
  mode: "text/x-csrc",
  matchBrackets: true,
  lineWrapping: true,
  autoCloseBrackets: true,
  scrollbarStyle: "simple"
};

const outputEditorOptions = {
  value: "Output shows up here",
  theme: "monokai",
  readOnly: "nocursor",
  lineWrapping: true,
  scrollbarStyle: "simple"
}
const ccode = document.getElementById("ccode");
const statusDiv = document.getElementById("status");
const outputDiv = document.getElementById("output");

const mainCodeEditor = CodeMirror.fromTextArea(ccode, mainCodeEditorOptions);
const outputEditor = CodeMirror(outputDiv, outputEditorOptions);

let updateTimeout;
mainCodeEditor.on("change", (editor, changeObj) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => handleCodeChange(editor), 200);
});

if(location.hash)
  try {
    const decodedCode = atob(location.hash.substring(1));
    mainCodeEditor.setValue(decodedCode);
  } catch(err) {
    console.log(err);
    location.hash = "";
    mainCodeEditor.setValue(defaultProgram);
  }
else
  mainCodeEditor.setValue(defaultProgram);

mainCodeEditor.refresh();
