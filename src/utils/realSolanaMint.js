// Real Solana NFT minting with actual blockchain transactions and enhanced error handling
import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  createAccount,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Transaction deduplication cache
const transactionCache = new Map();

// Enhanced error handling with retry logic
const retryWithBackoff = async (fn, context = 'operation', maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 ${context} attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ ${context} attempt ${attempt} failed:`, error.message);
      
      // Don't retry for certain errors
      if (error.message.includes('already been processed') || 
          error.message.includes('duplicate transaction') ||
          error.message.includes('Invalid signature')) {
        console.log(`❌ Non-retryable error: ${error.message}`);
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Retrying ${context} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`${context} failed after ${maxRetries} attempts: ${lastError.message}`);
};

// Generate unique transaction ID to prevent duplicates
const generateTransactionId = (userWallet, operation) => {
  return `${userWallet.toBase58()}-${operation}-${Date.now()}`;
};

// Check if transaction is already being processed
const isTransactionInProgress = (transactionId) => {
  return transactionCache.has(transactionId);
};

// Mark transaction as in progress
const markTransactionInProgress = (transactionId) => {
  transactionCache.set(transactionId, Date.now());
};

// Mark transaction as completed
const markTransactionCompleted = (transactionId) => {
  transactionCache.delete(transactionId);
};

// Clean up old transaction cache entries
const cleanupTransactionCache = () => {
  const now = Date.now();
  const maxAge = 5 * 60 * 1000; // 5 minutes
  
  for (const [id, timestamp] of transactionCache.entries()) {
    if (now - timestamp > maxAge) {
      transactionCache.delete(id);
    }
  }
};

// Create a real NFT mint on Solana with enhanced error handling and deduplication
export const createRealNFT = async (invoiceData, userWallet, signTransaction) => {
  // Generate unique transaction ID to prevent duplicates
  const transactionId = generateTransactionId(userWallet, 'mint-nft');
  
  // Check if transaction is already in progress
  if (isTransactionInProgress(transactionId)) {
    throw new Error('NFT minting is already in progress for this wallet. Please wait for the current transaction to complete.');
  }
  
  // Mark transaction as in progress
  markTransactionInProgress(transactionId);
  
  try {
    console.log('🚀 Starting real Solana NFT minting...');
    
    // Clean up old cache entries
    cleanupTransactionCache();
    
    // Validate inputs
    if (!userWallet) {
      throw new Error('User wallet is required');
    }
    
    if (!signTransaction || typeof signTransaction !== 'function') {
      throw new Error('Sign transaction function is required');
    }
    
    if (!invoiceData) {
      throw new Error('Invoice data is required');
    }
    
    // Check wallet balance with retry
    const balance = await retryWithBackoff(async () => {
      const walletBalance = await connection.getBalance(userWallet);
      console.log('💰 Wallet balance:', walletBalance / LAMPORTS_PER_SOL, 'SOL');
      
      const minimumRequired = 0.01 * LAMPORTS_PER_SOL; // 0.01 SOL minimum
      console.log('💸 Minimum required:', minimumRequired / LAMPORTS_PER_SOL, 'SOL');
      
      if (walletBalance < minimumRequired) {
        throw new Error(`Insufficient balance. Required: ${minimumRequired / LAMPORTS_PER_SOL} SOL, Available: ${walletBalance / LAMPORTS_PER_SOL} SOL`);
      }
      
      console.log('✅ Wallet balance sufficient:', walletBalance / LAMPORTS_PER_SOL, 'SOL');
      return walletBalance;
    }, 'balance check');

    // Create a new keypair for the NFT mint
    const mintKeypair = Keypair.generate();
    const mintPublicKey = mintKeypair.publicKey;
    
    console.log('🎯 Generated mint keypair:', mintPublicKey.toBase58());

    // Get rent exemption for mint account (fixed amount for SPL tokens)
    const rentExemption = 1461600; // Fixed rent exemption for SPL token mint (0.0014616 SOL)
    console.log('💰 Rent exemption required:', rentExemption / LAMPORTS_PER_SOL, 'SOL');

    // Create the mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: userWallet,
      newAccountPubkey: mintPublicKey,
      space: MINT_SIZE,
      lamports: rentExemption,
      programId: TOKEN_PROGRAM_ID,
    });

    // Initialize mint instruction
    const initMintIx = createInitializeMintInstruction(
      mintPublicKey, // mint
      0, // decimals (0 for NFTs)
      userWallet, // mint authority
      null // freeze authority
    );

    // Create transaction
    const transaction = new Transaction();
    transaction.add(createMintAccountIx);
    transaction.add(initMintIx);

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userWallet;

    console.log('📝 Transaction created, requesting wallet signature...');
    console.log('📝 Transaction details:', {
      instructions: transaction.instructions.length,
      feePayer: transaction.feePayer?.toBase58(),
      recentBlockhash: transaction.recentBlockhash,
      signatures: transaction.signatures.length
    });

    // Sign transaction with wallet first (transaction should be clean)
    let signedTransaction;
    try {
      signedTransaction = await signTransaction(transaction);
      console.log('✅ Wallet signed transaction successfully');
    } catch (walletError) {
      console.error('❌ Wallet signing error:', walletError);
      throw new Error(`Wallet signing failed: ${walletError.message}`);
    }
    
    // Then add the mint keypair signature
    signedTransaction.partialSign(mintKeypair);
    console.log('✅ Mint keypair signature added');
    
    console.log('✅ Transaction signed, sending to Solana devnet...');

    // Send transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    
    console.log('📡 Transaction sent, signature:', signature);

    // Confirm transaction with timeout handling
    let confirmation;
    try {
      console.log('⏳ Confirming transaction...');
      confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      console.log('✅ Transaction confirmed successfully');
    } catch (confirmError) {
      console.log('⚠️ Transaction confirmation timed out, checking if it succeeded...');
      
      // Check if transaction actually succeeded despite timeout
      try {
        const txInfo = await connection.getTransaction(signature);
        if (txInfo && !txInfo.meta.err) {
          console.log('✅ Transaction actually succeeded! (confirmed via getTransaction)');
          confirmation = { value: { err: null } }; // Mock successful confirmation
        } else {
          throw new Error(`Transaction failed or not found: ${confirmError.message}`);
        }
      } catch (checkError) {
        throw new Error(`Transaction confirmation failed: ${confirmError.message}`);
      }
    }

    console.log('🎉 NFT mint created successfully on Solana devnet!');

    // Wait a moment for the mint account to be fully created
    console.log('⏳ Waiting for mint account to be fully created...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get associated token account address
    console.log('🎫 Getting associated token account address...');
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintPublicKey, // mint
      userWallet // owner
    );
    
    console.log('🎫 Token account address:', tokenAccountAddress.toBase58());

    // Create associated token account with enhanced error handling
    console.log('🎫 Creating associated token account...');
    let tokenAccount;
    
    const tokenAccountResult = await retryWithBackoff(async () => {
      // First, try to get the account to see if it exists
      try {
        const existingAccount = await connection.getAccountInfo(tokenAccountAddress);
        if (existingAccount) {
          console.log('🎫 Token account already exists');
          return { address: tokenAccountAddress, signature: null };
        } else {
          throw new Error('Account does not exist');
        }
      } catch (getError) {
        // Account doesn't exist, create it
        console.log('🎫 Token account does not exist, creating...');
        
        // Create the associated token account instruction
        const createTokenAccountIx = createAssociatedTokenAccountInstruction(
          userWallet, // payer
          tokenAccountAddress, // associated token account
          userWallet, // owner
          mintPublicKey // mint
        );
        
        // Create and send the token account creation transaction
        const tokenAccountTransaction = new Transaction();
        tokenAccountTransaction.add(createTokenAccountIx);
        
        const { blockhash: tokenBlockhash } = await connection.getLatestBlockhash();
        tokenAccountTransaction.recentBlockhash = tokenBlockhash;
        tokenAccountTransaction.feePayer = userWallet;
        
        // Sign and send token account creation transaction
        const signedTokenAccountTransaction = await signTransaction(tokenAccountTransaction);
        const tokenAccountSignature = await connection.sendRawTransaction(signedTokenAccountTransaction.serialize());
        
        console.log('📡 Token account creation transaction sent:', tokenAccountSignature);
        
        // Confirm token account creation
        console.log('⏳ Confirming token account creation...');
        const tokenConfirmation = await connection.confirmTransaction(tokenAccountSignature, 'confirmed');
        
        if (tokenConfirmation.value.err) {
          throw new Error(`Token account creation failed: ${tokenConfirmation.value.err}`);
        }
        
        console.log('✅ Token account created successfully');
        return { address: tokenAccountAddress, signature: tokenAccountSignature };
      }
    }, 'token account creation');
    
    tokenAccount = tokenAccountResult;
    
    console.log('🎫 Token account ready:', tokenAccount.address.toBase58());

    // Create mint to instruction with retry
    const mintToResult = await retryWithBackoff(async () => {
      const mintToIx = createMintToInstruction(
        mintPublicKey, // mint
        tokenAccount.address, // destination
        userWallet, // authority
        1 // amount (1 for NFT)
      );

      // Create and send mint transaction
      const mintTransaction = new Transaction();
      mintTransaction.add(mintToIx);
      
      const { blockhash: mintBlockhash } = await connection.getLatestBlockhash();
      mintTransaction.recentBlockhash = mintBlockhash;
      mintTransaction.feePayer = userWallet;

      // Sign and send mint transaction
      const signedMintTransaction = await signTransaction(mintTransaction);
      console.log('✅ Mint transaction signed by wallet');
      
      const mintToSignature = await connection.sendRawTransaction(signedMintTransaction.serialize());
      console.log('📡 Mint transaction sent:', mintToSignature);
      
      // Confirm mint transaction
      console.log('⏳ Confirming mint transaction...');
      const mintConfirmation = await connection.confirmTransaction(mintToSignature, 'confirmed');
      
      if (mintConfirmation.value.err) {
        throw new Error(`Mint transaction failed: ${mintConfirmation.value.err}`);
      }
      
      console.log('✅ Mint transaction confirmed successfully');
      return mintToSignature;
    }, 'mint to token account');

    console.log('🎨 Token minted to user account');

    // Mark transaction as completed
    markTransactionCompleted(transactionId);

    return {
      success: true,
      mintAddress: mintPublicKey.toBase58(),
      signature: signature,
      tokenAccount: tokenAccount.address.toBase58(),
      mintToSignature: mintToResult,
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      isReal: true
    };

  } catch (error) {
    console.error('❌ Error creating real NFT:', error);
    
    // Mark transaction as completed (even if failed)
    markTransactionCompleted(transactionId);
    
    // Provide specific error messages
    if (error.message.includes('User rejected')) {
      throw new Error('Transaction was cancelled by user');
    } else if (error.message.includes('already been processed')) {
      throw new Error('Transaction already processed. Please wait and try again.');
    } else if (error.message.includes('already in progress')) {
      throw new Error('NFT minting is already in progress for this wallet');
    } else if (error.message.includes('Insufficient')) {
      throw new Error('Insufficient SOL balance for transaction fees');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your connection and try again');
    } else {
      throw new Error(`Failed to mint NFT: ${error.message}`);
    }
  }
};

// Get wallet balance
export const getWalletBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

// Request airdrop for testing
export const requestAirdrop = async (publicKey, amount = 1) => {
  try {
    console.log('🪂 Requesting airdrop...');
    const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(signature);
    console.log('✅ Airdrop successful:', signature);
    return { success: true, signature };
  } catch (error) {
    console.error('❌ Airdrop failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createRealNFT,
  getWalletBalance,
  requestAirdrop,
  connection
};
