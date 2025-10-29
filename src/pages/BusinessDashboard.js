import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Stack, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Flex, Spacer, Alert, AlertIcon, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, IconButton, Tooltip, Checkbox, useDisclosure, Avatar, Menu, MenuButton, MenuList, MenuItem, Progress, Skeleton, SkeletonText, useColorModeValue, motion } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { repayInvoice } from '../utils/paymentUtils';
import { BellIcon, SettingsIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { AnimatePresence, motion as framerMotion } from 'framer-motion';
const MotionTr = framerMotion(Tr);

const initialInvoices = [
  {
    invoiceNumber: 'INV-001',
    amount: 1000,
    currency: 'USDC',
    dueDate: '2025-08-01',
    repaymentPremium: 5,
    status: 'Sold',
    buyer: '7Gk...9sT',
    repaid: false,
  },
  {
    invoiceNumber: 'INV-002',
    amount: 2500,
    currency: 'USDC',
    dueDate: '2025-08-15',
    repaymentPremium: 4,
    status: 'Listed',
    buyer: null,
    repaid: false,
  },
  {
    invoiceNumber: 'INV-003',
    amount: 5000,
    currency: 'USDC',
    dueDate: '2025-09-01',
    repaymentPremium: 6,
    status: 'Repaid',
    buyer: '3Jd...2kP',
    repaid: true,
  },
];

function isDueSoonOrOverdue(dueDate, repaid) {
  if (repaid) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = (due - now) / (1000 * 60 * 60 * 24); // days
  return diff < 5;
}

function daysLeft(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function toCSV(invoices) {
  const header = ['Invoice #', 'Amount', 'Currency', 'Due Date', 'Premium', 'Status', 'Buyer', 'Repaid'];
  const rows = invoices.map(i => [i.invoiceNumber, i.amount, i.currency, i.dueDate, i.repaymentPremium, i.status, i.buyer || '', i.repaid ? 'Yes' : 'No']);
  return [header, ...rows].map(r => r.join(',')).join('\n');
}

const timelineSteps = [
  { key: 'minted', label: 'Minted' },
  { key: 'listed', label: 'Listed' },
  { key: 'sold', label: 'Sold' },
  { key: 'repaid', label: 'Repaid' },
];

const BusinessDashboard = () => {
  const { connected, publicKey } = useWallet();
  const [invoices, setInvoices] = useState([]);
  const toast = useToast();
  const [selected, setSelected] = useState([]);
  const [modalInvoice, setModalInvoice] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'dueSoon', message: 'Invoice INV-001 is due in 2 days.' },
    { id: 2, type: 'repaid', message: 'Invoice INV-003 was marked as repaid.' },
  ]);
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load invoices from marketplace on component mount and when wallet changes
  useEffect(() => {
    if (publicKey) {
      loadInvoices();
      loadNotifications();
    } else {
      // Clear invoices if wallet is disconnected
      setInvoices([]);
    }
  }, [publicKey]);

  const loadInvoices = () => {
    try {
      if (!publicKey) {
        setInvoices([]);
        return;
      }

      const marketplaceData = localStorage.getItem('marketplaceInvoices');
      const marketplaceInvoices = marketplaceData ? JSON.parse(marketplaceData) : [];
      
      const currentWalletAddress = publicKey.toBase58();
      
      // Filter invoices: only show invoices minted by user OR purchased by user
      const userInvoices = marketplaceInvoices.filter(invoice => {
        const isMintedByUser = invoice.business === currentWalletAddress;
        const isPurchasedByUser = invoice.buyer === currentWalletAddress;
        return isMintedByUser || isPurchasedByUser;
      });
      
      // Convert marketplace invoices to dashboard format
      const convertedInvoices = userInvoices.map((invoice, index) => ({
        id: invoice.id || `invoice-${index}-${Date.now()}`,
        invoiceNumber: invoice.invoiceNumber,
        amount: parseFloat(invoice.amount.replace(/[^\d.]/g, '')),
        currency: invoice.amount.split(' ')[1] || 'USDC',
        dueDate: invoice.dueDate,
        repaymentPremium: parseFloat(invoice.repaymentPremium.replace('%', '')),
        status: invoice.status || 'Listed',
        buyer: invoice.buyer || null,
        repaid: invoice.repaid ?? (invoice.status === 'Repaid'), // Preserve repaid status from localStorage
        nftMintAddress: invoice.nftMintAddress,
        nftSignature: invoice.nftSignature,
        nftMetadataUri: invoice.nftMetadataUri,
        business: invoice.business,
        description: invoice.description,
        paymentTerms: invoice.paymentTerms,
        creditScore: invoice.creditScore,
        lineItems: invoice.lineItems
      }));
      
      setInvoices(convertedInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Failed to load invoices');
    }
  };

  const loadNotifications = () => {
    try {
      const marketplaceData = localStorage.getItem('marketplaceInvoices');
      const marketplaceInvoices = marketplaceData ? JSON.parse(marketplaceData) : [];
      
      // Generate notifications based on recent activity
      const newNotifications = [];
      
      // Add notification for each minted invoice
      marketplaceInvoices.forEach(invoice => {
        if (invoice.nftMintAddress) {
          newNotifications.push({
            id: `mint-${invoice.id}`,
            type: 'success',
            message: `Invoice ${invoice.invoiceNumber} successfully minted as NFT!`,
            timestamp: new Date()
          });
        }
      });
      
      // Add due date notifications
      marketplaceInvoices.forEach(invoice => {
        const dueDate = new Date(invoice.dueDate);
        const now = new Date();
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue > 0) {
          newNotifications.push({
            id: `due-${invoice.id}`,
            type: 'warning',
            message: `Invoice ${invoice.invoiceNumber} is due in ${daysUntilDue} days`,
            timestamp: new Date()
          });
        }
      });
      
      // Sort by timestamp (newest first) and limit to 10
      const sortedNotifications = newNotifications
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
      
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const getPurchasedInvoices = () => {
    const data = localStorage.getItem('purchasedInvoices');
    return data ? JSON.parse(data) : [];
  };
  const setPurchasedInvoices = (invoices) => {
    localStorage.setItem('purchasedInvoices', JSON.stringify(invoices));
  };
  const getMarketplaceInvoices = () => {
    const data = localStorage.getItem('marketplaceInvoices');
    return data ? JSON.parse(data) : [];
  };
  const setMarketplaceInvoices = (invoices) => {
    localStorage.setItem('marketplaceInvoices', JSON.stringify(invoices));
  };

  // Summary stats - Calculate from filtered invoices only
  const currentWalletAddress = publicKey?.toBase58() || '';
  
  // Total Raised: Only count invoices minted by user that were sold/repaid
  const totalRaised = invoices
    .filter(i => i.business === currentWalletAddress && (i.status === 'Sold' || i.status === 'Repaid'))
    .reduce((sum, i) => sum + i.amount, 0);
  
  // Total Invoices: Count all invoices (minted + purchased)
  const totalInvoices = invoices.length;
  
  // Total Repaid: Count all repaid invoices (check both repaid flag and status)
  const totalRepaid = invoices.filter(i => i.repaid || i.status === 'Repaid').length;
  
  // Success Rate: Calculate based on invoices minted by user
  const invoicesMintedByUser = invoices.filter(i => i.business === currentWalletAddress);
  const repaidMintedByUser = invoicesMintedByUser.filter(i => i.repaid || i.status === 'Repaid').length;
  const successRate = invoicesMintedByUser.length > 0 
    ? Math.round((repaidMintedByUser / invoicesMintedByUser.length) * 100) 
    : 0;

  const handleMarkRepaid = (invoiceNumber) => {
    setLoading(true);
    try {
      setInvoices(prev => prev.map(i => i.invoiceNumber === invoiceNumber ? { ...i, repaid: true, status: 'Repaid' } : i));
      setError('');
      toast({ title: 'Invoice marked as repaid.', status: 'success', duration: 2000, isClosable: true });
    } catch (e) {
      setError('Failed to mark as repaid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayInvoice = async (invoice) => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to repay invoices.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('💸 Starting real invoice repayment...');
      
      // Use real repayment transaction
      const repaymentResult = await repayInvoice(invoice, publicKey, window.solana.signTransaction);
      
      if (repaymentResult.success) {
        // Update invoice status to repaid
        setInvoices(prev => prev.map(i => 
          i.invoiceNumber === invoice.invoiceNumber 
            ? { 
                ...i, 
                repaid: true, 
                status: 'Repaid',
                repaymentSignature: repaymentResult.signature,
                repaymentAmount: repaymentResult.totalRepayment,
                repaymentDate: new Date().toISOString()
              } 
            : i
        ));

        // Update marketplace to mark as repaid
        const updatedMarketplace = getMarketplaceInvoices().map(inv =>
          inv.invoiceNumber === invoice.invoiceNumber 
            ? { ...inv, repaid: true, status: 'Repaid' } 
            : inv
        );
        setMarketplaceInvoices(updatedMarketplace);

        toast({
          title: "Repayment Successful!",
          description: `You have successfully repaid invoice ${invoice.invoiceNumber} for ${repaymentResult.totalRepayment} SOL (including ${repaymentResult.premiumAmount} SOL premium). Transaction: ${repaymentResult.signature.slice(0, 8)}...`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        console.log('🎉 Invoice repayment completed successfully!');
      } else {
        throw new Error('Repayment failed');
      }
    } catch (err) {
      console.error('❌ Repayment error:', err);
      setError(err.message || "Failed to repay invoice. Please try again.");
      toast({
        title: "Repayment Failed",
        description: err.message || "Failed to repay invoice. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleListForSale = (invoiceId) => {
    setInvoices(prev => {
      const invoice = prev.find(i => i.id === invoiceId);
      if (!invoice) return prev;
      // Move to marketplace
      const newMarketplace = [...getMarketplaceInvoices(), { ...invoice, status: 'Available', buyer: null }];
      setMarketplaceInvoices(newMarketplace);
      // Remove from purchased
      const newInvoices = prev.filter(i => i.id !== invoiceId);
      setPurchasedInvoices(newInvoices);
      toast({ title: 'Invoice listed for sale again.', status: 'info', duration: 2000, isClosable: true });
      return newInvoices;
    });
  };

  const handleExportCSV = () => {
    const csv = toCSV(invoices);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkMarkRepaid = () => {
    setInvoices(prev => prev.map(i => selected.includes(i.invoiceNumber) ? { ...i, repaid: true, status: 'Repaid' } : i));
    setSelected([]);
    toast({ title: 'Selected invoices marked as repaid.', status: 'success', duration: 2000, isClosable: true });
  };

  const handleRowClick = (inv) => {
    setModalInvoice(inv);
    onOpen();
  };

  const handleNotifClick = () => setShowNotif(!showNotif);

  if (!connected) {
    return (
      <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
        <Alert status="info" mb={4}>
          <AlertIcon />
          Please connect your Solana wallet to view your business dashboard.
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxW="100%" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Flex align="center" mb={6}>
        <Heading>Business Dashboard</Heading>
        <Spacer />
        <Tooltip label="Notifications">
          <Box position="relative">
            <IconButton icon={<BellIcon />} onClick={handleNotifClick} variant="ghost" colorScheme="teal" aria-label="Notifications" />
            {notifications.length > 0 && (
              <Badge colorScheme="red" position="absolute" top="-1" right="-1" borderRadius="full" fontSize="0.7em">{notifications.length}</Badge>
            )}
            {showNotif && (
              <Box position="absolute" right={0} mt={2} bg="white" boxShadow="md" borderRadius="md" zIndex={20} minW="220px" p={2}>
                <Stack spacing={2}>
                  {notifications.map(n => (
                    <Box 
                      key={n.id} 
                      fontSize="sm" 
                      p={2} 
                      borderRadius="md" 
                      bg={n.type === 'success' ? 'green.50' : n.type === 'warning' ? 'orange.50' : 'blue.50'}
                      borderLeft="3px solid"
                      borderLeftColor={n.type === 'success' ? 'green.400' : n.type === 'warning' ? 'orange.400' : 'blue.400'}
                    >
                      <Text fontWeight="medium" color={n.type === 'success' ? 'green.700' : n.type === 'warning' ? 'orange.700' : 'blue.700'}>
                        {n.message}
                      </Text>
                      {n.timestamp && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {new Date(n.timestamp).toLocaleString()}
                        </Text>
                      )}
                    </Box>
                  ))}
                  {notifications.length === 0 && <Text fontSize="sm" color="gray.500">No notifications</Text>}
                </Stack>
              </Box>
            )}
          </Box>
        </Tooltip>
        <Menu>
          <MenuButton as={IconButton} icon={<SettingsIcon />} variant="ghost" colorScheme="teal" ml={2} aria-label="Settings" />
          <MenuList>
            <MenuItem icon={<Avatar size="xs" mr={2} />}>Profile / Settings (coming soon)</MenuItem>
          </MenuList>
        </Menu>
        <Text fontSize="sm" color="gray.500" ml={4}>Wallet: {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}</Text>
        <Badge colorScheme="green" ml={2} fontSize="sm">
          🟢 Platform Active
        </Badge>
      </Flex>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={8} mb={8}>
        <Box bg="teal.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Total Raised</Text>
          <Text fontSize="2xl">{totalRaised.toLocaleString()} USDC</Text>
          <Text fontSize="sm" color="gray.600">From invoice financing</Text>
        </Box>
        <Box bg="teal.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Invoices Minted</Text>
          <Text fontSize="2xl">{totalInvoices}</Text>
          <Text fontSize="sm" color="gray.600">NFT invoices created</Text>
        </Box>
        <Box bg="teal.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Invoices Repaid</Text>
          <Text fontSize="2xl">{totalRepaid}</Text>
          <Text fontSize="sm" color="gray.600">Successfully repaid</Text>
        </Box>
        <Box bg="blue.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Success Rate</Text>
          <Text fontSize="2xl">{successRate}%</Text>
          <Text fontSize="sm" color="gray.600">Repayment completion</Text>
        </Box>
      </Stack>
      <Flex mb={2} align="center" gap={2}>
        <Heading size="md">Your Invoices</Heading>
        <Spacer />
        <Button colorScheme="blue" size="sm" onClick={() => { loadInvoices(); loadNotifications(); }}>Refresh</Button>
        <Button colorScheme="teal" size="sm" onClick={handleExportCSV}>Export to CSV</Button>
        <Button colorScheme="teal" size="sm" onClick={handleBulkMarkRepaid} isDisabled={selected.length === 0}>Mark Selected as Repaid</Button>
      </Flex>
      {error && <Text color="red.500" aria-live="assertive" mb={2}>{error}</Text>}
      <Box overflowX="auto">
        {loading ? (
          <Skeleton height="320px" borderRadius="md" />
        ) : (
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th><Checkbox isChecked={selected.length === invoices.length} onChange={e => setSelected(e.target.checked ? invoices.map(i => i.invoiceNumber) : [])} /></Th>
                <Th>Invoice #</Th>
                <Th>Amount Raised</Th>
                <Th>Amount Due</Th>
                <Th>Due Date</Th>
                <Th>Countdown</Th>
                <Th>Premium</Th>
                <Th>Status</Th>
                <Th>NFT</Th>
                <Th>Buyer</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              <AnimatePresence>
                {invoices.filter(Boolean).map((inv) => {
                  if (!inv || !inv.invoiceNumber) return null;
                  const dueSoon = isDueSoonOrOverdue(inv.dueDate, inv.repaid);
                  const amountDue = (inv.amount * (1 + inv.repaymentPremium / 100)).toLocaleString();
                  const days = daysLeft(inv.dueDate);
                  let countdownColor = 'green';
                  if (days <= 5 && days > 0) countdownColor = 'orange';
                  if (days <= 0 && !inv.repaid) countdownColor = 'red';
                  return (
                    <MotionTr
                      key={`${inv.id || 'unknown'}-${inv.invoiceNumber}`}
                      bg={dueSoon && !inv.repaid && inv.status === 'Sold' ? 'orange.50' : undefined}
                      cursor="pointer"
                      onClick={e => { if (e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') handleRowClick(inv); }}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      aria-label={`View details for invoice ${inv.invoiceNumber}`}
                    >
                      <Td><Checkbox isChecked={selected.includes(inv.invoiceNumber)} onChange={e => setSelected(sel => e.target.checked ? [...sel, inv.invoiceNumber] : sel.filter(x => x !== inv.invoiceNumber))} onClick={e => e.stopPropagation()} /></Td>
                      <Td>{inv.invoiceNumber}</Td>
                      <Td>{inv.amount.toLocaleString()} {inv.currency}</Td>
                      <Td>{amountDue} {inv.currency}</Td>
                      <Td>{inv.dueDate} {dueSoon && !inv.repaid && inv.status === 'Sold' && <Badge colorScheme="orange" ml={2}>Due Soon</Badge>}</Td>
                      <Td>
                        <Tooltip label="Days left until due date" fontSize="sm">
                          <Badge colorScheme={countdownColor}>{days > 0 ? `${days} days` : inv.repaid ? 'Repaid' : 'Overdue'}</Badge>
                        </Tooltip>
                      </Td>
                      <Td>{inv.repaymentPremium}%</Td>
                      <Td>
                        <Badge colorScheme={inv.status === 'Repaid' ? 'green' : inv.status === 'Sold' ? 'blue' : 'yellow'}>{inv.status}</Badge>
                      </Td>
                      <Td>
                        {inv.nftMintAddress ? (
                          <Tooltip label={`NFT Minted: ${inv.nftMintAddress}`} fontSize="sm">
                            <Badge colorScheme="purple" cursor="pointer">
                              NFT ✓
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Text color="gray.400">—</Text>
                        )}
                      </Td>
                      <Td>{inv.buyer ? inv.buyer : <Text color="gray.400">—</Text>}</Td>
                      <Td>
                        <Flex justify="flex-end" gap={2}>
                          {inv.status === 'Sold' && !inv.repaid && inv.business === publicKey?.toBase58() && (
                            <>
                              <Button colorScheme="teal" size="sm" onClick={e => { e.stopPropagation(); handleRepayInvoice(inv); }} isLoading={loading} loadingText="Repaying...">Repay Invoice</Button>
                              <Button colorScheme="blue" size="sm" onClick={e => { e.stopPropagation(); handleListForSale(inv.id); }}>List for Sale</Button>
                            </>
                          )}
                          {inv.status === 'Sold' && !inv.repaid && inv.business !== publicKey?.toBase58() && (
                            <Text fontSize="sm" color="gray.500">Owned by different business</Text>
                          )}
                          {inv.status === 'Listed' && (
                            <Button colorScheme="gray" size="sm" isDisabled>Edit</Button>
                          )}
                          {inv.status === 'Repaid' && (
                            <Badge colorScheme="green">Repaid</Badge>
                          )}
                        </Flex>
                      </Td>
                    </MotionTr>
                  );
                })}
              </AnimatePresence>
            </Tbody>
          </Table>
        )}
      </Box>
      {/* Invoice Details Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        isCentered
        motionPreset="scale"
        aria-label="Invoice details modal"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Invoice Details</Heading>
          </ModalHeader>
          <ModalCloseButton />
          {loading ? (
            <SkeletonText mt="4" noOfLines={8} spacing="4" />
          ) : (
            modalInvoice && (
              <Box p={6}>
                <Stack spacing={2} mb={4}>
                  <Text><b>Invoice #:</b> {modalInvoice.invoiceNumber}</Text>
                  <Text><b>Business:</b> {modalInvoice.business || 'N/A'}</Text>
                  <Text><b>Amount:</b> {modalInvoice.amount.toLocaleString()} {modalInvoice.currency}</Text>
                  <Text><b>Due Date:</b> {modalInvoice.dueDate}</Text>
                  <Text><b>Premium:</b> {modalInvoice.repaymentPremium}%</Text>
                  <Text><b>Status:</b> {modalInvoice.status}</Text>
                  <Text><b>Buyer:</b> {modalInvoice.buyer || '—'}</Text>
                  <Text><b>Repaid:</b> {modalInvoice.repaid ? 'Yes' : 'No'}</Text>
                  {modalInvoice.nftMintAddress && (
                    <Text><b>NFT Mint:</b> {modalInvoice.nftMintAddress}</Text>
                  )}
                  {modalInvoice.description && (
                    <Text><b>Description:</b> {modalInvoice.description}</Text>
                  )}
                </Stack>
                <Heading size="sm" mb={2}>Lifecycle Timeline</Heading>
                <Flex align="center" gap={2}>
                  {timelineSteps.map((step, idx) => {
                    let active = false;
                    if (step.key === 'minted') active = true;
                    if (step.key === 'listed' && (modalInvoice.status === 'Listed' || modalInvoice.status === 'Sold' || modalInvoice.status === 'Repaid')) active = true;
                    if (step.key === 'sold' && (modalInvoice.status === 'Sold' || modalInvoice.status === 'Repaid')) active = true;
                    if (step.key === 'repaid' && modalInvoice.status === 'Repaid') active = true;
                    return (
                      <React.Fragment key={step.key}>
                        <Flex direction="column" align="center">
                          <Badge colorScheme={active ? 'teal' : 'gray'}>{step.label}</Badge>
                          {idx < timelineSteps.length - 1 && <Box h="2px" w="32px" bg={active ? 'teal.400' : 'gray.200'} mt={2} mb={2} />}
                        </Flex>
                      </React.Fragment>
                    );
                  })}
                </Flex>
              </Box>
            )
          )}
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusinessDashboard; 