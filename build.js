import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure dist directory exists
mkdirSync(join(__dirname, 'dist'), { recursive: true });

// Read the flashcards data
const flashcardsData = JSON.parse(
  readFileSync(join(__dirname, 'flashcards.json'), 'utf-8')
);

// Read the CSS and JS files
const styleCSS = readFileSync(join(__dirname, 'style.css'), 'utf-8');
const mainJS = readFileSync(join(__dirname, 'main.js'), 'utf-8');

// Function to escape HTML to prevent XSS
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Function to generate a single flashcard details/summary element
function generateFlashcardHTML(card) {
  return `      <details name="flashcards">
        <summary>${escapeHTML(card.front)}</summary>
        ${escapeHTML(card.back)}
      </details>`;
}

// Function to generate all flashcards HTML
function generateAllFlashcardsHTML(cards) {
  return cards.map(card => generateFlashcardHTML(card)).join('\n');
}

// Function to generate initial CSS custom properties for ordering
function generateInitialOrderStyle(count) {
  const properties = [];
  for (let i = 1; i <= count; i++) {
    properties.push(`--fc-${i}:${i}`);
  }
  return properties.join(';');
}

// Function to generate CSS rules for nth-child selectors
function generateOrderCSS(count) {
  const rules = [];
  for (let i = 1; i <= count; i++) {
    // Button is first child, so details start at child(2)
    rules.push(`    flash-cards > details:nth-child(${i + 1}) { --fc-order: var(--fc-${i}); }`);
  }
  return rules.join('\n');
}

// Generate the complete HTML
const flashcardsHTML = generateAllFlashcardsHTML(flashcardsData);
const initialOrderStyle = generateInitialOrderStyle(flashcardsData.length);
const orderCSS = generateOrderCSS(flashcardsData.length);

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flash Cards</title>
  <link rel="stylesheet" href="style.css">
  <style>
${orderCSS}
  </style>
</head>
<body>
  <h1>Flash Cards</h1>
  <flash-cards style="${initialOrderStyle}">
    <button>Randomize Order</button>
${flashcardsHTML}
  </flash-cards>
  <script src="main.js"></script>
</body>
</html>
`;

// Write to dist directory
writeFileSync(join(__dirname, 'dist', 'index.html'), htmlTemplate);

// Copy CSS and JS files to dist
copyFileSync(join(__dirname, 'style.css'), join(__dirname, 'dist', 'style.css'));
copyFileSync(join(__dirname, 'main.js'), join(__dirname, 'dist', 'main.js'));

console.log('✓ Static HTML generated successfully');
console.log('✓ CSS and JS files copied to dist/');
