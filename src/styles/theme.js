export const theme = {
  colors: {
    brand: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      dark: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    },
    glass: {
      light: 'rgba(255, 255, 255, 0.25)',
      medium: 'rgba(255, 255, 255, 0.15)',
      dark: 'rgba(0, 0, 0, 0.25)',
    }
  },
  fonts: {
    heading: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    body: '"Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  shadows: {
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    card: '0 10px 40px rgba(0, 0, 0, 0.1)',
    hover: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
  borderRadius: {
    glass: '16px',
    card: '12px',
  }
};

export const glassCardStyle = {
  background: 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

export const gradientButtonStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  _hover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
  },
  _active: {
    transform: 'translateY(0)',
  },
};
