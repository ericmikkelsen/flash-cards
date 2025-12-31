import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the flashcards data
const flashcardsData = JSON.parse(
  readFileSync(join(__dirname, 'flashcards.json'), 'utf-8')
);

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
  return `<details name="flashcards">
  <summary>${escapeHTML(card.front)}</summary>
  ${escapeHTML(card.back)}
</details>`;
}

// Function to generate all flashcards HTML
function generateAllFlashcardsHTML(cards) {
  return cards.map(card => generateFlashcardHTML(card)).join('\n');
}

// Generate the complete HTML
const flashcardsHTML = generateAllFlashcardsHTML(flashcardsData);

const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flash Cards</title>
</head>
<body>
  <h1>Flash Cards</h1>
  <div id="flashcards-container">
${flashcardsHTML}
  </div>
</body>
</html>
`;

// Write to dist directory
writeFileSync(join(__dirname, 'dist', 'index.html'), htmlTemplate);
console.log('✓ Static HTML generated successfully');
