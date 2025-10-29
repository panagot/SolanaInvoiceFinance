import React, { useState } from 'react';
import { Box, Flex, Heading, Link, Spacer, IconButton, useColorMode, useColorModeValue, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, VStack, Menu, MenuButton, MenuList, MenuItem, Avatar } from '@chakra-ui/react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import './wallet-button.css';
import { useWallet } from '@solana/wallet-adapter-react';
import { HamburgerIcon, SunIcon, MoonIcon } from '@chakra-ui/icons';
import NotificationSystem from './NotificationSystem';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/mint', label: 'Mint Invoice' },
  { to: '/marketplace', label: 'Marketplace' },
];

const Header = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const location = useLocation();
  const { colorMode, toggleColorMode } = useColorMode();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bg = useColorModeValue('gray.800', 'gray.900');
  const linkActiveStyle = {
    color: '#319795',
    fontWeight: 'bold',
    borderBottom: '2px solid #319795',
  };

  return (
    <Box
      bg="gray.800"
      px={4}
      py={3}
      color="white"
      position="sticky"
      top={0}
      zIndex={10}
      borderBottom="1px solid"
      borderColor="gray.700"
    >
      <Flex align="center">
        <Heading 
          size="md" 
          color="white"
          fontWeight="bold"
        >
          Solana Invoice Finance
        </Heading>
        <Spacer />
        {/* Desktop Nav */}
        <Flex gap={4} align="center" display={{ base: 'none', md: 'flex' }}>
          {navLinks.map(link => (
            <Link
              as={RouterNavLink}
              to={link.to}
              key={link.to}
              px={3}
              py={2}
              borderRadius="md"
              _hover={{ 
                textDecoration: 'none', 
                bg: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease'
              }}
              style={({ isActive }) => (location.pathname === link.to ? linkActiveStyle : undefined)}
            >
              {link.label}
            </Link>
          ))}
          {connected && (
            <Link 
              as={RouterNavLink} 
              to="/dashboard" 
              px={3}
              py={2}
              borderRadius="md"
              _hover={{ 
                textDecoration: 'none', 
                bg: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease'
              }} 
              style={({ isActive }) => (location.pathname === '/dashboard' ? linkActiveStyle : undefined)}
            >
              Dashboard
            </Link>
          )}
          
          {/* Notifications */}
          <NotificationSystem />
          
          {connected && (
            <Menu>
              <MenuButton 
                as={IconButton} 
                icon={<Avatar size="sm" name={publicKey?.toBase58()} />} 
                variant="ghost" 
                color="white" 
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }} 
                aria-label="User menu" 
              />
              <MenuList bg="gray.800" color="white" borderColor="gray.700" borderRadius="md" minW="160px" p={0}>
                <MenuItem as={RouterNavLink} to="/dashboard" bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Dashboard</MenuItem>
                <MenuItem as={RouterNavLink} to="/profile" bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Profile / Settings</MenuItem>
                <MenuItem onClick={disconnect} bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Logout</MenuItem>
              </MenuList>
            </Menu>
          )}
          <Box>
            <WalletMultiButton />
          </Box>
        </Flex>
        {/* Mobile Nav */}
        <IconButton
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          display={{ base: 'flex', md: 'none' }}
          ml={2}
          onClick={() => setDrawerOpen(true)}
          bg="teal.600"
          color="white"
          _hover={{ bg: 'teal.700' }}
        />
        <Drawer isOpen={drawerOpen} placement="right" onClose={() => setDrawerOpen(false)}>
          <DrawerOverlay />
          <DrawerContent bg={bg}>
            <DrawerCloseButton color="white" />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>
              <VStack align="start" spacing={4}>
                {navLinks.map(link => (
                  <Link
                    as={RouterNavLink}
                    to={link.to}
                    key={link.to}
                    px={2}
                    onClick={() => setDrawerOpen(false)}
                    _hover={{ textDecoration: 'none', color: '#38b2ac' }}
                    style={({ isActive }) => (location.pathname === link.to ? linkActiveStyle : undefined)}
                  >
                    {link.label}
                  </Link>
                ))}
                {connected && (
                  <Link as={RouterNavLink} to="/dashboard" px={2} onClick={() => setDrawerOpen(false)} _hover={{ textDecoration: 'none', color: '#38b2ac' }} style={({ isActive }) => (location.pathname === '/dashboard' ? linkActiveStyle : undefined)}>Dashboard</Link>
                )}
                {connected && (
                  <Menu>
                    <MenuButton as={IconButton} icon={<Avatar size="sm" name={publicKey?.toBase58()} />} variant="ghost" color="white" _hover={{ bg: 'teal.600' }} aria-label="User menu" />
                    <MenuList bg="gray.800" color="white" borderColor="gray.700" borderRadius="md" minW="160px" p={0}>
                      <MenuItem as={RouterNavLink} to="/dashboard" onClick={() => setDrawerOpen(false)} bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Dashboard</MenuItem>
                      <MenuItem as={RouterNavLink} to="/profile" onClick={() => setDrawerOpen(false)} bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Profile / Settings</MenuItem>
                      <MenuItem onClick={() => { disconnect(); setDrawerOpen(false); }} bg="gray.800" color="white" _hover={{ bg: 'teal.600', color: 'white' }} _active={{ bg: 'teal.600', color: 'white' }} _focus={{ bg: 'teal.600', color: 'white' }}>Logout</MenuItem>
                    </MenuList>
                  </Menu>
                )}
                <Box w="full">
                  <WalletMultiButton style={{ width: '100%' }} />
                </Box>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </Box>
  );
};

export default Header; 