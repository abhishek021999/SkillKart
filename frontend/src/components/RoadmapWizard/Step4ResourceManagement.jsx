import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  IconButton,
  useToast,
  Select,
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
  Progress,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tag,
  TagLeftIcon,
  TagLabel,
  Tooltip,
  useColorModeValue,
  Fade,
  useColorMode,
  useId,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, AttachmentIcon, LinkIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import VideoUploadModal from './VideoUploadModal';
import ArticleEditorModal from './ArticleEditorModal';
import QuizEditorModal from './QuizEditorModal';
import axiosInstance from '../../utils/axiosInstance';
import { endpoints } from '../../utils/api';

const resourceTypeMeta = {
  video: { color: 'blue', icon: AttachmentIcon, label: 'Video' },
  article: { color: 'orange', icon: InfoOutlineIcon, label: 'Article' },
  quiz: { color: 'purple', icon: EditIcon, label: 'Quiz' },
};

const Step4ResourceManagement = ({ data, onPrevious, onSave, onDataChange }) => {
  // Move all useContext hooks to the top
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { isOpen: isQuizOpen, onOpen: onQuizOpen, onClose: onQuizClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isMediaViewerOpen, onOpen: onMediaViewerOpen, onClose: onMediaViewerClose } = useDisclosure();

  // Then all useState hooks
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(0);
  const [selectedResource, setSelectedResource] = useState(null);
  const [uploadingResourceIndex, setUploadingResourceIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [quizEditor, setQuizEditor] = useState({ open: false, resourceIndex: null, isEdit: false, quizData: [] });
  const [mediaViewer, setMediaViewer] = useState({ isOpen: false, resource: null });
  const [previewResource, setPreviewResource] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [resourceModal, setResourceModal] = useState({ open: false, weekIndex: null, topicIndex: null, resourceIndex: null, mode: 'add', resource: null });
  const [writeArticleModal, setWriteArticleModal] = useState({ open: false, weekIndex: null, topicIndex: null, resourceIndex: null });
  const [videoModal, setVideoModal] = useState({ open: false, onUpload: null, initialUrl: '' });
  const [quizModal, setQuizModal] = useState({ open: false, onSave: null, initialValue: null });
  const [saving, setSaving] = useState(false);

  // Then all useRef hooks
  const fileInputRef = useRef(null);
  const uploadTimeoutRef = useRef(null);

  // Then all useEffect hooks
  useEffect(() => {
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
    };
  }, []);

  // Then all useCallback hooks
  const handleFileUpload = useCallback(async (file, cb) => {
    if (!file) return;
    setUploadingResourceIndex('uploading');
    setUploadProgress(0);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(endpoints.adminResourcesUpload, uploadFormData, {
        headers: { Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });
      const url = res.data.fileUrl || res.data.url || res.data;
      cb(url);
      toast({ title: 'Success', description: 'Resource uploaded successfully', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to upload resource', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setUploadingResourceIndex(null);
      setUploadProgress(0);
    }
  }, [toast]);

  const handleAddResource = useCallback((weekIndex, topicIndex, resource) => {
    const updatedWeeks = [...data.weeks];
    if (!updatedWeeks[weekIndex].topics[topicIndex].resources) {
      updatedWeeks[weekIndex].topics[topicIndex].resources = [];
    }
    updatedWeeks[weekIndex].topics[topicIndex].resources.push(resource);
    onDataChange({ weeks: updatedWeeks });
    setResourceModal({ open: false, weekIndex, topicIndex, resourceIndex: null, mode: 'add', resource: null });
  }, [data, onDataChange]);

  const handleRemoveResource = useCallback((weekIndex, topicIndex, resourceIndex) => {
    const updatedWeeks = [...data.weeks];
    updatedWeeks[weekIndex].topics[topicIndex].resources.splice(resourceIndex, 1);
    onDataChange({ weeks: updatedWeeks });
  }, [data, onDataChange]);

  const handleResourceChange = useCallback((weekIndex, topicIndex, resourceIndex, field, value) => {
    const updatedWeeks = [...data.weeks];
    updatedWeeks[weekIndex].topics[topicIndex].resources[resourceIndex][field] = value;
    onDataChange({ weeks: updatedWeeks });
  }, [data, onDataChange]);

  // Then all other hooks
  const id = useId();

  // Add or Edit Resource Modal
  const openResourceModal = (weekIndex, topicIndex, resourceIndex = null, mode = 'add', resource = null) => {
    setResourceModal({ open: true, weekIndex, topicIndex, resourceIndex, mode, resource });
  };
  const closeResourceModal = () => setResourceModal({ open: false, weekIndex: null, topicIndex: null, resourceIndex: null, mode: 'add', resource: null });

  // Resource Modal Content
  const ResourceModal = () => {
    const isEdit = resourceModal.mode === 'edit';
    const [type, setType] = useState(resourceModal.resource?.type || 'video');
    const [mode, setMode] = useState(resourceModal.resource?.mode || 'link');
    const [title, setTitle] = useState(resourceModal.resource?.title || '');
    const [url, setUrl] = useState(resourceModal.resource?.url || '');
    const [duration, setDuration] = useState(resourceModal.resource?.duration || 0);
    const [articleData, setArticleData] = useState(resourceModal.resource?.articleData || null);
    const [quizData, setQuizData] = useState(resourceModal.resource?.quizData || null);
    const [showVideoUpload, setShowVideoUpload] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [articleModal, setArticleModal] = useState({ open: false, onSave: null, initialValue: null });

    // Save handler
    const handleSave = async () => {
      if (saving) return;
      setSaving(true);
      let resource = { type, title, mode, url, duration };
      if (type === 'article' && mode === 'write') {
        resource.articleData = articleData;
        resource.url = resource.url && resource.url.trim() !== '' ? resource.url : `custom-article-${Date.now()}`;
      }
      if (type === 'quiz' && mode === 'write') {
        resource.quizData = quizData;
      }
      if (isEdit) {
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'type', type);
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'mode', mode);
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'url', url);
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'duration', duration);
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'articleData', articleData);
        handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'quizData', quizData);
      } else {
        handleAddResource(resourceModal.weekIndex, resourceModal.topicIndex, resource);
      }
      try {
        const cleanedData = { ...data, weeks: cleanResources(data.weeks) };
        await onSave(cleanedData);
        toast({ title: 'Success', description: 'Resource saved successfully', status: 'success', duration: 3000, isClosable: true });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to save resource', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setSaving(false);
      }
    };

    // Video Upload as last step, with animation
    const handleVideoUpload = async (uploadedUrl) => {
      setUploading(true);
      if (!uploadedUrl) {
        toast({ title: 'Error', description: 'Failed to upload video.', status: 'error', duration: 3000, isClosable: true });
        setUploading(false);
        setShowVideoUpload(false);
        return;
      }
      // Animate fade out, then add resource and close modal
      setFadeOut(true);
      setTimeout(() => {
        let resource = { type: 'video', mode: 'upload', url: uploadedUrl, title, duration };
        handleAddResource(resourceModal.weekIndex, resourceModal.topicIndex, resource);
        setUploading(false);
        setShowVideoUpload(false);
        setFadeOut(false);
      }, 400); // 400ms for fade animation
    };

    // Open video upload modal immediately if type is video/upload and not editing
    useEffect(() => {
      if (type === 'video' && mode === 'upload' && !isEdit && !showVideoUpload) {
        setShowVideoUpload(true);
      }
    }, [type, mode, isEdit, showVideoUpload]);

    // If video/upload, show upload modal and keep card visible with progress
    if (type === 'video' && mode === 'upload' && showVideoUpload) {
      return (
        <Fade in={!fadeOut} transition={{ enter: { duration: 0.2 }, exit: { duration: 0.4 } }}>
          <Box>
            <VideoUploadModal
              isOpen={true}
              onClose={() => { setShowVideoUpload(false); closeResourceModal(); }}
              onUpload={handleVideoUpload}
              initialUrl={url}
            />
            {uploading && (
              <Box mt={4} textAlign="center">
                <Progress size="sm" isIndeterminate colorScheme="blue" />
                <Text mt={2} color="gray.500">Processing video upload...</Text>
              </Box>
            )}
          </Box>
        </Fade>
      );
    }

    // Video Upload
    const openVideoUpload = () => setVideoModal({
      open: true,
      onUpload: (uploadedUrl) => {
        setUrl(uploadedUrl);
        setVideoModal((prev) => ({ ...prev, open: false }));
      },
      initialUrl: url,
    });
    // Article Write
    const openArticleEditor = () => setArticleModal({
      open: true,
      onSave: (article) => {
        setArticleData(article);
        setTitle(article.title);
        setArticleModal({ open: false, onSave: null, initialValue: null });
      },
      initialValue: articleData
    });
    // Quiz Edit
    const openQuizEditor = () => setQuizModal({
      open: true,
      onSave: (quiz) => {
        let resource = {
          type: 'quiz',
          mode: 'write',
          title: title || 'Quiz',
          quizData: quiz,
        };
        if (isEdit) {
          handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'type', 'quiz');
          handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'mode', 'write');
          handleResourceChange(resourceModal.weekIndex, resourceModal.topicIndex, resourceModal.resourceIndex, 'quizData', quiz);
        } else {
          handleAddResource(resourceModal.weekIndex, resourceModal.topicIndex, resource);
        }
        setQuizModal({ open: false, onSave: null, initialValue: null });
        closeResourceModal();
      },
      initialValue: quizData
    });

    return (
      <Modal isOpen={resourceModal.open} onClose={closeResourceModal} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEdit ? 'Edit Resource' : 'Add Resource'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Resource Type</FormLabel>
                <Select value={type} onChange={e => setType(e.target.value)}>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="quiz">Quiz</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input value={title} onChange={e => setTitle(e.target.value)} />
              </FormControl>
              {type !== 'quiz' && (
                <FormControl isRequired>
                  <FormLabel>Mode</FormLabel>
                  <Select value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="link">Link</option>
                    {type === 'video' && <option value="upload">Upload</option>}
                    {type === 'article' && <option value="write">Write Article</option>}
                  </Select>
                </FormControl>
              )}
              {/* Video/Article Link */}
              {(mode === 'link' && type !== 'quiz') && (
                <FormControl isRequired>
                  <FormLabel>Resource URL</FormLabel>
                  <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                </FormControl>
              )}
              {/* Video Upload */}
              {(type === 'video' && mode === 'upload') && (
                <Button colorScheme="blue" onClick={openVideoUpload} mb={2}>
                  {url ? 'Re-upload Video' : 'Upload Video'}
                </Button>
              )}
              {type === 'video' && url && (
                <Box mt={2}><Text fontWeight="bold">Preview:</Text><video src={url} controls width="100%" style={{ maxHeight: 200 }} /></Box>
              )}
              {/* Article Write */}
              {(type === 'article' && mode === 'write') && (
                <Button colorScheme="orange" onClick={openArticleEditor} mb={2}>
                  {articleData ? 'Edit Article' : 'Write Article'}
                </Button>
              )}
              {type === 'article' && mode === 'write' && articleData && (
                <Box mt={2} p={2} borderWidth={1} borderRadius="md" bg="gray.50">
                  <Text fontWeight="bold">{articleData.title}</Text>
                  <Text fontSize="sm" color="gray.600">{articleData.tags?.join(', ')}</Text>
                  <Box mt={2} dangerouslySetInnerHTML={{ __html: articleData.content }} />
                </Box>
              )}
              {/* Quiz Edit */}
              {type === 'quiz' && (
                <Button colorScheme="purple" leftIcon={<EditIcon />} mb={2} onClick={openQuizEditor}>
                  {quizData && quizData.length ? 'Edit Quiz' : 'Create Quiz'}
                </Button>
              )}
              {type === 'quiz' && quizData && quizData.length > 0 && (
                <Box mt={2} p={2} borderWidth={1} borderRadius="md" bg="gray.50">
                  <Text fontWeight="bold">Quiz Preview</Text>
                  {quizData.map((q, idx) => (
                    <Box key={idx} mt={2}>
                      <Text fontWeight="semibold">Q{idx + 1}: {q.question}</Text>
                      <VStack align="start" spacing={1} ml={4}>
                        {q.options.map((opt, oIdx) => (
                          <Text key={oIdx} color={q.correctIndex === oIdx ? 'green.600' : undefined}>
                            {String.fromCharCode(65 + oIdx)}. {opt} {q.correctIndex === oIdx && '(Correct)'}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  ))}
                </Box>
              )}
              {/* Video Duration */}
              {type === 'video' && (
                <FormControl>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <NumberInput value={duration} min={1} onChange={(_, v) => setDuration(v)}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" mr={3} onClick={handleSave} isLoading={saving} loadingText="Saving..." isDisabled={saving}>{isEdit ? 'Save Changes' : 'Add Resource'}</Button>
            <Button variant="ghost" onClick={closeResourceModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
        {/* Modals for video, article, quiz */}
        {videoModal.open && <VideoUploadModal isOpen={videoModal.open} onClose={() => setVideoModal({ ...videoModal, open: false })} onUpload={videoModal.onUpload} initialUrl={videoModal.initialUrl} />}
        {articleModal.open && <ArticleEditorModal isOpen={articleModal.open} onClose={() => setArticleModal({ open: false, onSave: null, initialValue: null })} onSave={articleModal.onSave} initialValue={articleModal.initialValue} />}
        {quizModal.open && <QuizEditorModal isOpen={quizModal.open} onClose={() => setQuizModal({ ...quizModal, open: false })} onSave={quizModal.onSave} initialValue={quizModal.initialValue} />}
      </Modal>
    );
  };

  // Main UI
  return (
    <Box>
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
                <Accordion allowMultiple>
                  {week.topics.map((topic, topicIndex) => (
                    <AccordionItem key={topicIndex}>
                      <h2>
                        <AccordionButton>
                          <Box flex="1" textAlign="left">
                            <strong>Topic:</strong> {topic.title}
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <VStack spacing={4} align="stretch">
                          <Button
                            leftIcon={<AddIcon />}
                            onClick={() => openResourceModal(weekIndex, topicIndex)}
                            size="sm"
                            colorScheme="brand"
                            variant="outline"
                          >
                            Add Resource
                          </Button>
                          <HStack wrap="wrap" spacing={4} align="flex-start">
                            {topic.resources && topic.resources.map((resource, resourceIndex) => {
                              const meta = resourceTypeMeta[resource.type] || {};
                              return (
                                <Box
                                  key={resourceIndex}
                                  p={4}
                                  borderWidth={2}
                                  borderRadius="lg"
                                  borderColor={meta.color ? `${meta.color}.400` : 'gray.200'}
                                  bg={useColorModeValue('white', 'gray.800')}
                                  minW="260px"
                                  maxW="260px"
                                  minH="180px"
                                  maxH="260px"
                                  boxShadow="sm"
                                  position="relative"
                                  display="flex"
                                  flexDirection="column"
                                  justifyContent="space-between"
                                  transition="box-shadow 0.2s, transform 0.2s"
                                  _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
                                >
                                  <HStack mb={2} spacing={2} align="center">
                                    <Tag colorScheme={meta.color || 'gray'} size="md">
                                      <TagLeftIcon as={meta.icon || InfoOutlineIcon} />
                                      <TagLabel>{meta.label || resource.type}</TagLabel>
                                    </Tag>
                                    <Tooltip label="Edit Resource">
                                      <IconButton
                                        icon={<EditIcon />}
                                        aria-label="Edit resource"
                                        size="sm"
                                        colorScheme="blue"
                                        variant="ghost"
                                        onClick={() => openResourceModal(weekIndex, topicIndex, resourceIndex, 'edit', resource)}
                                      />
                                    </Tooltip>
                                    <Tooltip label="Delete Resource">
                                      <IconButton
                                        icon={<DeleteIcon />}
                                        aria-label="Delete resource"
                                        size="sm"
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => handleRemoveResource(weekIndex, topicIndex, resourceIndex)}
                                      />
                                    </Tooltip>
                                  </HStack>
                                  <Box flex="1" mb={2}>
                                    <Text fontWeight="bold" mb={1} noOfLines={1}>{resource.title}</Text>
                                    {resource.type === 'video' && (
                                      <Text fontSize="sm" color="gray.600">{resource.mode === 'upload' ? 'Uploaded Video' : 'Video Link'}</Text>
                                    )}
                                    {resource.type === 'article' && (
                                      <Text fontSize="sm" color="gray.600">{resource.mode === 'write' ? 'Custom Article' : 'Article Link'}</Text>
                                    )}
                                    {resource.type === 'quiz' && (
                                      <Text fontSize="sm" color="gray.600">Quiz</Text>
                                    )}
                                    {resource.url && (
                                      <Text fontSize="xs" color="blue.500" isTruncated>{resource.url}</Text>
                                    )}
                                    {resource.duration && resource.type === 'video' && (
                                      <Text fontSize="xs" color="gray.500">Duration: {resource.duration} min</Text>
                                    )}
                                  </Box>
                                </Box>
                              );
                            })}
                          </HStack>
                        </VStack>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
        <HStack spacing={4} justify="flex-end">
          <Button onClick={onPrevious} variant="ghost">
            Previous
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={() => onSave({ ...data, weeks: cleanResources(data.weeks) })}
            isLoading={saving}
            loadingText="Saving..."
            isDisabled={saving}
          >
            Save Roadmap
          </Button>
        </HStack>
      </VStack>
      {resourceModal.open && <ResourceModal />}
    </Box>
  );
};

// Add a cleanup function to ensure all resources have a valid url
const cleanResources = (weeks) => {
  return weeks.map(week => ({
    ...week,
    topics: week.topics.map(topic => ({
      ...topic,
      resources: topic.resources.map(resource => {
        if (resource.type === 'quiz') {
          return resource; // quizzes don't need url
        }
        if (!resource.url || resource.url.trim() === '') {
          if (resource.type === 'article' && resource.mode === 'write') {
            return { ...resource, url: `custom-article-${Date.now()}` };
          }
          // fallback for other resources
          return { ...resource, url: `resource-${Date.now()}` };
        }
        return resource;
      })
    }))
  }));
};

export default Step4ResourceManagement; 