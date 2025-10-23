// Participant Detail Page – MongoDB API integration (View Only)

const AVATAR_BASE = '/images/';
const API_BASE = '/api';

const rn = (window.ROLL_NUMBER || '').toString();

const els = {
  avatar: document.getElementById('p-avatar'),
  status: document.getElementById('p-status'),
  name: document.getElementById('p-name'),
  roll: document.getElementById('p-roll'),
  team: document.getElementById('p-team'),
  teamName: document.getElementById('p-team-name'),
  college: document.getElementById('p-college'),
  branch: document.getElementById('p-branch'),
  year: document.getElementById('p-year'),
  degree: document.getElementById('p-degree'),
  email: document.getElementById('p-email'),
  phone: document.getElementById('p-phone'),
};

let currentParticipant = null;

function setStatusBadge(status) {
  const isDead = (status || '').toLowerCase() === 'eliminated';
  els.status.textContent = isDead ? 'ELIMINATED' : 'ALIVE';
  els.status.classList.toggle('dead', isDead);
  els.status.classList.toggle('alive', !isDead);
}

function render(p) {
  els.avatar.src = AVATAR_BASE + (p.avatar || 'blue.png');
  els.avatar.alt = p.name;
  setStatusBadge(p.status);
  els.name.textContent = p.name || '';
  els.roll.textContent = `Roll: ${p.rollNumber || rn}`;
  
  // Handle team display
  if (p.team && p.team.trim() !== '') {
    els.teamName.textContent = p.team;
    els.team.style.display = 'flex';
  } else {
    els.team.style.display = 'none';
  }
  
  els.college.textContent = p.college || '';
  els.branch.textContent = p.branch || '';
  els.year.textContent = p.year || '';
  els.degree.textContent = p.degree || '';
  
  // Add email and phone if elements exist
  if (els.email) els.email.textContent = p.email || '';
  if (els.phone) els.phone.textContent = p.phone || '';
}

// API Functions
async function fetchParticipantByRollNumber(rollNumber) {
  try {
    const response = await fetch(`${API_BASE}/participants-status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const participants = await response.json();
    const participant = participants.find(p => p.rollNumber === rollNumber);
    return participant || null;
  } catch (error) {
    console.error('Failed to fetch participant:', error);
    return null;
  }
}

async function load() {
  console.log('Loading participant with roll number:', rn);
  const participant = await fetchParticipantByRollNumber(rn);
  
  if (!participant) {
    console.log('Participant not found');
    // Show not found message
    els.name.textContent = 'Participant not found';
    els.roll.textContent = `Roll: ${rn}`;
    return;
  }
  
  currentParticipant = participant;
  render(participant);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  load().catch(console.error);
});