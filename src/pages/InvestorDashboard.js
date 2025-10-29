import React, { useState, useEffect } from 'react';
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, Button, VStack, Flex, useToast, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, SimpleGrid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowUpIcon, AddIcon } from '@chakra-ui/icons';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { getWalletBalance } from '../utils/paymentUtils';

function getPurchasedInvoices() {
  const data = localStorage.getItem('purchasedInvoices');
  return data ? JSON.parse(data) : [];
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

const InvestorDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const toast = useToast();
  
  useEffect(() => {
    const purchasedInvoices = getPurchasedInvoices();
    setInvoices(purchasedInvoices);
    
    // Calculate total invested and earnings
    let invested = 0;
    let earnings = 0;
    
    purchasedInvoices.forEach(invoice => {
      const amount = parseFloat(invoice.amount?.replace(/[^\d.]/g, '') || '0');
      const premium = parseFloat(invoice.repaymentPremium?.replace('%', '') || '0');
      
      invested += amount;
      
      if (invoice.repaid) {
        const premiumAmount = (amount * premium) / 100;
        earnings += premiumAmount;
      }
    });
    
    setTotalInvested(invested);
    setTotalEarnings(earnings);
  }, []);

  const handleRepay = (invoiceId) => {
    // Simulate repayment process
    setInvoices(prev => prev.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: 'Repaid', repaid: true }
        : invoice
    ));
    
    // Update localStorage
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: 'Repaid', repaid: true }
        : invoice
    );
    localStorage.setItem('purchasedInvoices', JSON.stringify(updatedInvoices));
    
    toast({
      title: "Invoice Repaid!",
      description: "The invoice has been marked as repaid successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };
  const calculatedTotalInvested = invoices.reduce((sum, i) => sum + Number(i.amount.toString().replace(/[^\d.]/g, '')), 0);
  const totalYield = invoices.reduce((sum, i) => sum + Number(getYield(i.amount, i.repaymentPremium).usdc.replace(/[^\d.]/g, '')), 0);
  const portfolioData = {
    totalInvested: calculatedTotalInvested,
    totalReturns: calculatedTotalInvested + totalYield,
    activeInvoices: invoices.length,
    completedInvoices: 0, // Mock data
    avgYield: invoices.length > 0 ? invoices.reduce((sum, i) => sum + Number(i.repaymentPremium?.toString().replace(/[^\d.]/g, '') || 0), 0) / invoices.length : 0,
    lowRiskCount: invoices.filter(i => i.creditScore >= 750).length,
    mediumRiskCount: invoices.filter(i => i.creditScore >= 650 && i.creditScore < 750).length,
    highRiskCount: invoices.filter(i => i.creditScore < 650).length,
    diversificationScore: 85, // Mock data
    liquidityScore: 72, // Mock data
    riskScore: 90, // Mock data
  };

  return (
    <Box maxW="7xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={6} color="gray.800" fontSize="2xl" fontWeight="bold">
        Investor Dashboard
      </Heading>

      {/* Commission Tracking Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Invested</StatLabel>
          <StatNumber color="blue.500">{totalInvested.toFixed(2)} SOL</StatNumber>
          <StatHelpText>Amount invested in invoice NFTs</StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Total Earnings</StatLabel>
          <StatNumber color="green.500">{totalEarnings.toFixed(2)} SOL</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            Commission earned from repayments
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>ROI</StatLabel>
          <StatNumber color={totalEarnings > 0 ? "green.500" : "gray.500"}>
            {totalInvested > 0 ? ((totalEarnings / totalInvested) * 100).toFixed(1) : 0}%
          </StatNumber>
          <StatHelpText>Return on investment</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Action Buttons */}
      <Flex gap={4} mb={6} wrap="wrap" align="center">
        <Button
          as={RouterLink}
          to="/marketplace"
          colorScheme="teal"
          leftIcon={<ArrowUpIcon />}
        >
          Browse Marketplace
        </Button>
        <Button
          as={RouterLink}
          to="/investor/yield"
          colorScheme="blue"
          leftIcon={<AddIcon />}
          variant="outline"
        >
          View Yield Report
        </Button>
      </Flex>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard portfolioData={portfolioData} />
      
      {/* Portfolio Table */}
      <Box mt={8}>
        <Heading size="lg" color="gray.800" mb={4}>Your Portfolio</Heading>
        {invoices.length === 0 ? (
          <VStack spacing={4} py={8}>
            <Text color="gray.600" textAlign="center">
              You haven't purchased any invoices yet.
            </Text>
            <Button as={RouterLink} to="/marketplace" colorScheme="teal">
              Browse Marketplace
            </Button>
          </VStack>
        ) : (
          <Box w="full" overflowX="auto">
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th color="gray.600">Invoice #</Th>
                  <Th color="gray.600">Business</Th>
                  <Th color="gray.600">Amount</Th>
                  <Th color="gray.600">Due Date</Th>
                  <Th color="gray.600">Premium</Th>
                  <Th color="gray.600">Expected Yield</Th>
                  <Th color="gray.600">Status</Th>
                  <Th color="gray.600">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invoices.map((inv) => {
                  const yieldInfo = getYield(inv.amount, inv.repaymentPremium);
                  return (
                    <Tr key={inv.id} _hover={{ bg: 'gray.50' }}>
                      <Td color="gray.800" fontWeight="bold">{inv.invoiceNumber}</Td>
                      <Td color="gray.600">{inv.business}</Td>
                      <Td color="gray.800">{inv.amount}</Td>
                      <Td color="gray.600">{inv.dueDate}</Td>
                      <Td color="green.600">{inv.repaymentPremium}</Td>
                      <Td color="green.600">{yieldInfo.usdc} USDC ({yieldInfo.percent})</Td>
                      <Td><Badge colorScheme={inv.repaid ? 'green' : 'blue'}>{inv.repaid ? 'Repaid' : 'Active'}</Badge></Td>
                      <Td>
                        <Flex gap={2}>
                          {!inv.repaid && (
                            <Button 
                              size="sm" 
                              colorScheme="green" 
                              variant="outline"
                              onClick={() => handleRepay(inv.id)}
                            >
                              Mark Repaid
                            </Button>
                          )}
                          <Button size="sm" colorScheme="teal" variant="outline" as={RouterLink} to="/marketplace">
                            Sell
                          </Button>
                        </Flex>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InvestorDashboard; 