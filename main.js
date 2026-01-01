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
      });
    }, 0);
  }
});
