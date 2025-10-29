import React from 'react';
import { Box, Flex, IconButton, Text } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box
      bg="gray.800"
      px={4}
      py={6}
      color="white"
      borderTop="1px solid"
      borderColor="gray.700"
      mt="auto"
    >
      <Flex align="center" justify="center" position="relative" wrap="wrap">
        {/* Centered Text */}
        <Text fontSize="sm" color="gray.400" textAlign="center">
          Built for the Startit x Superteam Balkan Hackathon 2025 • Powered by Solana
        </Text>
        
        {/* Right side - Twitter Icon */}
        <IconButton
          as="a"
          href="https://x.com/solanadevkit"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Twitter"
          variant="ghost"
          color="white"
          _hover={{ 
            bg: 'rgba(255, 255, 255, 0.1)',
            color: '#1DA1F2',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease'
          }}
          size="lg"
          position="absolute"
          right="0"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </IconButton>
      </Flex>
    </Box>
  );
};

export default Footer;
