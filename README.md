# Solana Invoice Finance MVP

A decentralized invoice financing platform built on Solana, enabling businesses to mint invoices as NFTs and investors to purchase, trade, and track repayments transparently.

---

## 🚀 Features
- **Mint Invoice as NFT:** Businesses can create invoice NFTs with metadata, repayment terms, and file hash for verification.
- **Marketplace:** Investors can browse, filter, sort, and purchase invoice NFTs. Secondary market trading supported.
- **Business Dashboard:** Track minted invoices, repayment status, and perform bulk actions. Visual timeline and notifications included.
- **Investor Dashboard:** Track purchased invoices, expected yield, and repayments.
- **Profile/Settings:** Manage business info and notification preferences.
- **Live Invoice Preview:** See how your NFT will appear as you fill the mint form.
- **Wallet Integration:** Connect with Solana wallets (Phantom, etc.) using wallet-adapter.
- **Modern UI/UX:** Responsive, accessible, with skeleton loaders, error handling, and subtle animations.

---

## 🛠️ Tech Stack
- **Frontend:** React.js, Chakra UI, React Router
- **Blockchain:** Solana Devnet, @solana/web3.js, wallet-adapter
- **State/Storage:** React state, localStorage (for demo)
- **Other:** CRACO (for Webpack polyfills), Framer Motion (animations)

---

## ⚡ Setup Instructions
1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd invoice-finance-mvp
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the app:**
   ```bash
   npm start
   ```
4. **Open in browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📝 Usage Guide
### For Businesses
1. Connect your Solana wallet.
2. Go to **Mint Invoice** and fill out the form (with file upload for hash).
3. Submit to mint your invoice NFT (demo: adds to localStorage/marketplace).
4. Track status and repayments in the **Business Dashboard**.

### For Investors
1. Connect your Solana wallet.
2. Browse the **Marketplace** for available invoices.
3. Filter, sort, and view details. Purchase invoices to fund businesses.
4. Track your investments in the **Investor Dashboard**.
5. Sell invoices on the secondary market (demo: relist in marketplace).

---

## 🧪 Demo Notes
- **No backend/blockchain write:** All data is stored in localStorage for demo purposes.
- **Dummy data:** Pre-populated invoices for both business and investor flows.
- **Wallet required:** Connect a Solana wallet (Phantom, etc.) to access dashboards and purchase.
- **No real funds:** All transactions are simulated.

---

## 🗂️ Key Files & Components
- `src/pages/MintInvoice.js` — Mint Invoice NFT form & live preview
- `src/pages/Marketplace.js` — Invoice marketplace (filter, sort, buy, modal)
- `src/pages/BusinessDashboard.js` — Business dashboard (table, bulk actions, notifications)
- `src/pages/InvestorDashboard.js` — Investor dashboard (summary, table, sell)
- `src/pages/Profile.js` — Profile/settings page
- `src/components/Header.js` — Navbar, wallet, avatar menu
- `src/pages/InvestorYield.js` — Investor yield & secondary market summary
- `src/index.js` — App entry, wallet/provider setup

---

## ✅ What Has Been Implemented
- Full business and investor flows (mint, buy, repay, relist)
- Marketplace with advanced filtering, sorting, and yield display
- Live invoice NFT preview
- Responsive, accessible UI with error handling and loaders
- Profile/settings and notification preferences
- Investor dashboard and yield summary
- Robust handling of malformed data and runtime errors

---

## 🙏 Credits & Acknowledgments
- Built with [Solana](https://solana.com/), [Chakra UI](https://chakra-ui.com/), [React](https://react.dev/), and [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter).
- UI/UX inspired by leading DeFi and fintech platforms.
- Special thanks to the open source community and Solana dev ecosystem. 