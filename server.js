import WebSocket from 'ws';
import { env } from 'process';
import { runCode } from './modules/runCode.js';

const wss = new WebSocket.Server({ port: env.PORT || 8000 });

wss.on('connection', ws => {
  ws.on('message', message => {
    if(typeof message === 'string')
      runCode(message)
        .then(responseObj => ws.send(JSON.stringify(responseObj)))
        .catch(err => console.error(err));
  });
});
