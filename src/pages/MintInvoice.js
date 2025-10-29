import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, FormControl, FormLabel, Input, Button, Stack, Select, Textarea, FormErrorMessage, FormHelperText, Divider, Tooltip, VStack, Icon, useToast, Alert, AlertIcon, Link, Spinner, Progress, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Badge, HStack, useBreakpointValue
} from '@chakra-ui/react';
import { InfoOutlineIcon, AttachmentIcon, CheckCircleIcon, ExternalLinkIcon, WarningIcon, CloseIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import RiskScoring from '../components/RiskScoring';
import { mintInvoiceNFT } from '../utils/metaplex';
import { getWalletBalance, requestAirdrop, checkRateLimit, sanitizeInput } from '../utils/paymentUtils';

const initialState = {
  invoiceNumber: '',
  amount: '',
  currency: 'USDC',
  dueDate: '',
  repaymentPremium: '',
  creditScore: '',
  paymentTerms: '',
  lineItems: '',
  invoiceFile: null,
  invoiceFileHash: '',
  notes: '',
  businessName: '',
  businessRegistration: '',
  businessWebsite: '',
};

function arrayBufferToHex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

const saveInvoiceToMarketplace = (invoice) => {
  const data = localStorage.getItem('marketplaceInvoices');
  const invoices = data ? JSON.parse(data) : [];
  invoices.push(invoice);
  localStorage.setItem('marketplaceInvoices', JSON.stringify(invoices));
};

const MintInvoice = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [hashing, setHashing] = useState(false);
  const [minting, setMinting] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [airdropLoading, setAirdropLoading] = useState(false);
  const [operationProgress, setOperationProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { connected, publicKey, signTransaction } = useWallet();
  const toast = useToast();
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onClose: onErrorClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Check balance when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkWalletBalance();
    }
  }, [connected, publicKey]);

  // Enhanced input validation
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'invoiceNumber':
        if (!value.trim()) {
          errors.invoiceNumber = 'Invoice number is required';
        } else if (value.length < 3) {
          errors.invoiceNumber = 'Invoice number must be at least 3 characters';
        } else if (!/^[A-Za-z0-9-_]+$/.test(value)) {
          errors.invoiceNumber = 'Invoice number can only contain letters, numbers, hyphens, and underscores';
        }
        break;
        
      case 'amount':
        const amount = parseFloat(value);
        if (!value.trim()) {
          errors.amount = 'Amount is required';
        } else if (isNaN(amount) || amount <= 0) {
          errors.amount = 'Amount must be a positive number';
        } else if (amount > 1000000) {
          errors.amount = 'Amount too large (max 1,000,000)';
        } else if (amount < 0.000001) {
          errors.amount = 'Amount too small (min 0.000001)';
        }
        break;
        
      case 'repaymentPremium':
        const premium = parseFloat(value);
        if (!value.trim()) {
          errors.repaymentPremium = 'Premium is required';
        } else if (isNaN(premium) || premium < 0 || premium > 100) {
          errors.repaymentPremium = 'Premium must be between 0 and 100';
        }
        break;
        
      case 'creditScore':
        const score = parseInt(value);
        if (!value.trim()) {
          errors.creditScore = 'Credit score is required';
        } else if (isNaN(score) || score < 0 || score > 850) {
          errors.creditScore = 'Credit score must be between 0 and 850';
        }
        break;
        
      case 'dueDate':
        if (!value) {
          errors.dueDate = 'Due date is required';
        } else if (new Date(value) <= new Date()) {
          errors.dueDate = 'Due date must be in the future';
        } else if (new Date(value) > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) {
          errors.dueDate = 'Due date cannot be more than 1 year in the future';
        }
        break;
        
      case 'businessName':
        if (!value.trim()) {
          errors.businessName = 'Business name is required';
        } else if (value.length < 2) {
          errors.businessName = 'Business name must be at least 2 characters';
        } else if (value.length > 100) {
          errors.businessName = 'Business name must be less than 100 characters';
        }
        break;
        
      case 'businessWebsite':
        if (!value.trim()) {
          errors.businessWebsite = 'Business website is required';
        } else if (!/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(value)) {
          errors.businessWebsite = 'Please enter a valid URL (e.g., https://example.com)';
        }
        break;
        
      case 'businessRegistration':
        if (!value.trim()) {
          errors.businessRegistration = 'Business registration is required';
        } else if (value.length < 3) {
          errors.businessRegistration = 'Registration must be at least 3 characters';
        }
        break;
        
      case 'paymentTerms':
        if (!value.trim()) {
          errors.paymentTerms = 'Payment terms are required';
        }
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Sanitize input
    const sanitizedValue = sanitizeInput(value);
    
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : sanitizedValue }));
    
    // Real-time validation
    const fieldErrors = validateField(name, sanitizedValue);
    setErrors((prev) => ({ ...prev, ...fieldErrors }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, invoiceFile: file, invoiceFileHash: '' }));
    if (file) {
      setHashing(true);
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashHex = arrayBufferToHex(hashBuffer);
      setForm((prev) => ({ ...prev, invoiceFileHash: hashHex }));
      setHashing(false);
    }
  };

  const fillDemoData = async () => {
    const demoData = {
      invoiceNumber: `INV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      businessName: 'Test Corp Inc.',
      amount: '1', // 1 SOL for easy testing
      currency: 'SOL', // Changed to SOL for testing
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      repaymentPremium: '10', // 10% premium for testing
      paymentTerms: 'Net 30',
      creditScore: '750',
      businessRegistration: 'REG-TEST-123456',
      businessWebsite: 'https://test-corp.com',
      notes: 'Test invoice for payment testing - 1 SOL with 10% premium',
      lineItems: 'Test Product - 1 SOL\nService Fee - Included'
    };
    
    // Simulate file upload for demo
    setHashing(true);
    const mockFile = {
      name: 'monkedao.jpg',
      type: 'image/jpeg',
      size: 245760, // Mock file size
      lastModified: Date.now()
    };
    
    // Generate a mock hash for the demo file
    const mockHash = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
    
    setForm({
      ...demoData,
      invoiceFile: mockFile,
      invoiceFileHash: mockHash
    });
    setErrors({});
    setHashing(false);
    
    toast({
      title: "Demo Data Loaded!",
      description: "Form filled with 1 SOL + 10% premium test data including monkedao.jpg invoice file",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const clearForm = () => {
    setForm(initialState);
    setErrors({});
    setSubmitted(false);
    setMintResult(null);
    
    toast({
      title: "Form Cleared!",
      description: "All fields have been reset",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const checkWalletBalance = async (showToast = false) => {
    if (!publicKey) return;
    
    setCheckingBalance(true);
    setCurrentOperation('Checking wallet balance...');
    setOperationProgress(20);
    
    try {
      const balance = await getWalletBalance(publicKey);
      setWalletBalance(balance);
      setOperationProgress(100);
      
      if (showToast) {
        toast({
          title: "Balance Checked",
          description: `Wallet balance: ${balance.toFixed(4)} SOL`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      
      console.log('Wallet balance checked:', balance, 'SOL');
    } catch (error) {
      console.error('Error checking balance:', error);
      setWalletBalance(0);
      
      const errorMessage = error.message || 'Could not check wallet balance';
      
      if (showToast) {
        toast({
          title: "Balance Check Failed",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Show detailed error modal
      setErrorDetails({
        title: 'Balance Check Failed',
        message: errorMessage,
        type: 'balance'
      });
      onErrorOpen();
    } finally {
      setCheckingBalance(false);
      setCurrentOperation('');
      setOperationProgress(0);
    }
  };

  const requestAirdrop = async () => {
    if (!publicKey) return;
    
    setAirdropLoading(true);
    setCurrentOperation('Requesting SOL airdrop...');
    setOperationProgress(30);
    
    try {
      // Check rate limit
      checkRateLimit('airdrop', publicKey.toBase58(), 3, 300000); // 3 requests per 5 minutes
      
      const result = await requestAirdrop(publicKey, 1);
      setOperationProgress(80);
      
      if (result.success) {
        toast({
          title: "Airdrop Successful!",
          description: "1 SOL has been added to your wallet",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh balance
        await checkWalletBalance();
        setOperationProgress(100);
      } else {
        throw new Error(result.error || 'Airdrop failed');
      }
    } catch (error) {
      console.error('Airdrop error:', error);
      
      const errorMessage = error.message || "Could not request airdrop";
      
      toast({
        title: "Airdrop Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      // Show detailed error modal
      setErrorDetails({
        title: 'Airdrop Failed',
        message: errorMessage,
        type: 'airdrop',
        canRetry: true
      });
      onErrorOpen();
    } finally {
      setAirdropLoading(false);
      setCurrentOperation('');
      setOperationProgress(0);
    }
  };

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You are back online",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "Please check your internet connection",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Auto-load demo data for first-time demo users
  useEffect(() => {
    const hasSeenDemo = localStorage.getItem('hasSeenInvoiceDemo');
    if (!hasSeenDemo && !form.invoiceFile) {
      // Auto-load demo data after a short delay to let the component mount
      const timer = setTimeout(() => {
        fillDemoData();
        localStorage.setItem('hasSeenInvoiceDemo', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    
    // Validate all fields using the enhanced validation function
    Object.keys(form).forEach(fieldName => {
      if (fieldName !== 'invoiceFile' && fieldName !== 'invoiceFileHash' && fieldName !== 'notes' && fieldName !== 'lineItems') {
        const fieldErrors = validateField(fieldName, form[fieldName]);
        Object.assign(newErrors, fieldErrors);
      }
    });

    // Custom validation for invoice file - check if we have either a real file or demo file
    if (!form.invoiceFileHash && !form.invoiceFile) {
      newErrors.invoiceFileHash = 'Please select a file or use the demo data';
    }

    return newErrors;
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    if (errorDetails?.type === 'airdrop') {
      await requestAirdrop();
    } else if (errorDetails?.type === 'balance') {
      await checkWalletBalance(true);
    } else if (errorDetails?.type === 'mint') {
      await handleSubmit({ preventDefault: () => {} });
    }
    
    onErrorClose();
  };

  // Dynamic calculation for user clarity
  const amountNum = parseFloat(form.amount);
  const premiumNum = parseFloat(form.repaymentPremium);
  const showCalculation = !isNaN(amountNum) && amountNum > 0 && !isNaN(premiumNum) && premiumNum >= 0;
  const investorRepayment = showCalculation ? (amountNum * (1 + premiumNum / 100)).toFixed(2) : '';

  const fieldTooltips = {
    invoiceNumber: 'A unique identifier for your invoice (e.g. INV-2025-001).',
    amount: 'The face value of the invoice. This is the amount you are seeking to finance.',
    currency: 'The currency in which the invoice is denominated.',
    dueDate: 'The date by which the invoice must be repaid.',
    repaymentPremium: 'The extra percentage you will pay the investor at maturity.',
    creditScore: 'Estimate of your business creditworthiness (0-850).',
    paymentTerms: 'When payment is expected (e.g. Net 30, Due on receipt).',
    lineItems: 'List the goods/services covered by this invoice, one per line.',
    invoiceFile: 'Upload the original invoice file (PDF/DOC). Only the hash is stored on-chain.',
    businessName: 'The legal name of your business.',
    businessRegistration: 'Official registration or tax ID number.',
    businessWebsite: 'Public website for due diligence.',
    notes: 'Any extra information for investors or verification.'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if offline
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your internet connection and try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      if (!connected) {
        toast({
          title: "Wallet Required",
          description: "Please connect your wallet to mint invoice NFTs",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Check rate limit
      try {
        checkRateLimit('mint', publicKey.toBase58(), 5, 300000); // 5 mints per 5 minutes
      } catch (rateLimitError) {
        toast({
          title: "Rate Limit Exceeded",
          description: rateLimitError.message,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setMinting(true);
      setCurrentOperation('Preparing to mint NFT...');
      setOperationProgress(10);
      
      try {
        // Check balance before minting
        setCurrentOperation('Checking wallet balance...');
        setOperationProgress(20);
        await checkWalletBalance();
        
        // Mint real NFT on Solana
        setCurrentOperation('Minting NFT on Solana...');
        setOperationProgress(50);
        const result = await mintInvoiceNFT(form, publicKey, signTransaction);
        setOperationProgress(80);
        
        if (result.success) {
          setMintResult(result);
          setSubmitted(true);
          setOperationProgress(90);
          
          // Save to marketplace for demo (with real NFT data)
          const newInvoice = {
            id: Date.now().toString(),
            invoiceNumber: form.invoiceNumber,
            business: publicKey?.toBase58() || 'Unknown', // Store wallet address instead of business name
            businessName: form.businessName, // Keep business name for display
            amount: `${Number(form.amount).toLocaleString()} ${form.currency}`,
            dueDate: form.dueDate,
            repaymentPremium: `${form.repaymentPremium}%`,
            status: 'Available',
            description: form.notes || 'No description provided.',
            paymentTerms: form.paymentTerms,
            creditScore: form.creditScore,
            lineItems: form.lineItems.split('\n').filter(Boolean),
            nftMintAddress: result.mintAddress,
            nftSignature: result.signature,
            nftMetadataUri: result.metadataUri,
          };
          saveInvoiceToMarketplace(newInvoice);
          setOperationProgress(100);
          
          toast({
            title: "NFT Minted Successfully!",
            description: `Invoice NFT created and added to marketplace. Check your dashboard for updates.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          
          // Auto-clear form after 5 seconds
          setTimeout(() => {
            setForm(initialState);
            setSubmitted(false);
            setMintResult(null);
            checkWalletBalance(); // Refresh balance after mint
          }, 5000);
        }
      } catch (error) {
        console.error('Minting error:', error);
        
        const errorMessage = error.message || "Failed to mint invoice NFT. Please try again.";
        
        toast({
          title: "Minting Failed",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        
        // Show detailed error modal
        setErrorDetails({
          title: 'Minting Failed',
          message: errorMessage,
          type: 'mint',
          canRetry: true
        });
        onErrorOpen();
      } finally {
        setMinting(false);
        setCurrentOperation('');
        setOperationProgress(0);
      }
    }
  };

  return (
    <Box maxW="6xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={6} color="gray.800" fontSize="2xl" fontWeight="bold">
        Mint Invoice as NFT
      </Heading>
      
      <Stack direction={{ base: 'column', lg: 'row' }} spacing={8} align="flex-start">
            <Box flex="2" w="full" p={6} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
              {submitted ? (
                <VStack spacing={4} py={8}>
                  <Icon as={CheckCircleIcon} boxSize={12} color="green.500" />
                  <Text color="green.600" fontWeight="bold" fontSize="lg">
                    Invoice NFT Successfully Minted!
                  </Text>
                  <Text color="gray.600" textAlign="center">
                    Your invoice has been minted as an NFT on Solana devnet and added to the marketplace.
                  </Text>
                  {mintResult?.isSimulated ? (
                    <Text color="blue.600" fontSize="sm" textAlign="center" fontStyle="italic">
                      Note: This is a simulation for hackathon demo purposes
                    </Text>
                  ) : (
                    <Text color="green.600" fontSize="sm" textAlign="center" fontStyle="italic">
                      ✅ Real transaction on Solana devnet
                    </Text>
                  )}
                  
                  {mintResult && (
                    <VStack spacing={3} mt={4} p={4} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                      <Text fontSize="sm" color="green.700" fontWeight="bold">
                        🎉 Real NFT Details (Solana Devnet):
                      </Text>
                      <Text fontSize="xs" color="green.600" wordBreak="break-all">
                        <strong>Mint Address:</strong> {mintResult.mintAddress}
                      </Text>
                      <Text fontSize="xs" color="green.600" wordBreak="break-all">
                        <strong>Transaction:</strong> {mintResult.signature}
                      </Text>
                      {mintResult.tokenAccount && (
                        <Text fontSize="xs" color="green.600" wordBreak="break-all">
                          <strong>Token Account:</strong> {mintResult.tokenAccount}
                        </Text>
                      )}
                      {mintResult.mintToSignature && (
                        <Text fontSize="xs" color="green.600" wordBreak="break-all">
                          <strong>Mint Signature:</strong> {mintResult.mintToSignature}
                        </Text>
                      )}
                      <Link
                        href={mintResult.explorerUrl || `https://explorer.solana.com/tx/${mintResult.signature}?cluster=devnet`}
                        isExternal
                        color="blue.500"
                        fontSize="xs"
                      >
                        View on Solana Explorer <ExternalLinkIcon mx="2px" />
                      </Link>
                    </VStack>
                  )}
                </VStack>
              ) : (
                <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
                {/* Wallet Balance Section */}
                {connected && (
                  <Box p={4} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                    <Text fontSize="sm" color="purple.700" mb={2} fontWeight="bold">
                      🌐 Network: Solana Devnet (Testnet)
                    </Text>
                    <Text fontSize="sm" color="purple.700" mb={3} fontWeight="bold">
                      💰 Wallet Balance: {checkingBalance ? 'Checking...' : `${walletBalance.toFixed(4)} SOL`}
                    </Text>
                    <Text fontSize="xs" color="purple.600" mb={3}>
                      Note: Your mainnet SOL won't show here. This is devnet for testing.
                    </Text>
                    <Stack direction="row" spacing={3} justify="center">
                      <Button 
                        colorScheme="purple" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => checkWalletBalance(true)}
                        isLoading={checkingBalance}
                        loadingText="Checking..."
                      >
                        Check Balance
                      </Button>
                      <Button 
                        colorScheme="green" 
                        variant="outline" 
                        size="sm" 
                        onClick={requestAirdrop}
                        isDisabled={minting}
                      >
                        Get 1 SOL (Airdrop)
                      </Button>
                    </Stack>
                  </Box>
                )}

                {/* Demo Data Buttons */}
                <Box textAlign="center" p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                  <Text fontSize="sm" color="blue.700" mb={3}>
                    🚀 Quick Testing: Fill form with demo data including mock invoice file
                  </Text>
                  <Stack direction="row" spacing={3} justify="center" wrap="wrap">
                    <Button 
                      colorScheme="blue" 
                      variant="outline" 
                      size="sm" 
                      onClick={fillDemoData}
                      isDisabled={minting}
                      isLoading={hashing}
                      loadingText="Loading Demo..."
                    >
                      Fill Demo Data (1 SOL + 10% + monkedao.jpg)
                    </Button>
                    <Button 
                      colorScheme="purple" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        const mockFile = {
                          name: 'monkedao.jpg',
                          type: 'image/jpeg',
                          size: 245760,
                          lastModified: Date.now()
                        };
                        const mockHash = 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456';
                        setForm(prev => ({ ...prev, invoiceFile: mockFile, invoiceFileHash: mockHash }));
                        toast({
                          title: "Demo Invoice File Loaded!",
                          description: "monkedao.jpg has been added to the form",
                          status: "success",
                          duration: 2000,
                          isClosable: true,
                        });
                      }}
                      isDisabled={minting}
                    >
                      Load monkedao.jpg
                    </Button>
                    <Button 
                      colorScheme="gray" 
                      variant="outline" 
                      size="sm" 
                      onClick={clearForm}
                      isDisabled={minting}
                    >
                      Clear Form
                    </Button>
                  </Stack>
                </Box>
                
                {/* Invoice Details (moved to top) */}
                <Box>
                  <Heading size="md" mb={2}>Invoice Details</Heading>
                  <Stack spacing={3}>
                    <FormControl isInvalid={!!errors.invoiceNumber} isRequired>
                      <FormLabel>Invoice Number <Tooltip label={fieldTooltips.invoiceNumber}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="invoiceNumber" value={form.invoiceNumber} onChange={handleChange} />
                      <FormHelperText>Unique identifier for this invoice (e.g. INV-2025-001).</FormHelperText>
                      <FormErrorMessage>{errors.invoiceNumber}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.amount} isRequired>
                      <FormLabel>Invoice Amount <Tooltip label={fieldTooltips.amount}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="amount" type="number" min={1} value={form.amount} onChange={handleChange} />
                      <FormHelperText>How much funding are you seeking? Enter the face value of the invoice (before premium).</FormHelperText>
                      <FormErrorMessage>{errors.amount}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Currency <Tooltip label={fieldTooltips.currency}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Select name="currency" value={form.currency} onChange={handleChange}>
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                        <option value="SOL">SOL</option>
                        <option value="EURO">EURO</option>
                      </Select>
                      <FormHelperText>Select the currency in which the invoice is denominated.</FormHelperText>
                    </FormControl>
                    <FormControl isInvalid={!!errors.dueDate} isRequired>
                      <FormLabel>Due Date <Tooltip label={fieldTooltips.dueDate}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
                      <FormHelperText>When is the invoice due to be repaid? Must be a future date.</FormHelperText>
                      <FormErrorMessage>{errors.dueDate}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.repaymentPremium} isRequired>
                      <FormLabel>Repayment Premium <Tooltip label={fieldTooltips.repaymentPremium}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="repaymentPremium" type="number" min={0} max={100} value={form.repaymentPremium} onChange={handleChange} />
                      <FormHelperText>
                        How much extra will you pay the investor at maturity, as a percentage of the invoice amount? For example, if you enter 10%, you will receive $10,000 now and the investor will be repaid $11,000 at maturity.
                      </FormHelperText>
                      {showCalculation && (
                        <Text fontSize="sm" color="blue.600" mt={1}>
                          You will receive: <b>${amountNum.toLocaleString(undefined, {maximumFractionDigits: 2})}</b> now.<br />
                          The investor will be repaid: <b>${Number(investorRepayment).toLocaleString(undefined, {maximumFractionDigits: 2})}</b> at maturity.
                        </Text>
                      )}
                      <Box mt={2} display="flex" alignItems="center">
                        <InfoOutlineIcon color="teal.500" mr={2} />
                        <Text fontSize="sm" color="gray.600">
                          You will be responsible for repaying the full invoice amount to the NFT holder by the due date. This amount includes the premium set above.
                        </Text>
                      </Box>
                      <FormErrorMessage>{errors.repaymentPremium}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.creditScore} isRequired>
                      <FormLabel>Credit Score <Tooltip label={fieldTooltips.creditScore}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="creditScore" type="number" min={0} max={850} value={form.creditScore} onChange={handleChange} placeholder="0-850" />
                      <FormHelperText>Estimate the business's creditworthiness (0 = poor, 850 = excellent). Used for investor risk assessment.</FormHelperText>
                      <FormErrorMessage>{errors.creditScore}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.paymentTerms} isRequired>
                      <FormLabel>Payment Terms <Tooltip label={fieldTooltips.paymentTerms}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="paymentTerms" value={form.paymentTerms} onChange={handleChange} placeholder="e.g. Net 30, Due on receipt" />
                      <FormHelperText>Describe when payment is expected (e.g. Net 30 = due in 30 days).</FormHelperText>
                      <FormErrorMessage>{errors.paymentTerms}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.lineItems} isRequired>
                      <FormLabel>Line Items <Tooltip label={fieldTooltips.lineItems}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Textarea name="lineItems" value={form.lineItems} onChange={handleChange} />
                      <FormHelperText>List the goods/services covered by this invoice, one per line.</FormHelperText>
                      <FormErrorMessage>{errors.lineItems}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.invoiceFileHash && !form.invoiceFile}>
                      <FormLabel>Invoice File <Tooltip label={fieldTooltips.invoiceFile}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Box position="relative">
                        <Input 
                          name="invoiceFile" 
                          type="file" 
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                          onChange={handleFileChange}
                          opacity={form.invoiceFile ? 0.5 : 1}
                          pointerEvents={form.invoiceFile ? "none" : "auto"}
                        />
                        {form.invoiceFile && (
                          <Box 
                            position="absolute" 
                            top="0" 
                            left="0" 
                            right="0" 
                            bottom="0" 
                            bg="purple.50" 
                            borderRadius="md" 
                            border="2px dashed" 
                            borderColor="purple.300"
                            display="flex" 
                            alignItems="center" 
                            justifyContent="center"
                            cursor="pointer"
                            onClick={() => {
                              // Clear the demo file to allow new file selection
                              setForm(prev => ({ ...prev, invoiceFile: null, invoiceFileHash: '' }));
                            }}
                          >
                            <VStack spacing={1}>
                              <Icon as={CheckCircleIcon} color="purple.500" boxSize={6} />
                              <Text fontSize="sm" fontWeight="bold" color="purple.700">
                                Demo File Loaded
                              </Text>
                              <Text fontSize="xs" color="purple.600">
                                Click to change file
                              </Text>
                            </VStack>
                          </Box>
                        )}
                      </Box>
                      <FormHelperText>
                        Upload the original invoice file. Only the SHA-256 hash will be stored on-chain for verification.
                        <br />
                        <Text as="span" color="purple.600" fontWeight="bold">
                          💡 Demo Tip: Use "Fill Demo Data" button above to automatically load monkedao.jpg
                        </Text>
                      </FormHelperText>
                      {form.invoiceFile && (
                        <Box mt={2} p={3} bg={form.invoiceFile.name === 'monkedao.jpg' ? 'purple.50' : 'green.50'} borderRadius="md" border="1px solid" borderColor={form.invoiceFile.name === 'monkedao.jpg' ? 'purple.200' : 'green.200'}>
                          <HStack spacing={2} mb={2}>
                            <Icon as={CheckCircleIcon} color={form.invoiceFile.name === 'monkedao.jpg' ? 'purple.500' : 'green.500'} />
                            <Text fontSize="sm" fontWeight="bold" color={form.invoiceFile.name === 'monkedao.jpg' ? 'purple.700' : 'green.700'}>
                              {form.invoiceFile.name === 'monkedao.jpg' ? '🎯 Demo File Selected:' : 'File Selected:'} {form.invoiceFile.name}
                            </Text>
                            {form.invoiceFile.name === 'monkedao.jpg' && (
                              <Badge colorScheme="purple" variant="solid" fontSize="xs">
                                DEMO
                              </Badge>
                            )}
                          </HStack>
                          <Text fontSize="xs" color="gray.600">
                            Size: {(form.invoiceFile.size / 1024).toFixed(1)} KB | Type: {form.invoiceFile.type}
                          </Text>
                          {form.invoiceFile.name === 'monkedao.jpg' && (
                            <Text fontSize="xs" color="purple.600" fontWeight="bold" mt={1}>
                              🚀 Perfect for demo! This file will be used for testing the invoice minting process.
                            </Text>
                          )}
                        </Box>
                      )}
                      {form.invoiceFileHash && (
                        <Box mt={2} p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                          <Text fontSize="sm" color="blue.700" fontWeight="bold" mb={1}>
                            SHA-256 Hash (On-Chain Verification):
                          </Text>
                          <Text fontSize="xs" color="gray.600" wordBreak="break-all" fontFamily="mono">
                            {form.invoiceFileHash}
                          </Text>
                        </Box>
                      )}
                      {hashing && <Text fontSize="sm" color="blue.500">Hashing file...</Text>}
                      <FormErrorMessage>{errors.invoiceFileHash}</FormErrorMessage>
                    </FormControl>
                    <FormControl isReadOnly>
                      <FormLabel>Status</FormLabel>
                      <Input value="Unfunded" isReadOnly />
                      <FormHelperText>This invoice is not yet funded. Status will update when purchased by an investor.</FormHelperText>
                    </FormControl>
                  </Stack>
                </Box>
                <Divider />
                {/* Business Details (moved to bottom) */}
                <Box>
                  <Heading size="md" mb={2}>Business Details</Heading>
                  <Stack spacing={3}>
                    <FormControl isInvalid={!!errors.businessName} isRequired>
                      <FormLabel>Business Name <Tooltip label={fieldTooltips.businessName}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="businessName" value={form.businessName} onChange={handleChange} />
                      <FormHelperText>The legal name of the business issuing the invoice.</FormHelperText>
                      <FormErrorMessage>{errors.businessName}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.businessRegistration} isRequired>
                      <FormLabel>Business Registration Number <Tooltip label={fieldTooltips.businessRegistration}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="businessRegistration" value={form.businessRegistration} onChange={handleChange} />
                      <FormHelperText>Official registration or tax ID number for verification.</FormHelperText>
                      <FormErrorMessage>{errors.businessRegistration}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={!!errors.businessWebsite} isRequired>
                      <FormLabel>Business Website <Tooltip label={fieldTooltips.businessWebsite}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Input name="businessWebsite" value={form.businessWebsite} onChange={handleChange} placeholder="https://example.com" />
                      <FormHelperText>Public website for due diligence. Must start with http:// or https://</FormHelperText>
                      <FormErrorMessage>{errors.businessWebsite}</FormErrorMessage>
                    </FormControl>
                  </Stack>
                </Box>
                <Divider />
                {/* Advanced */}
                <Box>
                  <Heading size="md" mb={2}>Advanced</Heading>
                  <Stack spacing={3}>
                    <FormControl>
                      <FormLabel>Additional Notes <Tooltip label={fieldTooltips.notes}><InfoOutlineIcon ml={1} color="teal.500" /></Tooltip></FormLabel>
                      <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Optional notes for investors or verification." />
                      <FormHelperText>Any extra information for investors or for verification purposes.</FormHelperText>
                    </FormControl>
                  </Stack>
                </Box>
                {!connected ? (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <VStack spacing={2} align="start">
                      <Text fontSize="sm" fontWeight="bold">
                        Please connect your wallet to mint invoice NFTs
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        Make sure your wallet is set to Solana Devnet (Testnet) for testing
                      </Text>
                    </VStack>
                  </Alert>
                ) : (
                  <Button 
                    type="submit" 
                    colorScheme="teal" 
                    size="lg" 
                    w="full" 
                    leftIcon={minting ? <Spinner size="sm" /> : <AttachmentIcon />}
                    isLoading={minting}
                    loadingText="Minting on Solana..."
                    isDisabled={minting}
                  >
                    {minting ? 'Minting on Solana...' : '🚀 Mint Real NFT on Solana'}
                  </Button>
                )}
                </Stack>
                </form>
              )}
            </Box>

            {/* Risk Scoring Sidebar */}
            <Box flex="1">
              <RiskScoring invoice={form} />
            </Box>
          </Stack>

          {/* Enhanced Loading and Progress Indicators */}
          {(minting || checkingBalance || airdropLoading) && (
            <Box mt={6} p={4} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <HStack spacing={3} mb={3}>
                <Spinner size="sm" color="blue.500" />
                <Text fontSize="sm" color="blue.700" fontWeight="medium">
                  {currentOperation || 'Processing...'}
                </Text>
              </HStack>
              <Progress 
                value={operationProgress} 
                colorScheme="blue" 
                size="sm" 
                borderRadius="md"
                isAnimated
              />
              {retryCount > 0 && (
                <Text fontSize="xs" color="blue.600" mt={2}>
                  Retry attempt: {retryCount}
                </Text>
              )}
            </Box>
          )}

          {/* Network Status Indicator */}
          {!isOnline && (
            <Alert status="warning" mt={4} borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">
                You are offline. Some features may not work properly.
              </Text>
            </Alert>
          )}

          {/* Error Modal */}
          <Modal isOpen={isErrorOpen} onClose={onErrorClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <HStack>
                  <Icon as={WarningIcon} color="red.500" />
                  <Text>{errorDetails?.title || 'Error'}</Text>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb={4}>{errorDetails?.message}</Text>
                {errorDetails?.type === 'balance' && (
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Text fontSize="sm">
                      You may need to request an airdrop to get SOL for testing.
                    </Text>
                  </Alert>
                )}
                {errorDetails?.type === 'mint' && (
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Text fontSize="sm">
                      Make sure you have enough SOL for transaction fees (at least 0.01 SOL).
                    </Text>
                  </Alert>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onErrorClose}>
                  Close
                </Button>
                {errorDetails?.canRetry && (
                  <Button colorScheme="blue" onClick={handleRetry}>
                    Retry
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Box>
  );
};

export default MintInvoice; 