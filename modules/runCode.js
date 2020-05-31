import { spawn } from 'child_process';

export const runCode = codeInBase64 => {
  return new Promise(resolve => {
    const gcc = spawn('gcc', ['-xc', '-fsyntax-only', '-']);

    gcc.once('close', code => {
      resolve(code);
    });

    gcc.stdin.write(Buffer.from(codeInBase64, 'base64').toString())
    gcc.stdin.end();
  });
}