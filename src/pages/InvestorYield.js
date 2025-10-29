import React from 'react';
import { Box, Heading, Stack, Text, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const dummyListings = [
  { id: '1', invoiceNumber: 'INV-001', business: 'Acme Corp', amount: '1,000 USDC', dueDate: '2025-08-01', premium: '5%', status: 'Listed' },
  { id: '2', invoiceNumber: 'INV-004', business: 'Delta Ltd', amount: '3,000 USDC', dueDate: '2025-09-10', premium: '6%', status: 'Listed' },
];

const InvestorYield = () => {
  return (
    <Box maxW="5xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={6}>Investor Yield & Secondary Market</Heading>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={8} mb={8}>
        <Box bg="teal.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Total Expected Yield</Text>
          <Text fontSize="2xl">4,500 USDC</Text>
        </Box>
        <Box bg="teal.50" p={4} borderRadius="md" flex="1">
          <Text fontSize="lg" fontWeight="bold">Active Listings</Text>
          <Text fontSize="2xl">2</Text>
        </Box>
      </Stack>
      <Heading size="md" mb={4}>Secondary Market Listings</Heading>
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>Invoice #</Th>
            <Th>Business</Th>
            <Th>Amount</Th>
            <Th>Due Date</Th>
            <Th>Premium</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dummyListings.map((listing) => (
            <Tr key={listing.id}>
              <Td>{listing.invoiceNumber}</Td>
              <Td>{listing.business}</Td>
              <Td>{listing.amount}</Td>
              <Td>{listing.dueDate}</Td>
              <Td>{listing.premium}</Td>
              <Td>{listing.status}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Stack direction="row" spacing={4} mt={8}>
        <Button as={RouterLink} to="/investor" colorScheme="teal">Go to Investor Dashboard</Button>
        <Button as={RouterLink} to="/marketplace" colorScheme="blue">Go to Marketplace</Button>
      </Stack>
    </Box>
  );
};

export default InvestorYield; 