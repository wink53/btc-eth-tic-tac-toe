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
**Live:** https://pdkba-aqaaa-aaaal-qwwfq-cai.icp0.io/

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

## Mainnet Deployment

### Identity & Wallet Setup

Mainnet deploys require a dedicated identity and a cycles wallet funded with ICP.

```bash
# 1. Create a production identity
dfx identity new prod
dfx identity use prod

# 2. Get the account ID to fund with ICP
dfx ledger account-id

# 3. Convert ICP to cycles via the cycles ledger
dfx ledger create-canister $(dfx identity get-principal) --amount <ICP_AMOUNT> --network ic

# 4. Deploy a cycles wallet to the newly created canister
dfx identity --network ic deploy-wallet <NEW_CANISTER_ID>

# 5. Deploy to mainnet
dfx deploy --network ic
```

### Controller Management

The deployed canisters are controlled by the identity used for deployment. To check or update controllers:

```bash
# View canister controllers
dfx canister --network ic status game_backend
dfx canister --network ic status game_frontend

# Remove a controller
dfx canister --network ic update-settings game_backend --remove-controller <CONTROLLER_ID>
```

### Cycles Top-Up

When cycles run low, send ICP to your identity's account and convert:

```bash
dfx ledger create-canister $(dfx identity get-principal) --amount <ICP_AMOUNT> --network ic
dfx identity --network ic deploy-wallet <WALLET_CANISTER_ID>
```

Or use the NNS dapp, Plug wallet, or any cycles transfer tool.

## License

MIT