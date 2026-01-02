customElements.define('flash-cards', class extends HTMLElement {
  connectedCallback() {
    // Use setTimeout to ensure button is in the DOM
    setTimeout(() => {
      const button = this.querySelector('button');
      const details = Array.from(this.querySelectorAll('details'));
      const count = details.length;

      if (!button) return;

      // Capture original fronts and backs in DOM order (initial load)
      const originalFronts = details.map(detail => {
        const s = detail.querySelector('summary');
        return s ? (s.textContent || '') : '';
      });
      const originalBacks = details.map(detail => {
        const s = detail.querySelector('summary');
        return Array.from(detail.childNodes)
          .filter(node => node !== s)
          .map(node => node.textContent || '')
          .join('').trim();
      });

      // Create a labeled select for back/front ordering if not present
      let label = this.querySelector('label.back-front-order');
      if (!label) {
        label = document.createElement('label');
        label.className = 'back-front-order';
        label.textContent = 'Back/front order ';

        const select = document.createElement('select');
        select.innerHTML = `
          <option value="random">Randomized front/back</option>
          <option value="reverse">Reverse</option>
          <option value="default" selected>Default</option>
        `;

        label.appendChild(select);
        button.parentNode.insertBefore(label, button.nextSibling);
      }
      const select = label.querySelector('select');

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

      // Helper to apply selected mode using the captured originals
      function applyMode(mode) {
        details.forEach((detail, idx) => {
          const summary = detail.querySelector('summary');
          if (!summary) return;

          let newFront, newBack;
          if (mode === 'random') {
            if (Math.random() < 0.5) {
              newFront = originalBacks[idx] || '';
              newBack = originalFronts[idx] || '';
            } else {
              newFront = originalFronts[idx] || '';
              newBack = originalBacks[idx] || '';
            }
          } else if (mode === 'reverse') {
            newFront = originalBacks[idx] || '';
            newBack = originalFronts[idx] || '';
          } else {
            newFront = originalFronts[idx] || '';
            newBack = originalBacks[idx] || '';
          }

          summary.textContent = newFront;
          Array.from(detail.childNodes)
            .filter(node => node !== summary)
            .forEach(node => detail.removeChild(node));
          detail.appendChild(document.createTextNode(newBack));
        });
      }

      // Attach handler to select
      select.addEventListener('change', () => applyMode(select.value));
    }, 0);
  }
});
