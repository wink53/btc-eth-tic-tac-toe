# BTC vs ETH - Tic Tac Toe on ICP

A Tic-Tac-Toe game running on the Internet Computer where Bitcoin battles Ethereum!

![BTC vs ETH](https://img.shields.io/badge/BTC-ETH-Tic%20Tac%20Toe-f7931a?logo=bitcoin&logoColor=627eea)

## Game Rules

- **Bitcoin** (orange) always goes first
- **Ethereum** (blue) goes second
- Click any empty cell to place your logo
- First to get 3 in a row (horizontal, vertical, or diagonal) wins!

## Setup & Deployment

### Prerequisites

- Install DFX (Internet Computer SDK):

```bash
# macOS/Linux
curl -fsSL https://internetcomputer.org/install.sh | sh

# Or via npm
npm install -g dfx
```

### Deploy Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/wink53/btc-eth-tic-tac-toe.git
   cd btc-eth-tic-tac-toe
   ```

2. **Start the local ICP replica**
   ```bash
   dfx start --background
   ```

3. **Deploy the canister**
   ```bash
   dfx deploy
   ```

4. **Build the frontend**
   ```bash
   npm install
   npm run build
   ```

5. **Open in browser**
   Navigate to the canister URL shown after deployment (typically `http://localhost:8000/?canisterId=...`)

### Deploy to ICP Mainnet

```bash
dfx deploy --network ic
```

## Project Structure

```
btc-eth-tic-tac-toe/
├── dfx.json                              # DFX configuration
├── package.json                          # npm dependencies
├── webpack.config.js                     # Webpack config for frontend
├── src/
│   └── btc_eth_tic_tac_toe/
│       ├── main.mo                       # Motoko backend (game logic)
│       ├── index.html                    # Game UI
│       └── index.js                      # Frontend JS + ICP connection
└── README.md
```

## Tech Stack

- **Backend**: Motoko (ICP smart contract language)
- **Frontend**: Vanilla JS, HTML, CSS
- **Build**: Webpack
- **Blockchain**: Internet Computer Protocol (ICP)

## License

MIT
