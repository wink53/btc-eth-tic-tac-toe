import Nat = "mo:base/Nat";
import Text = "mo:base/Text";
import Array = "mo:base/Array";
import Blob = "mo:base/Blob";

persistent actor Game {
  
  type HttpRequest = {
    method: Text;
    url: Text;
    headers: [ { name: Text; value: Text } ];
    body: Blob;
  };

  type HttpResponse = {
    status_code: Nat;
    headers: [ { name: Text; value: Text } ];
    body: Blob;
    streaming_strategy: ?Text;
  };

  // Board state: 0 = empty, 1 = Bitcoin, 2 = Ethereum
  stable var board : [var Nat] = [var 0, 0, 0, 0, 0, 0, 0, 0, 0];
  stable var currentPlayer : Nat = 1;
  stable var gameOver : Bool = false;
  stable var winner : Nat = 0;
  stable var moveCount : Nat = 0;
  transient let winPatterns : [[Nat]] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  public query func getBoard() : async [Nat] { Array.freeze(board) };
  public query func getCurrentPlayer() : async Nat { currentPlayer };
  public query func isGameOver() : async Bool { gameOver };
  public query func getWinner() : async Nat { winner };

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

  // HTTP handler for frontend
  public query func http_request(req : HttpRequest) : async HttpResponse {
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
    return "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>BTC vs ETH Tic Tac Toe</title><style>" #
    "*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:linear-gradient(135deg,#1a1a2e,#16213e);min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff}" #
    "h1{font-size:2.5rem;background:linear-gradient(90deg,#f7931a,#627eea);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.subtitle{margin-bottom:1.5rem;opacity:.8}" #
    ".players{display:flex;gap:2rem;margin-bottom:1rem}.player{padding:.5rem 1rem;border-radius:8px;font-weight:bold;opacity:.5;transition:all .3s}.player.active{opacity:1;transform:scale(1.1);box-shadow:0 0 20px rgba(255,255,255,.2)}" #
    ".player.bitcoin{background:rgba(247,147,26,.2);border:2px solid #f7931a}.player.bitcoin.active{background:rgba(247,147,26,.4)}" #
    ".player.ethereum{background:rgba(98,126,234,.2);border:2px solid #627eea}.player.ethereum.active{background:rgba(98,126,234,.4)}" #
    ".board{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;background:rgba(255,255,255,.1);padding:8px;border-radius:12px}" #
    ".cell{width:100px;height:100px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.2);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}" #
    ".cell:hover{background:rgba(255,255,255,.1);transform:scale(1.05)}.cell.taken{cursor:not-allowed}.cell.taken:hover{transform:none}.cell img{width:60px;height:60px}" #
    ".status{margin-top:1.5rem;font-size:1.3rem}.status.win{color:#4ade80;font-weight:bold}.status.draw{color:#fbbf24;font-weight:bold}" #
    ".reset-btn{margin-top:1rem;padding:.75rem 2rem;font-size:1rem;background:linear-gradient(135deg,#f7931a,#627eea);border:none;border-radius:8px;color:#fff;cursor:pointer;font-weight:bold;transition:transform .2s}" #
    ".reset-btn:hover{transform:translateY(-2px)}" #
    "</style></head><body>" #
    "<h1>BTC vs ETH</h1><p class=subtitle>Tic Tac Toe on ICP</p>" #
    "<div class=players><div class=\"player bitcoin\" id=pb><span>Bitcoin</span></div><div class=\"player ethereum\" id=pe><span>Ethereum</span></div></div>" #
    "<div class=board id=board>" #
    "<div class=cell data-i=0></div><div class=cell data-i=1></div><div class=cell data-i=2></div>" #
    "<div class=cell data-i=3></div><div class=cell data-i=4></div><div class=cell data-i=5></div>" #
    "<div class=cell data-i=6></div><div class=cell data-i=7></div><div class=cell data-i=8></div>" #
    "</div><p class=status id=status>Click to play</p><button class=reset-btn id=reset>New Game</button>" #
    "<script>const B='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23f7931a%22/%3E%3Cpath fill=%22%23fff%22 d=%22M23.2 14.1c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.7-.4-.7 2.6c-.4-.1-.9-.2-1.4-.3l.7-2.6-1.7-.4-.7 2.7c-.4-.1-.7-.2-1-.2l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.8.4 0 0-1.2-.3-1.2-.3l-.8 1.9 2.2.5c.4.1.8.2 1.2.3l-.7 2.8 1.7.4.7-2.7c.5.1.9.2 1.4.3l-.7 2.7 1.7.4.7-2.8c3 .6 5.2.3 6.2-2.4.8-2.2 0-3.4-1.6-4.2 1.1-.3 2-1 2.2-2.5zm-4 5.5c-.5 2.2-4.2 1-5.4.7l1-3.9c1.2.3 5 .9 4.4 3.2zm.6-5.6c-.5 1.9-3.5.9-4.5.7l.9-3.5c1 .2 4.1.7 3.6 2.8z%22/%3E%3C/svg%3E',E='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%23627eea%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 4v8.9l7.5 3.3L16 4z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M16 4L8.5 16.2l7.5-3.3V4z%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 22v6l7.5-10.4L16 22z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M16 28v-6L8.5 17.6l7.5 10.4z%22/%3E%3Cpath fill=%22%23fff%22 d=%22M16 20.4l7.5-4.2L16 12.9v7.5z%22/%3E%3Cpath fill=%22%23c0cbf2%22 d=%22M8.5 16.2l7.5 4.2v-7.5L8.5 16.2z%22/%3E%3C/svg%3E';" #
    "let cp=1,go=false,br=[0,0,0,0,0,0,0,0,0];const cs=document.querySelectorAll('.cell'),st=document.getElementById('status'),pb=document.getElementById('pb'),pe=document.getElementById('pe');" #
    "const wp=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];" #
    "function ui(){pb.classList.toggle('active',cp===1&&!go);pe.classList.toggle('active',cp===2&&!go)}" #
    "function rd(){cs.forEach((c,i)=>{if(br[i]===1)c.innerHTML='<img src=\"'+B+'\">',c.classList.add('taken');else if(br[i]===2)c.innerHTML='<img src=\"'+E+'\">',c.classList.add('taken');else c.innerHTML='',c.classList.remove('taken')})}" #
    "function cl(i){if(go||br[i]!==0)return;br[i]=cp;let w=0;for(const p of wp)if(br[p[0]]!==0&&br[p[0]]===br[p[1]]&&br[p[1]]===br[p[2]]){w=br[p[0]];go=true;break}if(!go&&br.every(c=>c!==0))w=3,go=true;rd();ui();if(go)st.textContent=w===1?'Bitcoin wins!':w===2?'Ethereum wins!':\"It's a draw!\",st.className='status'+(w?' '+(w<3?'win':'draw'):'');else cp=cp===1?2:1,ui(),st.textContent=cp===1?\"Bitcoin's turn\":\"Ethereum's turn\",st.className='status'}" #
    "function rs(){br=[0,0,0,0,0,0,0,0,0];cp=1;go=false;st.textContent='Click to play';st.className='status';rd();ui()}" #
    "cs.forEach((c,i)=>c.addEventListener('click',()=>cl(i)));document.getElementById('reset').addEventListener('click',rs);rd();ui()" #
    "</script></body></html>";
  };
}
