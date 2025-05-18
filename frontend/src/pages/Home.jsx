import { Box, Container, Heading, Text, Button, Stack, SimpleGrid, Icon, Image, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGraduationCap, FaUsers, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

// Animated SVG Logo
const Logo = () => (
  <Box as={motion.div} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} mb={4}>
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5cafeb" />
          <stop offset="1" stopColor="#fbc2eb" />
        </linearGradient>
      </defs>
      <circle cx="40" cy="40" r="38" stroke="url(#logo-gradient)" strokeWidth="4" fill="white" filter="url(#shadow)" />
      <path d="M20 40L40 20L60 40L40 60Z" fill="url(#logo-gradient)" />
      <circle cx="40" cy="40" r="8" fill="#fff" stroke="#5cafeb" strokeWidth="2" />
    </svg>
    <Text fontWeight="bold" fontSize="2xl" fontFamily="Montserrat, Poppins, sans-serif" bgGradient="linear(to-r, brand.400, accent.200)" bgClip="text">SkillKart</Text>
  </Box>
);

const Feature = ({ title, text, icon, delay }) => {
  return (
    <Stack
      as={motion.div}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      align="center"
      textAlign="center"
      p={6}
      bg={useColorModeValue('glass.100', 'glass.200')}
      rounded="2xl"
      shadow="xl"
      _hover={{ transform: 'translateY(-8px) scale(1.03)', boxShadow: '2xl', transition: 'all 0.3s' }}
      backdropFilter="blur(8px)"
    >
      <Icon as={icon} w={12} h={12} color="brand.500" mb={2} />
      <Heading size="md" fontFamily="Montserrat, Poppins, sans-serif">{title}</Heading>
      <Text color="gray.600">{text}</Text>
    </Stack>
  );
};

const AnimatedWave = () => (
  <Box position="absolute" left={0} right={0} top={0} zIndex={0} pointerEvents="none">
    <svg width="100%" height="180" viewBox="0 0 1440 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="url(#wave-gradient)" fillOpacity="0.3" d="M0,80 C360,180 1080,0 1440,80 L1440,180 L0,180 Z" />
      <defs>
        <linearGradient id="wave-gradient" x1="0" y1="0" x2="1440" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fbc2eb" />
          <stop offset="1" stopColor="#a6c1ee" />
        </linearGradient>
      </defs>
    </svg>
  </Box>
);

const Home = () => {
  const { user } = useAuth();
  return (
    <Box minH="100vh" bgGradient="linear(to-br, accent.100 0%, brand.100 100%)" position="relative" overflow="hidden">
      <AnimatedWave />
      {/* Hero Section */}
      <Container maxW="container.lg" py={24} position="relative" zIndex={1}>
        <Stack spacing={8} align="center" textAlign="center" as={motion.div} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <Logo />
          <Heading size="2xl" fontFamily="Montserrat, Poppins, sans-serif" bgGradient="linear(to-r, brand.400, accent.200)" bgClip="text" fontWeight="extrabold">
            Unlock Your Potential
          </Heading>
          <Text fontSize="xl" maxW="2xl" color="gray.700" fontFamily="Poppins, Montserrat, sans-serif">
            Your journey to mastering new skills starts here. Follow curated learning roadmaps, track your progress, and join a vibrant community of learners.
          </Text>
          {user ? (
            <Box>
              <Text fontSize="lg" color="brand.700" fontWeight="bold">You are logged in. Explore your dashboard or roadmaps!</Text>
            </Box>
          ) : (
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Box as={motion.div} whileHover={{ scale: 1.08, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }} whileTap={{ scale: 0.98 }}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  colorScheme="brand"
                  bgGradient="linear(to-r, brand.400, accent.200)"
                  color="white"
                  fontWeight="bold"
                  px={10}
                  py={6}
                  fontSize="xl"
                  shadow="xl"
                >
                  Get Started
                </Button>
              </Box>
              <Box as={motion.div} whileHover={{ scale: 1.08, borderColor: 'accent.200', color: 'accent.200' }} whileTap={{ scale: 0.98 }}>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  variant="outline"
                  color="brand.700"
                  borderColor="brand.400"
                  fontWeight="bold"
                  px={10}
                  py={6}
                  fontSize="xl"
                  shadow="md"
                >
                  Sign In
                </Button>
              </Box>
            </Stack>
          )}
        </Stack>
      </Container>

      {/* Features Section */}
      <Container maxW="container.xl" py={20} position="relative" zIndex={1}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            icon={FaGraduationCap}
            title="Curated Learning Paths"
            text="Follow expert-designed roadmaps to master new skills step by step"
            delay={0.1}
          />
          <Feature
            icon={FaUsers}
            title="Community Learning"
            text="Join discussions, share progress, and learn from others"
            delay={0.2}
          />
          <Feature
            icon={FaChartLine}
            title="Track Progress"
            text="Monitor your learning journey with detailed progress tracking"
            delay={0.3}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Home; 