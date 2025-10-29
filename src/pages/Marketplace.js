import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Stack, SimpleGrid, Button, Badge, Tooltip, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, Table, Tbody, Tr, Td, useToast, Input, Select, Checkbox, Tabs, TabList, TabPanels, Tab, TabPanel, Image, Flex, Skeleton, SkeletonText, useBreakpointValue, useColorModeValue, motion, VStack, HStack, Icon, Alert, AlertIcon, Spinner, Progress, useDisclosure as useDisclosureHook } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
import { purchaseNFT, repayInvoice, checkRateLimit, sanitizeInput } from '../utils/paymentUtils';
import { SearchIcon, FilterIcon, ArrowUpIcon, EditIcon, WarningIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import InvoiceCard from '../components/InvoiceCard';
import AuctionSystem from '../components/AuctionSystem';
import PortfolioBuilder from '../components/PortfolioBuilder';
import RiskScoring from '../components/RiskScoring';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';

const dummyInvoices = [
  {
    id: 'test-1',
    invoiceNumber: 'TEST-001',
    business: 'Test Corp Inc.',
    amount: '1 SOL',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    repaymentPremium: '10%',
    status: 'Available',
    description: 'Test invoice for payment testing - 1 SOL with 10% premium. Perfect for testing the full payment cycle!',
    paymentTerms: 'Net 30',
    creditScore: 750,
    lineItems: ['Test Product - 1 SOL', 'Service Fee - Included'],
    nftMintAddress: 'testMint123abc',
    nftSignature: 'testSig456def',
    nftMetadataUri: 'https://arweave.net/test-metadata-1',
  },
  {
    id: '1',
    invoiceNumber: 'INV-001',
    business: 'Acme Corp',
    amount: '1,000 USDC',
    dueDate: '2025-08-01',
    repaymentPremium: '5%',
    status: 'Available',
    description: 'Invoice for office supplies. Repayment premium means you will receive 5% more than the purchase price at maturity.',
    paymentTerms: 'Net 30',
    creditScore: 720,
    lineItems: ['Paper', 'Ink', 'Staplers'],
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    business: 'Beta LLC',
    amount: '2,500 USDC',
    dueDate: '2025-08-15',
    repaymentPremium: '4%',
    status: 'Available',
    description: 'Invoice for consulting services. 4% premium paid at maturity.',
    paymentTerms: 'Due on receipt',
    creditScore: 680,
    lineItems: ['Consulting - 10h'],
  },
  {
    id: '3',
    invoiceNumber: 'INV-003',
    business: 'Gamma Inc',
    amount: '5,000 USDC',
    dueDate: '2025-09-01',
    repaymentPremium: '6%',
    status: 'Available',
    description: 'Invoice for equipment rental. 6% premium paid at maturity.',
    paymentTerms: 'Net 60',
    creditScore: 750,
    lineItems: ['Excavator rental', 'Operator fee'],
  },
];

function getPurchasedInvoices() {
  const data = localStorage.getItem('purchasedInvoices');
  return data ? JSON.parse(data) : [];
}
function setPurchasedInvoices(invoices) {
  localStorage.setItem('purchasedInvoices', JSON.stringify(invoices));
}

function getMarketplaceInvoices() {
  const data = localStorage.getItem('marketplaceInvoices');
  return data ? JSON.parse(data) : [];
}

function setMarketplaceInvoices(invoices) {
  localStorage.setItem('marketplaceInvoices', JSON.stringify(invoices));
}

const getYield = (amount, premium) => {
  const amt = Number(amount.toString().replace(/[^\d.]/g, ''));
  const prem = Number(premium.toString().replace(/[^\d.]/g, ''));
  if (isNaN(amt) || isNaN(prem)) return { usdc: '—', percent: '—' };
  return {
    usdc: ((amt * prem) / 100).toLocaleString(),
    percent: prem + '%',
  };
};

const MotionBox = framerMotion(Box);

// Utility function to check invoice validity
function isValidInvoice(inv) {
  return inv && typeof inv === 'object' && inv.invoiceNumber;
}

const Marketplace = () => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAuctionOpen, onOpen: onAuctionOpen, onClose: onAuctionClose } = useDisclosure();
  const { isOpen: isPortfolioOpen, onOpen: onPortfolioOpen, onClose: onPortfolioClose } = useDisclosure();
  const { isOpen: isErrorOpen, onOpen: onErrorOpen, onClose: onErrorClose } = useDisclosureHook();
  const [purchased, setPurchased] = useState(getPurchasedInvoices());
  const toast = useToast();
  const { publicKey } = useWallet();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBusiness, setFilterBusiness] = useState('all');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, auction
  const [operationProgress, setOperationProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Merge dummy and localStorage invoices, ensuring unique IDs
  const marketplaceInvoices = getMarketplaceInvoices();
  const dummyInvoicesWithUniqueIds = dummyInvoices.map((invoice, index) => ({
    ...invoice,
    id: `dummy-${index}-${Math.random().toString(36).substr(2, 9)}-${performance.now().toString().replace('.', '')}` // Ensure truly unique IDs for dummy invoices
  }));
  const allInvoices = [...marketplaceInvoices, ...dummyInvoicesWithUniqueIds].filter(isValidInvoice);
  const purchasedIds = new Set(purchased.map(i => i.id));

  // Unique businesses for filter
  const businesses = Array.from(new Set(allInvoices.map(i => i.business)));

  // Filtering
  let filtered = allInvoices.filter(inv => {
    if (tab === 1 && (!publicKey || !purchasedIds.has(inv.id))) return false;
    if (filterStatus !== 'all' && (purchasedIds.has(inv.id) ? 'Sold' : inv.status) !== filterStatus) return false;
    if (filterBusiness !== 'all' && inv.business !== filterBusiness) return false;
    if (filterAvailable && (purchasedIds.has(inv.id) || inv.status !== 'Available')) return false;
    if (search && !(
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.business.toLowerCase().includes(search.toLowerCase())
    )) return false;
    return true;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    if (sortBy === 'amount') {
      const aAmt = Number(a.amount.toString().replace(/[^\d.]/g, ''));
      const bAmt = Number(b.amount.toString().replace(/[^\d.]/g, ''));
      return bAmt - aAmt;
    }
    if (sortBy === 'dueDate') {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === 'premium') {
      const aPrem = Number(a.repaymentPremium.toString().replace(/[^\d.]/g, ''));
      const bPrem = Number(b.repaymentPremium.toString().replace(/[^\d.]/g, ''));
      return bPrem - aPrem;
    }
    return 0;
  });

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

  const handleOpen = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    
    if (errorDetails?.type === 'purchase') {
      await handleBuy(selectedInvoice);
    }
    
    onErrorClose();
  };

  const handleBuy = async (invoice) => {
    if (!publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase invoices.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if wallet has signTransaction function
    if (!window.solana || !window.solana.signTransaction) {
      toast({
        title: "Wallet Error",
        description: "Your wallet does not support transaction signing. Please use a compatible wallet.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

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

    // Check rate limit
    try {
      checkRateLimit('purchase', publicKey.toBase58(), 10, 300000); // 10 purchases per 5 minutes
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

    setLoading(true);
    setError('');
    setCurrentOperation('Preparing purchase...');
    setOperationProgress(10);

    try {
      console.log('💳 Starting real NFT purchase...');
      setCurrentOperation('Processing payment...');
      setOperationProgress(30);
      
      // Use real payment transaction
      console.log('🔄 Starting purchase process...');
      console.log('📝 Invoice:', invoice.invoiceNumber);
      console.log('💰 Amount:', invoice.amount, 'SOL');
      console.log('👤 Buyer:', publicKey.toBase58());
      
      setCurrentOperation('Waiting for wallet signature...');
      setOperationProgress(50);
      
      const paymentResult = await purchaseNFT(invoice, publicKey, window.solana.signTransaction);
      
      console.log('📊 Purchase result:', paymentResult);
      
      if (paymentResult.success) {
        setOperationProgress(80);
        
        // Update local storage with purchase
        const newPurchased = [...purchased, { 
          ...invoice, 
          status: 'Sold', 
          buyer: publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4), 
          repaid: false,
          purchaseSignature: paymentResult.signature,
          purchaseAmount: paymentResult.amount,
          purchaseDate: new Date().toISOString()
        }];
        
        setPurchasedInvoices(newPurchased);
        setPurchased(newPurchased);
        
        // Update marketplace to mark as sold
        const updatedMarketplace = allInvoices.map(inv =>
          inv.id === invoice.id ? { ...inv, status: 'Sold', buyer: publicKey.toBase58() } : inv
        );
        setMarketplaceInvoices(updatedMarketplace);

        setOperationProgress(100);
        
        // Add a small delay to ensure wallet transaction is fully processed
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Purchase Successful!",
          description: `You have successfully purchased invoice ${invoice.invoiceNumber} for ${paymentResult.amount} SOL. Transaction: ${paymentResult.signature.slice(0, 8)}...`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        console.log('🎉 NFT purchase completed successfully!');
        onClose();
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      console.error('❌ Purchase error:', err);
      
      const errorMessage = err.message || "Failed to purchase invoice. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      
      // Show detailed error modal
      setErrorDetails({
        title: 'Purchase Failed',
        message: errorMessage,
        type: 'purchase',
        canRetry: true
      });
      onErrorOpen();
    } finally {
      setLoading(false);
      setCurrentOperation('');
      setOperationProgress(0);
    }
  };

  try {
    return (
      <Box maxW="7xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading mb={6} color="gray.800" fontSize="2xl" fontWeight="bold">
          Invoice Marketplace
        </Heading>
        
        {/* Action Buttons */}
        <Flex gap={4} mb={6} wrap="wrap" align="center">
          <Button
            onClick={onPortfolioOpen}
            colorScheme="teal"
            leftIcon={<ArrowUpIcon />}
          >
            Build Portfolio
          </Button>
          <Button
            onClick={onAuctionOpen}
            colorScheme="blue"
            leftIcon={<EditIcon />}
            variant="outline"
          >
            View Auctions
          </Button>
        </Flex>
        <Tabs index={tab} onChange={setTab} mb={4} variant="enclosed">
          <TabList>
            <Tab aria-label="All invoices tab">All Invoices</Tab>
            <Tab aria-label="My purchases tab">My Purchases</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              {/* Filters/Search/Sort */}
              <Flex gap={2} mb={4} wrap="wrap" align="center">
                <Input placeholder="Search invoice # or business" value={search} onChange={e => setSearch(e.target.value)} maxW="200px" aria-label="Search invoices" />
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} maxW="140px" aria-label="Filter by status">
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Sold">Sold</option>
                </Select>
                <Select value={filterBusiness} onChange={e => setFilterBusiness(e.target.value)} maxW="160px" aria-label="Filter by business">
                  <option value="all">All Businesses</option>
                  {businesses.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
                <Select value={sortBy} onChange={e => setSortBy(e.target.value)} maxW="140px" aria-label="Sort by">
                  <option value="dueDate">Sort: Due Date</option>
                  <option value="amount">Sort: Amount</option>
                  <option value="premium">Sort: Premium</option>
                </Select>
                <Checkbox isChecked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} aria-label="Show only available invoices">
                  Show Only Available
                </Checkbox>
              </Flex>
              {error && <Text color="red.500" aria-live="assertive" mb={2}>{error}</Text>}
              {/* Invoice Grid */}
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {loading ? Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} height="400px" borderRadius="lg" />
                )) : (
                  <AnimatePresence>
                    {filtered.map((invoice, index) => {
                      if (!isValidInvoice(invoice)) return null;
                      return (
                        <InvoiceCard
                          key={`${invoice.id}-${index}-${invoice.invoiceNumber}`}
                          invoice={invoice}
                          onPurchase={handleBuy}
                        />
                      );
                    })}
                  </AnimatePresence>
                )}
              </SimpleGrid>
            </TabPanel>
            <TabPanel px={0}>
              {/* My Purchases Tab */}
              <SimpleGrid columns={[1, 1, 2]} spacing={6}>
                {purchased.filter(inv => publicKey && isValidInvoice(inv)).map((invoice, index) => {
                  const yieldInfo = getYield(invoice.amount, invoice.repaymentPremium);
                  return (
                    <Box key={`purchased-${invoice.id}-${index}-${invoice.invoiceNumber}`} p={5} borderWidth="1px" borderRadius="lg" boxShadow="sm" bg="white" borderColor="gray.200" cursor="pointer" onClick={() => handleOpen(invoice)} _hover={{ boxShadow: 'md', bg: 'gray.50', borderColor: 'gray.300' }} aria-label={`View details for my purchased invoice ${invoice.invoiceNumber}`}>
                      <Stack spacing={2}>
                        <Flex align="center" gap={2}>
                          <Image src="https://placehold.co/40x40/319795/fff?text=NFT" alt="NFT" borderRadius="md" boxSize="40px" />
                          <Heading size="md">{invoice.invoiceNumber}</Heading>
                        </Flex>
                        <Text><b>Business:</b> {invoice.business}</Text>
                        <Text><b>Amount:</b> {invoice.amount}</Text>
                        <Tooltip label="The date by which the business must repay the investor (NFT holder)." fontSize="sm">
                          <Text><b>Due Date:</b> {invoice.dueDate}</Text>
                        </Tooltip>
                        <Tooltip label="The extra percentage you will receive on top of the purchase price when the invoice is repaid." fontSize="sm">
                          <Text><b>Repayment Premium:</b> {invoice.repaymentPremium}</Text>
                        </Tooltip>
                        <Tooltip label="Current status of this invoice NFT (e.g., Available, Sold, Repaid)." fontSize="sm">
                          <Badge colorScheme="blue" w="fit-content">Sold</Badge>
                        </Tooltip>
                        <Text fontSize="sm" color="gray.600">{invoice.description}</Text>
                        <Text fontSize="sm" color="teal.700"><b>Expected Yield:</b> {yieldInfo.usdc} USDC ({yieldInfo.percent})</Text>
                      </Stack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Divider my={6} />
        <Text fontSize="sm" color="gray.700" mt={4}>
          <b>How it works:</b> <br />
          1. Connect your Solana wallet.<br />
          2. Browse and select an invoice NFT to fund.<br />
          3. Purchase the NFT to provide liquidity to the business.<br />
          4. Hold or resell the NFT. At maturity, the business repays the current NFT holder.<br />
          5. All transactions are transparent and on-chain.
        </Text>
        {/* Modal for invoice details */}
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
          isCentered
          motionPreset="scale"
          aria-label="Invoice details modal"
        >
          <ModalOverlay />
          <ModalContent maxW="2xl">
            {loading ? (
              <SkeletonText mt="4" noOfLines={8} spacing="4" />
            ) : (
              <Flex direction="column" align="center" p={{ base: 2, md: 6 }}>
                <Image src="https://placehold.co/72x72/319795/fff?text=NFT" alt="NFT" borderRadius="full" boxSize="72px" mb={3} />
                <Heading size="lg" mb={1} textAlign="center">{isValidInvoice(selectedInvoice) ? selectedInvoice.invoiceNumber : 'N/A'}</Heading>
                <Text fontSize="lg" color="gray.600" mb={4} textAlign="center">{isValidInvoice(selectedInvoice) ? selectedInvoice.business : 'N/A'}</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="100%" mb={4}>
                  <Stack spacing={2} fontSize="md">
                    <Text><b>Amount:</b> {isValidInvoice(selectedInvoice) ? selectedInvoice.amount : 'N/A'}</Text>
                    <Text><b>Due Date:</b> {isValidInvoice(selectedInvoice) ? selectedInvoice.dueDate : 'N/A'}</Text>
                    <Text><b>Payment Terms:</b> {isValidInvoice(selectedInvoice) ? selectedInvoice.paymentTerms : 'N/A'}</Text>
                    <Text><b>Credit Score:</b> {isValidInvoice(selectedInvoice) ? selectedInvoice.creditScore : 'N/A'}</Text>
                  </Stack>
                  <Stack spacing={2} fontSize="md">
                    <Text><b>Status:</b> {isValidInvoice(selectedInvoice) ? (<Badge colorScheme={purchasedIds.has(selectedInvoice.id) ? 'blue' : selectedInvoice.status === 'Available' ? 'green' : 'yellow'} fontSize="1em">{purchasedIds.has(selectedInvoice.id) ? 'Sold' : selectedInvoice.status}</Badge>) : 'N/A'}</Text>
                    <Text><b>Repayment Premium:</b> {isValidInvoice(selectedInvoice) ? (<Badge colorScheme="teal" fontSize="1em">{selectedInvoice.repaymentPremium}</Badge>) : 'N/A'}</Text>
                    {isValidInvoice(selectedInvoice) && (
                      <Text color="teal.700" fontWeight="bold">
                        Expected Yield: {getYield(selectedInvoice.amount, selectedInvoice.repaymentPremium).usdc} USDC ({getYield(selectedInvoice.amount, selectedInvoice.repaymentPremium).percent})
                      </Text>
                    )}
                    <Text><b>Line Items:</b> {isValidInvoice(selectedInvoice) && selectedInvoice.lineItems && selectedInvoice.lineItems.length > 0 ? selectedInvoice.lineItems.join(', ') : '—'}</Text>
                  </Stack>
                </SimpleGrid>
                <Box bg="gray.50" borderRadius="md" p={4} w="100%" fontSize="md">
                  <Text color="gray.700"><b>Description:</b> {isValidInvoice(selectedInvoice) ? selectedInvoice.description : 'N/A'}</Text>
                </Box>
              </Flex>
            )}
          </ModalContent>
          <ModalFooter>
            <Button onClick={onClose} colorScheme="gray" mr={2} aria-label="Close invoice details modal">Close</Button>
            {isValidInvoice(selectedInvoice) && !purchasedIds.has(selectedInvoice.id) && (
              <Button colorScheme="teal" onClick={() => handleBuy(selectedInvoice)} aria-label="Buy invoice">Buy</Button>
            )}
          </ModalFooter>
        </Modal>

        {/* Portfolio Builder Modal */}
        <PortfolioBuilder
          isOpen={isPortfolioOpen}
          onClose={onPortfolioClose}
          availableInvoices={filtered}
        />

        {/* Auction System Modal */}
        <AuctionSystem
          invoice={selectedInvoice}
          isOpen={isAuctionOpen}
          onClose={onAuctionClose}
        />

        {/* Enhanced Loading and Progress Indicators */}
        {loading && (
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
              {errorDetails?.type === 'purchase' && (
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    Make sure you have enough SOL for the purchase and transaction fees.
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
  } catch (err) {
    return <Box color="red.500">Marketplace failed to load: {err.message}</Box>;
  }
};

export default Marketplace; 