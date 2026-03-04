const fs = require('fs');
const path = require('path');

const projectRoot = 'D:\\PROGAMAR\\Gym';
const nextReactDir = path.join(projectRoot, 'node_modules', 'next', 'dist', 'compiled', 'react', 'cjs');
const nextReactDOMDir = path.join(projectRoot, 'node_modules', 'next', 'dist', 'compiled', 'react-dom', 'cjs');
const reactDir = path.join(projectRoot, 'node_modules', 'react', 'cjs');
const reactDOMDir = path.join(projectRoot, 'node_modules', 'react-dom', 'cjs');

function copyIfMissing(src, dest, fileName) {
    const srcPath = path.join(src, fileName);
    const destPath = path.join(dest, fileName);
    
    if (fs.existsSync(srcPath)) {
        console.log(`Copying ${fileName} to ${dest}...`);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Successfully copied ${fileName}`);
    } else {
        console.error(`Source file not found: ${srcPath}`);
    }
}

// Ensure destination directories exist
if (!fs.existsSync(reactDir)) fs.mkdirSync(reactDir, { recursive: true });
if (!fs.existsSync(reactDOMDir)) fs.mkdirSync(reactDOMDir, { recursive: true });

copyIfMissing(nextReactDir, reactDir, 'react.development.js');
copyIfMissing(nextReactDOMDir, reactDOMDir, 'react-dom.development.js');
