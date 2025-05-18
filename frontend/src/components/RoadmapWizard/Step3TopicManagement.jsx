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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';

const Step3TopicManagement = ({ data, onNext, onPrevious, onDataChange }) => {
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate topics
    const hasTopics = data.weeks.some(week => week.topics.length > 0);
    if (!hasTopics) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one topic',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onNext();
  };

  const addTopic = (weekIndex) => {
    const updatedWeeks = [...data.weeks];
    if (!updatedWeeks[weekIndex].topics) {
      updatedWeeks[weekIndex].topics = [];
    }
    updatedWeeks[weekIndex].topics.push({
      title: '',
      description: '',
      estimatedTime: 0,
      resources: [],
    });
    onDataChange({ weeks: updatedWeeks });
  };

  const removeTopic = (weekIndex, topicIndex) => {
    const updatedWeeks = [...data.weeks];
    updatedWeeks[weekIndex].topics.splice(topicIndex, 1);
    onDataChange({ weeks: updatedWeeks });
  };

  const updateTopic = (weekIndex, topicIndex, field, value) => {
    const updatedWeeks = [...data.weeks];
    updatedWeeks[weekIndex].topics[topicIndex] = {
      ...updatedWeeks[weekIndex].topics[topicIndex],
      [field]: value,
    };
    onDataChange({ weeks: updatedWeeks });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Accordion allowMultiple>
          {data.weeks.map((week, weekIndex) => (
            <AccordionItem key={weekIndex}>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <strong>Week {week.weekNumber}:</strong> {week.title}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack spacing={4} align="stretch">
                  <Button
                    leftIcon={<AddIcon />}
                    onClick={() => addTopic(weekIndex)}
                    size="sm"
                    colorScheme="brand"
                    variant="outline"
                  >
                    Add Topic
                  </Button>

                  {week.topics.map((topic, topicIndex) => (
                    <Box
                      key={topicIndex}
                      p={4}
                      borderWidth={1}
                      borderRadius="md"
                      position="relative"
                    >
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Delete topic"
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        position="absolute"
                        top={2}
                        right={2}
                        onClick={() => removeTopic(weekIndex, topicIndex)}
                      />

                      <VStack spacing={4} align="stretch">
                        <FormControl>
                          <FormLabel>Topic Title</FormLabel>
                          <Input
                            value={topic.title}
                            onChange={(e) =>
                              updateTopic(weekIndex, topicIndex, 'title', e.target.value)
                            }
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Topic Description</FormLabel>
                          <Textarea
                            value={topic.description}
                            onChange={(e) =>
                              updateTopic(
                                weekIndex,
                                topicIndex,
                                'description',
                                e.target.value
                              )
                            }
                            rows={3}
                          />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Estimated Time (hours)</FormLabel>
                          <NumberInput
                            value={topic.estimatedTime}
                            onChange={(value) =>
                              updateTopic(
                                weekIndex,
                                topicIndex,
                                'estimatedTime',
                                parseInt(value)
                              )
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </FormControl>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

        <HStack spacing={4} justify="flex-end">
          <Button onClick={onPrevious} variant="ghost">
            Previous
          </Button>
          <Button type="submit" colorScheme="brand">
            Next: Resources
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Step3TopicManagement; 