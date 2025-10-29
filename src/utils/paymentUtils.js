// Real payment utilities for NFT purchases and repayments
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

// Connect to Solana devnet with retry configuration
const connection = new Connection('https://api.devnet.solana.com', {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000, // 60 seconds
  disableRetryOnRateLimit: false
});

// Platform wallet address (you would replace this with your actual platform wallet)
const PLATFORM_WALLET = '5xvbCUPDr36U44u9DZuMVY1Uz9m1NruDfUKB7BnHTYgi'; // Using the same wallet for demo

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Input validation utilities
const validateWallet = (wallet) => {
  if (!wallet) {
    throw new Error('Wallet is required');
  }
  if (!wallet.toBase58 || typeof wallet.toBase58 !== 'function') {
    throw new Error('Invalid wallet object');
  }
  try {
    new PublicKey(wallet.toBase58());
  } catch {
    throw new Error('Invalid wallet address');
  }
};

const validateAmount = (amount) => {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Amount must be a positive number');
  }
  if (numAmount > 1000000) {
    throw new Error('Amount too large (max 1,000,000 SOL)');
  }
  return numAmount;
};

const validatePremium = (premium) => {
  const numPremium = parseFloat(premium);
  if (isNaN(numPremium) || numPremium < 0 || numPremium > 100) {
    throw new Error('Premium must be between 0 and 100');
  }
  return numPremium;
};

// Retry utility with exponential backoff
const retryWithBackoff = async (fn, context = 'operation') => {
  let lastError;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`🔄 ${context} attempt ${attempt}/${RETRY_CONFIG.maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ ${context} attempt ${attempt} failed:`, error.message);
      
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }
      
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );
      
      console.log(`⏳ Retrying ${context} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`${context} failed after ${RETRY_CONFIG.maxRetries} attempts: ${lastError.message}`);
};

// Enhanced balance checking with retry
const checkBalanceWithRetry = async (wallet, requiredAmount, operation = 'operation') => {
  return await retryWithBackoff(async () => {
    const balance = await connection.getBalance(wallet);
    const balanceInSOL = balance / LAMPORTS_PER_SOL;
    const requiredInSOL = requiredAmount / LAMPORTS_PER_SOL;
    
    if (balance < requiredAmount) {
      throw new Error(`Insufficient balance for ${operation}. Required: ${requiredInSOL.toFixed(4)} SOL, Available: ${balanceInSOL.toFixed(4)} SOL`);
    }
    
    console.log(`✅ Balance sufficient for ${operation}: ${balanceInSOL.toFixed(4)} SOL`);
    return balance;
  }, `balance check for ${operation}`);
};

// Real payment for purchasing an NFT with enhanced error handling and retry logic
export const purchaseNFT = async (invoiceData, buyerWallet, signTransaction) => {
  try {
    console.log('💳 Starting real NFT purchase transaction...');
    
    // Comprehensive input validation
    validateWallet(buyerWallet);
    
    if (!invoiceData || !invoiceData.amount) {
      throw new Error('Invoice data with amount is required');
    }

    if (!signTransaction || typeof signTransaction !== 'function') {
      throw new Error('Sign transaction function is required');
    }

    // Parse and validate amount
    // Handle different amount formats (string, number, or object)
    let amountValue;
    if (typeof invoiceData.amount === 'string') {
      amountValue = invoiceData.amount.replace(/[^\d.]/g, '');
    } else if (typeof invoiceData.amount === 'number') {
      amountValue = invoiceData.amount.toString();
    } else if (invoiceData.amount && typeof invoiceData.amount === 'object') {
      // Handle case where amount might be an object with value property
      amountValue = invoiceData.amount.value ? invoiceData.amount.value.toString() : invoiceData.amount.toString();
    } else {
      throw new Error('Invalid amount format. Amount must be a string or number.');
    }
    
    const amount = validateAmount(amountValue);
    const amountInLamports = Math.floor(amount * LAMPORTS_PER_SOL);
    
    console.log('💰 Purchase amount:', amount, 'SOL');
    console.log('💰 Amount in lamports:', amountInLamports);

    // Check buyer balance with retry
    const requiredBalance = amountInLamports + (0.01 * LAMPORTS_PER_SOL); // Add fee buffer
    await checkBalanceWithRetry(buyerWallet, requiredBalance, 'NFT purchase');

    // Create and send transaction with retry
    const result = await retryWithBackoff(async () => {
      // Create payment transaction
      const paymentTransaction = new Transaction();
      
      // Add payment instruction (transfer SOL to platform wallet)
      const paymentInstruction = SystemProgram.transfer({
        fromPubkey: buyerWallet,
        toPubkey: new PublicKey(PLATFORM_WALLET),
        lamports: amountInLamports,
      });
      
      paymentTransaction.add(paymentInstruction);

      // Get recent blockhash with retry
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      paymentTransaction.recentBlockhash = blockhash;
      paymentTransaction.feePayer = buyerWallet;

      console.log('📝 Payment transaction created, requesting wallet signature...');
      console.log('🔐 Transaction details:', {
        from: buyerWallet.toBase58(),
        to: PLATFORM_WALLET,
        amount: amount + ' SOL',
        lamports: amountInLamports
      });

      // Sign transaction with buyer wallet
      console.log('⏳ Waiting for wallet signature...');
      console.log('🔍 This should trigger a wallet popup for user to sign the transaction');
      
      const signedTransaction = await signTransaction(paymentTransaction);
      
      if (!signedTransaction || !signedTransaction.signatures || signedTransaction.signatures.length === 0) {
        throw new Error('Transaction was not properly signed by wallet');
      }
      
      console.log('✅ Payment transaction signed by wallet, sending to Solana devnet...');
      console.log('📡 Transaction signature will be requested from wallet...');
      console.log('🔐 Transaction signatures:', signedTransaction.signatures.length);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      
      console.log('📡 Payment transaction sent, signature:', signature);

      // Confirm transaction with enhanced error handling
      let confirmation;
      try {
        console.log('⏳ Confirming payment transaction...');
        confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
          const errorDetails = confirmation.value.err;
          if (typeof errorDetails === 'object' && errorDetails.InstructionError) {
            throw new Error(`Transaction failed at instruction ${errorDetails.InstructionError[0]}: ${errorDetails.InstructionError[1]}`);
          }
          throw new Error(`Payment transaction failed: ${JSON.stringify(errorDetails)}`);
        }
        console.log('✅ Payment transaction confirmed successfully');
      } catch (confirmError) {
        console.log('⚠️ Payment confirmation timed out, checking if it succeeded...');
        
        // Check if transaction actually succeeded despite timeout
        try {
          const txInfo = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txInfo && !txInfo.meta.err) {
            console.log('✅ Payment transaction actually succeeded! (confirmed via getTransaction)');
            confirmation = { value: { err: null } };
          } else {
            throw new Error(`Payment transaction failed or not found: ${confirmError.message}`);
          }
        } catch (checkError) {
          throw new Error(`Payment transaction confirmation failed: ${confirmError.message}`);
        }
      }

      return {
        success: true,
        signature: signature,
        amount: amount,
        amountInLamports: amountInLamports,
        buyerWallet: buyerWallet.toBase58(),
        platformWallet: PLATFORM_WALLET,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        isReal: true
      };
    }, 'NFT purchase transaction');

    console.log('🎉 NFT purchase completed successfully!');
    return result;

  } catch (error) {
    console.error('❌ Error processing payment:', error);
    
    // Enhanced error handling with specific messages
    if (error.message.includes('User rejected') || error.message.includes('User cancelled')) {
      throw new Error('Payment was cancelled by user. Please try again if you want to complete the purchase.');
    } else if (error.message.includes('insufficient funds') || error.message.includes('Insufficient balance')) {
      throw new Error('Insufficient SOL balance for payment. Please add more SOL to your wallet and try again.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Transaction timed out. Please check the transaction status and try again if needed.');
    } else if (error.message.includes('Invalid wallet') || error.message.includes('Invalid address')) {
      throw new Error('Invalid wallet. Please reconnect your wallet and try again.');
    } else if (error.message.includes('Amount must be') || error.message.includes('Premium must be')) {
      throw new Error(`Invalid input: ${error.message}`);
    } else {
      throw new Error(`Payment failed: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }
};

// Real repayment for invoice issuer to buy back the NFT with enhanced error handling
export const repayInvoice = async (invoiceData, issuerWallet, signTransaction) => {
  try {
    console.log('💸 Starting real invoice repayment transaction...');
    
    // Comprehensive input validation
    validateWallet(issuerWallet);
    
    if (!invoiceData || !invoiceData.amount || !invoiceData.repaymentPremium) {
      throw new Error('Invoice data with amount and premium is required');
    }

    if (!signTransaction || typeof signTransaction !== 'function') {
      throw new Error('Sign transaction function is required');
    }

    // Calculate and validate repayment amount (original amount + premium)
    // Handle different amount formats (string, number, or object)
    let amountValue;
    if (typeof invoiceData.amount === 'string') {
      amountValue = invoiceData.amount.replace(/[^\d.]/g, '');
    } else if (typeof invoiceData.amount === 'number') {
      amountValue = invoiceData.amount.toString();
    } else if (invoiceData.amount && typeof invoiceData.amount === 'object') {
      // Handle case where amount might be an object with value property
      amountValue = invoiceData.amount.value ? invoiceData.amount.value.toString() : invoiceData.amount.toString();
    } else {
      throw new Error('Invalid amount format. Amount must be a string or number.');
    }
    
    // Handle different premium formats
    let premiumValue;
    if (typeof invoiceData.repaymentPremium === 'string') {
      premiumValue = invoiceData.repaymentPremium.replace('%', '');
    } else if (typeof invoiceData.repaymentPremium === 'number') {
      premiumValue = invoiceData.repaymentPremium.toString();
    } else {
      throw new Error('Invalid premium format. Premium must be a string or number.');
    }
    
    const originalAmount = validateAmount(amountValue);
    const premium = validatePremium(premiumValue);
    const premiumAmount = (originalAmount * premium) / 100;
    const totalRepayment = originalAmount + premiumAmount;
    const totalInLamports = Math.floor(totalRepayment * LAMPORTS_PER_SOL);
    
    console.log('💰 Original amount:', originalAmount, 'SOL');
    console.log('💰 Premium amount:', premiumAmount, 'SOL');
    console.log('💰 Total repayment:', totalRepayment, 'SOL');
    console.log('💰 Total in lamports:', totalInLamports);

    // Check issuer balance with retry
    const requiredBalance = totalInLamports + (0.01 * LAMPORTS_PER_SOL); // Add fee buffer
    await checkBalanceWithRetry(issuerWallet, requiredBalance, 'invoice repayment');

    // Create and send transaction with retry
    const result = await retryWithBackoff(async () => {
      // Create repayment transaction
      const repaymentTransaction = new Transaction();
      
      // Add repayment instruction (transfer SOL to platform wallet)
      const repaymentInstruction = SystemProgram.transfer({
        fromPubkey: issuerWallet,
        toPubkey: new PublicKey(PLATFORM_WALLET),
        lamports: totalInLamports,
      });
      
      repaymentTransaction.add(repaymentInstruction);

      // Get recent blockhash with retry
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      repaymentTransaction.recentBlockhash = blockhash;
      repaymentTransaction.feePayer = issuerWallet;

      console.log('📝 Repayment transaction created, requesting wallet signature...');

      // Sign transaction with issuer wallet
      const signedTransaction = await signTransaction(repaymentTransaction);
      
      console.log('✅ Repayment transaction signed, sending to Solana devnet...');

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      
      console.log('📡 Repayment transaction sent, signature:', signature);

      // Confirm transaction with enhanced error handling
      let confirmation;
      try {
        console.log('⏳ Confirming repayment transaction...');
        confirmation = await connection.confirmTransaction(signature, 'confirmed');
        
        if (confirmation.value.err) {
          const errorDetails = confirmation.value.err;
          if (typeof errorDetails === 'object' && errorDetails.InstructionError) {
            throw new Error(`Transaction failed at instruction ${errorDetails.InstructionError[0]}: ${errorDetails.InstructionError[1]}`);
          }
          throw new Error(`Repayment transaction failed: ${JSON.stringify(errorDetails)}`);
        }
        console.log('✅ Repayment transaction confirmed successfully');
      } catch (confirmError) {
        console.log('⚠️ Repayment confirmation timed out, checking if it succeeded...');
        
        // Check if transaction actually succeeded despite timeout
        try {
          const txInfo = await connection.getTransaction(signature, {
            commitment: 'confirmed',
            maxSupportedTransactionVersion: 0
          });
          
          if (txInfo && !txInfo.meta.err) {
            console.log('✅ Repayment transaction actually succeeded! (confirmed via getTransaction)');
            confirmation = { value: { err: null } };
          } else {
            throw new Error(`Repayment transaction failed or not found: ${confirmError.message}`);
          }
        } catch (checkError) {
          throw new Error(`Repayment transaction confirmation failed: ${confirmError.message}`);
        }
      }

      return {
        success: true,
        signature: signature,
        originalAmount: originalAmount,
        premiumAmount: premiumAmount,
        totalRepayment: totalRepayment,
        totalInLamports: totalInLamports,
        issuerWallet: issuerWallet.toBase58(),
        platformWallet: PLATFORM_WALLET,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        isReal: true
      };
    }, 'invoice repayment transaction');

    console.log('🎉 Invoice repayment completed successfully!');
    return result;

  } catch (error) {
    console.error('❌ Error processing repayment:', error);
    
    // Enhanced error handling with specific messages
    if (error.message.includes('User rejected') || error.message.includes('User cancelled')) {
      throw new Error('Repayment was cancelled by user. Please try again if you want to complete the repayment.');
    } else if (error.message.includes('insufficient funds') || error.message.includes('Insufficient balance')) {
      throw new Error('Insufficient SOL balance for repayment. Please add more SOL to your wallet and try again.');
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      throw new Error('Transaction timed out. Please check the transaction status and try again if needed.');
    } else if (error.message.includes('Invalid wallet') || error.message.includes('Invalid address')) {
      throw new Error('Invalid wallet. Please reconnect your wallet and try again.');
    } else if (error.message.includes('Amount must be') || error.message.includes('Premium must be')) {
      throw new Error(`Invalid input: ${error.message}`);
    } else {
      throw new Error(`Repayment failed: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }
};

// Enhanced wallet balance checking with retry
export const getWalletBalance = async (publicKey) => {
  try {
    validateWallet({ toBase58: () => publicKey.toBase58() });
    
    return await retryWithBackoff(async () => {
      const balance = await connection.getBalance(publicKey);
      const balanceInSOL = balance / LAMPORTS_PER_SOL;
      console.log(`💰 Wallet balance: ${balanceInSOL.toFixed(4)} SOL`);
      return balanceInSOL;
    }, 'balance check');
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
};

// Request airdrop with retry and validation
export const requestAirdrop = async (publicKey, amount = 1) => {
  try {
    validateWallet({ toBase58: () => publicKey.toBase58() });
    
    if (amount <= 0 || amount > 2) {
      throw new Error('Airdrop amount must be between 0.1 and 2 SOL');
    }
    
    return await retryWithBackoff(async () => {
      console.log(`🪂 Requesting ${amount} SOL airdrop...`);
      const signature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Airdrop successful: ${signature}`);
      return {
        success: true,
        signature: signature,
        amount: amount,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };
    }, 'airdrop request');
  } catch (error) {
    console.error('Airdrop failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate transaction signature
export const validateTransaction = async (signature) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (transaction.meta.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(transaction.meta.err)}`);
    }
    
    return {
      success: true,
      transaction: transaction,
      confirmed: true
    };
  } catch (error) {
    console.error('Transaction validation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Rate limiting utility
const rateLimiter = new Map();
export const checkRateLimit = (operation, walletAddress, maxRequests = 10, windowMs = 60000) => {
  const now = Date.now();
  const key = `${operation}-${walletAddress}`;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, []);
  }
  
  const requests = rateLimiter.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  rateLimiter.set(key, validRequests);
  
  if (validRequests.length >= maxRequests) {
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil((validRequests[0] + windowMs - now) / 1000)} seconds before trying again.`);
  }
  
  // Add current request
  validRequests.push(now);
  rateLimiter.set(key, validRequests);
  
  return true;
};

// Input sanitization utility
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

export default {
  purchaseNFT,
  repayInvoice,
  getWalletBalance,
  requestAirdrop,
  validateTransaction,
  checkRateLimit,
  sanitizeInput,
  connection,
  PLATFORM_WALLET
};
