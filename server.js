import WebSocket from 'ws';
import { env } from 'process';
import { runCode } from './modules/runCode.js';

const wss = new WebSocket.Server({ port: env.port || 8000 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    const messageObj = JSON.parse(message)
    runCode(messageObj.code)
      .then(responseObj => ws.send(JSON.stringify(responseObj)));
  });
});