import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  useColorModeValue,
  useBreakpointValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaGraduationCap } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
      >
        <Flex
          flex={{ base: 1, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}
        >
          <IconButton
            onClick={toggle}
            icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
          <HStack
            as={RouterLink}
            to="/"
            spacing={2}
            _hover={{ textDecoration: 'none' }}
            cursor="pointer"
          >
            <Icon
              as={FaGraduationCap}
              w={8}
              h={8}
              color="brand.500"
              transition="transform 0.2s"
              _hover={{ transform: 'scale(1.1)' }}
            />
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                bgGradient="linear(to-r, brand.500, brand.600)"
                bgClip="text"
                letterSpacing="tight"
              >
                SkillKart
              </Text>
              <Text
                fontSize="xs"
                color="gray.500"
                letterSpacing="wider"
                textTransform="uppercase"
              >
                Learn • Grow • Excel
              </Text>
            </Box>
          </HStack>

          <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
            <Stack direction={'row'} spacing={4}>
              {(!user || user.role !== 'admin') && (
                <Button
                  as={RouterLink}
                  to="/"
                  variant={'ghost'}
                >
                  Home
                </Button>
              )}
              {user && (
                <>
                  <Button
                    as={RouterLink}
                    to="/dashboard"
                    variant={'ghost'}
                  >
                    Dashboard
                  </Button>
                  {user.role === 'admin' && (
                    <Button
                      as={RouterLink}
                      to="/admin"
                      variant={'ghost'}
                    >
                      Admin Panel
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          {user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}
              >
                <Avatar
                  size={'sm'}
                  name={user.profile?.name || user.email}
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">
                  Profile
                </MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                display={user ? 'none' : 'inline-flex'}
              >
                Sign In
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                display={{ base: 'none', md: user ? 'none' : 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                _hover={{
                  bg: 'brand.600',
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      {/* Mobile menu */}
      {isOpen && (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            {(!user || user.role !== 'admin') && (
              <Button
                as={RouterLink}
                to="/"
                variant={'ghost'}
              >
                Home
              </Button>
            )}
            {user && (
              <>
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  variant={'ghost'}
                >
                  Dashboard
                </Button>
                {user.role === 'admin' && (
                  <Button
                    as={RouterLink}
                    to="/admin"
                    variant={'ghost'}
                  >
                    Admin Panel
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar; 