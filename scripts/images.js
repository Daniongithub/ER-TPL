document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function () {
      const fallback = this.getAttribute('data-fallback');
      if (fallback && this.src !== fallback) {
        this.src = fallback;
      }
    });
});