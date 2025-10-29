# 🚀 Metaplex NFT Integration Setup

This guide will help you set up real NFT minting for your Solana Invoice Finance platform.

## 📋 Prerequisites

1. **Node.js** installed (v16 or higher)
2. **Phantom Wallet** or other Solana wallet
3. **SOL on Devnet** for transaction fees

## 🔧 Setup Steps

### Step 1: Install Dependencies
```bash
npm install @metaplex-foundation/umi @metaplex-foundation/umi-uploader-bundlr @metaplex-foundation/mpl-token-metadata
```

### Step 2: Create Platform Collection
```bash
node setup-collection.js
```

This will:
- Create a collection NFT for your platform
- Upload metadata to Arweave
- Return the collection address

### Step 3: Update Collection Address
1. Copy the collection address from the setup script output
2. Open `src/utils/metaplex.js`
3. Replace `PLATFORM_COLLECTION` with your collection address:

```javascript
export const PLATFORM_COLLECTION = new PublicKey('YOUR_COLLECTION_ADDRESS_HERE');
```

### Step 4: Get Devnet SOL
1. Go to [Solana Faucet](https://faucet.solana.com/)
2. Enter your wallet address
3. Request devnet SOL (you'll need ~0.1 SOL for testing)

### Step 5: Test the Integration
1. Start your app: `npm start`
2. Connect your wallet
3. Go to "Mint Invoice" page
4. Fill out the form and click "Mint Invoice NFT"

## 🎯 What This Enables

### ✅ Real Blockchain Integration
- **Actual NFT minting** on Solana devnet
- **Metadata storage** on Arweave
- **Transaction verification** on Solana Explorer

### ✅ User Experience
- **Wallet connection** required for minting
- **Real transaction signatures** displayed
- **Solana Explorer links** for verification
- **Loading states** during minting

### ✅ Business Features
- **Collection authority** maintained by platform
- **Royalty fees** on secondary sales
- **Metadata verification** through file hashes
- **Professional NFT standards** compliance

## 🔍 How It Works

### 1. User Flow
1. User connects wallet
2. User fills invoice form
3. User clicks "Mint Invoice NFT"
4. Metadata uploaded to Arweave
5. NFT minted to user's wallet
6. Invoice added to marketplace

### 2. Technical Flow
```javascript
// 1. Upload metadata
const metadataUri = await uploadMetadata(invoiceData);

// 2. Mint NFT
const result = await mintInvoiceNFT(invoiceData, userWallet, signTransaction);

// 3. Save to marketplace
saveInvoiceToMarketplace(newInvoice);
```

### 3. NFT Structure
```json
{
  "name": "Invoice INV-001",
  "symbol": "INV",
  "description": "Invoice for Acme Corp - Amount: 1,000 USDC",
  "attributes": [
    {"trait_type": "Invoice Number", "value": "INV-001"},
    {"trait_type": "Business", "value": "Acme Corp"},
    {"trait_type": "Amount", "value": "1000"},
    {"trait_type": "Currency", "value": "USDC"},
    {"trait_type": "Due Date", "value": "2025-08-01"},
    {"trait_type": "Premium", "value": "5%"},
    {"trait_type": "Credit Score", "value": "720"},
    {"trait_type": "File Hash", "value": "abc123..."},
    {"trait_type": "Status", "value": "Available"}
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "User rejected" Error
- **Cause**: User cancelled the transaction
- **Solution**: Ask user to try again and confirm the transaction

#### 2. "Insufficient funds" Error
- **Cause**: Not enough SOL for transaction fees
- **Solution**: Get more devnet SOL from the faucet

#### 3. "Network error" Error
- **Cause**: Connection issues
- **Solution**: Check internet connection and try again

#### 4. Collection not found
- **Cause**: Collection address not set correctly
- **Solution**: Run setup script again and update the address

### Debug Mode
Enable console logging by opening browser dev tools to see detailed error messages.

## 🎉 Success Indicators

When everything works correctly, you should see:
- ✅ "NFT Minted Successfully!" toast message
- ✅ NFT details displayed (mint address, transaction signature)
- ✅ Link to Solana Explorer
- ✅ Invoice appears in marketplace
- ✅ NFT visible in user's wallet

## 🔄 Next Steps

After successful setup:
1. **Test thoroughly** with different invoice data
2. **Update to mainnet** when ready for production
3. **Add more features** like batch minting
4. **Integrate with marketplaces** like Magic Eden

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your wallet is connected to devnet
3. Ensure you have enough SOL for transaction fees
4. Try refreshing the page and reconnecting your wallet

---

**Happy minting! 🚀**
