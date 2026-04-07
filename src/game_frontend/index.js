// BTC vs ETH Tic Tac Toe - using @dfinity/agent with generated declarations
import { HttpAgent } from '@dfinity/agent';
import { canisterId, createActor } from '@declarations/game_backend';

const REPLICA_URL = 'http://127.0.0.1:4943';

// --- Sound Effects using Web Audio API ---
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ctx.currentTime + delay);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  osc.start(ctx.currentTime + delay);
  osc.stop(ctx.currentTime + delay + duration);
}

function playPlaceSound(isBitcoin) {
  // Bitcoin gets a deeper, warmer plop; Ethereum gets a crisper, higher chime
  const baseFreq = isBitcoin ? 330 : 440;
  playTone(baseFreq, 0.15, 'sine', 0.25);
  playTone(baseFreq * 1.5, 0.1, 'triangle', 0.12, 0.05);
  if (isBitcoin) {
    playTone(baseFreq * 0.5, 0.12, 'sine', 0.1, 0.03);
  }
}

function playWinSound() {
  // Rising triumphant chord
  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
  notes.forEach((freq, i) => playTone(freq, 0.4, 'sine', 0.2, i * 0.12));
  // Add a sparkle on top
  playTone(2093, 0.3, 'triangle', 0.1, 0.5);
}

function playDrawSound() {
  // Neutral descending tone
  playTone(440, 0.2, 'sine', 0.2);
  playTone(330, 0.3, 'sine', 0.15, 0.15);
  playTone(220, 0.4, 'sine', 0.1, 0.3);
}

// Create agent and actor using generated declarations
const agent = new HttpAgent({
  host: REPLICA_URL,
  verifyQuerySignatures: false,
}, 'local');

const actor = createActor(canisterId, {
  agent,
});

// Icons as inline SVGs
const BTC_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#f7931a"/><text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="white" text-anchor="middle">₿</text></svg>`;
const ETH_SVG = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#627eea"/><text x="50" y="65" font-family="Arial" font-size="40" font-weight="bold" fill="white" text-anchor="middle">Ξ</text></svg>`;
const PLAYERS = { 1: { name: 'Bitcoin', svg: BTC_SVG }, 2: { name: 'Ethereum', svg: ETH_SVG } };

// DOM elements
const cells = document.querySelectorAll('.cell');
const statusEl = document.getElementById('status');
const pbEl = document.getElementById('pb');
const peEl = document.getElementById('pe');
const resetBtn = document.getElementById('reset');
const loadingEl = document.getElementById('loading');
const overlayEl = document.getElementById('overlay');
const bannerEl = document.getElementById('banner');
const bannerTitle = document.getElementById('bannerTitle');
const bannerSubtitle = document.getElementById('bannerSubtitle');
const playAgainBtn = document.getElementById('playAgain');

// Game state
let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let currentPlayer = 1;
let gameOver = false;
let winner = 0;
let lastMovedPos = -1; // Track which cell was just placed
let hasPendingMove = false; // True when a move is in flight

function hideBanner() {
  overlayEl.style.display = 'none';
  bannerEl.style.display = 'none';
  bannerEl.className = 'banner';
  // Remove winning highlight from all cells
  cells.forEach(cell => cell.classList.remove('winner'));
}

function showBanner(winner, pattern) {
  overlayEl.style.display = 'block';
  bannerEl.style.display = 'block';

  if (winner === 3) {
    bannerEl.classList.add('draw');
    bannerTitle.textContent = "It's a Draw!";
    bannerSubtitle.textContent = 'Great game, both players!';
    playDrawSound();
  } else {
    const player = PLAYERS[winner];
    bannerEl.classList.add(player.name.toLowerCase());
    bannerTitle.textContent = `${player.name} Wins!`;
    bannerSubtitle.textContent = 'Congratulations to the winner!';
    playWinSound();
  }
}

async function render() {
  pbEl.classList.toggle('active', currentPlayer === 1 && !gameOver);
  peEl.classList.toggle('active', currentPlayer === 2 && !gameOver);

  cells.forEach((cell, i) => {
    const isJustPlaced = i === lastMovedPos;
    if (board[i] !== 0 && PLAYERS[board[i]]) {
      cell.innerHTML = ''; // clear
      cell.classList.add('taken');
      const playerClass = board[i] === 1 ? 'bitcoin' : 'ethereum';
      cell.classList.add(playerClass);
      // Only animate the cell that was just placed, not all existing tokens
      if (isJustPlaced) {
        // Set innerHTML immediately so token is always present; animate the class
        cell.innerHTML = PLAYERS[board[i]].svg;
        cell.classList.add('just-placed');
        setTimeout(() => cell.classList.remove('just-placed'), 1200);
      } else {
        cell.innerHTML = PLAYERS[board[i]].svg;
      }
    } else {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'bitcoin', 'ethereum', 'just-placed');
    }
  });

  lastMovedPos = -1; // Reset after rendering

  if (gameOver) {
    if (winner === 3) {
      statusEl.textContent = "It's a draw!";
      statusEl.className = 'status draw';
      hideBanner();
    } else if (PLAYERS[winner]) {
      statusEl.textContent = `${PLAYERS[winner].name} wins!`;
      statusEl.className = 'status win';
      // Fetch winning pattern and highlight
      try {
        const pattern = await actor.getWinningPattern();
        if (pattern && pattern.length === 3) {
          pattern.forEach(i => cells[i].classList.add('winner'));
        }
        showBanner(winner, pattern);
      } catch (e) {
        console.error('Pattern fetch error:', e);
      }
    }
  } else {
    statusEl.textContent = `${PLAYERS[currentPlayer]?.name || 'Player'}'s turn`;
    statusEl.className = 'status';
    hideBanner();
  }

  loadingEl.style.display = 'none';
}

async function fetchState() {
  // Skip if a move is in flight - don't let stale backend state overwrite optimistic update
  if (hasPendingMove) return;

  try {
    console.log('Fetching state...');

    const [boardResult, playerResult, gameOverResult, winnerResult] = await Promise.all([
      actor.getBoard(),
      actor.getCurrentPlayer(),
      actor.isGameOver(),
      actor.getWinner(),
    ]);

    // Sync all state from backend (safe now - any pending move was already applied)
    board = boardResult.map(n => Number(n));
    currentPlayer = Number(playerResult) || 1;
    gameOver = Boolean(gameOverResult);
    winner = Number(winnerResult) || 0;
    console.log('Board:', board, 'Player:', currentPlayer, 'GameOver:', gameOver, 'Winner:', winner);

    render();
  } catch (e) {
    console.error('State fetch error:', e);
    render();
  }
  loadingEl.style.display = 'none';
}

async function makeMove(pos) {
  if (gameOver || board[pos] !== 0) {
    console.log('makeMove blocked:', { pos, gameOver, boardPos: board[pos] });
    return;
  }

  try {
    console.log('Making move:', { pos, movingPlayer: currentPlayer, board: [...board] });
    lastMovedPos = pos;

    // Optimistically update local board immediately (no waiting)
    const movingPlayer = currentPlayer;
    board[pos] = movingPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    // Play sound and animate right away - no delay
    playPlaceSound(movingPlayer === 1);
    render(); // Shows animation instantly

    // Now send the actual move to the backend
    actor.makeMove(pos).then(() => {
      hasPendingMove = false;
      // Wait for animation to finish (1200ms) before syncing with backend
      setTimeout(fetchState, 1400);
    }).catch(err => {
      console.error('Move failed:', err);
      hasPendingMove = false;
      // Revert on error
      board[pos] = 0;
      currentPlayer = movingPlayer;
      render();
    });
  } catch (e) {
    console.error('Move error:', e);
    hasPendingMove = false;
  }
}

async function resetGame() {
  try {
    console.log('Resetting game...');
    hideBanner();
    // Immediately clear board visually before async call
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'winner', 'bitcoin', 'ethereum', 'just-placed');
    });
    statusEl.textContent = 'Resetting...';
    await actor.reset();
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer = 1;
    gameOver = false;
    winner = 0;
    setTimeout(fetchState, 300);
  } catch (e) {
    console.error('Reset error:', e);
  }
}

// Event listeners
cells.forEach((cell, i) => {
  cell.addEventListener('click', () => makeMove(i));
});
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
  hideBanner();
  resetGame();
});

// Init - reset local state and call backend reset to clear any old game
board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
currentPlayer = 1;
gameOver = false;
winner = 0;
loadingEl.style.display = 'block';

// Await the reset promise so we don't race with fetchState
actor.reset().then(() => {
  console.log('Backend reset complete, fetching state...');
  fetchState();
}).catch(() => {
  console.log('Backend reset failed, fetching state anyway...');
  fetchState();
});
