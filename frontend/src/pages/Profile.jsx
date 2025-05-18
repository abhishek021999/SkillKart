import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Container,
  Heading,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Badge,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  CheckboxGroup,
  Checkbox,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import { FaTrophy, FaFire, FaStar } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const INTERESTS = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'devops', label: 'DevOps' },
];

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    interests: [],
    learningGoals: '',
    weeklyAvailableTime: 0,
  });
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    qualifications: '',
    experience: '',
    expertise: '',
    bio: '',
    linkedin: '',
    profilePicture: '',
  });
  const toast = useToast();
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(endpoints.userProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = response.data.profile || {};
        if (user?.role === 'admin') {
          setAdminFormData({
            name: profile.name || '',
            email: response.data.email || '',
            qualifications: profile.qualifications || '',
            experience: profile.experience || '',
            expertise: profile.expertise || '',
            bio: profile.bio || '',
            linkedin: profile.linkedin || '',
            profilePicture: profile.profilePicture || '',
          });
        } else {
          setFormData({
            name: profile.name || '',
            interests: profile.interests || [],
            learningGoals: profile.learningGoals || '',
            weeklyAvailableTime: profile.weeklyAvailableTime || 0,
          });
        }
      } catch (err) {
        // fallback to user context if fetch fails
      }
      setFetching(false);
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.put(
        endpoints.userProfile,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      if (user?.role !== 'admin') {
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInterestChange = (values) => {
    setFormData(prev => ({ ...prev, interests: values }));
  };

  const handleAdminChange = (field, value) => {
    setAdminFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdminProfilePicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // You can implement upload logic here (e.g., to Cloudinary)
    // For now, just set the file name as a placeholder
    handleAdminChange('profilePicture', file.name);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(
        endpoints.userProfile,
        adminFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Profile</Heading>
          <Text mt={2} color="gray.600">
            {user?.role === 'admin'
              ? 'Manage your admin profile and professional details'
              : 'Manage your learning preferences and track your progress'}
          </Text>
        </Box>
        {fetching ? (
          <Stack align="center" py={12}><Spinner size="xl" color="brand.500" /></Stack>
        ) : user?.role === 'admin' ? (
          <Box p={8} bg="white" boxShadow="md" borderRadius="xl">
            <form onSubmit={handleAdminSubmit}>
              <Stack spacing={6}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    value={adminFormData.name}
                    onChange={e => handleAdminChange('name', e.target.value)}
                    placeholder="Your name"
                  />
                  {!adminFormData.name && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input value={adminFormData.email} isReadOnly placeholder="Not provided" />
                </FormControl>
                <FormControl>
                  <FormLabel>Qualifications</FormLabel>
                  <Input
                    value={adminFormData.qualifications}
                    onChange={e => handleAdminChange('qualifications', e.target.value)}
                    placeholder="e.g. M.Tech, PhD, etc."
                  />
                  {!adminFormData.qualifications && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Years of Experience</FormLabel>
                  <NumberInput min={0} max={60} value={adminFormData.experience} onChange={value => handleAdminChange('experience', value)}>
                    <NumberInputField placeholder="Not provided" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {!adminFormData.experience && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Areas of Expertise</FormLabel>
                  <Input
                    value={adminFormData.expertise}
                    onChange={e => handleAdminChange('expertise', e.target.value)}
                    placeholder="e.g. DevOps, Data Science, etc."
                  />
                  {!adminFormData.expertise && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Input
                    value={adminFormData.bio}
                    onChange={e => handleAdminChange('bio', e.target.value)}
                    placeholder="Short professional bio"
                  />
                  {!adminFormData.bio && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <FormControl>
                  <FormLabel>LinkedIn</FormLabel>
                  <Input
                    value={adminFormData.linkedin}
                    onChange={e => handleAdminChange('linkedin', e.target.value)}
                    placeholder="LinkedIn profile URL"
                  />
                  {!adminFormData.linkedin && <Text color="gray.400" fontSize="sm">Not provided</Text>}
                </FormControl>
                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  isLoading={loading}
                >
                  Save Changes
                </Button>
              </Stack>
            </form>
          </Box>
        ) : (
          <>
            <Box
              p={8}
              bg="white"
              boxShadow="md"
              borderRadius="xl"
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Interests</FormLabel>
                    <CheckboxGroup
                      colorScheme="brand"
                      value={formData.interests}
                      onChange={handleInterestChange}
                    >
                      <Stack spacing={2}>
                        {INTERESTS.map((interest) => (
                          <Checkbox key={interest.value} value={interest.value}>
                            {interest.label}
                          </Checkbox>
                        ))}
                      </Stack>
                    </CheckboxGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Learning Goals</FormLabel>
                    <Input
                      value={formData.learningGoals}
                      onChange={(e) => setFormData(prev => ({ ...prev, learningGoals: e.target.value }))}
                      placeholder="What do you want to achieve?"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Weekly Available Time (hours)</FormLabel>
                    <NumberInput
                      min={0}
                      max={168}
                      value={formData.weeklyAvailableTime}
                      onChange={(value) => setFormData(prev => ({ ...prev, weeklyAvailableTime: parseInt(value) }))}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="brand"
                    size="lg"
                    isLoading={loading}
                  >
                    Save Changes
                  </Button>
                </Stack>
              </form>
            </Box>

            <Box
              p={8}
              bg="white"
              boxShadow="md"
              borderRadius="xl"
            >
              <Stack spacing={6}>
                <Heading size="md">Achievements</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <VStack p={4} bg="gray.50" borderRadius="lg">
                    <Icon as={FaTrophy} w={8} h={8} color="yellow.500" />
                    <Text fontWeight="bold">XP Points</Text>
                    <Text fontSize="2xl">{user?.profile?.xpPoints || 0}</Text>
                  </VStack>

                  <VStack p={4} bg="gray.50" borderRadius="lg">
                    <Icon as={FaFire} w={8} h={8} color="orange.500" />
                    <Text fontWeight="bold">Current Streak</Text>
                    <Text fontSize="2xl">{user?.profile?.streak?.current || 0} days</Text>
                  </VStack>

                  <VStack p={4} bg="gray.50" borderRadius="lg">
                    <Icon as={FaStar} w={8} h={8} color="blue.500" />
                    <Text fontWeight="bold">Badges</Text>
                    <HStack>
                      {user?.profile?.badges?.map((badge, index) => (
                        <Badge key={index} colorScheme="blue">
                          {badge.name}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </SimpleGrid>
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default Profile; 