import { extendTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { createBreakpoints } from '@chakra-ui/theme-tools';

const fonts = {
  heading: `'Poppins', 'Montserrat', sans-serif`,
  body: `'Poppins', 'Montserrat', sans-serif`,
};

const colors = {
  brand: {
    50: '#e3f9ff',
    100: '#c1e7fe',
    200: '#a0d4fd',
    300: '#7ec2fc',
    400: '#5cafeb',
    500: '#3a9cda',
    600: '#2e7bb0',
    700: '#225a86',
    800: '#15395c',
    900: '#071932',
  },
  accent: {
    100: '#fbc2eb',
    200: '#a6c1ee',
    300: '#fcb69f',
    400: '#ffecd2',
    500: '#fcb69f',
  },
  glass: {
    100: 'rgba(255,255,255,0.7)',
    200: 'rgba(255,255,255,0.4)',
    300: 'rgba(255,255,255,0.2)',
  },
};

const breakpoints = createBreakpoints({
  sm: '30em',
  md: '48em',
  lg: '62em',
  xl: '80em',
});

const styles = {
  global: (props) => ({
    'html, body': {
      fontFamily: 'Poppins, Montserrat, sans-serif',
      bg: mode('brand.50', 'brand.900')(props),
      color: mode('brand.900', 'brand.50')(props),
      minHeight: '100vh',
      background: mode(
        'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        'linear-gradient(135deg, #071932 0%, #2e7bb0 100%)'
      )(props),
      transition: 'background 0.5s',
    },
    '::-webkit-scrollbar': {
      width: '8px',
      background: 'rgba(0,0,0,0.05)',
    },
    '::-webkit-scrollbar-thumb': {
      background: 'rgba(0,0,0,0.15)',
      borderRadius: '8px',
    },
  }),
};

const components = {
  Card: {
    baseStyle: {
      bg: 'glass.100',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
      borderRadius: '2xl',
      backdropFilter: 'blur(8px)',
      border: '1px solid',
      borderColor: 'glass.200',
      transition: 'box-shadow 0.3s',
      _hover: {
        boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.25)',
      },
    },
  },
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: 'xl',
      transition: 'all 0.2s',
    },
    variants: {
      solid: (props) => ({
        bgGradient: mode(
          'linear(to-r, brand.400, accent.200)',
          'linear(to-r, brand.700, accent.300)'
        )(props),
        color: mode('white', 'brand.50')(props),
        _hover: {
          bgGradient: mode(
            'linear(to-r, accent.200, brand.400)',
            'linear(to-r, accent.300, brand.700)'
          )(props),
          transform: 'scale(1.05)',
          boxShadow: 'lg',
        },
      }),
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 3,
      py: 1,
      fontWeight: 'bold',
      fontSize: '0.9em',
      letterSpacing: 'wide',
      boxShadow: 'sm',
      textTransform: 'capitalize',
      transition: 'all 0.2s',
    },
  },
  Progress: {
    baseStyle: {
      borderRadius: 'xl',
      height: '1.25rem',
      bg: 'glass.200',
      transition: 'all 0.5s',
    },
    defaultProps: {
      colorScheme: 'brand',
    },
  },
  Heading: {
    baseStyle: {
      fontFamily: 'Montserrat, Poppins, sans-serif',
      fontWeight: 'extrabold',
      letterSpacing: 'tight',
      textShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
};

const theme = extendTheme({
  fonts,
  colors,
  styles,
  components,
  breakpoints,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
});

export default theme; 