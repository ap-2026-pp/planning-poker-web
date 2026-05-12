import { alpha, createTheme } from '@mui/material/styles';

import {
  DEFAULT_ACCENT_COLOR,
  getAccentColor,
  type AccentColor,
  type ResolvedThemeMode,
} from './theme-settings';

type CreateAppThemeOptions = {
  mode?: ResolvedThemeMode;
  accentColor?: AccentColor;
};

export const createAppTheme = ({
  mode = 'light',
  accentColor = DEFAULT_ACCENT_COLOR,
}: CreateAppThemeOptions = {}) => {
  const accent = getAccentColor(accentColor);
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: accent.main,
        light: accent.light,
        dark: accent.dark,
        contrastText: accent.contrastText,
      },
      secondary: {
        main: accent.dark,
        light: accent.main,
        dark: isDark ? '#D8C4FF' : '#173F5A',
        contrastText: accent.contrastText,
      },
      background: {
        default: isDark ? '#0B0D1B' : '#EFF5FB',
        paper: isDark ? 'rgba(22, 24, 41, 0.92)' : 'rgba(255,255,255,0.84)',
      },
      text: {
        primary: isDark ? '#F8F5FF' : '#0C2230',
        secondary: isDark ? 'rgba(226, 220, 245, 0.72)' : '#607789',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(12, 34, 48, 0.10)',
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
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
            transition: 'background-color 180ms ease, box-shadow 180ms ease',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.94)',
            },
            '&.Mui-focused': {
              backgroundColor: isDark ? 'rgba(16, 17, 31, 0.92)' : '#FFFFFF',
              boxShadow: `0 0 0 6px ${alpha(accent.main, isDark ? 0.18 : 0.12)}`,
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
            boxShadow: isDark
              ? '0 24px 60px rgba(3, 6, 16, 0.34)'
              : '0 24px 60px rgba(12, 34, 48, 0.10)',
            backdropFilter: 'blur(14px)',
            border: isDark
              ? '1px solid rgba(255,255,255,0.08)'
              : '1px solid rgba(255,255,255,0.72)',
            backgroundImage: isDark
              ? 'linear-gradient(180deg, rgba(28, 29, 49, 0.94), rgba(18, 20, 36, 0.9))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,251,255,0.78))',
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
};

export const appTheme = createAppTheme();
