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
  if (!soundEnabled) return;
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
  const baseFreq = isBitcoin ? 330 : 440;
  playTone(baseFreq, 0.15, 'sine', 0.25);
  playTone(baseFreq * 1.5, 0.1, 'triangle', 0.12, 0.05);
  if (isBitcoin) {
    playTone(baseFreq * 0.5, 0.12, 'sine', 0.1, 0.03);
  }
}

function playWinSound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => playTone(freq, 0.4, 'sine', 0.2, i * 0.12));
  playTone(2093, 0.3, 'triangle', 0.1, 0.5);
}

function playDrawSound() {
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

// Win patterns for minimax
const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// --- Minimax for CPU opponent ---
function checkWinnerForMinimax(b, player) {
  for (const pattern of WIN_PATTERNS) {
    if (b[pattern[0]] === player && b[pattern[1]] === player && b[pattern[2]] === player) {
      return true;
    }
  }
  return false;
}

function getEmptyIndices(b) {
  return b.map((v, i) => v === 0 ? i : -1).filter(i => i >= 0);
}

function minimax(b, depth, isMax, cpuPlayer) {
  const humanPlayer = cpuPlayer === 1 ? 2 : 1;

  if (checkWinnerForMinimax(b, cpuPlayer)) return 10 - depth;
  if (checkWinnerForMinimax(b, humanPlayer)) return depth - 10;
  if (getEmptyIndices(b).length === 0) return 0;

  const emptySpots = getEmptyIndices(b);

  if (isMax) {
    let best = -Infinity;
    for (const spot of emptySpots) {
      b[spot] = cpuPlayer;
      best = Math.max(best, minimax(b, depth + 1, false, cpuPlayer));
      b[spot] = 0;
    }
    return best;
  } else {
    let best = Infinity;
    for (const spot of emptySpots) {
      b[spot] = humanPlayer;
      best = Math.min(best, minimax(b, depth + 1, true, cpuPlayer));
      b[spot] = 0;
    }
    return best;
  }
}

function getBestMove(b, cpuPlayer) {
  let bestScore = -Infinity;
  let bestMove = -1;
  const emptySpots = getEmptyIndices(b);

  for (const spot of emptySpots) {
    b[spot] = cpuPlayer;
    const score = minimax(b, 0, false, cpuPlayer);
    b[spot] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestMove = spot;
    }
  }
  return bestMove;
}

// --- Local Storage helpers ---
function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// --- Persistent state ---
let soundEnabled = loadFromStorage('ttt_sound', true);
let gameMode = loadFromStorage('ttt_mode', 'pvp'); // 'pvp' | 'btc_cpu' | 'cpu_eth'
let scores = loadFromStorage('ttt_scores', { btc: 0, eth: 0, draws: 0 });

function cpuPlayerForMode(mode) {
  if (mode === 'btc_cpu') return 2; // CPU plays ETH
  if (mode === 'cpu_eth') return 1; // CPU plays BTC
  return null;
}

function isCpuTurn() {
  const cpu = cpuPlayerForMode(gameMode);
  return cpu !== null && currentPlayer === cpu && !gameOver;
}

// --- DOM elements ---
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
const soundBtnEl = document.getElementById('soundBtn');
const modeBtnEls = document.querySelectorAll('.mode-btn');
const btcScoreEl = document.getElementById('btcScore');
const ethScoreEl = document.getElementById('ethScore');
const drawScoreEl = document.getElementById('drawScore');

// --- Game state ---
let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let currentPlayer = 1;
let gameOver = false;
let winner = 0;
let lastMovedPos = -1;
let hasPendingMove = false;
let cpuTimeoutId = null;
let scoresUpdated = false; // Track if scores were already updated for this game

// --- UI helpers ---
function updateSoundBtn() {
  soundBtnEl.textContent = soundEnabled ? '🔊' : '🔇';
  soundBtnEl.classList.toggle('muted', !soundEnabled);
}

function updateModeBtns() {
  modeBtnEls.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === gameMode);
  });
}

function updateScoreDisplay() {
  btcScoreEl.textContent = scores.btc;
  ethScoreEl.textContent = scores.eth;
  drawScoreEl.textContent = scores.draws;
}

function updateCellsForCpuTurn() {
  const cpu = cpuPlayerForMode(gameMode);
  const isCpu = cpu !== null && currentPlayer === cpu && !gameOver;
  cells.forEach((cell, i) => {
    if (isCpu && board[i] === 0) {
      cell.classList.add('disabled');
    } else {
      cell.classList.remove('disabled');
    }
  });
}

function hideBanner() {
  overlayEl.style.display = 'none';
  bannerEl.style.display = 'none';
  bannerEl.className = 'banner';
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

function updateScores(winner) {
  if (winner === 1) scores.btc++;
  else if (winner === 2) scores.eth++;
  else scores.draws++;
  saveToStorage('ttt_scores', scores);
  updateScoreDisplay();
}

async function render() {
  pbEl.classList.toggle('active', currentPlayer === 1 && !gameOver);
  peEl.classList.toggle('active', currentPlayer === 2 && !gameOver);

  cells.forEach((cell, i) => {
    const isJustPlaced = i === lastMovedPos;
    if (board[i] !== 0 && PLAYERS[board[i]]) {
      cell.innerHTML = '';
      cell.classList.add('taken');
      const playerClass = board[i] === 1 ? 'bitcoin' : 'ethereum';
      cell.classList.add(playerClass);
      if (isJustPlaced) {
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

  lastMovedPos = -1;
  updateCellsForCpuTurn();

  if (gameOver) {
    if (winner === 3) {
      statusEl.textContent = "It's a draw!";
      statusEl.className = 'status draw';
      if (!scoresUpdated) { updateScores(0); scoresUpdated = true; }
      hideBanner();
    } else if (PLAYERS[winner]) {
      statusEl.textContent = `${PLAYERS[winner].name} wins!`;
      statusEl.className = 'status win';
      if (!scoresUpdated) { updateScores(winner); scoresUpdated = true; }
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

  // Trigger CPU move if it's CPU's turn
  if (isCpuTurn()) {
    if (cpuTimeoutId) clearTimeout(cpuTimeoutId);
    cpuTimeoutId = setTimeout(() => triggerCpuMove(), 700);
  }
}

async function fetchState() {
  if (hasPendingMove) return;

  try {
    console.log('Fetching state...');
    const [boardResult, playerResult, gameOverResult, winnerResult] = await Promise.all([
      actor.getBoard(),
      actor.getCurrentPlayer(),
      actor.isGameOver(),
      actor.getWinner(),
    ]);

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

  // Block human moves during CPU turn
  if (isCpuTurn()) return;

  try {
    console.log('Making move:', { pos, movingPlayer: currentPlayer, board: [...board] });
    lastMovedPos = pos;

    const movingPlayer = currentPlayer;
    board[pos] = movingPlayer;
    currentPlayer = currentPlayer === 1 ? 2 : 1;

    playPlaceSound(movingPlayer === 1);
    render();

    actor.makeMove(pos).then(() => {
      hasPendingMove = false;
      setTimeout(fetchState, 1400);
    }).catch(err => {
      console.error('Move failed:', err);
      hasPendingMove = false;
      board[pos] = 0;
      currentPlayer = movingPlayer;
      render();
    });
  } catch (e) {
    console.error('Move error:', e);
    hasPendingMove = false;
  }
}

function triggerCpuMove() {
  if (gameOver || !isCpuTurn()) return;
  const cpu = cpuPlayerForMode(gameMode);
  const move = getBestMove([...board], cpu);
  if (move >= 0) {
    console.log('CPU making move:', move);
    makeMove(move);
  }
}

async function resetGame() {
  try {
    if (cpuTimeoutId) { clearTimeout(cpuTimeoutId); cpuTimeoutId = null; }
    hideBanner();
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'winner', 'bitcoin', 'ethereum', 'just-placed', 'disabled');
    });
    statusEl.textContent = 'Resetting...';
    await actor.reset();
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer = 1;
    gameOver = false;
    winner = 0;
    scoresUpdated = false;
    updateCellsForCpuTurn();
    render();
  } catch (e) {
    console.error('Reset error:', e);
  }
}

// --- Event listeners ---
cells.forEach((cell, i) => {
  cell.addEventListener('click', () => makeMove(i));
});
resetBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', () => {
  hideBanner();
  resetGame();
});

soundBtnEl.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  saveToStorage('ttt_sound', soundEnabled);
  updateSoundBtn();
});

modeBtnEls.forEach(btn => {
  btn.addEventListener('click', () => {
    gameMode = btn.dataset.mode;
    saveToStorage('ttt_mode', gameMode);
    updateModeBtns();
    resetGame();
  });
});

// --- Init ---
updateSoundBtn();
updateModeBtns();
updateScoreDisplay();

board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
currentPlayer = 1;
gameOver = false;
winner = 0;
scoresUpdated = false;
loadingEl.style.display = 'block';

actor.reset().then(() => {
  console.log('Backend reset complete, fetching state...');
  fetchState();
}).catch(() => {
  console.log('Backend reset failed, fetching state anyway...');
  fetchState();
});
