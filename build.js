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
  <style>
    flash-cards {
      display: flex;
      flex-direction: column;
    }
    flash-cards > button {
      order: -1;
    }
    flash-cards > details {
      order: var(--fc-order);
    }
${orderCSS}
  </style>
  <script>
    customElements.define('flash-cards', class extends HTMLElement {
      connectedCallback() {
        // Use setTimeout to ensure button is in the DOM
        setTimeout(() => {
          const button = this.querySelector('button');
          const details = Array.from(this.querySelectorAll('details'));
          const count = details.length;
          
          if (!button) return;
          
          button.addEventListener('click', () => {
            // Create an array of numbers from 1 to count
            const numbers = Array.from({ length: count }, (_, i) => i + 1);
            
            // Shuffle the array using Fisher-Yates algorithm
            for (let i = numbers.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
            
            // Update the CSS custom properties
            const styleProps = numbers.map((num, idx) => \`--fc-\${idx + 1}:\${num}\`).join(';');
            this.setAttribute('style', styleProps);
          });
        }, 0);
      }
    });
  </script>
</head>
<body>
  <h1>Flash Cards</h1>
  <flash-cards style="${initialOrderStyle}">
    <button>Randomize Order</button>
${flashcardsHTML}
  </flash-cards>
</body>
</html>
`;

// Write to dist directory
writeFileSync(join(__dirname, 'dist', 'index.html'), htmlTemplate);
console.log('✓ Static HTML generated successfully');
