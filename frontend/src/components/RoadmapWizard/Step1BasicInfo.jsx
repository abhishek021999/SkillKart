import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';

const Step1BasicInfo = ({ data, onNext, onDataChange, noCategoryDropdown }) => {
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!data.title || !data.description || !data.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onNext();
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={data.title}
            onChange={(e) => onDataChange({ title: e.target.value })}
            placeholder="Enter roadmap title"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={data.description}
            onChange={(e) => onDataChange({ description: e.target.value })}
            placeholder="Enter roadmap description"
            rows={4}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Category</FormLabel>
          <Select
            value={data.category}
            onChange={(e) => onDataChange({ category: e.target.value })}
            placeholder="Select category"
          >
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="data-science">Data Science</option>
            <option value="machine-learning">Machine Learning</option>
            <option value="ui-ux">UI/UX Design</option>
            <option value="devops">DevOps</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Difficulty</FormLabel>
          <Select
            value={data.difficulty}
            onChange={(e) => onDataChange({ difficulty: e.target.value })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="brand" size="lg">
          Next: Week Structure
        </Button>
      </VStack>
    </Box>
  );
};

export default Step1BasicInfo; 