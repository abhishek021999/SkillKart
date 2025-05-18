import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Input,
  Select,
  Textarea,
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
  Avatar,
  Badge,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const Discussions = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    roadmapId: '',
  });
  const [roadmaps, setRoadmaps] = useState([]);
  const toast = useToast();

  useEffect(() => {
    fetchDiscussions();
    fetchRoadmaps();
  }, [category]);

  const fetchDiscussions = async () => {
    try {
      const url = category
        ? `https://skillkart-backend-i4j5.onrender.com/api/discussions/category/${category}`
        : 'https://skillkart-backend-i4j5.onrender.com/api/discussions';
      const response = await axiosInstance.get(endpoints.discussions);
      setDiscussions(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch discussions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmaps = async () => {
    try {
      const response = await axiosInstance.get(endpoints.roadmaps);
      setRoadmaps(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch roadmaps',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(endpoints.discussions, formData);
      toast({
        title: 'Success',
        description: 'Discussion created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchDiscussions();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create discussion',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredDiscussions = discussions.filter((discussion) =>
    discussion.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size="lg">Community Discussions</Heading>
          <Text mt={2} color="gray.600">
            Join the conversation and share your learning journey
          </Text>
        </Box>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <Input
            placeholder="Search discussions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            placeholder="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxW="200px"
          >
            <option value="">All Categories</option>
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="data-science">Data Science</option>
            <option value="machine-learning">Machine Learning</option>
            <option value="ui-ux">UI/UX Design</option>
            <option value="devops">DevOps</option>
          </Select>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="brand"
            onClick={onOpen}
          >
            New Discussion
          </Button>
        </Stack>

        {loading ? (
          <Stack align="center" py={12}><Spinner size="xl" color="brand.500" /></Stack>
        ) : (
          <Stack spacing={4}>
            {filteredDiscussions.map((discussion) => (
              <Box
                key={discussion._id}
                p={6}
                borderWidth={1}
                borderRadius="lg"
                _hover={{ shadow: 'md' }}
              >
                <Stack spacing={4}>
                  <Stack direction="row" align="center" justify="space-between">
                    <Heading size="md">{discussion.title}</Heading>
                    <Badge colorScheme="blue">{discussion.category}</Badge>
                  </Stack>
                  <Text color="gray.600">{discussion.content}</Text>
                  <Stack direction="row" align="center" spacing={4}>
                    <Avatar
                      size="sm"
                      name={discussion.author.name}
                      src={discussion.author.avatar}
                    />
                    <Text fontSize="sm" color="gray.500">
                      Posted by {discussion.author.name} on{' '}
                      {new Date(discussion.createdAt).toLocaleDateString()}
                    </Text>
                  </Stack>
                  {discussion.roadmap && (
                    <Badge colorScheme="purple">
                      Related to: {discussion.roadmap.title}
                    </Badge>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Discussion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit}>
                <Stack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, title: e.target.value }))
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Content</FormLabel>
                    <Textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, content: e.target.value }))
                      }
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, category: e.target.value }))
                      }
                    >
                      <option value="">Select a category</option>
                      <option value="web-development">Web Development</option>
                      <option value="mobile-development">Mobile Development</option>
                      <option value="data-science">Data Science</option>
                      <option value="machine-learning">Machine Learning</option>
                      <option value="ui-ux">UI/UX Design</option>
                      <option value="devops">DevOps</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Related Roadmap (Optional)</FormLabel>
                    <Select
                      value={formData.roadmapId}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, roadmapId: e.target.value }))
                      }
                    >
                      <option value="">Select a roadmap</option>
                      {roadmaps.map((roadmap) => (
                        <option key={roadmap._id} value={roadmap._id}>
                          {roadmap.title}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="brand" onClick={handleSubmit}>
                Create Discussion
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Container>
  );
};

export default Discussions; 