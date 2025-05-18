import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Badge,
  Select,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Tag,
  TagLabel,
  HStack,
  Spinner,
  Button,
} from '@chakra-ui/react';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRoadmaps: 0,
    totalCompletions: 0,
    averageProgress: 0
  });
  const [roadmaps, setRoadmaps] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState('');
  const [userProgress, setUserProgress] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedRoadmap) {
      setLoading(true);
      fetchUserProgress(selectedRoadmap).finally(() => setLoading(false));
    }
  }, [selectedRoadmap]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [statsResponse, roadmapsResponse] = await Promise.all([
        axiosInstance.get(endpoints.adminStats, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axiosInstance.get(endpoints.adminRoadmaps, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats(statsResponse.data);
      setRoadmaps(roadmapsResponse.data);
      if (roadmapsResponse.data.length > 0) {
        setSelectedRoadmap(roadmapsResponse.data[0]._id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async (roadmapId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`${endpoints.adminRoadmaps}/${roadmapId}/progress`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserProgress(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user progress',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'green';
    if (progress >= 50) return 'yellow';
    if (progress >= 25) return 'orange';
    return 'red';
  };

  return (
    <Container maxW="container.xl" py={8}>
      {loading ? (
        <Stack align="center" py={12}><Spinner size="xl" color="brand.500" /></Stack>
      ) : (
        <Stack spacing={8}>
          <Box>
            <Heading size="lg">Admin Analytics Dashboard</Heading>
            <Text mt={2} color="gray.600">
              Track roadmap usage and user progress
            </Text>
            <Button mt={4} colorScheme="blue" onClick={fetchDashboardData} isLoading={loading}>
              Refresh
            </Button>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Stat
              px={4}
              py={5}
              bg="white"
              shadow="md"
              rounded="lg"
            >
              <StatLabel>Total Users</StatLabel>
              <StatNumber>{stats.totalUsers}</StatNumber>
              <StatHelpText>Active learners</StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
              bg="white"
              shadow="md"
              rounded="lg"
            >
              <StatLabel>Active Roadmaps</StatLabel>
              <StatNumber>{stats.activeRoadmaps}</StatNumber>
              <StatHelpText>Currently in use</StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
              bg="white"
              shadow="md"
              rounded="lg"
            >
              <StatLabel>Total Completions</StatLabel>
              <StatNumber>{stats.totalCompletions}</StatNumber>
              <StatHelpText>Completed roadmaps</StatHelpText>
            </Stat>

            <Stat
              px={4}
              py={5}
              bg="white"
              shadow="md"
              rounded="lg"
            >
              <StatLabel>Average Progress</StatLabel>
              <StatNumber>{stats.averageProgress}%</StatNumber>
              <StatHelpText>Across all roadmaps</StatHelpText>
            </Stat>
          </SimpleGrid>

          <Box>
            <Stack spacing={4}>
              <Box>
                <Text mb={2} fontWeight="bold">Select Roadmap to View Progress</Text>
                <Select
                  value={selectedRoadmap}
                  onChange={(e) => setSelectedRoadmap(e.target.value)}
                >
                  {roadmaps.map((roadmap) => (
                    <option key={roadmap._id} value={roadmap._id}>
                      {roadmap.title}
                    </option>
                  ))}
                </Select>
              </Box>

              <Box
                bg="white"
                shadow="md"
                rounded="lg"
                overflow="hidden"
              >
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Progress</Th>
                      <Th>Details</Th>
                      <Th>Last Activity</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {userProgress.map((progress) => (
                      <Tr key={progress.userId}>
                        <Td>
                          <Box>
                            <Text fontWeight="bold">{progress.userName}</Text>
                            <Text fontSize="sm" color="gray.500">{progress.userEmail}</Text>
                          </Box>
                        </Td>
                        <Td>
                          <Progress
                            value={progress.percentage}
                            colorScheme={getProgressColor(progress.percentage)}
                            size="sm"
                          />
                          <Text fontSize="sm" mt={1}>
                            {progress.percentage}%
                          </Text>
                        </Td>
                        <Td>
                          <Accordion allowToggle>
                            <AccordionItem border="none">
                              <AccordionButton px={0}>
                                <Box flex="1" textAlign="left">
                                  <Text fontSize="sm" color="blue.500">View Details</Text>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4}>
                                <Stack spacing={2}>
                                  <Box>
                                    <Text fontSize="sm" fontWeight="bold">Interests:</Text>
                                    <HStack spacing={2} mt={1}>
                                      {progress.userInterests.map((interest, index) => (
                                        <Tag key={index} size="sm" colorScheme="blue">
                                          <TagLabel>{interest}</TagLabel>
                                        </Tag>
                                      ))}
                                    </HStack>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" fontWeight="bold">Learning Goals:</Text>
                                    <Text fontSize="sm" mt={1}>{progress.userGoals}</Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" fontWeight="bold">Started:</Text>
                                    <Text fontSize="sm" mt={1}>
                                      {new Date(progress.startedAt).toLocaleDateString()}
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontSize="sm" fontWeight="bold">Completed Topics:</Text>
                                    <Text fontSize="sm" mt={1}>
                                      {progress.completedTopics.length} topics completed
                                    </Text>
                                  </Box>
                                </Stack>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </Td>
                        <Td>{new Date(progress.lastActivity).toLocaleDateString()}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              progress.status === 'active' ? 'green' :
                              progress.status === 'paused' ? 'yellow' :
                              'red'
                            }
                          >
                            {progress.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </Stack>
          </Box>
        </Stack>
      )}
    </Container>
  );
};

export default AdminDashboard; 