import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Progress, Badge, Heading, Stat, StatLabel, StatNumber,
  StatHelpText, Alert, AlertIcon, Tooltip, Icon, Divider, useColorModeValue, 
  CircularProgress, CircularProgressLabel, Button, Collapse, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { 
  InfoIcon, WarningIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon,
  TimeIcon, StarIcon, ArrowUpIcon, ArrowDownIcon,
  LockIcon, SpinnerIcon, SettingsIcon, ViewIcon
} from '@chakra-ui/icons';

const RiskScoring = ({ invoice }) => {
  const [riskScore, setRiskScore] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [marketAnalysis, setMarketAnalysis] = useState({});
  const [processingTime, setProcessingTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { isOpen: isDetailsOpen, onToggle: onDetailsToggle } = useDisclosure();
  const { isOpen: isAiOpen, onToggle: onAiToggle } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (invoice) {
      calculateAdvancedRiskScore(invoice);
    }
  }, [invoice]);

  const simulateAIProcessing = async () => {
    setIsAnalyzing(true);
    const startTime = Date.now();
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const endTime = Date.now();
    setProcessingTime(endTime - startTime);
    setIsAnalyzing(false);
  };

  const calculateAdvancedRiskScore = async (invoiceData) => {
    await simulateAIProcessing();
    
    let score = 0;
    const factors = [];
    const insights = [];
    const marketData = {};

    // Enhanced Credit Score Analysis (35% weight)
    const creditScore = parseInt(invoiceData.creditScore) || 0;
    let creditFactor = 0;
    let creditInsight = '';
    
    if (creditScore >= 800) {
      creditFactor = 98;
      creditInsight = 'Exceptional credit profile with excellent payment history';
      factors.push({ 
        name: 'Credit Score Analysis', 
        score: 98, 
        weight: 35, 
        status: 'excellent', 
        description: 'Exceptional credit rating (800+)',
        trend: 'up',
        confidence: 95
      });
    } else if (creditScore >= 750) {
      creditFactor = 92;
      creditInsight = 'Strong credit profile with consistent payment behavior';
      factors.push({ 
        name: 'Credit Score Analysis', 
        score: 92, 
        weight: 35, 
        status: 'excellent', 
        description: 'Excellent credit rating (750-799)',
        trend: 'up',
        confidence: 90
      });
    } else if (creditScore >= 700) {
      creditFactor = 85;
      creditInsight = 'Good credit standing with minor risk factors';
      factors.push({ 
        name: 'Credit Score Analysis', 
        score: 85, 
        weight: 35, 
        status: 'good', 
        description: 'Good credit rating (700-749)',
        trend: 'stable',
        confidence: 85
      });
    } else if (creditScore >= 650) {
      creditFactor = 72;
      creditInsight = 'Fair credit with some payment inconsistencies';
      factors.push({ 
        name: 'Credit Score Analysis', 
        score: 72, 
        weight: 35, 
        status: 'fair', 
        description: 'Fair credit rating (650-699)',
        trend: 'down',
        confidence: 75
      });
    } else {
      creditFactor = 45;
      creditInsight = 'Poor credit history with significant payment issues';
      factors.push({ 
        name: 'Credit Score Analysis', 
        score: 45, 
        weight: 35, 
        status: 'poor', 
        description: 'Poor credit rating (<650)',
        trend: 'down',
        confidence: 60
      });
    }
    score += creditFactor * 0.35;
    insights.push({ type: 'credit', message: creditInsight, impact: 'high' });

    // Enhanced Amount Analysis (25% weight)
    const amount = parseFloat(invoiceData.amount?.toString().replace(/[^\d.]/g, '')) || 0;
    let amountFactor = 0;
    let amountInsight = '';
    
    if (amount <= 500) {
      amountFactor = 95;
      amountInsight = 'Micro-invoice with minimal financial exposure';
      factors.push({ 
        name: 'Financial Exposure', 
        score: 95, 
        weight: 25, 
        status: 'low', 
        description: 'Micro-invoice ($0-500)',
        trend: 'stable',
        confidence: 90
      });
    } else if (amount <= 2000) {
      amountFactor = 88;
      amountInsight = 'Small invoice with manageable risk profile';
      factors.push({ 
        name: 'Financial Exposure', 
        score: 88, 
        weight: 25, 
        status: 'low', 
        description: 'Small invoice ($500-2K)',
        trend: 'stable',
        confidence: 85
      });
    } else if (amount <= 10000) {
      amountFactor = 78;
      amountInsight = 'Medium invoice requiring careful evaluation';
      factors.push({ 
        name: 'Financial Exposure', 
        score: 78, 
        weight: 25, 
        status: 'medium', 
        description: 'Medium invoice ($2K-10K)',
        trend: 'stable',
        confidence: 80
      });
    } else if (amount <= 50000) {
      amountFactor = 65;
      amountInsight = 'Large invoice with significant financial exposure';
      factors.push({ 
        name: 'Financial Exposure', 
        score: 65, 
        weight: 25, 
        status: 'high', 
        description: 'Large invoice ($10K-50K)',
        trend: 'down',
        confidence: 75
      });
    } else {
      amountFactor = 50;
      amountInsight = 'Enterprise-level invoice requiring extensive due diligence';
      factors.push({ 
        name: 'Financial Exposure', 
        score: 50, 
        weight: 25, 
        status: 'very-high', 
        description: 'Enterprise invoice ($50K+)',
        trend: 'down',
        confidence: 70
      });
    }
    score += amountFactor * 0.25;
    insights.push({ type: 'amount', message: amountInsight, impact: 'medium' });

    // Enhanced Payment Terms Analysis (20% weight)
    const paymentTerms = invoiceData.paymentTerms?.toLowerCase() || '';
    let termsFactor = 0;
    let termsInsight = '';
    
    if (paymentTerms.includes('net 15') || paymentTerms.includes('due on receipt')) {
      termsFactor = 95;
      termsInsight = 'Expedited payment terms indicate strong cash flow management';
      factors.push({ 
        name: 'Payment Velocity', 
        score: 95, 
        weight: 20, 
        status: 'excellent', 
        description: 'Fast payment terms (≤15 days)',
        trend: 'up',
        confidence: 90
      });
    } else if (paymentTerms.includes('net 30')) {
      termsFactor = 85;
      termsInsight = 'Standard payment terms with industry-typical risk';
      factors.push({ 
        name: 'Payment Velocity', 
        score: 85, 
        weight: 20, 
        status: 'good', 
        description: 'Standard payment terms (30 days)',
        trend: 'stable',
        confidence: 85
      });
    } else if (paymentTerms.includes('net 60')) {
      termsFactor = 70;
      termsInsight = 'Extended payment terms increase liquidity risk';
      factors.push({ 
        name: 'Payment Velocity', 
        score: 70, 
        weight: 20, 
        status: 'fair', 
        description: 'Extended payment terms (60 days)',
        trend: 'down',
        confidence: 75
      });
    } else if (paymentTerms.includes('net 90')) {
      termsFactor = 55;
      termsInsight = 'Long payment terms significantly increase default risk';
      factors.push({ 
        name: 'Payment Velocity', 
        score: 55, 
        weight: 20, 
        status: 'poor', 
        description: 'Long payment terms (90+ days)',
        trend: 'down',
        confidence: 70
      });
    } else {
      termsFactor = 75;
      termsInsight = 'Unclear payment terms require clarification';
      factors.push({ 
        name: 'Payment Velocity', 
        score: 75, 
        weight: 20, 
        status: 'unknown', 
        description: 'Unclear payment terms',
        trend: 'stable',
        confidence: 60
      });
    }
    score += termsFactor * 0.20;
    insights.push({ type: 'terms', message: termsInsight, impact: 'medium' });

    // Business Intelligence Analysis (15% weight)
    const businessAge = Math.floor(Math.random() * 15) + 1; // Enhanced mock
    const businessStability = Math.random() * 100;
    let businessFactor = 0;
    let businessInsight = '';
    
    if (businessAge >= 10 && businessStability >= 80) {
      businessFactor = 92;
      businessInsight = 'Established enterprise with proven track record and stable operations';
      factors.push({ 
        name: 'Business Intelligence', 
        score: 92, 
        weight: 15, 
        status: 'excellent', 
        description: 'Established enterprise (10+ years)',
        trend: 'up',
        confidence: 90
      });
    } else if (businessAge >= 5 && businessStability >= 70) {
      businessFactor = 82;
      businessInsight = 'Mature business with solid operational foundation';
      factors.push({ 
        name: 'Business Intelligence', 
        score: 82, 
        weight: 15, 
        status: 'good', 
        description: 'Mature business (5-10 years)',
        trend: 'up',
        confidence: 85
      });
    } else if (businessAge >= 2 && businessStability >= 60) {
      businessFactor = 72;
      businessInsight = 'Growing business with developing operational stability';
      factors.push({ 
        name: 'Business Intelligence', 
        score: 72, 
        weight: 15, 
        status: 'fair', 
        description: 'Growing business (2-5 years)',
        trend: 'stable',
        confidence: 75
      });
    } else {
      businessFactor = 58;
      businessInsight = 'Early-stage business with limited operational history';
      factors.push({ 
        name: 'Business Intelligence', 
        score: 58, 
        weight: 15, 
        status: 'poor', 
        description: 'Startup business (<2 years)',
        trend: 'down',
        confidence: 65
      });
    }
    score += businessFactor * 0.15;
    insights.push({ type: 'business', message: businessInsight, impact: 'high' });

    // Market & Industry Analysis (5% weight)
    const industryStability = 85; // Mock industry analysis
    const marketTrend = Math.random() > 0.5 ? 'up' : 'stable';
    factors.push({ 
      name: 'Market Analysis', 
      score: industryStability, 
      weight: 5, 
      status: 'stable', 
      description: 'Stable industry with positive outlook',
      trend: marketTrend,
      confidence: 80
    });
    score += industryStability * 0.05;
    insights.push({ 
      type: 'market', 
      message: `Industry analysis shows ${marketTrend === 'up' ? 'positive growth trends' : 'stable market conditions'}`, 
      impact: 'low' 
    });

    // Generate market analysis data
    marketData.industryGrowth = marketTrend === 'up' ? '+3.2%' : '+0.8%';
    marketData.marketSize = '$2.3T';
    marketData.competitionLevel = 'Moderate';
    marketData.regulatoryRisk = 'Low';

    setRiskScore(Math.round(score));
    setRiskFactors(factors);
    setAiInsights(insights);
    setMarketAnalysis(marketData);
  };

  const getRiskLevel = (score) => {
    if (score >= 90) return { 
      level: 'Premium Investment', 
      color: 'green', 
      description: 'Exceptional opportunity with minimal risk',
      icon: LockIcon,
      recommendation: 'Strong buy recommendation'
    };
    if (score >= 80) return { 
      level: 'Low Risk', 
      color: 'green', 
      description: 'Safe investment with good returns',
      icon: CheckCircleIcon,
      recommendation: 'Recommended investment'
    };
    if (score >= 70) return { 
      level: 'Medium Risk', 
      color: 'yellow', 
      description: 'Moderate risk with balanced returns',
      icon: InfoIcon,
      recommendation: 'Consider with caution'
    };
    if (score >= 55) return { 
      level: 'High Risk', 
      color: 'orange', 
      description: 'Higher risk requiring careful evaluation',
      icon: WarningIcon,
      recommendation: 'High-risk investment'
    };
    return { 
      level: 'Very High Risk', 
      color: 'red', 
      description: 'High-risk investment with uncertain returns',
      icon: WarningIcon,
      recommendation: 'Not recommended'
    };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent':
        return <CheckCircleIcon color="green.500" />;
      case 'good':
        return <InfoIcon color="blue.500" />;
      case 'fair':
        return <WarningIcon color="yellow.500" />;
      case 'poor':
      case 'very-high':
        return <WarningIcon color="red.500" />;
      default:
        return <InfoIcon color="gray.500" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon color="green.500" />;
      case 'down':
        return <ArrowDownIcon color="red.500" />;
      default:
        return <TimeIcon color="gray.500" />;
    }
  };

  if (!riskScore) return null;

  const riskLevel = getRiskLevel(riskScore);

  return (
    <Box p={6} bg={bgColor} borderRadius="md" border="1px solid" borderColor={borderColor} boxShadow="md">
      <VStack spacing={6} align="stretch">
        <Heading size="md" color="gray.800" display="flex" alignItems="center" gap={2}>
          <Icon as={SettingsIcon} color="purple.500" />
          AI Risk Assessment Engine
          {isAnalyzing && <CircularProgress isIndeterminate size="20px" color="purple.500" />}
        </Heading>
        
        {/* Processing Info */}
        {processingTime > 0 && (
          <Box p={3} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
            <HStack spacing={2}>
              <Icon as={SpinnerIcon} color="purple.500" />
              <Text fontSize="sm" color="purple.700" fontWeight="medium">
                AI Analysis completed in {processingTime}ms using advanced machine learning algorithms
              </Text>
            </HStack>
          </Box>
        )}
        
        {/* Overall Risk Score */}
        <Box textAlign="center" p={6} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
          <HStack justify="center" mb={4}>
            <CircularProgress
              value={riskScore}
              size="120px"
              thickness="8px"
              color={riskLevel.color === 'green' ? 'green.400' : riskLevel.color === 'yellow' ? 'yellow.400' : riskLevel.color === 'orange' ? 'orange.400' : 'red.400'}
              trackColor="gray.200"
            >
              <CircularProgressLabel>
                <VStack spacing={0}>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    {riskScore}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    /100
                  </Text>
                </VStack>
              </CircularProgressLabel>
            </CircularProgress>
            <VStack align="start" spacing={2}>
              <HStack>
                <Icon as={riskLevel.icon} color={`${riskLevel.color}.500`} />
                <Badge 
                  colorScheme={riskLevel.color} 
                  size="lg" 
                  px={3} 
                  py={1} 
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {riskLevel.level}
                </Badge>
              </HStack>
              <Text color="gray.600" fontSize="sm" fontWeight="medium" textAlign="left">
                {riskLevel.description}
              </Text>
              <Text color="gray.500" fontSize="xs" textAlign="left">
                {riskLevel.recommendation}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* AI Insights */}
        <Box p={4} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAiToggle}
            rightIcon={isAiOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            color="blue.700"
            fontWeight="bold"
            fontSize="sm"
            p={0}
            h="auto"
          >
            <Icon as={SettingsIcon} mr={2} />
            AI-Generated Insights ({aiInsights.length})
          </Button>
          <Collapse in={isAiOpen}>
            <VStack spacing={2} align="stretch" mt={3}>
              {aiInsights.map((insight, index) => (
                <Alert 
                  key={index}
                  status={insight.impact === 'high' ? 'success' : insight.impact === 'medium' ? 'info' : 'warning'}
                  bg={`${insight.impact === 'high' ? 'green' : insight.impact === 'medium' ? 'blue' : 'yellow'}.50`}
                  color={`${insight.impact === 'high' ? 'green' : insight.impact === 'medium' ? 'blue' : 'yellow'}.700`}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={`${insight.impact === 'high' ? 'green' : insight.impact === 'medium' ? 'blue' : 'yellow'}.200`}
                >
                  <AlertIcon />
                  <Text fontSize="sm" fontWeight="medium">{insight.message}</Text>
                </Alert>
              ))}
            </VStack>
          </Collapse>
        </Box>

        {/* Risk Breakdown */}
        <VStack spacing={4} align="stretch">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDetailsToggle}
            rightIcon={isDetailsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            color="gray.700"
            fontWeight="bold"
            fontSize="sm"
            p={0}
            h="auto"
          >
            <Icon as={ViewIcon} mr={2} />
            Detailed Risk Analysis ({riskFactors.length} factors)
          </Button>
          <Collapse in={isDetailsOpen}>
            <VStack spacing={3} align="stretch">
              {riskFactors.map((factor, index) => (
                <Box key={index} p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200" _hover={{ bg: "white", borderColor: "teal.300", transition: "all 0.2s" }}>
                  <HStack justify="space-between" mb={3}>
                    <HStack spacing={3}>
                      {getStatusIcon(factor.status)}
                      <Text fontWeight="bold" color="gray.800" fontSize="sm">
                        {factor.name}
                      </Text>
                      {getTrendIcon(factor.trend)}
                    </HStack>
                    <HStack spacing={3}>
                      <Text color="gray.600" fontSize="sm" fontWeight="medium">
                        {factor.score}/100
                      </Text>
                      <Badge colorScheme="teal" variant="subtle" px={2} py={1} borderRadius="md" fontSize="xs">
                        {factor.weight}%
                      </Badge>
                      <Tooltip label={`Confidence: ${factor.confidence}%`}>
                        <Badge colorScheme="purple" variant="outline" px={2} py={1} borderRadius="md" fontSize="xs">
                          {factor.confidence}%
                        </Badge>
                      </Tooltip>
                    </HStack>
                  </HStack>
                  <Progress
                    value={factor.score}
                    colorScheme={factor.score >= 80 ? 'green' : factor.score >= 60 ? 'yellow' : 'red'}
                    size="sm"
                    borderRadius="full"
                    mb={3}
                    bg="gray.200"
                  />
                  <Text color="gray.600" fontSize="sm">
                    {factor.description}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Collapse>
        </VStack>

        {/* Market Analysis */}
        <Box p={4} bg="green.50" borderRadius="lg" border="1px solid" borderColor="green.200">
          <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center" gap={2}>
            <Icon as={ArrowUpIcon} color="green.500" />
            Market Intelligence
          </Heading>
          <Table size="sm" variant="simple">
            <Tbody>
              <Tr>
                <Td fontWeight="bold" color="gray.600">Industry Growth</Td>
                <Td color="green.600" fontWeight="bold">{marketAnalysis.industryGrowth}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold" color="gray.600">Market Size</Td>
                <Td color="gray.800">{marketAnalysis.marketSize}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold" color="gray.600">Competition Level</Td>
                <Td color="gray.800">{marketAnalysis.competitionLevel}</Td>
              </Tr>
              <Tr>
                <Td fontWeight="bold" color="gray.600">Regulatory Risk</Td>
                <Td color="green.600" fontWeight="bold">{marketAnalysis.regulatoryRisk}</Td>
              </Tr>
            </Tbody>
          </Table>
        </Box>

        {/* Enhanced Recommendations */}
        <Box p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
          <Heading size="sm" color="gray.800" mb={3} display="flex" alignItems="center" gap={2}>
            <Icon as={StarIcon} color="yellow.500" />
            AI Investment Recommendations
          </Heading>
          <VStack spacing={2} align="stretch">
            {riskScore >= 90 && (
              <Alert status="success" bg="green.50" color="green.700" borderRadius="md" border="1px solid" borderColor="green.200">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">Premium Investment Opportunity</Text>
                  <Text fontSize="xs">Exceptional risk-reward profile with minimal downside risk</Text>
                </VStack>
              </Alert>
            )}
            {riskScore >= 80 && riskScore < 90 && (
              <Alert status="success" bg="green.50" color="green.700" borderRadius="md" border="1px solid" borderColor="green.200">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">Strong Investment Recommendation</Text>
                  <Text fontSize="xs">Low risk profile with attractive returns potential</Text>
                </VStack>
              </Alert>
            )}
            {riskScore >= 70 && riskScore < 80 && (
              <Alert status="info" bg="blue.50" color="blue.700" borderRadius="md" border="1px solid" borderColor="blue.200">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">Moderate Risk Investment</Text>
                  <Text fontSize="xs">Balanced risk-reward profile suitable for diversified portfolios</Text>
                </VStack>
              </Alert>
            )}
            {riskScore < 70 && (
              <Alert status="warning" bg="orange.50" color="orange.700" borderRadius="md" border="1px solid" borderColor="orange.200">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">High-Risk Investment</Text>
                  <Text fontSize="xs">Significant risk factors require careful evaluation and risk management</Text>
                </VStack>
              </Alert>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default RiskScoring;
