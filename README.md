# BTC vs ETH - Tic Tac Toe on ICP

A Tic-Tac-Toe game running on the Internet Computer where Bitcoin battles Ethereum!

## Architecture

- **Backend Canister**: `btc_eth_tic_tac_toe` - Motoko smart contract handling game logic
- **Frontend Canister**: `btc_eth_tic_tac_toe_assets` - Asset canister serving HTML/CSS/JS

## Game Rules

- **Bitcoin** (orange) always goes first
- **Ethereum** (blue) goes second
- Click any empty cell to place your logo
- First to get 3 in a row (horizontal, vertical, or diagonal) wins!

## Quick Deploy (Local)

### Prerequisites

Install DFX (Internet Computer SDK):

```bash
# macOS/Linux
curl -fsSL https://internetcomputer.org/install.sh | sh

# Verify installation
dfx --version
```

### Deploy

```bash
# Clone the repo
git clone https://github.com/wink53/btc-eth-tic-tac-toe.git
cd btc-eth-tic-tac-toe

# Start local ICP replica
dfx start --background

# Deploy to local replica
dfx deploy

# Build frontend
npm install
npm run build
```

Open the URL shown in the output (typically `http://localhost:8000/?canisterId=...`)

## Deploy to ICP Mainnet

```bash
dfx deploy --network ic
```

## ICP Ninja (Browser IDE)

You can also deploy using ICP Ninja:

1. Go to https://icp.ninja
2. Create a new Motoko project
3. Copy the contents of `src/btc_eth_tic_tac_toe/main.mo` into the editor
4. Deploy the canister
5. Create a new asset canister and upload the built `dist/` files

## Project Structure

```
btc-eth-tic-tac-toe/
├── dfx.json                              # Canister configuration
├── package.json                           # npm dependencies
├── webpack.config.js                      # Webpack config
├── src/
│   ├── btc_eth_tic_tac_toe/             # Backend canister
│   │   ├── main.mo                       # Motoko game logic
│   │   └── main.did                      # Candid interface
│   └── btc_eth_tic_tac_toe_assets/       # Frontend canister
│       ├── index.html                    # Game UI
│       └── index.js                      # ICP connection
└── README.md
```

## Tech Stack

- **Backend**: Motoko (ICP smart contract language)
- **Frontend**: Vanilla JS, HTML, CSS
- **Build**: Webpack
- **Blockchain**: Internet Computer Protocol (ICP)

## Canister Interface

```candid
service : {
  "getBoard": () -> (vec nat8) query;
  "getCurrentPlayer": () -> (nat8) query;
  "isGameOver": () -> (bool) query;
  "getWinner": () -> (nat8) query;
  "makeMove": (position: nat8) -> (variant { ok: bool; err: text });
  "reset": () -> ();
}
```

## License

MIT
