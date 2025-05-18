import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const Step2WeekStructure = ({ data, onNext, onPrevious, onDataChange }) => {
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate weeks
    if (data.weeks.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one week',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onNext();
  };

  const addWeek = () => {
    const newWeek = {
      weekNumber: data.weeks.length + 1,
      title: `Week ${data.weeks.length + 1}`,
      description: '',
      topics: [],
    };
    onDataChange({ weeks: [...data.weeks, newWeek] });
  };

  const removeWeek = (index) => {
    const updatedWeeks = data.weeks.filter((_, i) => i !== index).map((week, i) => ({
      ...week,
      weekNumber: i + 1,
    }));
    onDataChange({ weeks: updatedWeeks });
  };

  const updateWeek = (index, field, value) => {
    const updatedWeeks = [...data.weeks];
    updatedWeeks[index] = {
      ...updatedWeeks[index],
      [field]: value,
    };
    onDataChange({ weeks: updatedWeeks });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <FormControl>
          <FormLabel>Number of Weeks</FormLabel>
          <NumberInput
            min={1}
            max={52}
            value={data.duration}
            onChange={(value) => {
              const numValue = parseInt(value);
              let updatedWeeks = [...data.weeks];
              if (numValue > updatedWeeks.length) {
                // Add new weeks, keep existing data
                for (let i = updatedWeeks.length; i < numValue; i++) {
                  updatedWeeks.push({
                    weekNumber: i + 1,
                    title: `Week ${i + 1}`,
                    description: '',
                    topics: [],
                  });
                }
              } else if (numValue < updatedWeeks.length) {
                // Remove extra weeks
                updatedWeeks = updatedWeeks.slice(0, numValue);
              }
              // Update week numbers
              updatedWeeks = updatedWeeks.map((w, i) => ({ ...w, weekNumber: i + 1 }));
              onDataChange({
                duration: numValue,
                weeks: updatedWeeks,
              });
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <Button
          leftIcon={<AddIcon />}
          onClick={addWeek}
          colorScheme="brand"
          variant="outline"
        >
          Add Week
        </Button>

        {data.weeks.map((week, index) => (
          <Box
            key={index}
            p={4}
            borderWidth={1}
            borderRadius="md"
            position="relative"
          >
            <IconButton
              icon={<DeleteIcon />}
              aria-label="Delete week"
              size="sm"
              colorScheme="red"
              variant="ghost"
              position="absolute"
              top={2}
              right={2}
              onClick={() => removeWeek(index)}
            />

            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Week {week.weekNumber} Title</FormLabel>
                <Input
                  value={week.title}
                  onChange={(e) => updateWeek(index, 'title', e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Week Description</FormLabel>
                <Textarea
                  value={week.description}
                  onChange={(e) => updateWeek(index, 'description', e.target.value)}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </Box>
        ))}

        <HStack spacing={4} justify="flex-end">
          <Button onClick={onPrevious} variant="ghost">
            Previous
          </Button>
          <Button type="submit" colorScheme="brand">
            Next: Topics
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Step2WeekStructure; 