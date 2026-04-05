import Nat = "mo:base/Nat";
import Array = "mo:base/Array";
import Text = "mo:base/Text";

actor Game {
  // Board state: 0 = empty, 1 = Bitcoin, 2 = Ethereum
  private var board : [Nat] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  private var currentPlayer : Nat = 1; // 1 = Bitcoin, 2 = Ethereum
  private var gameOver : Bool = false;
  private var winner : Nat = 0; // 0 = no winner, 1 = Bitcoin, 2 = Ethereum, 3 = draw
  private var moveCount : Nat = 0;

  // Winning combinations
  private let winPatterns : [[Nat]] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]              // diagonals
  ];

  // ============ GAME STATE QUERIES ============

  public query func getBoard() : [Nat] {
    return board;
  };

  public query func getCurrentPlayer() : Nat {
    return currentPlayer;
  };

  public query func isGameOver() : Bool {
    return gameOver;
  };

  public query func getWinner() : Nat {
    return winner;
  };

  // ============ GAME ACTIONS ============

  public func makeMove(position : Nat) : ({#ok : Bool; #err : Text}) {
    if (gameOver) {
      return #err "Game is already over";
    };

    if (position >= 9) {
      return #err "Invalid position";
    };

    if (board[position] != 0) {
      return #err "Position already taken";
    };

    // Place the move
    board[position] := currentPlayer;
    moveCount := moveCount + 1;

    // Check for win
    for (pattern in winPatterns.vals()) {
      let a = board[pattern[0]];
      let b = board[pattern[1]];
      let c = board[pattern[2]];
      if (a != 0 and a == b and b == c) {
        winner := currentPlayer;
        gameOver := true;
        return #ok true;
      };
    };

    // Check for draw
    if (moveCount == 9) {
      winner := 3;
      gameOver := true;
      return #ok true;
    };

    // Switch player
    if (currentPlayer == 1) {
      currentPlayer := 2;
    } else {
      currentPlayer := 1;
    };

    return #ok true;
  };

  public func reset() {
    board := [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer := 1;
    gameOver := false;
    winner := 0;
    moveCount := 0;
  };

  // ============ HTTP FRONTEND ============

  public query func http_request(req : HttpRequest) : HttpResponse {
    if (req.method == "GET" and req.url == "/") {
      return {
        status_code = 200;
        headers = [ { name = "Content-Type"; value = "text/html; charset=utf-8" } ];
        body = Text.encodeUtf8(htmlPage());
        streaming_strategy = null;
      };
    };

    return {
      status_code = 404;
      headers = [];
      body = Text.encodeUtf8("Not Found");
      streaming_strategy = null;
    };
  };

  private func htmlPage() : Text {
    return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BTC vs ETH - Tic Tac Toe</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #f7931a, #627eea);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle { font-size: 1.2rem; margin-bottom: 1.5rem; opacity: 0.8; }
    .players { display: flex; gap: 2rem; margin-bottom: 1rem; }
    .player {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-weight: bold;
      opacity: 0.5;
      transition: all 0.3s;
    }
    .player.active { opacity: 1; transform: scale(1.1); box-shadow: 0 0 20px rgba(255,255,255,0.2); }
    .player.bitcoin { background: rgba(247,147,26,0.2); border: 2px solid #f7931a; }
    .player.bitcoin.active { background: rgba(247,147,26,0.4); }
    .player.ethereum { background: rgba(98,126,234,0.2); border: 2px solid #627eea; }
    .player.ethereum.active { background: rgba(98,126,234,0.4); }
    .board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      background: rgba(255,255,255,0.1);
      padding: 8px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .cell {
      width: 100px;
      height: 100px;
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cell:hover { background: rgba(255,255,255,0.1); transform: scale(1.05); }
    .cell.taken { cursor: not-allowed; }
    .cell.taken:hover { transform: none; }
    .cell svg { width: 60px; height: 60px; }
    .status { margin-top: 1.5rem; font-size: 1.3rem; text-align: center; }
    .status.win { color: #4ade80; font-weight: bold; }
    .status.draw { color: #fbbf24; font-weight: bold; }
    .reset-btn {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      font-size: 1rem;
      background: linear-gradient(135deg, #f7931a, #627eea);
      border: none;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      font-weight: bold;
      transition: transform 0.2s;
    }
    .reset-btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <h1>BTC vs ETH</h1>
  <p class="subtitle">Tic Tac Toe on the Internet Computer</p>
  <div class="players">
    <div class="player bitcoin" id="player-bitcoin"><span>Bitcoin's Turn</span></div>
    <div class="player ethereum" id="player-ethereum"><span>Ethereum's Turn</span></div>
  </div>
  <div class="board" id="board">
    <div class="cell" data-index="0"></div>
    <div class="cell" data-index="1"></div>
    <div class="cell" data-index="2"></div>
    <div class="cell" data-index="3"></div>
    <div class="cell" data-index="4"></div>
    <div class="cell" data-index="5"></div>
    <div class="cell" data-index="6"></div>
    <div class="cell" data-index="7"></div>
    <div class="cell" data-index="8"></div>
  </div>
  <p class="status" id="status">Click any cell to make your move</p>
  <button class="reset-btn" id="reset">New Game</button>
  <script>
    const BITCOIN_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23f7931a"/%3E%3Cpath fill="%23fff" d="M23.2 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c3 .6 5.2.3 6.2-2.4.8-2.2 0-3.4-1.6-4.2 1.1-.3 2-1 2.2-2.5zm-4 5.5c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.6c-.5 1.9-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z'/%3E%3C/svg%3E';
    const ETHEREUM_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23627eea"/%3E%3Cpath fill="%23fff" d="M16 4v8.9l7.5 3.3L16 4z"/%3E%3Cpath fill="%23c0cbf2" d="M16 4L8.5 16.2l7.5-3.3V4z"/%3E%3Cpath fill="%23fff" d="M16 22v6l7.5-10.4L16 22z"/%3E%3Cpath fill="%23c0cbf2" d="M16 28v-6L8.5 17.6l7.5 10.4z"/%3E%3Cpath fill="%23fff" d="M16 20.4l7.5-4.2L16 12.9v7.5z"/%3E%3Cpath fill="%23c0cbf2" d="M8.5 16.2l7.5 4.2v-7.5L8.5 16.2z"/%3E%3C/svg%3E';
    
    // Game state
    let currentPlayer = 1;
    let gameOver = false;
    let board = [0,0,0,0,0,0,0,0,0];
    
    // DOM
    const cells = document.querySelectorAll('.cell');
    const statusEl = document.getElementById('status');
    const resetBtn = document.getElementById('reset');
    const playerBitcoinEl = document.getElementById('player-bitcoin');
    const playerEthereumEl = document.getElementById('player-ethereum');

    const winPatterns = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    function updatePlayerIndicator() {
      playerBitcoinEl.classList.toggle('active', currentPlayer === 1 && !gameOver);
      playerEthereumEl.classList.toggle('active', currentPlayer === 2 && !gameOver);
    }

    function renderBoard() {
      cells.forEach((cell, index) => {
        if (board[index] === 1) {
          cell.innerHTML = '<img src="' + BITCOIN_SVG + '" alt="Bitcoin" />';
          cell.classList.add('taken');
        } else if (board[index] === 2) {
          cell.innerHTML = '<img src="' + ETHEREUM_SVG + '" alt="Ethereum" />';
          cell.classList.add('taken');
        } else {
          cell.innerHTML = '';
          cell.classList.remove('taken');
        }
      });
    }

    function handleCellClick(index) {
      if (gameOver || board[index] !== 0) return;
      
      board[index] = currentPlayer;
      
      let winner = 0;
      for (const p of winPatterns) {
        if (board[p[0]] !== 0 && board[p[0]] === board[p[1]] && board[p[1]] === board[p[2]]) {
          winner = board[p[0]];
          gameOver = true;
          break;
        }
      }
      
      if (!gameOver && board.every(c => c !== 0)) {
        winner = 3;
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
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updatePlayerIndicator();
        statusEl.textContent = currentPlayer === 1 ? "Bitcoin's turn" : "Ethereum's turn";
        statusEl.className = 'status';
      }
    }

    function resetGame() {
      board = [0,0,0,0,0,0,0,0,0];
      currentPlayer = 1;
      gameOver = false;
      statusEl.textContent = 'Click any cell to make your move';
      statusEl.className = 'status';
      renderBoard();
      updatePlayerIndicator();
    }

    cells.forEach(cell => {
      cell.addEventListener('click', () => handleCellClick(parseInt(cell.dataset.index)));
    });
    resetBtn.addEventListener('click', resetGame);
    
    renderBoard();
    updatePlayerIndicator();
  </script>
</body>
</html>
""";
  };
};

// HTTP types
type HttpRequest = {
  method: Text;
  url: Text;
  headers: [ { name: Text; value: Text } ];
  body: Blob;
};

type HttpResponse = {
  status_code: Nat16;
  headers: [ { name: Text; value: Text } ];
  body: Blob;
  streaming_strategy: ?StreamingStrategy;
};

type Nat16 = Nat;
type StreamingStrategy = {
  #Callback: {
    callback: shared (StreamingCallbackToken) -> async (StreamingCallbackResponse);
    token: StreamingCallbackToken;
  };
};

type StreamingCallbackToken = {
  token: Blob;
  index: Nat;
  sha256: ?Blob;
};

type StreamingCallbackResponse = {
  body: Blob;
  token: ?StreamingCallbackToken;
};
