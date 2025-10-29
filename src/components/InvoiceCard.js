import React from 'react';
import {
  Box, Text, Badge, VStack, HStack, Icon, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useToast, Progress
} from '@chakra-ui/react';
import { StarIcon, TimeIcon, ViewIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';

const InvoiceCard = ({ invoice, onPurchase }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connected, publicKey } = useWallet();
  const toast = useToast();

  const handlePurchase = () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase invoices",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onPurchase(invoice);
    onClose();
    
    toast({
      title: "Purchase Successful!",
      description: `You've purchased ${invoice.invoiceNumber}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const getRiskColor = (score) => {
    if (score >= 750) return 'green';
    if (score >= 650) return 'yellow';
    return 'red';
  };

  const getRiskLabel = (score) => {
    if (score >= 750) return 'Low Risk';
    if (score >= 650) return 'Medium Risk';
    return 'High Risk';
  };

  const daysUntilDue = Math.ceil((new Date(invoice.dueDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <GlassCard
        w="full"
        h="full"
        cursor="pointer"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
        }}
        transition="all 0.3s ease"
        onClick={onOpen}
      >
        <VStack spacing={4} align="stretch" h="full">
          {/* Header */}
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">
                {invoice.invoiceNumber}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {invoice.business}
              </Text>
            </VStack>
            <Badge
              colorScheme={getRiskColor(invoice.creditScore)}
              borderRadius="full"
              px={3}
              py={1}
            >
              {getRiskLabel(invoice.creditScore)}
            </Badge>
          </HStack>

          {/* Amount */}
          <Box textAlign="center" py={2}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              {invoice.amount}
            </Text>
            <Text fontSize="sm" color="green.400">
              +{invoice.repaymentPremium} Premium
            </Text>
          </Box>

          {/* Details */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={2}>
                <Icon as={TimeIcon} color="gray.600" boxSize={4} />
                <Text fontSize="sm" color="gray.600">
                  Due in {daysUntilDue} days
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={StarIcon} color="yellow.400" boxSize={4} />
                <Text fontSize="sm" color="gray.600">
                  {invoice.creditScore}
                </Text>
              </HStack>
            </HStack>

            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {invoice.description}
            </Text>
          </VStack>

          {/* Status Bar */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="xs" color="gray.600">Status</Text>
              <Text fontSize="xs" color="gray.600">{invoice.status}</Text>
            </HStack>
            <Progress
              value={invoice.status === 'Available' ? 0 : 100}
              colorScheme="green"
              size="sm"
              borderRadius="full"
            />
          </Box>

          {/* Action Button */}
          <GradientButton
            size="sm"
            w="full"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <Icon as={ViewIcon} mr={2} />
            View Details
          </GradientButton>
        </VStack>
      </GlassCard>

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="white" color="gray.800">
          <ModalHeader>{invoice.invoiceNumber} - {invoice.business}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Amount and Premium */}
              <Box textAlign="center" p={4} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                  {invoice.amount}
                </Text>
                <Text color="green.600" fontSize="lg">
                  +{invoice.repaymentPremium} Premium ({invoice.paymentTerms})
                </Text>
              </Box>

              {/* Details Grid */}
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap={4}>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Due Date</Text>
                  <Text color="gray.800">{invoice.dueDate}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Credit Score</Text>
                  <Text color="gray.800">{invoice.creditScore} ({getRiskLabel(invoice.creditScore)})</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Payment Terms</Text>
                  <Text color="gray.800">{invoice.paymentTerms}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.600">Days Until Due</Text>
                  <Text color="gray.800">{daysUntilDue} days</Text>
                </Box>
              </Box>

              {/* Description */}
              <Box>
                <Text fontWeight="bold" color="gray.600" mb={2}>Description</Text>
                <Text color="gray.800">{invoice.description}</Text>
              </Box>

              {/* Line Items */}
              <Box>
                <Text fontWeight="bold" color="gray.600" mb={2}>Line Items</Text>
                <VStack spacing={1} align="stretch">
                  {invoice.lineItems.map((item, index) => (
                    <Text key={index} color="gray.800" fontSize="sm">
                      • {item}
                    </Text>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <GradientButton onClick={handlePurchase} isDisabled={!connected}>
              Purchase Invoice
            </GradientButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default InvoiceCard;
