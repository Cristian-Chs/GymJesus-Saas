const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'build_capture.log');
const stream = fs.createWriteStream(logFile);

console.log(`Running npm run build and logging to ${logFile}...`);

const child = spawn('npm.cmd', ['run', 'build'], {
  cwd: __dirname,
  shell: true
});

child.stdout.on('data', (data) => {
  process.stdout.write(data);
  stream.write(data);
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
  stream.write(data);
});

child.on('close', (code) => {
  console.log(`\nBuild process exited with code ${code}`);
  stream.write(`\nBuild process exited with code ${code}`);
  stream.end();
  process.exit(code);
});
