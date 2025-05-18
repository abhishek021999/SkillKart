import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Button,
  Progress,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Icon,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  List,
  ListItem,
  ListIcon,
  Link,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  RadioGroup,
  Radio,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Avatar,
  Textarea,
  FormControl,
  FormLabel,
  useDisclosure,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Tooltip,
} from '@chakra-ui/react';
import { FaCheck, FaPlay, FaBook, FaVideo, FaQuestionCircle, FaClock, FaTrophy, FaFire, FaStar, FaMedal } from 'react-icons/fa';
import { AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import axiosInstance from '../utils/axiosInstance';
import { endpoints } from '../utils/api';

const RoadmapDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discussions, setDiscussions] = useState([]);
  const toast = useToast();
  const [quizModal, setQuizModal] = useState({ open: false, quiz: null, topicTitle: '', weekIndex: null, topicIndex: null });
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [selfRating, setSelfRating] = useState(3);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [postingDiscussion, setPostingDiscussion] = useState(false);
  const [replyContent, setReplyContent] = useState({});
  const [postingReply, setPostingReply] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editDiscussion, setEditDiscussion] = useState(null);
  const [editAnswer, setEditAnswer] = useState(null);
  const [deleting, setDeleting] = useState({ type: '', id: null, parentId: null });
  const [alertOpen, setAlertOpen] = useState(false);
  const cancelRef = useRef();
  const [lastDiscussions, setLastDiscussions] = useState([]);
  const [progress, setProgress] = useState([]);
  const [userXP, setUserXP] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [userStreak, setUserStreak] = useState(0);
  const [userStreakLongest, setUserStreakLongest] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [badgePopup, setBadgePopup] = useState(null);

  useEffect(() => {
    fetchRoadmap();
    fetchDiscussions();
    fetchProgress();
    fetchUserProfile();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      const response = await axiosInstance.get(endpoints.roadmapById(id));
      setRoadmap(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch roadmap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscussions = async () => {
    try {
      const response = await axiosInstance.get(endpoints.discussionsRoadmap(id));
      setDiscussions(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch discussions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axiosInstance.get(endpoints.roadmapProgress(id));
      setProgress(response.data.progress || []);
    } catch (error) {
      setProgress([]);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(endpoints.userProfile);
      setUserXP(response.data.profile.xp || 0);
      setUserBadges(response.data.profile.badges || []);
      setUserStreak(response.data.profile.streak || 0);
      setUserStreakLongest(response.data.profile.streakLongest || 0);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getProgress = () => {
    if (!roadmap) return 0;
    let total = 0, completed = 0;
    roadmap.weeks.forEach((week, weekIdx) => {
      week.topics.forEach((topic, topicIdx) => {
        total++;
        if (isCompleted(weekIdx, topicIdx)) completed++;
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const isCompleted = (weekIdx, topicIdx) =>
    progress.some(p => p.weekIndex === weekIdx && p.topicIndex === topicIdx && p.completed);
  const isInProgress = (weekIdx, topicIdx) =>
    progress.some(p => p.weekIndex === weekIdx && p.topicIndex === topicIdx && p.inProgress);

  const markTopicComplete = async (weekIndex, topicIndex) => {
    try {
      if (!user?._id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to mark topics as complete',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const response = await axiosInstance.put(endpoints.topicComplete(id, weekIndex, topicIndex), {
        userId: user._id,
        roadmapId: id
      });
      await fetchProgress();
      await fetchUserProfile();
      if (response.data.confetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2500);
      }
      if (response.data.newBadge) {
        setBadgePopup(response.data.newBadge);
        setTimeout(() => setBadgePopup(null), 3000);
      }
      toast({
        title: 'Success',
        description: `Topic marked as complete! Earned 10 XP.${response.data.newBadge ? ` New badge: ${response.data.newBadge}` : ''} Current streak: ${response.data.profile.streak}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking topic complete:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update topic status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const markTopicInProgress = async (weekIndex, topicIndex) => {
    try {
      if (!user?._id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to mark topics as in progress',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const response = await axiosInstance.put(endpoints.topicInProgress(id, weekIndex, topicIndex), {
        userId: user._id,
        roadmapId: id
      });
      await fetchProgress();
      toast({
        title: 'Success',
        description: 'Topic marked as in progress',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error marking topic in progress:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update topic status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetTopicProgress = async (weekIndex, topicIndex) => {
    try {
      if (!user?._id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to reset topic progress',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      const response = await axiosInstance.put(endpoints.topicReset(id, weekIndex, topicIndex), {
        userId: user._id,
        roadmapId: id
      });
      await fetchProgress();
      toast({
        title: 'Success',
        description: 'Topic progress has been reset',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error resetting topic progress:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reset topic progress',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Quiz modal handlers
  const openQuizModal = (quiz, topicTitle, weekIndex, topicIndex) => {
    if (!Array.isArray(quiz) || quiz.length === 0) {
      setQuizModal({ open: true, quiz: [], topicTitle, weekIndex, topicIndex });
      setQuizAnswers([]);
      setQuizSubmitted(false);
      setQuizScore(0);
      setSelfRating(3);
      return;
    }
    setQuizModal({ open: true, quiz, topicTitle, weekIndex, topicIndex });
    setQuizAnswers(Array(quiz.length).fill(null));
    setQuizSubmitted(false);
    setQuizScore(0);
    setSelfRating(3);
  };
  const closeQuizModal = () => {
    setQuizModal({ open: false, quiz: null, topicTitle: '', weekIndex: null, topicIndex: null });
    setQuizAnswers([]);
    setQuizSubmitted(false);
    setQuizScore(0);
    setSelfRating(3);
  };
  const handleQuizAnswer = (qIdx, value) => {
    setQuizAnswers(prev => {
      const updated = [...prev];
      updated[qIdx] = parseInt(value);
      return updated;
    });
  };
  const handleQuizSubmit = () => {
    let score = 0;
    quizModal.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) score++;
    });
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  const handleNewDiscussionChange = (e) => {
    setNewDiscussion({ ...newDiscussion, [e.target.name]: e.target.value });
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    setPostingDiscussion(true);
    try {
      await axiosInstance.post(endpoints.discussions, {
        title: newDiscussion.title,
        content: newDiscussion.content,
        roadmap: id,
      });
      setNewDiscussion({ title: '', content: '' });
      onClose();
      fetchDiscussions();
      toast({ title: 'Success', description: 'Question posted!', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to post question', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setPostingDiscussion(false);
    }
  };

  const handleReplyChange = (discussionId, value) => {
    setReplyContent(prev => ({ ...prev, [discussionId]: value }));
  };

  const handlePostReply = async (discussionId) => {
    setPostingReply(prev => ({ ...prev, [discussionId]: true }));
    try {
      await axiosInstance.post(endpoints.discussionComments(discussionId), {
        content: replyContent[discussionId],
      });
      setReplyContent(prev => ({ ...prev, [discussionId]: '' }));
      fetchDiscussions();
      toast({ title: 'Success', description: 'Answer posted!', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to post answer', status: 'error', duration: 5000, isClosable: true });
    } finally {
      setPostingReply(prev => ({ ...prev, [discussionId]: false }));
    }
  };

  // Notification for new answers to user's questions
  useEffect(() => {
    if (!user || !lastDiscussions.length) return;
    const myQuestions = lastDiscussions.filter(d => d.author._id === user._id);
    const newAnswers = discussions.filter(d => d.author._id === user._id && d.comments.length > myQuestions.find(q => q._id === d._id)?.comments.length);
    if (newAnswers.length > 0) {
      newAnswers.forEach(d => {
        toast({
          title: 'New answer to your question',
          description: `Your question "${d.title}" has a new answer!`,
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      });
    }
    setLastDiscussions(discussions);
  }, [discussions, user]);

  // Edit Discussion
  const handleEditDiscussion = (discussion) => {
    setEditDiscussion({ ...discussion });
  };
  const handleEditDiscussionChange = (e) => {
    setEditDiscussion(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSaveEditDiscussion = async () => {
    if (!editDiscussion.title.trim() || !editDiscussion.content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await axiosInstance.put(endpoints.discussion(editDiscussion._id), {
        title: editDiscussion.title,
        content: editDiscussion.content,
      });
      setEditDiscussion(null);
      fetchDiscussions();
      toast({ title: 'Question updated!', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update question',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleLikeDiscussion = async (discussionId) => {
    try {
      await axiosInstance.put(endpoints.discussionLike(discussionId));
      fetchDiscussions();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update like', status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Edit Answer
  const handleEditAnswer = (discussionId, comment) => {
    setEditAnswer({ discussionId, commentId: comment._id, content: comment.content });
  };
  const handleEditAnswerChange = (e) => {
    setEditAnswer(prev => ({ ...prev, content: e.target.value }));
  };
  const handleSaveEditAnswer = async () => {
    try {
      await axiosInstance.put(endpoints.discussionCommentById(editAnswer.discussionId, editAnswer.commentId), {
        content: editAnswer.content,
      });
      setEditAnswer(null);
      fetchDiscussions();
      toast({ title: 'Answer updated!', status: 'success', duration: 3000, isClosable: true });
    } catch {
      toast({ title: 'Error', description: 'Failed to update answer', status: 'error', duration: 5000, isClosable: true });
    }
  };

  // Delete Discussion/Answer
  const handleDelete = (type, id, parentId = null) => {
    setDeleting({ type, id, parentId });
    setAlertOpen(true);
  };
  const handleConfirmDelete = async () => {
    try {
      if (deleting.type === 'discussion') {
        await axiosInstance.delete(endpoints.discussion(deleting.id));
        toast({ title: 'Question deleted!', status: 'success', duration: 3000, isClosable: true });
      } else if (deleting.type === 'answer') {
        await axiosInstance.delete(endpoints.discussionCommentById(deleting.parentId, deleting.id));
        toast({ title: 'Answer deleted!', status: 'success', duration: 3000, isClosable: true });
      }
      setAlertOpen(false);
      setDeleting({ type: '', id: null, parentId: null });
      fetchDiscussions();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', status: 'error', duration: 5000, isClosable: true });
    }
  };

  if (loading) {
    return <Stack align="center" py={12}><Spinner size="xl" color="brand.500" /></Stack>;
  }

  if (!roadmap) {
    return <Text>Roadmap not found</Text>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Stack spacing={4}>
            <Stack direction="row" justify="space-between" align="center">
              <Stack spacing={1}>
                <Heading size="lg">{roadmap.title}</Heading>
                <Stack direction="row" spacing={2}>
                  <Badge colorScheme="blue" px={2} py={1} borderRadius="md">
                    {roadmap.category}
                  </Badge>
                  <Badge colorScheme="purple" px={2} py={1} borderRadius="md">
                    {roadmap.difficulty}
                  </Badge>
                </Stack>
              </Stack>
              <Stack direction="row" spacing={4} align="center">
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Total Duration</Text>
                  <Text fontWeight="bold">
                    {roadmap.weeks.reduce((total, week) => 
                      total + week.topics.reduce((weekTotal, topic) => 
                        weekTotal + (topic.estimatedTime || 0), 0), 0
                    )} hours
                  </Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Weeks</Text>
                  <Text fontWeight="bold">{roadmap.weeks.length}</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">XP</Text>
                  <Text fontWeight="bold">{userXP}</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Badges</Text>
                  <Text fontWeight="bold">{userBadges.length}</Text>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="sm" color="gray.500">Streak</Text>
                  <Text fontWeight="bold">{userStreak}</Text>
                </Box>
              </Stack>
            </Stack>
            <Box>
              <Text fontWeight="bold" mb={1}>Overall Progress</Text>
              <Progress 
                value={getProgress()} 
                colorScheme="brand" 
                size="md" 
                borderRadius="md"
                hasStripe
                isAnimated
              />
              <Text fontSize="sm" color="gray.600" mt={1}>{getProgress()}% completed</Text>
            </Box>
            <Text color="gray.600">{roadmap.description}</Text>
          </Stack>
        </Box>

        <Tabs>
          <TabList>
            <Tab>Learning Path</Tab>
            <Tab>Discussions</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Accordion allowMultiple>
                {roadmap.weeks.map((week, weekIndex) => (
                  <AccordionItem key={weekIndex}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <Text fontWeight="bold">
                            Week {week.weekNumber}: {week.title}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      <Stack spacing={4}>
                        {week.topics.map((topic, topicIndex) => {
                          // Find quiz resource
                          const quizResource = topic.resources.find(r => r.type === 'quiz' && Array.isArray(r.quizData || r.quiz));
                          const quizData = quizResource?.quizData || quizResource?.quiz;
                          return (
                            <Card as={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: topicIndex * 0.1 }} key={topicIndex} variant="outline" position="relative">
                              <CardHeader>
                                <Stack direction="row" justify="space-between" align="center">
                                  <Stack spacing={1}>
                                    <Heading size="sm">{topic.title}</Heading>
                                    {topic.estimatedTime && (
                                      <Text fontSize="sm" color="gray.500">
                                        <Icon as={FaClock} mr={1} />
                                        {topic.estimatedTime} hours
                                      </Text>
                                    )}
                                  </Stack>
                                  <Stack direction="row" spacing={2}>
                                    {isCompleted(weekIndex, topicIndex) ? (
                                      <Badge colorScheme="green" px={2} py={1} borderRadius="md">
                                        <Icon as={FaCheck} mr={1} />
                                        Completed
                                      </Badge>
                                    ) : isInProgress(weekIndex, topicIndex) ? (
                                      <Badge colorScheme="yellow" px={2} py={1} borderRadius="md">
                                        <Icon as={FaPlay} mr={1} />
                                        In Progress
                                      </Badge>
                                    ) : null}
                                    {!isCompleted(weekIndex, topicIndex) && !isInProgress(weekIndex, topicIndex) && (
                                      <Button
                                        size="sm"
                                        colorScheme="yellow"
                                        leftIcon={<Icon as={FaPlay} />}
                                        onClick={() => markTopicInProgress(weekIndex, topicIndex)}
                                      >
                                        Start Learning
                                      </Button>
                                    )}
                                    {!isCompleted(weekIndex, topicIndex) && (
                                      <Button
                                        size="sm"
                                        colorScheme="brand"
                                        leftIcon={<Icon as={FaCheck} />}
                                        onClick={() => markTopicComplete(weekIndex, topicIndex)}
                                      >
                                        Mark Complete
                                      </Button>
                                    )}
                                    {isCompleted(weekIndex, topicIndex) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        colorScheme="gray"
                                        onClick={() => resetTopicProgress(weekIndex, topicIndex)}
                                      >
                                        Reset Progress
                                      </Button>
                                    )}
                                    {quizResource && quizData && quizData.length > 0 && (
                                      <Button
                                        size="sm"
                                        colorScheme="purple"
                                        onClick={() => openQuizModal(quizData, topic.title, weekIndex, topicIndex)}
                                      >
                                        Practice Quiz
                                      </Button>
                                    )}
                                  </Stack>
                                </Stack>
                              </CardHeader>
                              <CardBody>
                                <Text color="gray.600" mb={4}>{topic.description}</Text>
                                <Box>
                                  <Text fontWeight="medium" mb={2}>Learning Resources</Text>
                                  <List spacing={3}>
                                    {topic.resources.map((resource, resourceIndex) => (
                                      <ListItem 
                                        key={resourceIndex}
                                        p={2}
                                        borderRadius="md"
                                        _hover={{ bg: 'gray.50' }}
                                        transition="all 0.2s"
                                      >
                                        <Stack direction="row" align="center">
                                          <ListIcon
                                            as={
                                              resource.type === 'video'
                                                ? FaVideo
                                                : resource.type === 'article'
                                                ? FaBook
                                                : FaQuestionCircle
                                            }
                                            color="brand.500"
                                            boxSize={5}
                                          />
                                          <Box flex={1}>
                                            <Link 
                                              href={resource.url} 
                                              isExternal 
                                              color="brand.500"
                                              fontWeight="medium"
                                              _hover={{ textDecoration: 'underline' }}
                                            >
                                              {resource.title}
                                            </Link>
                                            {resource.description && (
                                              <Text fontSize="sm" color="gray.500" mt={1}>
                                                {resource.description}
                                              </Text>
                                            )}
                                          </Box>
                                          {resource.duration && (
                                            <Badge colorScheme="gray" px={2} py={1}>
                                              {resource.duration} min
                                            </Badge>
                                          )}
                                          {resource.type === 'quiz' && (
                                            <Button
                                              colorScheme="purple"
                                              size="sm"
                                              mt={2}
                                              onClick={() => openQuizModal(resource.quizData || resource.quiz, topic.title, weekIndex, topicIndex)}
                                            >
                                              Practice Quiz
                                            </Button>
                                          )}
                                        </Stack>
                                      </ListItem>
                                    ))}
                                  </List>
                                </Box>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </Stack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
              {/* Quiz Modal */}
              <Modal isOpen={quizModal.open} onClose={closeQuizModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Practice Quiz: {quizModal.topicTitle}</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    {(!quizModal.quiz || quizModal.quiz.length === 0) ? (
                      <Text color="gray.500" textAlign="center">No quiz questions available for this topic.</Text>
                    ) : (
                      <VStack spacing={6} align="stretch">
                        {quizModal.quiz.map((q, qIdx) => (
                          <Box key={qIdx} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                            <Text fontWeight="semibold" mb={2}>Q{qIdx + 1}: {q.question}</Text>
                            <RadioGroup
                              value={quizAnswers[qIdx] !== null ? quizAnswers[qIdx] : undefined}
                              onChange={val => handleQuizAnswer(qIdx, val)}
                              isDisabled={quizSubmitted}
                            >
                              <VStack align="start">
                                {q.options.map((opt, oIdx) => {
                                  let color = undefined;
                                  let fontWeight = undefined;
                                  let showCorrect = false;
                                  if (quizSubmitted) {
                                    if (q.correctIndex === oIdx) {
                                      color = 'green.600';
                                      fontWeight = 'bold';
                                      if (quizAnswers[qIdx] !== q.correctIndex) showCorrect = true;
                                    } else if (quizAnswers[qIdx] === oIdx) {
                                      color = 'red.500';
                                      fontWeight = 'bold';
                                    }
                                  }
                                  return (
                                    <Radio key={oIdx} value={oIdx} colorScheme="purple">
                                      <Text color={color} fontWeight={fontWeight}>
                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                        {quizSubmitted && showCorrect && ' (Correct)'}
                                        {quizSubmitted && quizAnswers[qIdx] === oIdx && quizAnswers[qIdx] !== q.correctIndex && ' (Your answer)'}
                                      </Text>
                                    </Radio>
                                  );
                                })}
                              </VStack>
                            </RadioGroup>
                            {quizSubmitted && quizAnswers[qIdx] === q.correctIndex && (
                              <Text color="green.600" fontWeight="bold" mt={2}>Correct!</Text>
                            )}
                            {quizSubmitted && quizAnswers[qIdx] !== q.correctIndex && (
                              <Text color="red.500" fontWeight="bold" mt={2}>Incorrect. Correct answer: {String.fromCharCode(65 + q.correctIndex)}</Text>
                            )}
                          </Box>
                        ))}
                        {quizSubmitted && (
                          <Box p={4} borderWidth={1} borderRadius="md" bg="purple.50" textAlign="center">
                            <Text fontWeight="bold" fontSize="lg">Your Score: {quizScore} / {quizModal.quiz.length}</Text>
                            <Text mt={2}>How confident do you feel about this topic?</Text>
                            <NumberInput
                              min={1}
                              max={5}
                              value={selfRating}
                              onChange={(_, v) => setSelfRating(v)}
                              isDisabled={false}
                              width="120px"
                              mx="auto"
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.500">(1 = Not confident, 5 = Very confident)</Text>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </ModalBody>
                  <ModalFooter>
                    {!quizSubmitted ? (
                      <Button colorScheme="purple" mr={3} onClick={handleQuizSubmit} isDisabled={quizAnswers.some(a => a === null)}>
                        Submit Quiz
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={closeQuizModal}>Close</Button>
                    )}
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </TabPanel>

            <TabPanel>
              <Stack spacing={4}>
                <Button leftIcon={<AddIcon />} colorScheme="brand" alignSelf="flex-start" onClick={onOpen} mb={4}>
                  Ask a Question
                </Button>
                {/* New Discussion Modal */}
                <Modal isOpen={isOpen} onClose={onClose} size="lg">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Ask a Question</ModalHeader>
                    <ModalCloseButton />
                    <form onSubmit={handlePostDiscussion}>
                      <ModalBody>
                        <FormControl isRequired mb={4}>
                          <FormLabel>Title</FormLabel>
                          <Input name="title" value={newDiscussion.title} onChange={handleNewDiscussionChange} placeholder="Enter your question title" />
                        </FormControl>
                        <FormControl isRequired>
                          <FormLabel>Details</FormLabel>
                          <Textarea name="content" value={newDiscussion.content} onChange={handleNewDiscussionChange} placeholder="Describe your question..." rows={5} />
                        </FormControl>
                      </ModalBody>
                      <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="brand" type="submit" isLoading={postingDiscussion}>Post Question</Button>
                      </ModalFooter>
                    </form>
                  </ModalContent>
                </Modal>
                {/* Edit Discussion Modal */}
                <Modal isOpen={!!editDiscussion} onClose={() => setEditDiscussion(null)} size="lg">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Edit Question</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <FormControl isRequired mb={4}>
                        <FormLabel>Title</FormLabel>
                        <Input name="title" value={editDiscussion?.title || ''} onChange={handleEditDiscussionChange} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Details</FormLabel>
                        <Textarea name="content" value={editDiscussion?.content || ''} onChange={handleEditDiscussionChange} rows={5} />
                      </FormControl>
                    </ModalBody>
                    <ModalFooter>
                      <Button variant="ghost" mr={3} onClick={() => setEditDiscussion(null)}>Cancel</Button>
                      <Button colorScheme="brand" onClick={handleSaveEditDiscussion}>Save</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                {/* Edit Answer Modal */}
                <Modal isOpen={!!editAnswer} onClose={() => setEditAnswer(null)} size="lg">
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Edit Answer</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <FormControl isRequired>
                        <FormLabel>Answer</FormLabel>
                        <Textarea value={editAnswer?.content || ''} onChange={handleEditAnswerChange} rows={4} />
                      </FormControl>
                    </ModalBody>
                    <ModalFooter>
                      <Button variant="ghost" mr={3} onClick={() => setEditAnswer(null)}>Cancel</Button>
                      <Button colorScheme="brand" onClick={handleSaveEditAnswer}>Save</Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
                {/* Delete Confirmation Dialog */}
                <AlertDialog isOpen={alertOpen} leastDestructiveRef={cancelRef} onClose={() => setAlertOpen(false)}>
                  <AlertDialogOverlay />
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Confirmation</AlertDialogHeader>
                    <AlertDialogBody>Are you sure you want to delete this {deleting.type === 'discussion' ? 'question' : 'answer'}? This action cannot be undone.</AlertDialogBody>
                    <AlertDialogFooter>
                      <Button ref={cancelRef} onClick={() => setAlertOpen(false)}>Cancel</Button>
                      <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>Delete</Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* Discussions List */}
                {discussions.map((discussion) => (
                  <Card key={discussion._id} variant="outline">
                    <CardHeader>
                      <Heading size="sm">{discussion.title}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        by {discussion.author.profile?.name || discussion.author.email}
                      </Text>
                      {discussion.author._id === user?._id && (
                        <Stack direction="row" spacing={2} mt={2}>
                          <Button size="xs" colorScheme="blue" variant="outline" onClick={() => handleEditDiscussion(discussion)}>Edit</Button>
                          <Button size="xs" colorScheme="red" variant="outline" onClick={() => handleDelete('discussion', discussion._id)}>Delete</Button>
                        </Stack>
                      )}
                    </CardHeader>
                    <CardBody>
                      <Text mb={2}>{discussion.content}</Text>
                      {/* Comments/Answers */}
                      <Stack spacing={3} mt={4}>
                        {discussion.comments && discussion.comments.length > 0 && (
                          <Box>
                            <Text fontWeight="bold" mb={2}>Answers:</Text>
                            <Stack spacing={2}>
                              {discussion.comments.map((comment) => (
                                <Box key={comment._id} p={3} bg="gray.50" borderRadius="md">
                                  <Stack direction="row" align="center" spacing={2} mb={1}>
                                    <Avatar size="xs" name={comment.author?.profile?.name || comment.author?.email} />
                                    <Text fontSize="sm" fontWeight="bold">{comment.author?.profile?.name || comment.author?.email}</Text>
                                    <Text fontSize="xs" color="gray.400">{new Date(comment.createdAt).toLocaleString()}</Text>
                                    {comment.author._id === user?._id && (
                                      <>
                                        <Button size="xs" colorScheme="blue" variant="ghost" onClick={() => handleEditAnswer(discussion._id, comment)}>Edit</Button>
                                        <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleDelete('answer', comment._id, discussion._id)}>Delete</Button>
                                      </>
                                    )}
                                  </Stack>
                                  <Text fontSize="sm">{comment.content}</Text>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}
                        {/* Reply form */}
                        <Box mt={2}>
                          <Textarea
                            placeholder="Write your answer..."
                            value={replyContent[discussion._id] || ''}
                            onChange={e => handleReplyChange(discussion._id, e.target.value)}
                            rows={2}
                          />
                          <Button
                            size="sm"
                            colorScheme="brand"
                            mt={2}
                            isLoading={postingReply[discussion._id]}
                            onClick={() => handlePostReply(discussion._id)}
                            isDisabled={!replyContent[discussion._id] || postingReply[discussion._id]}
                          >
                            Post Answer
                          </Button>
                        </Box>
                      </Stack>
                    </CardBody>
                    <CardFooter>
                      <Stack direction="row" spacing={4}>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={FaCheck} />}
                          colorScheme={discussion.likes.includes(user?._id) ? 'brand' : 'gray'}
                          onClick={() => handleLikeDiscussion(discussion._id)}
                        >
                          {discussion.likes.length} Likes
                        </Button>
                        <Button size="sm" variant="ghost">
                          {discussion.comments.length} Comments
                        </Button>
                      </Stack>
                    </CardFooter>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Box position="sticky" top="16" zIndex={10} as={motion.div} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} bgGradient="linear(to-r, accent.100, brand.100)" borderRadius="2xl" boxShadow="xl" p={6} mb={8}>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={8} align="center" justify="center">
            <VStack>
              <Icon as={FaTrophy} w={10} h={10} color="yellow.400" />
              <Text fontWeight="bold" fontSize="lg" fontFamily="Montserrat, Poppins, sans-serif">XP</Text>
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Text fontSize="3xl" color="brand.700">{userXP}</Text>
              </motion.div>
            </VStack>
            <VStack>
              <Icon as={FaFire} w={10} h={10} color="orange.400" />
              <Text fontWeight="bold" fontSize="lg" fontFamily="Montserrat, Poppins, sans-serif">Streak</Text>
              <Tooltip label={`Longest streak: ${userStreakLongest || userStreak} days`} hasArrow>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}>
                  <Text fontSize="3xl" color="orange.500">{userStreak}</Text>
                </motion.div>
              </Tooltip>
            </VStack>
            <VStack>
              <Icon as={FaStar} w={10} h={10} color="blue.400" />
              <Text fontWeight="bold" fontSize="lg" fontFamily="Montserrat, Poppins, sans-serif">Badges</Text>
              <HStack spacing={2}>
                {userBadges.map((badge, i) => (
                  <Tooltip key={i} label={badge} hasArrow>
                    <motion.div whileHover={{ scale: 1.3 }}>
                      <Badge colorScheme="purple" px={3} py={1} borderRadius="full" fontSize="lg" boxShadow="md">{badge}</Badge>
                    </motion.div>
                  </Tooltip>
                ))}
              </HStack>
            </VStack>
          </Stack>
          <AnimatePresence>
            {badgePopup && (
              <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.5 }} style={{ position: 'absolute', left: '50%', top: '-2.5rem', transform: 'translateX(-50%)', zIndex: 100 }}>
                <Box bg="purple.500" color="white" px={6} py={3} borderRadius="xl" boxShadow="2xl" fontWeight="bold" fontSize="xl" display="flex" alignItems="center" gap={2}>
                  <Icon as={FaMedal} w={7} h={7} color="yellow.300" />
                  New Badge: {badgePopup}!
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </Stack>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={250} recycle={false} />}
    </Container>
  );
};

export default RoadmapDetail; 