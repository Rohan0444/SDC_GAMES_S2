document.addEventListener('DOMContentLoaded', () => {
  const avatars = [
    '/css/images/triangle_img.jpg',
    '/css/images/square.png'
  ];

  // Assign random avatar to each host photo
  document.querySelectorAll('img.host-photo[data-random-avatar="true"]').forEach((img) => {
    const pick = avatars[Math.floor(Math.random() * avatars.length)];
    img.src = pick;
    img.loading = 'lazy';
  });
});
