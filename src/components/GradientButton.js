import React from 'react';
import { Button, ButtonProps } from '@chakra-ui/react';

const GradientButton = ({ children, gradient = 'primary', ...props }) => {
  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  };

  return (
    <Button
      background={gradients[gradient]}
      color="white"
      border="none"
      borderRadius="8px"
      fontWeight="600"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
        filter: 'brightness(1.1)',
      }}
      _active={{
        transform: 'translateY(0)',
      }}
      _focus={{
        boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.3)',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
