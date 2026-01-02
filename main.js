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
        const styleProps = numbers.map((num, idx) => `--fc-${idx + 1}:${num}`).join(';');
        this.setAttribute('style', styleProps);
        // Randomly flip front/back for each card (50% chance)
        details.forEach(detail => {
          if (Math.random() < 0.5) {
            const summary = detail.querySelector('summary');
            if (!summary) return;

            // Get front (summary) text
            const frontText = summary.textContent || '';

            // Get back text: all child nodes except the summary
            const backText = Array.from(detail.childNodes)
              .filter(node => node !== summary)
              .map(node => node.textContent || '')
              .join('').trim();

            // Swap: set summary to back, and replace other contents with front text
            summary.textContent = backText;

            // Remove all non-summary child nodes
            Array.from(detail.childNodes)
              .filter(node => node !== summary)
              .forEach(node => detail.removeChild(node));

            // Append the front text as a text node (back side)
            detail.appendChild(document.createTextNode(frontText));
          }
        });
      });
    }, 0);
  }
});
