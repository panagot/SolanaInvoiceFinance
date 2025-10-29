// Simplified Metaplex utility for hackathon demo
// This avoids complex dependencies that cause webpack issues

// Platform collection address (mock for demo)
export const PLATFORM_COLLECTION = '11111111111111111111111111111111';

// Upload metadata to Arweave via Bundlr (simulated)
export const uploadMetadata = async (invoiceData) => {
  try {
    const metadata = {
      name: `Invoice ${invoiceData.invoiceNumber}`,
      symbol: 'INV',
      description: `Invoice for ${invoiceData.businessName} - Amount: ${invoiceData.amount} ${invoiceData.currency}`,
      image: 'https://via.placeholder.com/400x400/319795/ffffff?text=INVOICE+NFT',
      attributes: [
        {
          trait_type: 'Invoice Number',
          value: invoiceData.invoiceNumber
        },
        {
          trait_type: 'Business',
          value: invoiceData.businessName
        },
        {
          trait_type: 'Amount',
          value: invoiceData.amount
        },
        {
          trait_type: 'Currency',
          value: invoiceData.currency
        },
        {
          trait_type: 'Due Date',
          value: invoiceData.dueDate
        },
        {
          trait_type: 'Premium',
          value: `${invoiceData.repaymentPremium}%`
        },
        {
          trait_type: 'Credit Score',
          value: invoiceData.creditScore
        },
        {
          trait_type: 'File Hash',
          value: invoiceData.invoiceFileHash
        },
        {
          trait_type: 'Status',
          value: 'Available'
        }
      ],
      properties: {
        files: [
          {
            uri: 'https://via.placeholder.com/400x400/319795/ffffff?text=INVOICE+NFT',
            type: 'image/png'
          }
        ],
        category: 'image'
      }
    };

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URI
    const mockUri = `https://arweave.net/mock-${Date.now()}`;
    console.log('Metadata uploaded to:', mockUri);
    return mockUri;
  } catch (error) {
    console.error('Error uploading metadata:', error);
    throw new Error('Failed to upload metadata to Arweave');
  }
};

// Mint NFT using real Solana devnet transactions
export const mintInvoiceNFT = async (invoiceData, userWallet, signTransaction) => {
  try {
    console.log('Starting NFT minting process on Solana devnet...');
    
    // Validate inputs
    if (!userWallet) {
      throw new Error('User wallet is required');
    }
    
    if (!invoiceData || !invoiceData.invoiceNumber) {
      throw new Error('Invoice data is required');
    }

    // Upload metadata to Arweave (simulated for now)
    console.log('Uploading metadata...');
    const metadataUri = await uploadMetadata(invoiceData);
    console.log('Metadata uploaded to:', metadataUri);
    
    // Create real NFT on Solana blockchain
    console.log('Creating real NFT on Solana devnet...');
    const { createRealNFT } = await import('./realSolanaMint');
    
    const result = await createRealNFT(invoiceData, userWallet, signTransaction);
    
    console.log('🎉 Real NFT created successfully!');

    return {
      success: true,
      mintAddress: result.mintAddress,
      signature: result.signature,
      metadataUri: metadataUri,
      tokenAccount: result.tokenAccount,
      mintToSignature: result.mintToSignature,
      isSimulated: false, // Real blockchain transaction
      explorerUrl: result.explorerUrl
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    
    // Provide more specific error messages
    if (error.message.includes('User rejected')) {
      throw new Error('Transaction was cancelled by user');
    } else if (error.message.includes('insufficient funds')) {
      throw new Error('Insufficient SOL balance for transaction fees');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again');
    } else {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }
};

// Get NFT details (simulated)
export const getNFTDetails = async (mintAddress) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      mintAddress,
      name: `Invoice NFT ${mintAddress.slice(-4)}`,
      symbol: 'INV',
      uri: `https://arweave.net/mock-${mintAddress}`,
      isSimulated: true
    };
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw new Error('Failed to fetch NFT details');
  }
};

// Verify NFT exists (simulated)
export const verifyNFT = async (mintAddress) => {
  try {
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 300));
    return true; // Always return true for demo
  } catch (error) {
    return false;
  }
};

// Export default object
const metaplexUtils = {
  uploadMetadata,
  mintInvoiceNFT,
  getNFTDetails,
  verifyNFT,
  PLATFORM_COLLECTION
};

export default metaplexUtils;
