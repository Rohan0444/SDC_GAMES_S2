// Among Us Participants Page – MongoDB API integration (View Only)

// DOM refs
const grid = document.getElementById('participants-grid');
const searchInput = document.getElementById('participant-search');

let state = {
  all: [],
  filtered: [],
};

const AVATAR_BASE = '/images/';
const API_BASE = '/api';

// Utility functions
function showEmptyState() {
  grid.innerHTML = '';
  const empty = document.createElement('div');
  empty.style.textAlign = 'center';
  empty.style.color = '#bdc3c7';
  empty.style.width = '100%';
  empty.style.gridColumn = '1 / -1';
  empty.textContent = 'No participants found.';
  grid.appendChild(empty);
}

function normalize(p) {
  return {
    _id: p._id,
    name: p.name?.trim() || 'Unknown',
    rollNumber: p.rollNumber?.toString().trim() || '',
    status: (p.status || 'Alive'),
    avatar: p.avatar || 'blue.png',
    college: p.college || '',
    branch: p.branch || '',
    year: p.year || '',
    degree: p.degree || '',
    email: p.email || '',
    phone: p.phone || '',
    eliminatedAt: p.eliminatedAt || null,
    registeredAt: p.registeredAt || null
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

  // Add elimination animation if participant is eliminated
  if (p.status === 'Eliminated') {
    card.style.animation = 'eliminationPulse 2s ease-in-out infinite';
    card.style.filter = 'grayscale(100%)';
    card.style.opacity = '0.7';
  }

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

// API Functions
async function fetchParticipants() {
  try {
    const response = await fetch(`${API_BASE}/participants-status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const participants = await response.json();
    return participants.map(normalize);
  } catch (error) {
    console.error('Failed to fetch participants:', error);
    showEmptyState();
    return [];
  }
}

// Initialize and load participants
async function initializeParticipants() {
  console.log('Loading participants from MongoDB...');
  state.all = await fetchParticipants();
  applyFilter();
  
  // Set up polling for real-time updates (every 5 seconds)
  setInterval(async () => {
    const updatedParticipants = await fetchParticipants();
    if (JSON.stringify(updatedParticipants) !== JSON.stringify(state.all)) {
      state.all = updatedParticipants;
      applyFilter();
    }
  }, 5000);
}

// Search functionality
function applyFilter() {
  const q = (searchInput?.value || '').toLowerCase().trim();
  if (!q) {
    state.filtered = state.all.slice();
  } else {
    state.filtered = state.all.filter(p =>
      p.name.toLowerCase().includes(q) || 
      p.rollNumber.toLowerCase().includes(q) ||
      p.college.toLowerCase().includes(q) ||
      p.branch.toLowerCase().includes(q)
    );
  }
  render(state.filtered);
}

// Event listeners
searchInput?.addEventListener('input', applyFilter);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  initializeParticipants();
});