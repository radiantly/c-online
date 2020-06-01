const urlParams = new URLSearchParams(window.location.search);
const server = urlParams.get("server");

const ccode = document.getElementById("ccode");
const statusDiv = document.getElementById("status");
const outputDiv = document.getElementById("output");

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

const mainCodeEditor = CodeMirror.fromTextArea(ccode, mainCodeEditorOptions);
const outputEditor = CodeMirror(outputDiv, outputEditorOptions);

let oldStatus;
const updateStatus = status => {
  if(status === oldStatus) return;
  oldStatus = status;
  switch(status) {
    case 'green': statusDiv.classList.replace("red", "green"); break;
    case 'red': statusDiv.classList.replace("green", "red"); break;
    case 'connecting': statusDiv.classList.add("connecting");
                       outputEditor.setValue("Connecting...");
                       break;
    case 'connected': statusDiv.classList.remove("connecting");
                      statusDiv.classList.add("green");
                      outputEditor.setValue("Connected.");
                      break;
    case 'noserver': outputEditor.setValue("No websocket server specified.");
  }
}

let socket;
const handleSocketOpen = event => {
  console.info("[open] Connected!");
  updateStatus('connected');
};

const handleSocketMessage = event => {
  if(!event.data) return;
  const result = JSON.parse(event.data);
  console.log(result);
  if (result.exitCode == 0) {
    updateStatus('green');
    outputEditor.setValue("No errors :)");
  } else {
    updateStatus('red');
    outputEditor.setValue(result.errors.map(elem => elem.split("\n").map(line => line.replace(/^<stdin>:\s*/, '')).join("\n")).join("\n"));
  }
};

const handleSocketClose = event => {
  if (event.wasClean)
    console.info(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  else
    console.info('[close] Connection died');
  updateStatus('connecting');
  setTimeout(initializeSocket, 2000);
};

const handleSocketError = error => console.error(`[error] ${error.message}`);

const initializeSocket = () => {
  socket = new WebSocket(server);

  socket.onopen = handleSocketOpen;
  socket.onmessage = handleSocketMessage;
  socket.onclose = handleSocketClose;
  socket.onerror = handleSocketError;
}

server ? initializeSocket() : updateStatus('noserver');

const handleCodeChange = () => {
  if(socket.readyState !== 1) return;
  const codeInBase64 = btoa(mainCodeEditor.getValue());
  location.hash = codeInBase64;
  socket.send(`{ "code": "${codeInBase64}" }`);
};

let updateTimeout;
mainCodeEditor.on("change", (editor, changeObj) => {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(handleCodeChange, 200);
});

let startProgram =
`#include<stdio.h>

int main() {
\t
\tprintf("Hello World!");
\t
\treturn 0;
}`;

if(location.hash)
  try {
    startProgram = atob(location.hash.substring(1));
  } catch(err) {
    console.log(err);
    location.hash = "";
  }

mainCodeEditor.setValue(startProgram);
mainCodeEditor.refresh();
