import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Select, SimpleGrid, Badge, Progress, Stat, StatLabel, StatNumber,
  StatHelpText, Alert, AlertIcon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton,
  ModalBody, ModalFooter, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Checkbox, Divider
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowUpIcon } from '@chakra-ui/icons';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

const PortfolioBuilder = ({ isOpen, onClose, availableInvoices }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioSettings, setPortfolioSettings] = useState({
    maxRisk: 70,
    minYield: 4,
    maxAmount: 10000,
    diversification: 5, // number of different businesses
    autoRebalance: false
  });
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState(null);

  useEffect(() => {
    calculatePortfolioMetrics();
  }, [portfolio]);

  const calculatePortfolioMetrics = () => {
    if (portfolio.length === 0) {
      setPortfolioMetrics(null);
      return;
    }

    const totalAmount = portfolio.reduce((sum, inv) => sum + parseFloat(inv.amount?.toString().replace(/[^\d.]/g, '')), 0);
    const totalYield = portfolio.reduce((sum, inv) => sum + parseFloat(inv.repaymentPremium?.toString().replace(/[^\d.]/g, '')), 0);
    const avgYield = totalYield / portfolio.length;
    
    // Calculate weighted risk score
    const totalRiskScore = portfolio.reduce((sum, inv) => {
      const riskScore = inv.creditScore >= 750 ? 20 : inv.creditScore >= 650 ? 60 : 90;
      const amount = parseFloat(inv.amount?.toString().replace(/[^\d.]/g, ''));
      return sum + (riskScore * amount);
    }, 0);
    const avgRisk = totalRiskScore / totalAmount;

    // Calculate diversification score
    const uniqueBusinesses = new Set(portfolio.map(inv => inv.business)).size;
    const diversificationScore = Math.min((uniqueBusinesses / portfolioSettings.diversification) * 100, 100);

    setPortfolioMetrics({
      totalAmount,
      avgYield,
      avgRisk,
      diversificationScore,
      uniqueBusinesses,
      totalInvoices: portfolio.length
    });
  };

  const addToPortfolio = (invoice) => {
    if (portfolio.find(inv => inv.id === invoice.id)) return;
    
    setPortfolio(prev => [...prev, invoice]);
    setSelectedInvoices(prev => [...prev, invoice.id]);
  };

  const removeFromPortfolio = (invoiceId) => {
    setPortfolio(prev => prev.filter(inv => inv.id !== invoiceId));
    setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
  };

  const getRiskLevel = (score) => {
    if (score <= 30) return { level: 'Low', color: 'green' };
    if (score <= 60) return { level: 'Medium', color: 'yellow' };
    return { level: 'High', color: 'red' };
  };

  const getFilteredInvoices = () => {
    return availableInvoices.filter(invoice => {
      const amount = parseFloat(invoice.amount?.toString().replace(/[^\d.]/g, ''));
      const premium = parseFloat(invoice.repaymentPremium?.toString().replace(/[^\d.]/g, ''));
      const riskScore = invoice.creditScore >= 750 ? 20 : invoice.creditScore >= 650 ? 60 : 90;

      return amount <= portfolioSettings.maxAmount &&
             premium >= portfolioSettings.minYield &&
             riskScore <= portfolioSettings.maxRisk;
    });
  };

  const createPortfolio = () => {
    // In a real app, this would save the portfolio and execute the investments
    console.log('Creating portfolio:', portfolio);
    onClose();
  };

  const autoBuildPortfolio = () => {
    const filtered = getFilteredInvoices();
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, portfolioSettings.diversification);
    
    setPortfolio(selected);
    setSelectedInvoices(selected.map(inv => inv.id));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" maxH="90vh">
        <ModalHeader>
          <HStack spacing={3}>
            <ArrowUpIcon color="blue.400" />
            <Text>Portfolio Builder</Text>
            <Badge colorScheme="blue">{portfolio.length} invoices selected</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody overflowY="auto">
          <VStack spacing={6} align="stretch">
            {/* Portfolio Settings */}
            <GlassCard>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="lg" color="white">Portfolio Settings</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text mb={2} color="gray.100">Maximum Risk Level</Text>
                    <Slider
                      value={portfolioSettings.maxRisk}
                      onChange={(val) => setPortfolioSettings(prev => ({ ...prev, maxRisk: val }))}
                      min={10}
                      max={100}
                      colorScheme="red"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text fontSize="sm" color="gray.200">{portfolioSettings.maxRisk}%</Text>
                  </Box>
                  
                  <Box>
                    <Text mb={2} color="gray.100">Minimum Yield</Text>
                    <Slider
                      value={portfolioSettings.minYield}
                      onChange={(val) => setPortfolioSettings(prev => ({ ...prev, minYield: val }))}
                      min={1}
                      max={20}
                      colorScheme="green"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text fontSize="sm" color="gray.200">{portfolioSettings.minYield}%</Text>
                  </Box>
                  
                  <Box>
                    <Text mb={2} color="gray.100">Maximum Amount per Invoice</Text>
                    <Select
                      value={portfolioSettings.maxAmount}
                      onChange={(e) => setPortfolioSettings(prev => ({ ...prev, maxAmount: parseInt(e.target.value) }))}
                      bg="gray.700"
                    >
                      <option value={1000}>$1,000</option>
                      <option value={5000}>$5,000</option>
                      <option value={10000}>$10,000</option>
                      <option value={25000}>$25,000</option>
                      <option value={50000}>$50,000</option>
                    </Select>
                  </Box>
                  
                  <Box>
                    <Text mb={2} color="gray.100">Target Diversification</Text>
                    <Slider
                      value={portfolioSettings.diversification}
                      onChange={(val) => setPortfolioSettings(prev => ({ ...prev, diversification: val }))}
                      min={3}
                      max={10}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                    <Text fontSize="sm" color="gray.200">{portfolioSettings.diversification} businesses</Text>
                  </Box>
                </SimpleGrid>
                
                <HStack spacing={4}>
                  <GradientButton onClick={autoBuildPortfolio} size="sm">
                    <AddIcon mr={2} />
                    Auto-Build Portfolio
                  </GradientButton>
                  <Checkbox
                    isChecked={portfolioSettings.autoRebalance}
                    onChange={(e) => setPortfolioSettings(prev => ({ ...prev, autoRebalance: e.target.checked }))}
                    colorScheme="blue"
                  >
                    Auto-rebalance
                  </Checkbox>
                </HStack>
              </VStack>
            </GlassCard>

            {/* Portfolio Metrics */}
            {portfolioMetrics && (
              <GlassCard>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg" color="white">Portfolio Metrics</Text>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                    <Stat textAlign="center">
                      <StatLabel color="gray.100">Total Amount</StatLabel>
                      <StatNumber color="white" fontSize="xl">
                        ${portfolioMetrics.totalAmount.toLocaleString()}
                      </StatNumber>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel color="gray.100">Avg Yield</StatLabel>
                      <StatNumber color="green.400" fontSize="xl">
                        {portfolioMetrics.avgYield.toFixed(1)}%
                      </StatNumber>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel color="gray.100">Risk Level</StatLabel>
                      <StatNumber color={getRiskLevel(portfolioMetrics.avgRisk).color} fontSize="xl">
                        {getRiskLevel(portfolioMetrics.avgRisk).level}
                      </StatNumber>
                    </Stat>
                    
                    <Stat textAlign="center">
                      <StatLabel color="gray.100">Diversification</StatLabel>
                      <StatNumber color="blue.400" fontSize="xl">
                        {portfolioMetrics.uniqueBusinesses}
                      </StatNumber>
                      <StatHelpText color="gray.200">
                        {portfolioMetrics.totalInvoices} invoices
                      </StatHelpText>
                    </Stat>
                  </SimpleGrid>
                  
                  <Box w="full">
                    <HStack justify="space-between" mb={2}>
                      <Text color="gray.100">Diversification Score</Text>
                      <Text color="white">{portfolioMetrics.diversificationScore.toFixed(0)}%</Text>
                    </HStack>
                    <Progress
                      value={portfolioMetrics.diversificationScore}
                      colorScheme="blue"
                      size="lg"
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              </GlassCard>
            )}

            {/* Available Invoices */}
            <GlassCard>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    Available Invoices ({getFilteredInvoices().length})
                  </Text>
                </HStack>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  {getFilteredInvoices().map((invoice) => (
                    <Box
                      key={invoice.id}
                      p={4}
                      bg="gray.700"
                      borderRadius="lg"
                      border={selectedInvoices.includes(invoice.id) ? "2px solid" : "1px solid"}
                      borderColor={selectedInvoices.includes(invoice.id) ? "blue.400" : "gray.600"}
                    >
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold" color="white">
                              {invoice.invoiceNumber}
                            </Text>
                            <Text fontSize="sm" color="gray.200">
                              {invoice.business}
                            </Text>
                          </VStack>
                          <Badge colorScheme={getRiskLevel(invoice.creditScore >= 750 ? 20 : invoice.creditScore >= 650 ? 60 : 90).color}>
                            {getRiskLevel(invoice.creditScore >= 750 ? 20 : invoice.creditScore >= 650 ? 60 : 90).level}
                          </Badge>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text color="white" fontWeight="bold">
                            {invoice.amount}
                          </Text>
                          <Text color="green.400" fontWeight="bold">
                            +{invoice.repaymentPremium}
                          </Text>
                        </HStack>
                        
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.200">
                            Due: {invoice.dueDate}
                          </Text>
                          <Text fontSize="sm" color="gray.200">
                            Score: {invoice.creditScore}
                          </Text>
                        </HStack>
                        
                        {selectedInvoices.includes(invoice.id) ? (
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="outline"
                            onClick={() => removeFromPortfolio(invoice.id)}
                          >
                            <DeleteIcon mr={2} />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            variant="outline"
                            onClick={() => addToPortfolio(invoice)}
                          >
                            <AddIcon mr={2} />
                            Add to Portfolio
                          </Button>
                        )}
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </GlassCard>

            {/* Portfolio Preview */}
            {portfolio.length > 0 && (
              <GlassCard>
                <VStack spacing={4}>
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    Portfolio Preview ({portfolio.length} invoices)
                  </Text>
                  <VStack spacing={2} w="full" maxH="200px" overflowY="auto">
                    {portfolio.map((invoice) => (
                      <HStack
                        key={invoice.id}
                        justify="space-between"
                        w="full"
                        p={2}
                        bg="gray.700"
                        borderRadius="md"
                      >
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" color="white" fontSize="sm">
                            {invoice.invoiceNumber}
                          </Text>
                          <Text color="gray.200" fontSize="xs">
                            {invoice.business}
                          </Text>
                        </VStack>
                        <HStack spacing={3}>
                          <Text color="white" fontSize="sm">
                            {invoice.amount}
                          </Text>
                          <Text color="green.400" fontSize="sm">
                            +{invoice.repaymentPremium}
                          </Text>
                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => removeFromPortfolio(invoice.id)}
                          >
                            <DeleteIcon />
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </VStack>
                </VStack>
              </GlassCard>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <GradientButton
            onClick={createPortfolio}
            isDisabled={portfolio.length === 0}
          >
            Create Portfolio ({portfolio.length} invoices)
          </GradientButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PortfolioBuilder;
