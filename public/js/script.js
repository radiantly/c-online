const defaultProgram =
`#include<stdio.h>
    
int main() {
    printf("Hello World!");

    return 0;
}`;

const handleCodeChange = (mirror, changeObj) => {
  console.log(mirror);
};

const codeMirrorOptions = {
  indentUnit: 4,
  indentWithTabs: true,
  theme: "monokai",
  lineNumbers: true,
  mode: "text/x-csrc",
  matchBrackets: true
};

const ccode = document.getElementById("ccode");
const mainCodeEditor = CodeMirror.fromTextArea(ccode, codeMirrorOptions);
const statusDiv = document.getElementById("status");

mainCodeEditor.on("change", (editor, changeObj) => {
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
      if (result.exit == 0) statusDiv.classList.replace("red", "green");
      else statusDiv.classList.replace("green", "red");
    });
});

if(location.hash) {
  try {
    const decodedCode = atob(location.hash.substring(1));
    mainCodeEditor.setValue(decodedCode);
  } catch(err) {
    console.log(err);
    location.hash = "";
  }
}