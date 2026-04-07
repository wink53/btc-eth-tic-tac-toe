// BTC vs ETH Tic Tac Toe - using @dfinity/agent with generated declarations
import { HttpAgent } from '@dfinity/agent';
import { canisterId, createActor } from '@declarations/game_backend';

const REPLICA_URL = 'http://127.0.0.1:4943';

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
  } else {
    const player = PLAYERS[winner];
    bannerEl.classList.add(player.name.toLowerCase());
    bannerTitle.textContent = `${player.name} Wins!`;
    bannerSubtitle.textContent = 'Congratulations to the winner!';
  }
}

async function render() {
  pbEl.classList.toggle('active', currentPlayer === 1 && !gameOver);
  peEl.classList.toggle('active', currentPlayer === 2 && !gameOver);

  cells.forEach((cell, i) => {
    if (board[i] !== 0 && PLAYERS[board[i]]) {
      cell.innerHTML = ''; // clear
      cell.classList.add('taken');
      const playerClass = board[i] === 1 ? 'bitcoin' : 'ethereum';
      cell.classList.add(playerClass);
      // Use setTimeout to defer SVG insertion, forcing fresh animation
      setTimeout(() => {
        cell.innerHTML = PLAYERS[board[i]].svg;
        cell.classList.add('just-placed');
        // Remove animation class after it completes
        setTimeout(() => {
          cell.classList.remove('just-placed');
        }, 400);
      }, 0);
    } else {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'bitcoin', 'ethereum', 'just-placed');
    }
  });

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
  if (gameOver || board[pos] !== 0) return;

  try {
    console.log('Making move:', pos);
    await actor.makeMove(pos);
    setTimeout(fetchState, 300);
  } catch (e) {
    console.error('Move error:', e);
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

// Init
loadingEl.style.display = 'block';
fetchState();
