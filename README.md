# BTC vs ETH - Tic Tac Toe on ICP

A Tic-Tac-Toe game running on the Internet Computer. Bitcoin vs Ethereum on the blockchain!

**Two-canister architecture** — `game_backend` handles game logic, `game_frontend` serves the HTML/JS frontend.

## How to Deploy

### Option 1 — ICP Ninja (easiest)
1. Go to **https://icp.ninja**
2. Upload the `src/` folder or connect your GitHub repo
3. Deploy — no local setup needed

### Option 2 — dfx CLI
```bash
git clone https://github.com/wink53/btc-eth-tic-tac-toe.git
cd btc-eth-tic-tac-toe
dfx start --background
dfx deploy
```
Then open the URL shown in the output (e.g. `http://localhost:4943/?canisterId=...`).

### Option 3 — Mainnet
```bash
# Requires a cycles wallet on mainnet
dfx deploy --network ic --wallet <your-wallet-canister-id>
```

## How to Play

- **Bitcoin** (orange) always goes first
- **Ethereum** (blue) goes second
- Click any empty cell to place your logo
- First to get 3 in a row (horizontal, vertical, or diagonal) wins
- Click **New Game** to reset

## Project Structure

```
btc-eth-tic-tac-toe/
├── dfx.json                    # DFX configuration (2 canisters)
├── src/
│   ├── game_backend/
│   │   ├── main.mo             # Game logic (Motoko)
│   │   └── main.did            # Candid interface
│   └── game_frontend/
│       ├── index.html           # Game UI
│       ├── index.js             # Frontend logic
│       └── assets/              # Static assets
├── webpack.config.js           # Frontend bundler config
└── package.json
```

## Canister Interface (game_backend)

```candid
getBoard: () -> (vec nat8) query;
getCurrentPlayer: () -> (nat8) query;
isGameOver: () -> (bool) query;
getWinner: () -> (nat8) query;
getWinningPattern: () -> (vec nat8) query;
makeMove: (position: nat8) -> (variant { ok: bool; err: text });
reset: () -> ();
```

## Tech Stack

- **Motoko** — smart contract language for ICP
- **Two-canister** — backend + frontend separation
- **Webpack** — bundling for frontend canister

## License

MIT