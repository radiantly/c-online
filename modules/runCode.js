import { spawn } from 'child_process';

export const runCode = code => {
  return new Promise(resolve => {
    const gcc = spawn('gcc', ['-xc', '-fsyntax-only', '-']);
    const errors = []
    gcc.stderr.on('data', data => {
      errors.push(data.toString())
    });

    gcc.once('close', code => {
      resolve({ exitCode: code, errors: errors});
    });

    gcc.stdin.write(code)
    gcc.stdin.end();
  });
}