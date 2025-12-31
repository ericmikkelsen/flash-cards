import flashcardsData from './flashcards.json';

// Function to escape HTML to prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
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

// Insert flashcards into the page
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('flashcards-container');
  if (container) {
    container.innerHTML = generateAllFlashcardsHTML(flashcardsData);
  }
});
