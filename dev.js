import { createServer } from 'http';
import { readFileSync, watch, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;
let htmlContent = '';

// Ensure dist directory exists
mkdirSync(join(__dirname, 'dist'), { recursive: true });

// Function to build the HTML
function buildHTML() {
  return new Promise((resolve, reject) => {
    exec('npm run build', (error, stdout, stderr) => {
      if (error) {
        console.error('Build error:', stderr);
        reject(error);
        return;
      }
      console.log(stdout);
      
      // Read the generated HTML
      try {
        htmlContent = readFileSync(join(__dirname, 'dist', 'index.html'), 'utf-8');
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Initial build
await buildHTML();

// Create HTTP server
const server = createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(htmlContent);
  } else if (req.url === '/style.css') {
    try {
      const css = readFileSync(join(__dirname, 'dist', 'style.css'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end(css);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else if (req.url === '/main.js') {
    try {
      const js = readFileSync(join(__dirname, 'dist', 'main.js'), 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end(js);
    } catch (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n✓ Dev server running at http://localhost:${PORT}/`);
  console.log('  Watching for changes...\n');
});

// Watch for changes in source files
const filesToWatch = ['build.js', 'flashcards.json', 'style.css', 'main.js'];
const watchers = [];

filesToWatch.forEach(file => {
  const filePath = join(__dirname, file);
  try {
    const watcher = watch(filePath, async (eventType) => {
      if (eventType === 'change') {
        console.log(`\n↻ ${file} changed, rebuilding...`);
        try {
          await buildHTML();
          console.log('✓ Rebuild complete\n');
        } catch (err) {
          console.error('✗ Rebuild failed:', err.message);
        }
      }
    });
    watchers.push(watcher);
  } catch (err) {
    console.warn(`⚠ Could not watch ${file}: ${err.message}`);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n↻ Shutting down dev server...');
  
  // Close all file watchers
  watchers.forEach(watcher => {
    try {
      watcher.close();
    } catch (err) {
      // Ignore errors during cleanup
    }
  });
  
  // Close the HTTP server
  server.close(() => {
    console.log('✓ Dev server stopped');
    process.exit(0);
  });
});
