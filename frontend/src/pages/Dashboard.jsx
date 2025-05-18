import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Onboarding from '../components/Onboarding';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Badge,
  Progress,
  Stack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FaSearch, FaBook, FaClock, FaChartLine } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [roadmaps, setRoadmaps] = useState([]);
  const [allRoadmaps, setAllRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const toast = useToast();

  useEffect(() => {
    // Fetch all roadmaps for recommended logic
    const fetchAllRoadmaps = async () => {
      try {
        const response = await axiosInstance.get(endpoints.roadmaps);
        setAllRoadmaps(response.data);
      } catch (error) {
        setAllRoadmaps([]);
      }
    };
    fetchAllRoadmaps();
  }, []);

  useEffect(() => {
    // Fetch profile on mount
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axiosInstance.get(endpoints.userProfile, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data.profile);
      } catch {
        setProfile(null);
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchRoadmaps();
  }, [category, difficulty]);

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedCategory = localStorage.getItem('dashboardCategory');
    const savedDifficulty = localStorage.getItem('dashboardDifficulty');
    const savedSearchTerm = localStorage.getItem('dashboardSearchTerm');
    if (savedCategory) setCategory(savedCategory);
    if (savedDifficulty) setDifficulty(savedDifficulty);
    if (savedSearchTerm) setSearchTerm(savedSearchTerm);
  }, []);

  // Save filters to localStorage on change
  useEffect(() => {
    localStorage.setItem('dashboardCategory', category);
  }, [category]);
  useEffect(() => {
    localStorage.setItem('dashboardDifficulty', difficulty);
  }, [difficulty]);
  useEffect(() => {
    localStorage.setItem('dashboardSearchTerm', searchTerm);
  }, [searchTerm]);

  const fetchRoadmaps = async () => {
    try {
      let url = endpoints.roadmaps;
      if (category) {
        url = `${endpoints.roadmaps}/category/${category}`;
      } else if (difficulty) {
        url = `${endpoints.roadmaps}/difficulty/${difficulty}`;
      }

      const response = await axiosInstance.get(url);
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
  };

  // If not logged in, redirect to login
  if (typeof user === 'undefined' || profileLoading) {
    // Show spinner while user or profile is loading
    return (
      <Stack align="center" py={12}>
        <Spinner size="xl" color="brand.500" />
      </Stack>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const isProfileIncomplete =
    !profile ||
    !Array.isArray(profile.interests) || profile.interests.length === 0 ||
    !profile.learningGoals || profile.learningGoals.trim() === '' ||
    !profile.weeklyAvailableTime || profile.weeklyAvailableTime < 1;

  console.log('user:', user);
  console.log('profile:', profile);
  console.log('isProfileIncomplete:', isProfileIncomplete);

  if (profile && isProfileIncomplete) {
    return <Onboarding onSubmit={async (data) => {
      // Save onboarding data
      const token = localStorage.getItem('token');
      await axiosInstance.put(endpoints.userProfile, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, ...data });
    }} initialData={profile} />;
  }

  // Fallback for debugging
  if (!profile && !profileLoading) {
    return <div>Profile not loaded or missing. Please check your backend and profile data.</div>;
  }

  const filteredRoadmaps = roadmaps.filter(roadmap =>
    (roadmap.title && roadmap.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (roadmap.description && roadmap.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'green';
    if (progress >= 50) return 'yellow';
    return 'red';
  };

  const getRecommendedRoadmap = () => {
    // Try to get from localStorage first
    const stored = localStorage.getItem('recommendedRoadmap');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if this roadmap still exists in the ALL roadmaps list (not filtered)
        const stillExists = allRoadmaps.find(rm => rm._id === parsed._id);
        if (stillExists) return stillExists;
      } catch {}
    }
    // Otherwise, find and store the first match from allRoadmaps
    if (!profile || !profile.interests || profile.interests.length === 0) return null;
    const found = allRoadmaps.find(rm => profile.interests.includes(rm.category));
    if (found) {
      localStorage.setItem('recommendedRoadmap', JSON.stringify(found));
      return found;
    }
    return null;
  };

  const recommendedRoadmap = getRecommendedRoadmap();

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        {recommendedRoadmap && (
          <Box bg="blue.50" p={6} borderRadius="lg" boxShadow="md">
            <Heading size="md" mb={2}>Recommended for you</Heading>
            <Text fontWeight="bold">{recommendedRoadmap.title}</Text>
            <Text color="gray.600">{recommendedRoadmap.description}</Text>
            <Button
              as={RouterLink}
              to={`/roadmap/${recommendedRoadmap._id}`}
              colorScheme="brand"
              mt={3}
            >
              View Roadmap
            </Button>
          </Box>
        )}
        <Box>
          <Heading size="lg">Learning Dashboard</Heading>
          <Text mt={2} color="gray.600">
            Explore and track your learning journey
          </Text>
        </Box>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search roadmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="web-development">Web Development</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="data-science">Data Science</option>
            <option value="machine-learning">Machine Learning</option>
            <option value="ui-ux">UI/UX Design</option>
            <option value="devops">DevOps</option>
          </Select>

          <Select
            placeholder="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </Stack>

        {loading ? (
          <Stack align="center" py={12}><Spinner size="xl" color="brand.500" /></Stack>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredRoadmaps.map((roadmap) => (
              <Card key={roadmap._id} variant="outline">
                <CardHeader>
                  <Heading size="md">{roadmap.title}</Heading>
                  <Stack direction="row" mt={2}>
                    <Badge colorScheme="blue">{roadmap.category}</Badge>
                    <Badge colorScheme="purple">{roadmap.difficulty}</Badge>
                  </Stack>
                </CardHeader>
                <CardBody>
                  <Text color="gray.600">{roadmap.description}</Text>
                  <Stack mt={4} spacing={2}>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        <Icon as={FaBook} mr={2} />
                        {roadmap.weeks.length} weeks
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        <Icon as={FaClock} mr={2} />
                        {roadmap.weeks.reduce((total, week) => 
                          total + week.topics.reduce((weekTotal, topic) => 
                            weekTotal + (topic.estimatedTime || 0), 0), 0
                        )} hours
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.500">
                        <Icon as={FaChartLine} mr={2} />
                        Progress
                      </Text>
                      <Progress
                        value={roadmap.progress || 0}
                        colorScheme={getProgressColor(roadmap.progress || 0)}
                        size="sm"
                        mt={1}
                      />
                    </Box>
                  </Stack>
                </CardBody>
                <CardFooter>
                  <Button
                    as={RouterLink}
                    to={`/roadmap/${roadmap._id}`}
                    colorScheme="brand"
                    width="full"
                  >
                    View Roadmap
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
};

export default Dashboard; 