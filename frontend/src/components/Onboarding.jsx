import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CheckboxGroup,
  Checkbox,
  Stack,
  VStack,
  useToast,
  Heading,
} from '@chakra-ui/react';

const INTERESTS = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'ui-ux', label: 'UI/UX Design' },
  { value: 'devops', label: 'DevOps' },
];

const Onboarding = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    interests: initialData.interests || [],
    learningGoals: initialData.learningGoals || '',
    weeklyAvailableTime: initialData.weeklyAvailableTime || 0,
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleInterestChange = (values) => {
    setFormData(prev => ({ ...prev, interests: values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.interests.length === 0 || !formData.learningGoals || !formData.weeklyAvailableTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" p={8} bg="white" boxShadow="md" borderRadius="xl">
      <Heading size="lg" mb={6}>Welcome! Set up your learning profile</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Interests</FormLabel>
            <CheckboxGroup
              colorScheme="brand"
              value={formData.interests}
              onChange={handleInterestChange}
            >
              <Stack spacing={2} direction="column">
                {INTERESTS.map((interest) => (
                  <Checkbox key={interest.value} value={interest.value}>
                    {interest.label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Learning Goals</FormLabel>
            <Input
              value={formData.learningGoals}
              onChange={(e) => setFormData(prev => ({ ...prev, learningGoals: e.target.value }))}
              placeholder="What do you want to achieve?"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Weekly Available Time (hours)</FormLabel>
            <NumberInput
              min={1}
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
            Save & Continue
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Onboarding; 