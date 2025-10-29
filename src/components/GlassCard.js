import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

const GlassCard = ({ children, ...props }) => {
  return (
    <Box
      background="rgba(255, 255, 255, 0.25)"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.18)"
      borderRadius="16px"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      p={6}
      _hover={{
        background: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease',
      }}
      transition="all 0.3s ease"
      {...props}
    >
      {children}
    </Box>
  );
};

export default GlassCard;
