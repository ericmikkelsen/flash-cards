import flashcardsData from './flashcards.json';

// Function to generate a single flashcard details/summary element
function generateFlashcardHTML(card) {
  return `<details name="flashcards">
  <summary>${card.front}</summary>
  ${card.back}
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
