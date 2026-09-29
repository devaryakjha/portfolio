const visibleArtworks = new Set();
function updateMotion() {
  for (const artwork of visibleArtworks) artwork.toggleAttribute('data-motion-running', !document.hidden);
}
const observer = new IntersectionObserver(entries => {
  for (const { target, isIntersecting, intersectionRatio } of entries) {
    if (isIntersecting && intersectionRatio > .05) visibleArtworks.add(target);
    else {
      visibleArtworks.delete(target);
      target.removeAttribute('data-motion-running');
    }
  }
  updateMotion();
}, { threshold: [0, .05] });
document.querySelectorAll('.grid-artwork-oore-build').forEach(artwork => observer.observe(artwork));
document.addEventListener('visibilitychange', updateMotion);
