import React from 'react';
import { Box, Heading, Text, Stack, Button, VStack, HStack, Icon, SimpleGrid, Container, Badge, Flex, Image, useColorModeValue, CircularProgress, CircularProgressLabel } from '@chakra-ui/react';
import { ArrowForwardIcon, StarIcon, LockIcon, ExternalLinkIcon, ArrowUpIcon, CheckIcon, TimeIcon, ViewIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/Footer';

const Home = () => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, blue.50, teal.50)',
    'linear(to-br, purple.900, blue.900, teal.900)'
  );
  
  return (
    <Box minH="100vh" bg={bgGradient}>
      {/* Hero Section */}
      <Container maxW="7xl" py={20}>
        <VStack spacing={20} align="center">
          {/* Main Hero */}
          <VStack spacing={6} align="center" textAlign="center">
            <Heading 
              fontSize={{ base: "2xl", md: "4xl" }} 
              fontWeight="bold" 
              color="gray.700"
              maxW="4xl"
            >
              Connecting Balkan SMEs with global investors through NFT-backed invoice financing
      </Heading>
            <Text 
              fontSize={{ base: "xl", md: "2xl" }} 
              color="gray.600" 
              fontWeight="500"
              maxW="4xl"
            >
        Unlock working capital. Invest in real-world cashflows.
      </Text>
          </VStack>
      
          {/* Problem & Solution Side by Side */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full" maxW="6xl">
            {/* Problem Statement */}
            <Box 
              bg="white" 
              p={8} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="red.200" 
              boxShadow="xl"
              position="relative"
              overflow="hidden"
              h="fit-content"
            >
              <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, red.400, red.600)" />
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={TimeIcon} color="red.500" boxSize={6} />
                  <Heading size="lg" color="red.700">
                    The Problem
                  </Heading>
                </HStack>
                <Text fontSize="lg" color="red.600" fontWeight="500">
                  In the Balkans and across emerging markets, <Text as="span" fontWeight="bold" color="red.700">60% of SMEs report late payments</Text> of 30-90 days.
                </Text>
                <Text fontSize="md" color="red.500">
                  This cash flow crisis prevents growth, forces expensive bank loans, and limits economic development.
                </Text>
              </VStack>
            </Box>
            
            {/* Solution */}
            <Box 
              bg="white" 
              p={8} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="green.200" 
              boxShadow="xl"
              position="relative"
              overflow="hidden"
              h="fit-content"
            >
              <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, green.400, green.600)" />
              <VStack spacing={4} align="start">
                <HStack spacing={3}>
                  <Icon as={CheckIcon} color="green.500" boxSize={6} />
                  <Heading size="lg" color="green.700">
                    Our Solution
                  </Heading>
                </HStack>
                <Text fontSize="lg" color="green.600" fontWeight="500">
                  Businesses mint invoices as <Text as="span" fontWeight="bold" color="green.700">Solana NFTs</Text> and sell them to global investors for <Text as="span" fontWeight="bold" color="green.700">instant liquidity</Text>.
                </Text>
                <Text fontSize="md" color="green.500">
                  When clients pay, smart contracts automatically distribute funds. No banks, no intermediaries, just transparent DeFi.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Why Solana */}
          {/* Process Flow */}
          <Box 
            bg="white" 
            p={8} 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor="blue.200" 
            maxW="6xl" 
            w="full"
            boxShadow="xl"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top={0} left={0} right={0} h="4px" bgGradient="linear(to-r, blue.400, blue.600)" />
            <VStack spacing={8}>
                <HStack spacing={3}>
                <Icon as={ArrowForwardIcon} color="blue.500" boxSize={6} />
                <Heading size="lg" color="blue.700">
                  How It Works: 4-Step Process
                </Heading>
                </HStack>
              
              {/* Process Flow with Circular Statistics */}
              <Box w="full" maxW="6xl" mx="auto" py={8}>
                {/* All Steps in One Line */}
                <HStack justify="space-between" align="flex-start" w="full" spacing={4}>
                  {/* Step 1: Upload */}
                  <VStack spacing={3} align="center" flex="1" position="relative" zIndex={2}>
                    <Box position="relative">
                      <CircularProgress 
                        value={25} 
                        size="100px" 
                        color="blue.500" 
                        thickness="8px"
                        trackColor="blue.100"
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text fontSize="xl" fontWeight="bold" color="blue.700">1</Text>
                            <Text fontSize="xs" color="blue.500">25%</Text>
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Badge 
                        position="absolute" 
                        top="-2" 
                        right="-2" 
                        colorScheme="blue" 
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        UPLOAD
                      </Badge>
                    </Box>
                    <VStack spacing={1} textAlign="center">
                      <Text fontSize="md" fontWeight="bold" color="blue.700">Business Uploads Invoice</Text>
                    </VStack>
                  </VStack>

                  {/* Step 2: Mint */}
                  <VStack spacing={3} align="center" flex="1" position="relative" zIndex={2}>
                    <Box position="relative">
                      <CircularProgress 
                        value={50} 
                        size="100px" 
                        color="purple.500" 
                        thickness="8px"
                        trackColor="purple.100"
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text fontSize="xl" fontWeight="bold" color="purple.700">2</Text>
                            <Text fontSize="xs" color="purple.500">50%</Text>
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Badge 
                        position="absolute" 
                        top="-2" 
                        right="-2" 
                        colorScheme="purple" 
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        MINT
                      </Badge>
                    </Box>
                    <VStack spacing={1} textAlign="center">
                      <Text fontSize="md" fontWeight="bold" color="purple.700">NFT Minted on Solana</Text>
                    </VStack>
                  </VStack>

                  {/* Step 3: Fund */}
                  <VStack spacing={3} align="center" flex="1" position="relative" zIndex={2}>
                    <Box position="relative">
                      <CircularProgress 
                        value={75} 
                        size="100px" 
                        color="green.500" 
                        thickness="8px"
                        trackColor="green.100"
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text fontSize="xl" fontWeight="bold" color="green.700">3</Text>
                            <Text fontSize="xs" color="green.500">75%</Text>
              </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Badge 
                        position="absolute" 
                        top="-2" 
                        right="-2" 
                        colorScheme="green" 
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        FUND
                      </Badge>
            </Box>
                    <VStack spacing={1} textAlign="center">
                      <Text fontSize="md" fontWeight="bold" color="green.700">Investors Fund Invoice</Text>
                    </VStack>
                  </VStack>

                  {/* Step 4: Payout */}
                  <VStack spacing={3} align="center" flex="1" position="relative" zIndex={2}>
                    <Box position="relative">
                      <CircularProgress 
                        value={100} 
                        size="100px" 
                        color="teal.500" 
                        thickness="8px"
                        trackColor="teal.100"
                      >
                        <CircularProgressLabel>
                          <VStack spacing={0}>
                            <Text fontSize="xl" fontWeight="bold" color="teal.700">4</Text>
                            <Text fontSize="xs" color="teal.500">100%</Text>
                          </VStack>
                        </CircularProgressLabel>
                      </CircularProgress>
                      <Badge 
                        position="absolute" 
                        top="-2" 
                        right="-2" 
                        colorScheme="teal" 
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                      >
                        PAYOUT
                      </Badge>
                    </Box>
                    <VStack spacing={1} textAlign="center">
                      <Text fontSize="md" fontWeight="bold" color="teal.700">Automatic Payout</Text>
                    </VStack>
                  </VStack>
                </HStack>
              </Box>

              {/* Central Flow Line - Between circles and statistics */}
              <Box 
                w="full" 
                maxW="6xl" 
                mx="auto" 
                height="4px" 
                bgGradient="linear(to-r, blue.200, purple.200, green.200, teal.200)"
                borderRadius="full"
                my={6}
                px={8}
              />

              {/* Process Statistics */}
              <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} w="full" mt={8}>
                <Box bg="blue.50" p={4} borderRadius="xl" textAlign="center" border="1px solid" borderColor="blue.200">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.700">1 min</Text>
                  <Text fontSize="sm" color="blue.600">Average Upload Time</Text>
                </Box>
                <Box bg="purple.50" p={4} borderRadius="xl" textAlign="center" border="1px solid" borderColor="purple.200">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.700">18</Text>
                  <Text fontSize="sm" color="purple.600">Invoices Minted</Text>
                </Box>
                <Box bg="green.50" p={4} borderRadius="xl" textAlign="center" border="1px solid" borderColor="green.200">
                  <Text fontSize="2xl" fontWeight="bold" color="green.700">24/7</Text>
                  <Text fontSize="sm" color="green.600">Global Access</Text>
                </Box>
                <Box bg="teal.50" p={4} borderRadius="xl" textAlign="center" border="1px solid" borderColor="teal.200">
                  <Text fontSize="2xl" fontWeight="bold" color="teal.700">100%</Text>
                  <Text fontSize="sm" color="teal.600">Success Rate</Text>
            </Box>
          </SimpleGrid>
        </VStack>
      </Box>

          {/* Visual Diagrams - Redesigned */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} w="full" maxW="6xl">
            {/* Problem: Cash Flow Gap */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="red.200" 
              boxShadow="xl"
              h="fit-content"
            >
              <Heading size="md" color="red.700" mb={4}>Problem: Cash Flow Gap</Heading>
              <Box as="svg" viewBox="0 0 480 140" width="100%" height="140px">
                <rect x="0" y="0" width="480" height="140" fill="transparent" />
                <g fontFamily="Inter, system-ui" fontSize="12" fill="#1f2937">
                  {/* Circles */}
                  <circle cx="60" cy="50" r="18" fill="#fff5f5" stroke="#f56565" strokeWidth="2" />
                  <circle cx="180" cy="50" r="18" fill="#fff5f5" stroke="#f56565" strokeWidth="2" />
                  <circle cx="300" cy="50" r="18" fill="#fff5f5" stroke="#f56565" strokeWidth="2" />
                  <circle cx="420" cy="50" r="18" fill="#fff5f5" stroke="#f56565" strokeWidth="2" />
                  
                  {/* Labels */}
                  <text x="60" y="85" fontSize="11" fontWeight="500" textAnchor="middle">Work Done</text>
                  <text x="180" y="85" fontSize="11" fontWeight="500" textAnchor="middle">Invoice Sent</text>
                  <text x="300" y="85" fontSize="11" fontWeight="500" textAnchor="middle">Waiting 60-90 days</text>
                  <text x="420" y="85" fontSize="11" fontWeight="500" textAnchor="middle">Cash Flow Gap</text>
                  
                  {/* Arrows */}
                  <path d="M 78 50 L 162 50" stroke="#f56565" strokeWidth="2" markerEnd="url(#arrow1)" />
                  <path d="M 198 50 L 282 50" stroke="#f56565" strokeWidth="2" markerEnd="url(#arrow2)" />
                  <path d="M 318 50 L 402 50" stroke="#f56565" strokeWidth="2" markerEnd="url(#arrow3)" />
                  
                  <defs>
                    <marker id="arrow1" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#f56565" />
                    </marker>
                    <marker id="arrow2" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#f56565" />
                    </marker>
                    <marker id="arrow3" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#f56565" />
                    </marker>
                  </defs>
                </g>
              </Box>
            </Box>

            {/* Solution Loop */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="green.200" 
              boxShadow="xl"
              h="fit-content"
            >
              <Heading size="md" color="green.700" mb={4}>Solution Loop</Heading>
              <Box as="svg" viewBox="0 0 520 140" width="100%" height="140px">
                <rect x="0" y="0" width="520" height="140" fill="transparent" />
                <g fontFamily="Inter, system-ui" fontSize="11" fill="#1f2937">
                  {/* Boxes */}
                  <rect x="20" y="20" width="80" height="50" rx="6" fill="#f0fff4" stroke="#48bb78" strokeWidth="2" />
                  <rect x="120" y="20" width="80" height="50" rx="6" fill="#e6fffa" stroke="#38b2ac" strokeWidth="2" />
                  <rect x="220" y="20" width="80" height="50" rx="6" fill="#fff5f0" stroke="#ed8936" strokeWidth="2" />
                  <rect x="320" y="20" width="80" height="50" rx="6" fill="#f0f9ff" stroke="#3182ce" strokeWidth="2" />
                  <rect x="420" y="20" width="80" height="50" rx="6" fill="#fef5e7" stroke="#d69e2e" strokeWidth="2" />
                  
                  {/* Labels */}
                  <text x="60" y="40" fontSize="11" fontWeight="500" textAnchor="middle">Business</text>
                  <text x="60" y="55" fontSize="11" fontWeight="500" textAnchor="middle">Upload</text>
                  
                  <text x="160" y="40" fontSize="11" fontWeight="500" textAnchor="middle">NFT</text>
                  <text x="160" y="55" fontSize="11" fontWeight="500" textAnchor="middle">Minted</text>
                  
                  <text x="260" y="40" fontSize="11" fontWeight="500" textAnchor="middle">Investors</text>
                  <text x="260" y="55" fontSize="11" fontWeight="500" textAnchor="middle">Fund</text>
                  
                  <text x="360" y="40" fontSize="11" fontWeight="500" textAnchor="middle">Client</text>
                  <text x="360" y="55" fontSize="11" fontWeight="500" textAnchor="middle">Pays</text>
                  
                  <text x="460" y="40" fontSize="11" fontWeight="500" textAnchor="middle">Smart</text>
                  <text x="460" y="55" fontSize="11" fontWeight="500" textAnchor="middle">Contract</text>
                  
                  {/* Arrows */}
                  <path d="M 100 45 L 120 45" stroke="#48bb78" strokeWidth="2" markerEnd="url(#arrow4)" />
                  <path d="M 200 45 L 220 45" stroke="#38b2ac" strokeWidth="2" markerEnd="url(#arrow5)" />
                  <path d="M 300 45 L 320 45" stroke="#ed8936" strokeWidth="2" markerEnd="url(#arrow6)" />
                  <path d="M 400 45 L 420 45" stroke="#3182ce" strokeWidth="2" markerEnd="url(#arrow7)" />
                  
                  <defs>
                    <marker id="arrow4" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#48bb78" />
                    </marker>
                    <marker id="arrow5" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#38b2ac" />
                    </marker>
                    <marker id="arrow6" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#ed8936" />
                    </marker>
                    <marker id="arrow7" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#3182ce" />
                    </marker>
                  </defs>
                </g>
              </Box>
            </Box>

            {/* System Architecture */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="blue.200" 
              boxShadow="xl"
              h="fit-content"
            >
              <Heading size="md" color="blue.700" mb={4}>System Architecture</Heading>
              <Box as="svg" viewBox="0 0 480 150" width="100%" height="150px">
                <rect x="0" y="0" width="480" height="150" fill="transparent" />
                <g fontFamily="Inter, system-ui" fontSize="11" fill="#1f2937">
                  {/* Main boxes */}
                  <rect x="20" y="30" width="100" height="60" rx="6" fill="#f0f9ff" stroke="#3182ce" strokeWidth="2" />
                  <rect x="200" y="30" width="100" height="60" rx="6" fill="#faf5ff" stroke="#805ad5" strokeWidth="2" />
                  
                  {/* Side boxes */}
                  <rect x="340" y="0" width="100" height="30" rx="6" fill="#f0fff4" stroke="#48bb78" strokeWidth="2" />
                  <rect x="340" y="32.5" width="100" height="55" rx="6" fill="#fff5f0" stroke="#ed8936" strokeWidth="2" />
                  <rect x="340" y="87.5" width="100" height="40" rx="6" fill="#fef5e7" stroke="#d69e2e" strokeWidth="2" />
                  
                  {/* Labels */}
                  <text x="70" y="50" fontSize="12" fontWeight="500" textAnchor="middle">Frontend</text>
                  <text x="70" y="70" fontSize="12" fontWeight="500" textAnchor="middle">dApp</text>
                  
                  <text x="250" y="50" fontSize="12" fontWeight="500" textAnchor="middle">Solana</text>
                  <text x="250" y="70" fontSize="12" fontWeight="500" textAnchor="middle">Program</text>
                  
                  <text x="390" y="18" fontSize="12" fontWeight="600" textAnchor="middle">Metadata</text>
                  <text x="390" y="60" fontSize="12" fontWeight="600" textAnchor="middle">USDC</text>
                  <text x="390" y="107.5" fontSize="12" fontWeight="600" textAnchor="middle">Wallets</text>
                  
                  {/* Arrows */}
                  <path d="M 120 60 L 200 60" stroke="#3182ce" strokeWidth="2" markerEnd="url(#arrow8)" />
                  <path d="M 300 60 L 340 60" stroke="#805ad5" strokeWidth="2" markerEnd="url(#arrow9)" />
                  
                  <defs>
                    <marker id="arrow8" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#3182ce" />
                    </marker>
                    <marker id="arrow9" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#805ad5" />
                    </marker>
                  </defs>
                </g>
              </Box>
            </Box>
            
            {/* Capital Flow */}
            <Box 
              bg="white" 
              p={6} 
              borderRadius="2xl" 
              border="1px solid" 
              borderColor="teal.200" 
              boxShadow="xl"
              h="fit-content"
            >
              <Heading size="md" color="teal.700" mb={4}>Capital Flow (Investor Perspective)</Heading>
              <Box as="svg" viewBox="0 0 480 140" width="100%" height="140px">
                <rect x="0" y="0" width="480" height="140" fill="transparent" />
                <g fontFamily="Inter, system-ui" fontSize="11" fill="#1f2937">
                  {/* Boxes */}
                  <rect x="20" y="20" width="120" height="70" rx="6" fill="#f0fff4" stroke="#48bb78" strokeWidth="2" />
                  <rect x="180" y="20" width="120" height="70" rx="6" fill="#f0f9ff" stroke="#3182ce" strokeWidth="2" />
                  <rect x="340" y="20" width="120" height="70" rx="6" fill="#fff5f0" stroke="#ed8936" strokeWidth="2" />
                  
                  {/* Labels */}
                  <text x="80" y="40" fontSize="12" fontWeight="500" textAnchor="middle">Small Business</text>
                  <text x="80" y="55" fontSize="10" fontWeight="400" textAnchor="middle">Invoice pending -</text>
                  <text x="80" y="70" fontSize="10" fontWeight="400" textAnchor="middle">needs liquidity</text>
                  
                  <text x="240" y="40" fontSize="12" fontWeight="500" textAnchor="middle">NFT Marketplace</text>
                  <text x="240" y="55" fontSize="10" fontWeight="400" textAnchor="middle">Invoice NFT listed</text>
                  <text x="240" y="70" fontSize="10" fontWeight="400" textAnchor="middle">and purchased</text>
                  
                  <text x="400" y="40" fontSize="12" fontWeight="500" textAnchor="middle">Investors</text>
                  <text x="400" y="55" fontSize="10" fontWeight="400" textAnchor="middle">Real-time yield</text>
                  <text x="400" y="70" fontSize="10" fontWeight="400" textAnchor="middle">on repayment</text>
                  
                  {/* Arrows */}
                  <path d="M 140 55 L 180 55" stroke="#48bb78" strokeWidth="2" markerEnd="url(#arrow12)" />
                  <path d="M 300 55 L 340 55" stroke="#3182ce" strokeWidth="2" markerEnd="url(#arrow13)" />
                  
                  <defs>
                    <marker id="arrow12" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#48bb78" />
                    </marker>
                    <marker id="arrow13" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                      <polygon points="0 0, 6 2, 0 4" fill="#3182ce" />
                    </marker>
                  </defs>
                </g>
              </Box>
            </Box>
          </SimpleGrid>

          {/* CTA Buttons */}
          <VStack spacing={6} w="full" maxW="4xl">
            <HStack spacing={6} justify="center" wrap="wrap">
              <Button 
                as={RouterLink} 
                to="/mint" 
                colorScheme="teal" 
                size="xl" 
                px={12} 
                py={8} 
                fontWeight="bold" 
                fontSize="xl"
                borderRadius="xl"
                bgGradient="linear(to-r, teal.400, teal.600)"
                _hover={{ 
                  bgGradient: "linear(to-r, teal.500, teal.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl"
                }}
                transition="all 0.3s ease"
                boxShadow="lg"
              >
                Get Started – Mint Your Invoice
                <Icon as={ArrowForwardIcon} ml={2} />
              </Button>
              <Button 
                as={RouterLink} 
                to="/marketplace" 
                colorScheme="blue" 
                size="xl" 
                px={12} 
                py={8} 
                fontWeight="bold" 
                fontSize="xl"
                borderRadius="xl"
                bgGradient="linear(to-r, blue.400, blue.600)"
                _hover={{ 
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "xl"
                }}
                transition="all 0.3s ease"
                boxShadow="lg"
              >
                Browse Marketplace
                <Icon as={ExternalLinkIcon} ml={2} />
              </Button>
            </HStack>
            
            <Text fontSize="sm" color="gray.500" textAlign="center" maxW="2xl">
              Join the future of invoice financing. No banks, no intermediaries, just transparent DeFi connecting global capital with local businesses.
            </Text>
            
            {/* Trust Statement */}
            <Box 
              bg="blue.50" 
              p={6} 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="blue.200" 
              maxW="4xl"
              textAlign="center"
            >
              <Text fontSize="md" color="blue.700" fontWeight="medium">
                🔒 All transactions are verifiable on-chain, and all invoice data is hashed and stored on Arweave for transparency.
              </Text>
            </Box>
            
          </VStack>
        </VStack>
      </Container>
      
      {/* Footer */}
      <Footer />
  </Box>
);
};

export default Home;
