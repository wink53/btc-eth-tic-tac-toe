import Nat = "mo:base/Nat";
import Array = "mo:base/Array";

actor Game {
  // Board state: 0 = empty, 1 = Bitcoin, 2 = Ethereum
  private var board : [Nat] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  private var currentPlayer : Nat = 1; // 1 = Bitcoin, 2 = Ethereum
  private var gameOver : Bool = false;
  private var winner : Nat = 0; // 0 = no winner, 1 = Bitcoin, 2 = Ethereum, 3 = draw
  private var moveCount : Nat = 0;

  // Winning combinations
  private let winPatterns : [[Nat]] = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal
    [2, 4, 6]  // anti-diagonal
  ];

  // Get current board state
  public query func getBoard() : [Nat] {
    return board;
  };

  // Get current player (1 = Bitcoin, 2 = Ethereum)
  public query func getCurrentPlayer() : Nat {
    return currentPlayer;
  };

  // Check if game is over
  public query func isGameOver() : Bool {
    return gameOver;
  };

  // Get winner (0 = none, 1 = Bitcoin, 2 = Ethereum, 3 = draw)
  public query func getWinner() : Nat {
    return winner;
  };

  // Make a move
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

  // Reset the game
  public func reset() {
    board := [0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer := 1;
    gameOver := false;
    winner := 0;
    moveCount := 0;
  };
}
