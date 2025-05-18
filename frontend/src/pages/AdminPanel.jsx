import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Link,
  Progress,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';
import QuizEditor from '../components/QuizEditor';
import RoadmapWizard from '../components/RoadmapWizard/RoadmapWizard';
import RoadmapPreviewModal from '../components/RoadmapWizard/RoadmapPreviewModal';
import { useAuth } from '../contexts/AuthContext';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AdminPanel = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoadmap, setEditingRoadmap] = useState(null);
  const [mediaViewer, setMediaViewer] = useState({ isOpen: false, resource: null });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    duration: 4,
    weeks: [],
  });
  const toast = useToast();
  const [editTopicModal, setEditTopicModal] = useState({ open: false, weekIndex: null, topicIndex: null, topic: null });
  const [addTopicModal, setAddTopicModal] = useState({ open: false, roadmapId: null, weekIndex: null, topic: { title: '', description: '', estimatedTime: 0, resources: [] } });
  const [uploadingResourceIndex, setUploadingResourceIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);
  const [quizEditor, setQuizEditor] = useState({ open: false, resourceIndex: null, isEdit: false, quizData: [] });
  const [showWizard, setShowWizard] = useState(false);
  const [previewRoadmap, setPreviewRoadmap] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardKey, setWizardKey] = useState(0);
  const uploadTimeoutRef = useRef(null);
  const apiCallTimeoutRef = useRef(null);
  const { user } = useAuth();
  const openModalBtnRef = useRef();
  const openMediaViewerBtnRef = useRef();

  // Memoize fetchRoadmaps to prevent unnecessary recreations
  const fetchRoadmaps = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(endpoints.adminRoadmaps, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmaps(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch roadmaps',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchRoadmaps();
    
    // Cleanup function
    return () => {
      if (uploadTimeoutRef.current) {
        clearTimeout(uploadTimeoutRef.current);
      }
      if (apiCallTimeoutRef.current) {
        clearTimeout(apiCallTimeoutRef.current);
      }
    };
  }, [fetchRoadmaps]);

  // Debounced API call function
  const debouncedFetchRoadmaps = useCallback(() => {
    if (apiCallTimeoutRef.current) {
      clearTimeout(apiCallTimeoutRef.current);
    }
    apiCallTimeoutRef.current = setTimeout(() => {
      fetchRoadmaps();
    }, 300);
  }, [fetchRoadmaps]);

  const handleOpenModal = (roadmap = null) => {
    // Always close the modal first
    onClose();

    // Reset all state
    setEditingRoadmap(null);
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      category: '',
      difficulty: 'beginner',
      duration: 4,
      weeks: []
    });
    setShowWizard(false);
    setWizardKey(prev => prev + 1); // Force remount of wizard

    // If editing an existing roadmap, set its data
    if (roadmap) {
      setEditingRoadmap(roadmap);
      setFormData({
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        difficulty: roadmap.difficulty,
        duration: roadmap.weeks?.length || roadmap.duration || 1,
        weeks: roadmap.weeks,
      });
      setIsEditing(true);
    }

    // Open the modal after a short delay to ensure remount
    setTimeout(() => {
      onOpen();
    }, 50);
  };

  const handleSaveRoadmap = async (roadmapData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = isEditing 
        ? endpoints.adminRoadmapById(editingRoadmap._id)
        : endpoints.adminRoadmaps;
      
      const method = isEditing ? 'put' : 'post';
      
      const response = await axiosInstance[method](endpoint, roadmapData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast({
        title: 'Success',
        description: isEditing ? 'Roadmap updated successfully' : 'Roadmap created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset all state after successful save
      setEditingRoadmap(null);
      setIsEditing(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'beginner',
        duration: 4,
        weeks: []
      });
      setShowWizard(false);
      setWizardKey(prev => prev + 1); // Force remount of wizard
      
      onClose();
      debouncedFetchRoadmaps();
    } catch (error) {
      console.error('Save error:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save roadmap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoadmap = async (roadmapData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(endpoints.adminRoadmapById(editingRoadmap._id), roadmapData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Roadmap updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setShowWizard(false);
      debouncedFetchRoadmaps();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update roadmap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoadmap = async (id) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(endpoints.adminRoadmapById(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({
        title: 'Success',
        description: 'Roadmap deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      debouncedFetchRoadmaps();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete roadmap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Optimize state updates for weeks and topics
  const addWeek = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      weeks: [
        ...prev.weeks,
        {
          weekNumber: prev.weeks.length + 1,
          title: '',
          description: '',
          topics: [],
        },
      ],
    }));
  }, []);

  const addTopic = useCallback((weekIndex) => {
    setFormData(prev => {
      const updatedWeeks = [...prev.weeks];
      if (!updatedWeeks[weekIndex].topics) {
        updatedWeeks[weekIndex].topics = [];
      }
      updatedWeeks[weekIndex].topics.push({
        title: '',
        description: '',
        estimatedTime: 0,
        resources: []
      });
      return { ...prev, weeks: updatedWeeks };
    });
  }, []);

  const addResource = (weekIndex, topicIndex) => {
    const updatedWeeks = [...formData.weeks];
    updatedWeeks[weekIndex].topics[topicIndex].resources.push({
      type: 'video',
      title: '',
      url: '',
      duration: 0,
    });
    setFormData(prev => ({ ...prev, weeks: updatedWeeks }));
  };

  const handleEditTopic = (roadmapId, weekIndex, topicIndex) => {
    const roadmap = roadmaps.find(r => r._id === roadmapId);
    if (!roadmap) return;
    const topic = roadmap.weeks[weekIndex]?.topics[topicIndex];
    setEditingRoadmap(roadmap);
    setEditTopicModal({
      open: true,
      weekIndex,
      topicIndex,
      topic: { ...topic }
    });
  };

  const handleEditTopicChange = (field, value) => {
    setEditTopicModal((prev) => ({
      ...prev,
      topic: { ...prev.topic, [field]: value }
    }));
  };

  const handleSaveTopicEdit = async () => {
    const { weekIndex, topicIndex, topic } = editTopicModal;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.put(endpoints.adminRoadmapById(editingRoadmap._id) + `/weeks/${weekIndex}/topics/${topicIndex}`, topic, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Success', description: 'Topic updated', status: 'success', duration: 3000, isClosable: true });
      setEditTopicModal({ open: false, weekIndex: null, topicIndex: null, topic: null });
      debouncedFetchRoadmaps();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update topic', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleDeleteTopic = async (roadmapId, weekIndex, topicIndex) => {
    if (!window.confirm('Are you sure you want to delete this topic?')) return;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(endpoints.adminRoadmapById(roadmapId) + `/weeks/${weekIndex}/topics/${topicIndex}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Success', description: 'Topic deleted', status: 'success', duration: 3000, isClosable: true });
      debouncedFetchRoadmaps();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete topic', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleOpenAddTopicModal = (roadmapId, weekIndex) => {
    setAddTopicModal({ open: true, roadmapId, weekIndex, topic: { title: '', description: '', estimatedTime: 0, resources: [] } });
  };

  const handleAddTopicChange = (field, value) => {
    setAddTopicModal((prev) => ({
      ...prev,
      topic: { ...prev.topic, [field]: value }
    }));
  };

  const handleAddTopicSubmit = async () => {
    const { roadmapId, weekIndex, topic } = addTopicModal;
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.post(endpoints.adminRoadmapById(roadmapId) + `/weeks/${weekIndex}/topics`, topic, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Success', description: 'Topic added', status: 'success', duration: 3000, isClosable: true });
      setAddTopicModal({ open: false, roadmapId: null, weekIndex: null, topic: { title: '', description: '', estimatedTime: 0, resources: [] } });
      debouncedFetchRoadmaps();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add topic', status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleAddResourceToAddTopic = () => {
    setAddTopicModal((prev) => ({
      ...prev,
      topic: {
        ...prev.topic,
        resources: [
          ...(prev.topic.resources || []),
          { type: 'video', title: '', url: '', duration: 0 }
        ]
      }
    }));
  };

  const handleResourceChangeInAddTopic = (index, field, value) => {
    setAddTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources[index][field] = value;
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  const handleRemoveResourceFromAddTopic = (index) => {
    setAddTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources.splice(index, 1);
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  const handleAddResourceToEditTopic = () => {
    setEditTopicModal((prev) => ({
      ...prev,
      topic: {
        ...prev.topic,
        resources: [
          ...(prev.topic.resources || []),
          { type: 'video', title: '', url: '', duration: 0 }
        ]
      }
    }));
  };

  const handleResourceChangeInEditTopic = (index, field, value) => {
    setEditTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources[index][field] = value;
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  const handleRemoveResourceFromEditTopic = (index) => {
    setEditTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources.splice(index, 1);
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  const handleViewMedia = (resource) => {
    setMediaViewer({ isOpen: true, resource });
  };

  const handleCloseMediaViewer = () => {
    setMediaViewer({ isOpen: false, resource: null });
  };

  const handleFileUpload = async (file, index, isEditMode = false) => {
    if (!file) return;
    setUploadingResourceIndex(index);
    setUploadProgress(0);

    const uploadFormData = new window.FormData();
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

      if (isEditMode) {
        setEditTopicModal(prev => {
          const updatedResources = [...(prev.topic.resources || [])];
          updatedResources[index] = {
            ...updatedResources[index],
            url: url,
            type: file.type.includes('pdf') ? 'article' : updatedResources[index].type
          };
          return {
            ...prev,
            topic: { ...prev.topic, resources: updatedResources }
          };
        });
      } else {
        setAddTopicModal(prev => {
          const updatedResources = [...(prev.topic.resources || [])];
          updatedResources[index] = {
            ...updatedResources[index],
            url: url,
            type: file.type.includes('pdf') ? 'article' : updatedResources[index].type
          };
          return {
            ...prev,
            topic: { ...prev.topic, resources: updatedResources }
          };
        });
        // Also update formData for roadmap creation modal if needed
        setFormData(prev => {
          const updatedWeeks = [...prev.weeks];
          for (let w = 0; w < updatedWeeks.length; w++) {
            for (let t = 0; t < updatedWeeks[w].topics.length; t++) {
              if (updatedWeeks[w].topics[t].resources && updatedWeeks[w].topics[t].resources[index]) {
                updatedWeeks[w].topics[t].resources[index] = {
                  ...updatedWeeks[w].topics[t].resources[index],
                  url: url,
                  type: file.type.includes('pdf') ? 'article' : updatedWeeks[w].topics[t].resources[index].type
                };
              }
            }
          }
          return { ...prev, weeks: updatedWeeks };
        });
      }

      toast({
        title: 'Success',
        description: 'Resource uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resource. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingResourceIndex(null);
      setUploadProgress(0);
    }
  };

  const getResourceUrl = (url) => {
    if (!url) return '';
    try {
      if (typeof url === 'string') {
        // Check if it's a JSON string
        if (url.startsWith('{')) {
          const parsed = JSON.parse(url);
          return parsed.fileUrl || url;
        }
        return url;
      }
      return url;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return url;
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
    toast({
      title: 'Error',
      description: 'Failed to load PDF. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  // Helper to get Google Docs Viewer URL for PDFs
  const getPdfViewerUrl = (url) => {
    const pdfUrl = getResourceUrl(url);
    return `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  };

  // Helper to get Cloudinary direct download URL for PDFs
  const getPdfDownloadUrl = (url) => {
    const pdfUrl = getResourceUrl(url);
    return pdfUrl.includes('cloudinary.com')
      ? pdfUrl.replace('/upload/', '/upload/fl_attachment/')
      : pdfUrl;
  };

  // PDF preview using Google Docs Viewer
  const renderPdfPreview = (url) => (
    <Box mt={2}>
      <iframe
        src={getPdfViewerUrl(url)}
        width="100%"
        height="300px"
        style={{ border: '1px solid #ccc' }}
        title="PDF Preview"
      />
      <Stack direction="row" spacing={2} mt={2} justify="center">
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => window.open(getPdfDownloadUrl(url), '_blank')}
        >
          Download PDF
        </Button>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => window.open(getPdfViewerUrl(url), '_blank')}
        >
          Open in New Tab
        </Button>
      </Stack>
    </Box>
  );

  // PDF full viewer using Google Docs Viewer
  const renderPdfViewer = (url) => (
    <Box>
      <iframe
        src={getPdfViewerUrl(url)}
        width="100%"
        height="80vh"
        style={{ border: '1px solid #ccc' }}
        title="PDF Viewer"
      />
      <Stack direction="row" spacing={4} mt={4} justify="center">
        <Button
          colorScheme="blue"
          onClick={() => window.open(getPdfDownloadUrl(url), '_blank')}
        >
          Download PDF
        </Button>
        <Button
          colorScheme="blue"
          onClick={() => window.open(getPdfViewerUrl(url), '_blank')}
        >
          Open in New Tab
        </Button>
      </Stack>
    </Box>
  );

  const handleOpenQuizEditor = (resourceIndex, isEditMode = false, quizData = []) => {
    setQuizEditor({ open: true, resourceIndex, isEdit: isEditMode, quizData });
  };

  const handleSaveQuizInRoadmapCreation = (quizData) => {
    setFormData(prev => {
      const updatedWeeks = [...prev.weeks];
      // Find the week/topic/resource for the quiz editor
      for (let w = 0; w < updatedWeeks.length; w++) {
        for (let t = 0; t < updatedWeeks[w].topics.length; t++) {
          for (let r = 0; r < updatedWeeks[w].topics[t].resources.length; r++) {
            if (quizEditor.open && quizEditor.resourceIndex === r) {
              updatedWeeks[w].topics[t].resources[r] = {
                ...updatedWeeks[w].topics[t].resources[r],
                quiz: quizData
              };
            }
          }
        }
      }
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleSaveQuizInAddTopic = (quizData) => {
    setAddTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources[quizEditor.resourceIndex] = {
        ...updatedResources[quizEditor.resourceIndex],
        quiz: quizData
      };
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  const handleSaveQuizInEditTopic = (quizData) => {
    setEditTopicModal((prev) => {
      const updatedResources = [...(prev.topic.resources || [])];
      updatedResources[quizEditor.resourceIndex] = {
        ...updatedResources[quizEditor.resourceIndex],
        quiz: quizData
      };
      return {
        ...prev,
        topic: { ...prev.topic, resources: updatedResources }
      };
    });
  };

  console.log('user:', user);

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Admin Dashboard</Heading>
          <Text mt={2} color="gray.600">
            Manage learning roadmaps and content
          </Text>
        </Box>

        <Box>
          <Button
            ref={openModalBtnRef}
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={() => handleOpenModal(null)}
            isLoading={loading}
          >
            Create New Roadmap
          </Button>
        </Box>

        {loading ? (
          <Stack align="center" py={12}>
            <Spinner size="xl" color="brand.500" />
          </Stack>
        ) : (
          <Box>
            {roadmaps.map((roadmap) => (
              <Box 
                key={roadmap._id}
                mb={6} 
                boxShadow="md" 
                borderRadius="lg" 
                bg="white" 
                p={6}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Heading size="md" display="inline-block">{roadmap.title}</Heading>
                    <Text color="gray.600" mt={1}>{roadmap.description}</Text>
                  </Box>
                  <Stack direction="row" spacing={2} align="center" mr={4}>
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit Roadmap"
                      size="sm"
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleOpenModal(roadmap)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete Roadmap"
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteRoadmap(roadmap._id)}
                    />
                    <IconButton
                      ref={openMediaViewerBtnRef}
                      icon={<ViewIcon />}
                      aria-label="Preview Roadmap"
                      size="sm"
                      colorScheme="teal"
                      variant="outline"
                      onClick={() => setPreviewRoadmap(roadmap)}
                    />
                  </Stack>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="full" finalFocusRef={openModalBtnRef}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Roadmap</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <RoadmapWizard
                key={wizardKey}
                onClose={onClose}
                onSave={isEditing ? handleUpdateRoadmap : handleSaveRoadmap}
                initialData={formData}
                isEditing={isEditing}
                roadmapId={editingRoadmap?._id}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={mediaViewer.isOpen} onClose={handleCloseMediaViewer} size="full" finalFocusRef={openMediaViewerBtnRef}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {mediaViewer.resource?.title}
              <ModalCloseButton />
            </ModalHeader>
            <ModalBody maxH="60vh" overflowY="auto">
              {mediaViewer.resource && (
                <Box p={4}>
                  {mediaViewer.resource.type === 'video' && (
                    <video 
                      src={getResourceUrl(mediaViewer.resource.url)} 
                      controls 
                      width="100%" 
                      style={{ maxHeight: '80vh' }}
                    />
                  )}
                  {mediaViewer.resource.type === 'article' && mediaViewer.resource.url.endsWith('.pdf') && (
                    renderPdfViewer(mediaViewer.resource.url)
                  )}
                  {mediaViewer.resource.type === 'article' && !mediaViewer.resource.url.endsWith('.pdf') && (
                    <Box>
                      <Text mb={4}>External Article Link:</Text>
                      <Link href={getResourceUrl(mediaViewer.resource.url)} isExternal color="blue.500">
                        {getResourceUrl(mediaViewer.resource.url)}
                      </Link>
                    </Box>
                  )}
                  {mediaViewer.resource.type === 'quiz' && mediaViewer.resource.quiz && (
                    <Box>
                      <Text fontSize="xl" fontWeight="bold" mb={4}>Quiz Preview</Text>
                      {mediaViewer.resource.quiz.length === 0 && <Text>No questions added.</Text>}
                      {mediaViewer.resource.quiz.map((q, qIdx) => (
                        <Box key={qIdx} mb={6} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                          <Text fontWeight="semibold" mb={2}>Q{qIdx + 1}: {q.question}</Text>
                          <Stack spacing={2}>
                            {q.options.map((opt, oIdx) => (
                              <Box key={oIdx} display="flex" alignItems="center">
                                <input type="radio" disabled checked={q.correctIndex === oIdx} style={{ marginRight: 8 }} />
                                <Text as={q.correctIndex === oIdx ? 'b' : undefined} color={q.correctIndex === oIdx ? 'green.600' : undefined}>
                                  {opt}
                                  {q.correctIndex === oIdx && ' (Correct)'}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        <QuizEditor
          isOpen={quizEditor.open}
          onClose={() => setQuizEditor({ open: false, resourceIndex: null, isEdit: false, quizData: [] })}
          quizData={quizEditor.quizData}
          onSave={editingRoadmap ? (quizEditor.isEdit ? handleSaveQuizInEditTopic : handleSaveQuizInAddTopic) : handleSaveQuizInRoadmapCreation}
        />

        {previewRoadmap && (
          <RoadmapPreviewModal
            isOpen={!!previewRoadmap}
            onClose={() => setPreviewRoadmap(null)}
            roadmap={previewRoadmap}
          />
        )}
      </Stack>
    </Container>
  );
};

export default AdminPanel;