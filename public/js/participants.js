// Squid Game Participants Grid – Firestore live updates
// This script renders participant cards and greys out eliminated players.

// Firebase Web v10 ESM imports via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

//web app's Firebase configuration (rishik)
const firebaseConfig = {
  apiKey: "AIzaSyAyn0iUIkspW0QZnz9ZkguCVwLAnqq5kZ4",
  authDomain: "sdc-games-18b12.firebaseapp.com",
  projectId: "sdc-games-18b12",
  storageBucket: "sdc-games-18b12.firebasestorage.app",
  messagingSenderId: "404189247609",
  appId: "1:404189247609:web:e362aaed065067e73cfca8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM helpers
const grid = document.getElementById('participants-grid');

function pad3(n) {
  try { return String(n).padStart(3, '0'); } catch { return String(n); }
}

function showEmptyState() {
  grid.innerHTML = '';
  const empty = document.createElement('div');
  empty.style.textAlign = 'center';
  empty.style.color = '#bdc3c7';
  empty.style.width = '100%';
  empty.style.gridColumn = '1 / -1';
  empty.textContent = 'No participants found in Firestore. Add some to see the grid.';
  grid.appendChild(empty);
}

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'participant-card';

  const status = (p.status || '').toLowerCase();
  if (status === 'eliminated') {
    card.classList.add('eliminated');
  }

  const rot = document.createElement('div');
  rot.className = 'card-rotator';

  const inner = document.createElement('div');
  inner.className = 'participant-inner';

  const hasImage = typeof p.imageUrl === 'string' && p.imageUrl.trim().length > 0;
  if (hasImage) {
    const img = document.createElement('img');
    img.alt = p.name || pad3(p.number || '');
    img.src = p.imageUrl;
    img.onerror = () => {
      img.remove();
      appendNumberFallback(inner, p);
      appendOverlayNumber(inner, p);
    };
    inner.appendChild(img);
  } else {
    appendNumberFallback(inner, p);
  }

  // Always show an overlay number like the panel
  appendOverlayNumber(inner, p);

  rot.appendChild(inner);
  card.appendChild(rot);
  return card;
}

function appendNumberFallback(container, p) {
  const box = document.createElement('div');
  box.className = 'participant-number-fallback';
  box.textContent = pad3(p.number ?? '');
  container.appendChild(box);
}

function appendOverlayNumber(container, p) {
  const num = document.createElement('div');
  num.className = 'participant-overlay-number';
  num.textContent = pad3(p.number ?? '');
  container.appendChild(num);
}

function render(items) {
  grid.innerHTML = '';
  items.forEach((p) => {
    grid.appendChild(createCard(p));
  });
}

// Subscribe to Firestore 'participants' collection ordered by number
const participantsCol = collection(db, 'participants');
const q = query(participantsCol, orderBy('number'));

onSnapshot(q, (snapshot) => {
  const participants = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (!participants.length) {
    showEmptyState();
  } else {
    render(participants);
  }
}, (err) => {
  console.error('Failed to fetch participants:', err);
  showEmptyState();
});
