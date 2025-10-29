import React from 'react';
import {
  Box, VStack, HStack, Text, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Progress, Badge, SimpleGrid, Heading, Divider
} from '@chakra-ui/react';
import GlassCard from './GlassCard';

const AnalyticsDashboard = ({ portfolioData }) => {
  const totalInvested = portfolioData?.totalInvested || 0;
  const totalReturns = portfolioData?.totalReturns || 0;
  const activeInvoices = portfolioData?.activeInvoices || 0;
  const completedInvoices = portfolioData?.completedInvoices || 0;
  const avgYield = portfolioData?.avgYield || 0;

  const roi = totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested * 100) : 0;

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color="white" textAlign="center">
        📊 Portfolio Analytics
      </Heading>
      
      {/* Key Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <GlassCard textAlign="center">
          <Stat>
            <StatLabel color="gray.300">Total Invested</StatLabel>
            <StatNumber color="white" fontSize="2xl">
              ${totalInvested.toLocaleString()}
            </StatNumber>
            <StatHelpText color="gray.400">USDC</StatHelpText>
          </Stat>
        </GlassCard>

        <GlassCard textAlign="center">
          <Stat>
            <StatLabel color="gray.300">Total Returns</StatLabel>
            <StatNumber color="white" fontSize="2xl">
              ${totalReturns.toLocaleString()}
            </StatNumber>
            <StatHelpText color="gray.400">
              <StatArrow type={roi >= 0 ? 'increase' : 'decrease'} />
              {roi.toFixed(2)}% ROI
            </StatHelpText>
          </Stat>
        </GlassCard>

        <GlassCard textAlign="center">
          <Stat>
            <StatLabel color="gray.300">Active Invoices</StatLabel>
            <StatNumber color="white" fontSize="2xl">
              {activeInvoices}
            </StatNumber>
            <StatHelpText color="gray.400">Pending</StatHelpText>
          </Stat>
        </GlassCard>

        <GlassCard textAlign="center">
          <Stat>
            <StatLabel color="gray.300">Completed</StatLabel>
            <StatNumber color="white" fontSize="2xl">
              {completedInvoices}
            </StatNumber>
            <StatHelpText color="gray.400">Invoices</StatHelpText>
          </Stat>
        </GlassCard>
      </SimpleGrid>

      {/* Performance Chart Placeholder */}
      <GlassCard>
        <VStack spacing={4}>
          <Heading size="md" color="white">Performance Overview</Heading>
          <Box w="full" h="200px" bg="gray.700" borderRadius="lg" p={4}>
            <Text color="gray.400" textAlign="center" mt="20%">
              📈 Performance Chart Coming Soon
            </Text>
            <Text color="gray.500" textAlign="center" fontSize="sm">
              Real-time portfolio performance visualization
            </Text>
          </Box>
        </VStack>
      </GlassCard>

      {/* Risk Distribution */}
      <GlassCard>
        <VStack spacing={4}>
          <Heading size="md" color="white">Risk Distribution</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full">
            <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
              <Text color="green.400" fontSize="2xl" fontWeight="bold">
                {portfolioData?.lowRiskCount || 0}
              </Text>
              <Text color="gray.300">Low Risk</Text>
              <Badge colorScheme="green" mt={2}>A+ Rating</Badge>
            </Box>
            <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
              <Text color="yellow.400" fontSize="2xl" fontWeight="bold">
                {portfolioData?.mediumRiskCount || 0}
              </Text>
              <Text color="gray.300">Medium Risk</Text>
              <Badge colorScheme="yellow" mt={2}>B Rating</Badge>
            </Box>
            <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
              <Text color="red.400" fontSize="2xl" fontWeight="bold">
                {portfolioData?.highRiskCount || 0}
              </Text>
              <Text color="gray.300">High Risk</Text>
              <Badge colorScheme="red" mt={2}>C Rating</Badge>
            </Box>
          </SimpleGrid>
        </VStack>
      </GlassCard>

      {/* Portfolio Health */}
      <GlassCard>
        <VStack spacing={4}>
          <Heading size="md" color="white">Portfolio Health</Heading>
          <VStack spacing={4} w="full">
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text color="gray.300">Diversification</Text>
                <Text color="white">{portfolioData?.diversificationScore || 85}%</Text>
              </HStack>
              <Progress
                value={portfolioData?.diversificationScore || 85}
                colorScheme="green"
                size="lg"
                borderRadius="full"
              />
            </Box>
            
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text color="gray.300">Liquidity</Text>
                <Text color="white">{portfolioData?.liquidityScore || 72}%</Text>
              </HStack>
              <Progress
                value={portfolioData?.liquidityScore || 72}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
              />
            </Box>
            
            <Box w="full">
              <HStack justify="space-between" mb={2}>
                <Text color="gray.300">Risk Management</Text>
                <Text color="white">{portfolioData?.riskScore || 90}%</Text>
              </HStack>
              <Progress
                value={portfolioData?.riskScore || 90}
                colorScheme="purple"
                size="lg"
                borderRadius="full"
              />
            </Box>
          </VStack>
        </VStack>
      </GlassCard>
    </VStack>
  );
};

export default AnalyticsDashboard;
