import Nat = "mo:base/Nat";
import Array = "mo:base/Array";

actor Game {

  // Board state: 0 = empty, 1 = Bitcoin, 2 = Ethereum
  stable var board : [var Nat] = [var 0, 0, 0, 0, 0, 0, 0, 0, 0];
  stable var currentPlayer : Nat = 1;
  stable var gameOver : Bool = false;
  stable var winner : Nat = 0;
  stable var moveCount : Nat = 0;
  let winPatterns : [[Nat]] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  public query func getBoard() : async [Nat] { Array.freeze(board) };
  public query func getCurrentPlayer() : async Nat { currentPlayer };
  public query func isGameOver() : async Bool { gameOver };
  public query func getWinner() : async Nat { winner };

  public query func getWinningPattern() : async [Nat] {
    if (not gameOver or winner == 3) return [];
    for (pattern in winPatterns.vals()) {
      let a = board[pattern[0]];
      let b = board[pattern[1]];
      let c = board[pattern[2]];
      if (a != 0 and a == b and b == c) {
        return pattern;
      };
    };
    return [];
  };

  public func makeMove(position : Nat) : async ({#ok : Bool; #err : Text}) {
    if (gameOver) return #err "Game is already over";
    if (position >= 9) return #err "Invalid position";
    if (board[position] != 0) return #err "Position already taken";

    board[position] := currentPlayer;
    moveCount += 1;

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

    if (moveCount == 9) {
      winner := 3;
      gameOver := true;
      return #ok true;
    };

    currentPlayer := if (currentPlayer == 1) { 2 } else { 1 };
    #ok true
  };

  public func reset() : async () {
    board := [var 0, 0, 0, 0, 0, 0, 0, 0, 0];
    currentPlayer := 1;
    gameOver := false;
    winner := 0;
    moveCount := 0;
  };
}
