import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0C2432',
      light: '#1D5678',
      dark: '#071923',
      contrastText: '#F5FBFF',
    },
    secondary: {
      main: '#235E86',
      light: '#478ABD',
      dark: '#173F5A',
      contrastText: '#F4FBFF',
    },
    background: {
      default: '#EFF5FB',
      paper: 'rgba(255,255,255,0.84)',
    },
    text: {
      primary: '#0C2230',
      secondary: '#607789',
    },
    divider: 'rgba(12, 34, 48, 0.10)',
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          minHeight: 46,
          boxShadow: 'none',
          transition: 'transform 180ms ease, background-color 180ms ease, border-color 180ms ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.8)',
          transition: 'background-color 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.94)',
          },
          '&.Mui-focused': {
            backgroundColor: '#FFFFFF',
            boxShadow: '0 0 0 6px rgba(35,94,134,0.12)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 24px 60px rgba(12, 34, 48, 0.10)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.72)',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,251,255,0.78))',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
