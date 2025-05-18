import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  Button,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import Step1BasicInfo from './Step1BasicInfo';
import Step2WeekStructure from './Step2WeekStructure';
import Step3TopicManagement from './Step3TopicManagement';
import Step4ResourceManagement from './Step4ResourceManagement';
import RoadmapPreviewModal from './RoadmapPreviewModal';
import axios from 'axios';

const steps = [
  { title: 'Basic Info', description: 'Roadmap Details' },
  { title: 'Week Structure', description: 'Plan Weeks' },
  { title: 'Topics', description: 'Add Topics' },
  { title: 'Resources', description: 'Add Resources' },
];

const RoadmapWizard = ({ onClose, onSave, initialData, isEditing, roadmapId }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [roadmapData, setRoadmapData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 4,
    weeks: [],
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  // Reset to first step and set initial data on mount or when initialData changes
  useEffect(() => {
    setCurrentStep(0);
    if (initialData) {
      setRoadmapData(initialData);
    } else {
      setRoadmapData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        duration: 4,
        weeks: [],
      });
    }
  }, [initialData]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepData = (stepData) => {
    setRoadmapData((prev) => ({
      ...prev,
      ...stepData,
    }));
  };

  const handleSaveRoadmap = async (roadmap) => {
    if (saving) return; // Prevent double submit
    setSaving(true);
    try {
      // Validate required fields before sending
      const weeks = roadmap.weeks || [];
      const duration = weeks.length;
      
      if (!roadmap.title || !roadmap.category || !duration || isNaN(Number(duration))) {
        toast({
          title: 'Error',
          description: 'Title, category, and duration (number of weeks) are required.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
        return;
      }

      // Check that every topic has at least three resources
      let topicWithFewResources = null;
      if (Array.isArray(weeks)) {
        weeks.forEach((week, weekIdx) => {
          if (Array.isArray(week.topics)) {
            week.topics.forEach((topic, topicIdx) => {
              if (!Array.isArray(topic.resources) || topic.resources.length < 3) {
                topicWithFewResources = { week: weekIdx + 1, topic: topic.title || `Topic ${topicIdx + 1}` };
              }
            });
          }
        });
      }
      if (topicWithFewResources) {
        toast({
          title: 'Error',
          description: `Each topic must have at least three resources. Please add more to "${topicWithFewResources.topic}" in Week ${topicWithFewResources.week}.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Check that every week has at least one topic
      let weekWithNoTopics = null;
      weeks.forEach((week, weekIdx) => {
        if (!Array.isArray(week.topics) || week.topics.length === 0) {
          weekWithNoTopics = weekIdx + 1;
        }
      });
      if (weekWithNoTopics) {
        toast({
          title: 'Error',
          description: `Each week must have at least one topic. Please add topics to Week ${weekWithNoTopics}.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Clean up resources: remove any non-quiz, non-write-article resources with empty url
      const cleanedWeeks = weeks.map(week => ({
        ...week,
        topics: week.topics.map(topic => ({
          ...topic,
          resources: topic.resources.filter(resource =>
            resource.type === 'quiz' ||
            (resource.type === 'article' && resource.mode === 'write') ||
            (resource.url && resource.url.trim() !== '')
          )
        }))
      }));
      const cleanedRoadmap = { ...roadmap, weeks: cleanedWeeks };

      if (onSave) {
        await onSave(cleanedRoadmap);
      }
    } catch (error) {
      console.error('Roadmap save error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save roadmap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            data={roadmapData}
            onNext={handleNext}
            onDataChange={handleStepData}
            noCategoryDropdown
          />
        );
      case 1:
        return (
          <Step2WeekStructure
            data={roadmapData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDataChange={handleStepData}
          />
        );
      case 2:
        return (
          <Step3TopicManagement
            data={roadmapData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onDataChange={handleStepData}
          />
        );
      case 3:
        return (
          <Step4ResourceManagement
            data={roadmapData}
            onPrevious={handlePrevious}
            onSave={handleSaveRoadmap}
            onDataChange={handleStepData}
            saving={saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">{isEditing ? 'Edit Roadmap' : 'Create New Roadmap'}</Heading>
        
        <Stepper index={currentStep} colorScheme="brand">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        <Box>{renderStep()}</Box>

        <Button colorScheme="teal" mt={4} onClick={() => setPreviewOpen(true)}>
          Preview Roadmap
        </Button>
      </VStack>

      <RoadmapPreviewModal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} roadmap={roadmapData} />
    </Container>
  );
};

export default RoadmapWizard; 