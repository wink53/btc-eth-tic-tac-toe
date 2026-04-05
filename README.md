# BTC vs ETH - Tic Tac Toe on ICP

A Tic-Tac-Toe game running on the Internet Computer. Bitcoin vs Ethereum on the blockchain!

**One self-contained Motoko canister** — serves both the game logic AND the HTML frontend via HTTP.

## How to Deploy (ICP Ninja)

1. Go to **https://icp.ninja**
2. Create a new Motoko project
3. Copy the contents of `src/btc_eth_tic_tac_toe/main.mo` into the editor
4. Click **Deploy**
5. Open the canister URL — the game is ready to play!

## How to Play

- **Bitcoin** (orange) always goes first
- **Ethereum** (blue) goes second
- Click any empty cell to place your logo
- First to get 3 in a row (horizontal, vertical, or diagonal) wins
- Click **New Game** to reset

## Project Structure

```
btc-eth-tic-tac-toe/
└── src/
    └── btc_eth_tic_tac_toe/
        ├── main.mo          # Self-contained: game logic + HTTP frontend
        └── main.did         # Candid interface
```

## Local Deployment (dfx)

```bash
git clone https://github.com/wink53/btc-eth-tic-tac-toe.git
cd btc-eth-tic-tac-toe
dfx start --background
dfx deploy
```

Then open the canister URL shown in the output.

## Canister Interface

```candid
getBoard: () -> (vec nat8) query;
getCurrentPlayer: () -> (nat8) query;
isGameOver: () -> (bool) query;
getWinner: () -> (nat8) query;
makeMove: (position: nat8) -> (variant { ok: bool; err: text });
reset: () -> ();
http_request: (req: HttpRequest) -> (HttpResponse) query;
```

## Tech Stack

- **Motoko** — smart contract language for ICP
- **Single canister** — serves both backend + frontend via HTTP gateway
- **No external dependencies** — deploys directly from ICP Ninja

## License

MIT
