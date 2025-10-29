import React, { useState } from 'react';
import { Box, Heading, FormControl, FormLabel, Input, Button, Stack, Checkbox, useToast } from '@chakra-ui/react';

const Profile = () => {
  const [form, setForm] = useState({
    businessName: '',
    registration: '',
    website: '',
    email: '',
    notifyDueSoon: true,
    notifyRepaid: true,
  });
  const toast = useToast();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Profile saved!', status: 'success', duration: 2000 });
  };
  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading mb={4}>Profile & Settings</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={5}>
          <FormControl>
            <FormLabel>Business Name</FormLabel>
            <Input name="businessName" value={form.businessName} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Registration Number</FormLabel>
            <Input name="registration" value={form.registration} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Business Website</FormLabel>
            <Input name="website" value={form.website} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input name="email" value={form.email} onChange={handleChange} />
          </FormControl>
          <FormControl>
            <FormLabel>Notification Preferences</FormLabel>
            <Checkbox name="notifyDueSoon" isChecked={form.notifyDueSoon} onChange={handleChange}>Remind me when invoices are due soon</Checkbox>
            <Checkbox name="notifyRepaid" isChecked={form.notifyRepaid} onChange={handleChange}>Notify me when invoices are repaid</Checkbox>
          </FormControl>
          <Button colorScheme="teal" type="submit">Save</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default Profile; 