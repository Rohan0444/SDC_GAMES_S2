// Among Us Participants Page – Firestore live updates + Admin CRUD

// Firebase Web v10 ESM imports via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// Firebase config (provided)
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

// DOM refs
const grid = document.getElementById('participants-grid');
const searchInput = document.getElementById('participant-search');

// FAB + modal elements
const fabAdd = document.getElementById('fab-add');
const addModal = document.getElementById('add-modal');
const addPass = document.getElementById('add-pass');
const addForm = document.getElementById('add-form');
const aName = document.getElementById('a-name');
const aRoll = document.getElementById('a-roll');
const aCollege = document.getElementById('a-college');
const aBranch = document.getElementById('a-branch');
const aYear = document.getElementById('a-year');
const aDegree = document.getElementById('a-degree');
const aStatus = document.getElementById('a-status');
const aAvatar = document.getElementById('a-avatar');
const aCancel = document.getElementById('a-cancel');

let state = {
  all: [],
  filtered: [],
};

const AVATAR_BASE = '/images/';
const ADMIN_PASSWORD = 'sdcadmin';

function showEmptyState() {
  grid.innerHTML = '';
  const empty = document.createElement('div');
  empty.style.textAlign = 'center';
  empty.style.color = '#bdc3c7';
  empty.style.width = '100%';
  empty.style.gridColumn = '1 / -1';
  empty.textContent = 'No participants found. Use Admin to add some.';
  grid.appendChild(empty);
}

function normalize(p) {
  return {
    id: p.id,
    name: p.name?.trim() || 'Unknown',
    rollNumber: p.rollNumber?.toString().trim() || '',
    status: (p.status || 'Alive'),
    avatar: p.avatar || 'blue.png',
    college: p.college || '',
    branch: p.branch || '',
    year: p.year || '',
    degree: p.degree || '',
  };
}

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'participant-card ' + ((p.status || '').toLowerCase() === 'eliminated' ? 'eliminated' : 'alive');

  const img = document.createElement('img');
  img.className = 'avatar';
  img.alt = p.name;
  img.src = AVATAR_BASE + (p.avatar || 'blue.png');
  img.loading = 'lazy';

  const meta = document.createElement('div');
  meta.className = 'meta';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = p.name;
  const roll = document.createElement('div');
  roll.className = 'roll';
  roll.textContent = `Roll: ${p.rollNumber}`;
  const status = document.createElement('div');
  status.className = 'status';
  status.textContent = p.status === 'Eliminated' ? 'ELIMINATED' : 'ALIVE';

  meta.appendChild(name);
  meta.appendChild(roll);
  meta.appendChild(status);

  card.appendChild(img);
  card.appendChild(meta);

  card.addEventListener('click', () => {
    const rn = encodeURIComponent(p.rollNumber);
    window.location.href = `/participants/${rn}`;
  });

  return card;
}

function render(items) {
  grid.innerHTML = '';
  if (!items.length) { showEmptyState(); return; }
  items.forEach((p) => grid.appendChild(createCard(p)));
}

// Live subscription with new schema (ordered by rollNumber)
const participantsCol = collection(db, 'participants');
const q = query(participantsCol, orderBy('rollNumber'));

onSnapshot(q, (snapshot) => {
  state.all = snapshot.docs.map((d) => normalize({ id: d.id, ...d.data() }));
  applyFilter();
}, (err) => {
  console.error('Failed to fetch participants:', err);
  showEmptyState();
});

// Search
function applyFilter() {
  const q = (searchInput?.value || '').toLowerCase().trim();
  if (!q) {
    state.filtered = state.all.slice();
  } else {
    state.filtered = state.all.filter(p =>
      p.name.toLowerCase().includes(q) || p.rollNumber.toLowerCase().includes(q)
    );
  }
  render(state.filtered);
}
searchInput?.addEventListener('input', applyFilter);

// FAB: open add modal with password
fabAdd?.addEventListener('click', () => {
  addPass.value = '';
  addModal.classList.remove('hidden');
});

function hideAddModal() {
  addModal.classList.add('hidden');
  addForm.reset();
}

aCancel?.addEventListener('click', hideAddModal);

addForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (addPass.value !== ADMIN_PASSWORD) {
    alert('Wrong password');
    return;
  }
  const data = {
    name: aName.value.trim(),
    rollNumber: aRoll.value.trim(),
    college: aCollege.value.trim(),
    branch: aBranch.value.trim(),
    year: aYear.value.trim(),
    degree: aDegree.value.trim(),
    status: aStatus.value,
    avatar: aAvatar.value,
  };
  if (!data.name || !data.rollNumber) return alert('Name and Roll Number are required.');
  try {
    await addDoc(participantsCol, data);
    hideAddModal();
  } catch (e) {
    console.error('Add failed', e);
    alert('Failed to add participant');
  }
});
