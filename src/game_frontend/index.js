import { Actor, HttpAgent } from '@icp-sdk/core/agent';
import { idlFactory } from '../declarations/game_backend/game_backend.did.js';
import { canisterId } from '../declarations/game_backend/index.js';

// BTC and ETH SVG icons
const B = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23f7931a%22/%3E%3Cpath fill=%22%23fff%22 d=%22M23.2 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c3 .6 5.2.3 6.2-2.4.8-2.2 0-3.4-1.6-4.2 1.1-.3 2-1 2.2-2.5zm-4 5.5c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.6c-.5 1.9-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z%22/%3E%3C/svg%3E';
const E = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23627eea%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 4v8.9l7.5 3.3L16 4z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M16 4L8.5 16.2l7.5-3.3V4z%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 22v6l7.5-10.4L16 22z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M16 28v-6L8.5 17.6l7.5 10.4z%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 20.4l7.5-4.2L16 12.9v7.5z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M8.5 16.2l7.5 4.2v-7.5L8.5 16.2z%22/%3E%3C/svg%3E';

// Win patterns
const WP = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

// Create agent and actor
const agent = new HttpAgent({
  host: 'http://127.0.0.1:4943',
});

// Fetch root key for local development
if (process.env.DFX_NETWORK !== 'ic') {
  agent.fetchRootKey().catch(err => {
    console.warn('Unable to fetch root key:', err);
  });
}

const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId,
});

// Game state
let cp = 1;
let go = false;
let br = [0,0,0,0,0,0,0,0,0];

// DOM elements
const cs = document.querySelectorAll('.cell');
const st = document.getElementById('status');
const pb = document.getElementById('pb');
const pe = document.getElementById('pe');
const loading = document.getElementById('loading');

// UI functions
function ui() {
  pb.classList.toggle('active', cp === 1 && !go);
  pe.classList.toggle('active', cp === 2 && !go);
}

function rd() {
  cs.forEach((c, i) => {
    if (br[i] === 1) {
      c.innerHTML = `<img src="${B}">`;
      c.classList.add('taken');
    } else if (br[i] === 2) {
      c.innerHTML = `<img src="${E}">`;
      c.classList.add('taken');
    } else {
      c.innerHTML = '';
      c.classList.remove('taken');
    }
  });
}

function updateStatus(msg, className) {
  st.textContent = msg;
  st.className = 'status' + (className ? ' ' + className : '');
}

// Sync game state from backend
async function syncState() {
  try {
    const [board, player, gameOver, winner] = await Promise.all([
      backend.getBoard(),
      backend.getCurrentPlayer(),
      backend.isGameOver(),
      backend.getWinner()
    ]);
    br = Array.from(board).map(n => Number(n));
    cp = Number(player);
    go = gameOver;
    rd();
    ui();
    if (go) {
      const w = Number(winner);
      updateStatus(w === 1 ? 'Bitcoin wins!' : w === 2 ? 'Ethereum wins!' : "It's a draw!", w < 3 ? 'win' : 'draw');
    } else {
      updateStatus(cp === 1 ? "Bitcoin's turn" : "Ethereum's turn");
    }
  } catch (e) {
    console.error('Sync failed:', e);
    updateStatus('Sync failed: ' + e.message);
  }
}

// Click handler
async function cl(i) {
  if (go || br[i] !== 0) return;

  try {
    const result = await backend.makeMove(i);
    if (result.ok) {
      br[i] = cp;
    }
  } catch (e) {
    console.error('Move failed:', e);
    return;
  }

  // Check for win locally
  let w = 0;
  for (const p of WP) {
    if (br[p[0]] !== 0 && br[p[0]] === br[p[1]] && br[p[1]] === br[p[2]]) {
      w = br[p[0]];
      go = true;
      break;
    }
  }

  if (!go && br.every(c => c !== 0)) {
    w = 3;
    go = true;
  }

  rd();
  ui();

  if (go) {
    updateStatus(w === 1 ? 'Bitcoin wins!' : w === 2 ? 'Ethereum wins!' : "It's a draw!", w < 3 ? 'win' : 'draw');
  } else {
    cp = cp === 1 ? 2 : 1;
    ui();
    updateStatus(cp === 1 ? "Bitcoin's turn" : "Ethereum's turn");
  }
}

// Reset handler
async function rs() {
  try {
    await backend.reset();
    br = [0,0,0,0,0,0,0,0,0];
    cp = 1;
    go = false;
    updateStatus('Click to play');
    rd();
    ui();
  } catch (e) {
    console.error('Reset failed:', e);
  }
}

// Event listeners
cs.forEach((c, i) => c.addEventListener('click', () => cl(i)));
document.getElementById('reset').addEventListener('click', rs);

// Initialize
syncState().then(() => {
  loading.style.display = 'none';
});
