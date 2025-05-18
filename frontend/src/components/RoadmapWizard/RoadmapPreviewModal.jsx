import React, { useState, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Heading,
  Text,
  Stack,
  Divider,
  Tag,
  VStack,
  useColorModeValue,
  HStack,
  TagLeftIcon,
  TagLabel,
  SimpleGrid,
  Tooltip,
  useDisclosure,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { InfoOutlineIcon, AttachmentIcon, EditIcon } from '@chakra-ui/icons';

const resourceTypeMeta = {
  video: { color: 'blue', icon: AttachmentIcon, label: 'Video' },
  article: { color: 'orange', icon: InfoOutlineIcon, label: 'Article' },
  quiz: { color: 'purple', icon: EditIcon, label: 'Quiz' },
};

const RoadmapPreviewModal = ({ isOpen, onClose, roadmap }) => {
  // Move all useContext hooks to the top
  const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();
  const { isOpen: isQuizOpen, onOpen: onQuizOpen, onClose: onQuizClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const toast = useToast();

  // Then all useState hooks
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [mediaViewer, setMediaViewer] = useState({ isOpen: false, resource: null });
  const [previewResource, setPreviewResource] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);

  // Then all useCallback hooks
  const handleViewMedia = useCallback((resource) => {
    setMediaViewer({ isOpen: true, resource });
  }, []);

  const handleCloseMediaViewer = useCallback(() => {
    setMediaViewer({ isOpen: false, resource: null });
  }, []);

  const handlePreviewResource = useCallback((resource) => {
    setPreviewResource(resource);
    onPreviewOpen();
  }, [onPreviewOpen]);

  const handleClosePreview = useCallback(() => {
    setPreviewResource(null);
    onPreviewClose();
  }, [onPreviewClose]);

  if (!roadmap) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Preview Roadmap</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={6}>
            <Heading size="lg" mb={1}>{roadmap.title}</Heading>
            <Text color="gray.600" mb={2} noOfLines={2}>{roadmap.description}</Text>
            <HStack spacing={3} mb={2}>
              <Tag colorScheme="blue">{roadmap.category}</Tag>
              <Tag colorScheme="purple">{roadmap.difficulty}</Tag>
              <Tag colorScheme="teal">{roadmap.duration} weeks</Tag>
            </HStack>
          </Box>
          <Divider mb={4} />
          <VStack align="stretch" spacing={8}>
            {roadmap.weeks?.map((week, weekIdx) => (
              <Box key={weekIdx} p={4} borderWidth={1} borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')} boxShadow="sm">
                <Heading size="md" mb={1} color="teal.600">Week {week.weekNumber}: {week.title}</Heading>
                <Text mb={2} color="gray.700" noOfLines={2}>{week.description}</Text>
                <VStack align="stretch" spacing={4}>
                  {week.topics?.map((topic, topicIdx) => (
                    <Box key={topicIdx} p={3} borderWidth={1} borderRadius="md" bg={useColorModeValue('white', 'gray.800')}>
                      <HStack mb={1} justify="space-between">
                        <Heading size="sm">{topic.title}</Heading>
                        <Tag colorScheme="gray" fontSize="xs">{topic.estimatedTime}h</Tag>
                      </HStack>
                      <Text mb={2} color="gray.600" noOfLines={2}>{topic.description}</Text>
                      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
                        {topic.resources?.map((resource, resIdx) => {
                          const meta = resourceTypeMeta[resource.type] || {};
                          return (
                            <Box key={resIdx} p={3} borderWidth={1} borderRadius="md" bg={useColorModeValue('gray.100', 'gray.900')} minW="180px" maxW="320px" boxShadow="xs">
                              <HStack mb={1} spacing={2}>
                                <Tag colorScheme={meta.color || 'gray'} size="sm">
                                  <TagLeftIcon as={meta.icon || InfoOutlineIcon} />
                                  <TagLabel>{meta.label || resource.type}</TagLabel>
                                </Tag>
                                <Tooltip label={resource.title} hasArrow><Text fontWeight="bold" noOfLines={1}>{resource.title}</Text></Tooltip>
                              </HStack>
                              {resource.type === 'video' && resource.url && (
                                <Box mb={2}>
                                  <video src={resource.url} controls width="100%" style={{ maxHeight: 120, borderRadius: 6 }} />
                                  {resource.duration && <Text fontSize="xs">Duration: {resource.duration} min</Text>}
                                </Box>
                              )}
                              {resource.type === 'article' && resource.articleData && (
                                <Box mb={2}>
                                  <Tooltip label={resource.articleData.title} hasArrow>
                                    <Text fontWeight="semibold" noOfLines={1}>{resource.articleData.title}</Text>
                                  </Tooltip>
                                  <Text fontSize="xs" color="gray.600" noOfLines={1}>Tags: {resource.articleData.tags?.join(', ')}</Text>
                                  <Box mt={1} maxH="60px" overflowY="auto" fontSize="sm" color="gray.700" dangerouslySetInnerHTML={{ __html: resource.articleData.content?.slice(0, 120) + (resource.articleData.content?.length > 120 ? '...' : '') }} />
                                </Box>
                              )}
                              {resource.type === 'article' && resource.url && !resource.articleData && (
                                <Text as="a" href={resource.url} color="blue.500" target="_blank" rel="noopener noreferrer" fontSize="sm">External Article Link</Text>
                              )}
                              {resource.type === 'quiz' && resource.quizData && (
                                <Box>
                                  <Text fontWeight="semibold" mb={1} fontSize="sm">Quiz ({resource.quizData.length} Qs)</Text>
                                  <VStack align="start" spacing={0} ml={1} maxH="60px" overflowY="auto">
                                    {resource.quizData.slice(0,2).map((q, qIdx) => (
                                      <Tooltip key={qIdx} label={q.question} hasArrow>
                                        <Text fontSize="xs" noOfLines={1}>Q{qIdx + 1}: {q.question}</Text>
                                      </Tooltip>
                                    ))}
                                    {resource.quizData.length > 2 && <Text fontSize="xs" color="gray.400">+{resource.quizData.length - 2} more</Text>}
                                  </VStack>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  ))}
                </VStack>
              </Box>
            ))}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RoadmapPreviewModal; 