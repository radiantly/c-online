import express from 'express';
import { runCode } from './modules/runCode.js';
const app = express();

app.use(express.static('public'));
app.use(express.json())

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/', async (req, res) => {
  if(!(req.body.hasOwnProperty('code')))
    return res.status(400).send("No code.");
  
  const exitCode = await runCode(req.body.code);
  res.status(200).json({exit: exitCode});
});
app.listen(3000);