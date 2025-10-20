document.addEventListener('DOMContentLoaded', () => {
  const sloth = '/images/sloth_host.png';
  document.querySelectorAll('img.host-photo').forEach((img) => {
    img.src = sloth;
    img.loading = 'lazy';
  });
});
