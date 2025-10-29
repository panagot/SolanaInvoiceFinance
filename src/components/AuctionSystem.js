import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Input, Progress, Badge, Stat, StatLabel, StatNumber,
  StatHelpText, Alert, AlertIcon, Countdown, useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Icon, SimpleGrid
} from '@chakra-ui/react';
import { TimeIcon, EditIcon, ArrowUpIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

const AuctionSystem = ({ invoice, isOpen, onClose }) => {
  const { connected, publicKey } = useWallet();
  const toast = useToast();
  
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [bids, setBids] = useState([]);
  const [highestBidder, setHighestBidder] = useState(null);
  const [auctionStatus, setAuctionStatus] = useState('active'); // active, ended, sold

  useEffect(() => {
    if (invoice) {
      // Mock auction data
      setCurrentBid(invoice.reservePrice || parseFloat(invoice.amount?.toString().replace(/[^\d.]/g, '')) * 0.8);
      setTimeLeft(invoice.auctionDuration || 86400); // 24 hours in seconds
      setBids(invoice.bids || []);
      setHighestBidder(invoice.highestBidder || null);
    }
  }, [invoice]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setAuctionStatus('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBid = () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to place bids",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (bidValue <= currentBid) {
      toast({
        title: "Bid Too Low",
        description: "Your bid must be higher than the current bid",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newBid = {
      id: Date.now(),
      bidder: publicKey?.toBase58().slice(0, 8) + '...',
      amount: bidValue,
      timestamp: new Date(),
    };

    setBids(prev => [newBid, ...prev]);
    setCurrentBid(bidValue);
    setHighestBidder(publicKey?.toBase58().slice(0, 8) + '...');
    setBidAmount('');

    toast({
      title: "Bid Placed!",
      description: `You've placed a bid of $${bidValue}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleBuyNow = () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "Purchase Successful!",
      description: `You've purchased ${invoice.invoiceNumber} at the buy-now price`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    
    setAuctionStatus('sold');
    onClose();
  };

  if (!invoice) return null;

  const faceValue = parseFloat(invoice.amount?.toString().replace(/[^\d.]/g, ''));
  const buyNowPrice = faceValue * 0.95; // 5% discount from face value
  const reservePrice = faceValue * 0.8; // 20% discount from face value
  const currentDiscount = ((faceValue - currentBid) / faceValue * 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={EditIcon} color="yellow.400" />
            <Text>Auction: {invoice.invoiceNumber}</Text>
            <Badge colorScheme={auctionStatus === 'active' ? 'green' : auctionStatus === 'ended' ? 'red' : 'blue'}>
              {auctionStatus === 'active' ? 'Live' : auctionStatus === 'ended' ? 'Ended' : 'Sold'}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Auction Timer */}
            <GlassCard>
              <VStack spacing={4}>
                <HStack spacing={2}>
                  <Icon as={TimeIcon} color="red.400" />
                  <Text fontWeight="bold" fontSize="lg">Auction Ends In</Text>
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="white">
                  {formatTime(timeLeft)}
                </Text>
                <Progress
                  value={(timeLeft / 86400) * 100}
                  colorScheme="red"
                  size="lg"
                  w="full"
                  borderRadius="full"
                />
              </VStack>
            </GlassCard>

            {/* Current Bid */}
            <GlassCard>
              <VStack spacing={4}>
                <Text fontWeight="bold" fontSize="lg" color="white">Current Bid</Text>
                <Stat textAlign="center">
                  <StatNumber fontSize="4xl" color="white">
                    ${currentBid.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>
                    <Badge colorScheme="green">
                      {currentDiscount.toFixed(1)}% discount from face value
                    </Badge>
                  </StatHelpText>
                </Stat>
                {highestBidder && (
                  <Text color="gray.300" fontSize="sm">
                    Highest bidder: {highestBidder}
                  </Text>
                )}
              </VStack>
            </GlassCard>

            {/* Pricing Info */}
            <SimpleGrid columns={3} spacing={4}>
              <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Face Value</Text>
                <Text color="white" fontWeight="bold">${faceValue.toLocaleString()}</Text>
              </Box>
              <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Buy Now</Text>
                <Text color="green.400" fontWeight="bold">${buyNowPrice.toLocaleString()}</Text>
              </Box>
              <Box textAlign="center" p={4} bg="gray.700" borderRadius="lg">
                <Text color="gray.400" fontSize="sm">Reserve</Text>
                <Text color="red.400" fontWeight="bold">${reservePrice.toLocaleString()}</Text>
              </Box>
            </SimpleGrid>

            {/* Bid Section */}
            {auctionStatus === 'active' && (
              <GlassCard>
                <VStack spacing={4}>
                  <Text fontWeight="bold" color="white">Place Your Bid</Text>
                  <HStack spacing={3} w="full">
                    <Input
                      placeholder="Enter bid amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      type="number"
                      bg="gray.700"
                      border="none"
                    />
                    <GradientButton onClick={handleBid} isDisabled={!bidAmount}>
                      Place Bid
                    </GradientButton>
                  </HStack>
                  <Alert status="info" bg="blue.900" color="blue.100">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Minimum bid: ${(currentBid + 1).toLocaleString()}
                    </Text>
                  </Alert>
                </VStack>
              </GlassCard>
            )}

            {/* Buy Now Option */}
            {auctionStatus === 'active' && (
              <GradientButton
                onClick={handleBuyNow}
                size="lg"
                gradient="success"
                w="full"
              >
                <Icon as={ArrowUpIcon} mr={2} />
                Buy Now: ${buyNowPrice.toLocaleString()} (5% discount)
              </GradientButton>
            )}

            {/* Recent Bids */}
            {bids.length > 0 && (
              <GlassCard>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold" color="white">Recent Bids</Text>
                  <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                    {bids.slice(0, 5).map((bid) => (
                      <HStack key={bid.id} justify="space-between" p={2} bg="gray.700" borderRadius="md">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="bold" color="white">
                            {bid.bidder}
                          </Text>
                          <Text fontSize="xs" color="gray.400">
                            {bid.timestamp.toLocaleTimeString()}
                          </Text>
                        </VStack>
                        <Text fontWeight="bold" color="green.400">
                          ${bid.amount.toLocaleString()}
                        </Text>
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
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AuctionSystem;
