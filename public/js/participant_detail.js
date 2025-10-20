import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, query, where, limit, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyn0iUIkspW0QZnz9ZkguCVwLAnqq5kZ4",
  authDomain: "sdc-games-18b12.firebaseapp.com",
  projectId: "sdc-games-18b12",
  storageBucket: "sdc-games-18b12.firebasestorage.app",
  messagingSenderId: "404189247609",
  appId: "1:404189247609:web:e362aaed065067e73cfca8"
};

const ADMIN_PASSWORD = 'sdcadmin'; // change as needed
const AVATAR_BASE = '/images/';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rn = (window.ROLL_NUMBER || '').toString();

const els = {
  avatar: document.getElementById('p-avatar'),
  status: document.getElementById('p-status'),
  name: document.getElementById('p-name'),
  roll: document.getElementById('p-roll'),
  college: document.getElementById('p-college'),
  branch: document.getElementById('p-branch'),
  year: document.getElementById('p-year'),
  degree: document.getElementById('p-degree'),
};

const gate = {
  pass: document.getElementById('admin-pass'),
  unlock: document.getElementById('admin-unlock'),
  form: document.getElementById('admin-form'),
  fName: document.getElementById('f-name'),
  fRoll: document.getElementById('f-roll'),
  fCollege: document.getElementById('f-college'),
  fBranch: document.getElementById('f-branch'),
  fYear: document.getElementById('f-year'),
  fDegree: document.getElementById('f-degree'),
  fStatus: document.getElementById('f-status'),
  fAvatar: document.getElementById('f-avatar'),
  save: document.getElementById('save-btn'),
  del: document.getElementById('delete-btn'),
};

let currentDocId = null;

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
  els.college.textContent = p.college || '';
  els.branch.textContent = p.branch || '';
  els.year.textContent = p.year || '';
  els.degree.textContent = p.degree || '';
}

async function load() {
  const col = collection(db, 'participants');
  const qy = query(col, where('rollNumber', '==', rn), limit(1));
  const snap = await getDocs(qy);
  if (snap.empty) return;
  const docSnap = snap.docs[0];
  currentDocId = docSnap.id;
  render(docSnap.data());
  // preload form
  const d = docSnap.data();
  gate.fName.value = d.name || '';
  gate.fRoll.value = d.rollNumber || '';
  gate.fCollege.value = d.college || '';
  gate.fBranch.value = d.branch || '';
  gate.fYear.value = d.year || '';
  gate.fDegree.value = d.degree || '';
  gate.fStatus.value = d.status || 'Alive';
  gate.fAvatar.value = d.avatar || 'blue.png';
}

// Admin gate
gate.unlock.addEventListener('click', () => {
  if (gate.pass.value === ADMIN_PASSWORD) {
    gate.form.classList.remove('hidden');
    gate.pass.value = '';
  } else {
    alert('Wrong password');
  }
});

gate.save.addEventListener('click', async () => {
  if (!currentDocId) return alert('Participant not loaded');
  const data = {
    name: gate.fName.value.trim(),
    rollNumber: gate.fRoll.value.trim(),
    college: gate.fCollege.value.trim(),
    branch: gate.fBranch.value.trim(),
    year: gate.fYear.value.trim(),
    degree: gate.fDegree.value.trim(),
    status: gate.fStatus.value,
    avatar: gate.fAvatar.value,
  };
  try {
    await updateDoc(doc(db, 'participants', currentDocId), data);
    render(data);
    alert('Saved');
  } catch (e) {
    console.error(e);
    alert('Save failed');
  }
});

gate.del.addEventListener('click', async () => {
  if (!currentDocId) return alert('Participant not loaded');
  if (!confirm('Delete this participant?')) return;
  try {
    await deleteDoc(doc(db, 'participants', currentDocId));
    window.location.href = '/partispants';
  } catch (e) {
    console.error(e);
    alert('Delete failed');
  }
});

load().catch(console.error);