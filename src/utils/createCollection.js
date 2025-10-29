import { createUmi } from '@metaplex-foundation/umi';
import { bundlrUploader } from '@metaplex-foundation/umi-uploader-bundlr';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

// Create UMI instance
const umi = createUmi('https://api.devnet.solana.com')
  .use(bundlrUploader())
  .use(mplTokenMetadata());

// Collection metadata
const collectionMetadata = {
  name: "Invoice Finance Collection",
  symbol: "INV",
  description: "Official collection for invoice NFTs on the Solana Invoice Finance platform. Each NFT represents a real-world invoice that can be traded and financed.",
  image: "https://via.placeholder.com/400x400/319795/ffffff?text=INVOICE+FINANCE",
  attributes: [
    {
      trait_type: "Platform",
      value: "Solana Invoice Finance"
    },
    {
      trait_type: "Type",
      value: "Invoice NFT"
    },
    {
      trait_type: "Network",
      value: "Solana Devnet"
    }
  ],
  properties: {
    files: [
      {
        uri: "https://via.placeholder.com/400x400/319795/ffffff?text=INVOICE+FINANCE",
        type: "image/png"
      }
    ],
    category: "image"
  }
};

// Create the platform collection
export const createPlatformCollection = async () => {
  try {
    console.log('Creating platform collection...');
    
    // Upload collection metadata
    const [uri] = await umi.uploader.uploadJson(collectionMetadata);
    console.log('Collection metadata uploaded to:', uri);
    
    // Create the collection NFT
    const collection = await umi.nfts().create({
      name: collectionMetadata.name,
      symbol: collectionMetadata.symbol,
      uri: uri,
      sellerFeeBasisPoints: 500, // 5% royalty
      isCollection: true,
      isMutable: true,
    });
    
    console.log('Collection created successfully!');
    console.log('Collection Address:', collection.mintAddress);
    console.log('Transaction Signature:', collection.signature);
    console.log('Metadata URI:', uri);
    
    return {
      success: true,
      collectionAddress: collection.mintAddress,
      signature: collection.signature,
      metadataUri: uri
    };
  } catch (error) {
    console.error('Error creating collection:', error);
    throw new Error(`Failed to create collection: ${error.message}`);
  }
};

// Run this script to create the collection
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  createPlatformCollection()
    .then((result) => {
      console.log('Collection creation result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Collection creation failed:', error);
      process.exit(1);
    });
}

export default createPlatformCollection;
