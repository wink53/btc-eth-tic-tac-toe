// Bitcoin and Ethereum logo SVGs as data URIs
const BITCOIN_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23f7931a'/%3E%3Cpath fill='%23fff' d='M23.2 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c3 .6 5.2.3 6.2-2.4.8-2.2 0-3.4-1.6-4.2 1.1-.3 2-1 2.2-2.5zm-4 5.5c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.6c-.5 1.9-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z'/%3E%3C/svg%3E`;

const ETHEREUM_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23627eea'/%3E%3Cpath fill='%23fff' d='M16 4v8.9l7.5 3.3L16 4z'/%3E%3Cpath fill='%23c0cbf2' d='M16 4L8.5 16.2l7.5-3.3V4z'/%3E%3Cpath fill='%23fff' d='M16 22v6l7.5-10.4L16 22z'/%3E%3Cpath fill='%23c0cbf2' d='M16 28v-6L8.5 17.6l7.5 10.4z'/%3E%3Cpath fill='%23fff' d='M16 20.4l7.5-4.2L16 12.9v7.5z'/%3E%3Cpath fill='%23c0cbf2' d='M8.5 16.2l7.5 4.2v-7.5L8.5 16.2z'/%3E%3C/svg%3E`;

// ICP Canister connection
// After dfx deploy, the canister ID is available via dfx.json or environment
const CANISTER_ID = typeof CANISTER_ID !== 'undefined' 
  ? CANISTER_ID 
  : 'btc_eth_tic_tac_toe'; // fallback for local dev

// Game state
let currentPlayer = 1; // 1 = Bitcoin, 2 = Ethereum
let gameOver = false;
let board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

// DOM elements
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const resetBtn = document.getElementById('reset');
const playerBitcoinEl = document.getElementById('player-bitcoin');
const playerEthereumEl = document.getElementById('player-ethereum');
const cells = document.querySelectorAll('.cell');

// ICP Agent setup
// In production, this would use the generated candid.js from dfx generate
// For now, we simulate the canister interface
class GameCanister {
  constructor(canisterId) {
    this.canisterId = canisterId;
    this.url = this.getCanisterUrl();
  }

  getCanisterUrl() {
    // Determine the URL based on environment
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
    
    if (isLocal) {
      // Local development - use query parameter for canister ID
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('canisterId');
      return `http://${host}:8000${idFromUrl ? '?canisterId=' + idFromUrl : ''}`;
    } else {
      // ICP mainnet - use .ic0.app domain
      return `https://${canisterId}.ic0.app`;
    }
  }

  async call(method, args = {}) {
    // For a real ICP dapp, this would use @dfinity/agent Actor
    // This is a simplified client-side simulation
    // In production, after dfx generate, you'd have typed actors
    
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve({ ok: true });
      }, 50);
    });
  }
}

// Initialize game
function init() {
  statusEl.textContent = 'Click any cell to make your move';
  resetBtn.style.display = 'block';
  updatePlayerIndicator();
  renderBoard();

  // Add click handlers
  cells.forEach(cell => {
    cell.addEventListener('click', () => handleCellClick(parseInt(cell.dataset.index)));
  });

  resetBtn.addEventListener('click', resetGame);
}

function updatePlayerIndicator() {
  playerBitcoinEl.classList.toggle('active', currentPlayer === 1 && !gameOver);
  playerEthereumEl.classList.toggle('active', currentPlayer === 2 && !gameOver);
}

function renderBoard() {
  cells.forEach((cell, index) => {
    const value = board[index];
    if (value === 1) {
      cell.innerHTML = `<img src="${BITCOIN_SVG}" alt="Bitcoin" />`;
      cell.classList.add('taken');
    } else if (value === 2) {
      cell.innerHTML = `<img src="${ETHEREUM_SVG}" alt="Ethereum" />`;
      cell.classList.add('taken');
    } else {
      cell.innerHTML = '';
      cell.classList.remove('taken');
    }
  });
}

function handleCellClick(index) {
  if (gameOver || board[index] !== 0) {
    return;
  }

  // Place the move
  board[index] = currentPlayer;

  // Check for win
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]              // diagonals
  ];

  let winner = 0;
  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (board[a] !== 0 && board[a] === board[b] && board[b] === board[c]) {
      winner = board[a];
      gameOver = true;
      break;
    }
  }

  // Check for draw
  if (!gameOver && board.every(cell => cell !== 0)) {
    winner = 3; // draw
    gameOver = true;
  }

  renderBoard();
  updatePlayerIndicator();

  if (gameOver) {
    if (winner === 1) {
      statusEl.textContent = 'Bitcoin wins!';
      statusEl.className = 'status win';
    } else if (winner === 2) {
      statusEl.textContent = 'Ethereum wins!';
      statusEl.className = 'status win';
    } else {
      statusEl.textContent = "It's a draw!";
      statusEl.className = 'status draw';
    }
  } else {
    // Switch player
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerIndicator();
    statusEl.textContent = currentPlayer === 1 ? "Bitcoin's turn" : "Ethereum's turn";
    statusEl.className = 'status';
  }
}

function resetGame() {
  board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  currentPlayer = 1;
  gameOver = false;
  statusEl.textContent = 'Click any cell to make your move';
  statusEl.className = 'status';
  renderBoard();
  updatePlayerIndicator();
}

// Start the game
init();
