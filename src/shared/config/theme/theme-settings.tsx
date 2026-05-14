import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;
export type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'rose';

type AccentColorDefinition = {
  value: AccentColor;
  label: string;
  main: string;
  light: string;
  dark: string;
  contrastText: string;
};

type ThemeSettingsContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedThemeMode;
  accentColor: AccentColor;
  accent: AccentColorDefinition;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
};

export const THEME_STORAGE_KEY = 'planning-poker.theme-mode';
export const ACCENT_STORAGE_KEY = 'planning-poker.accent-color';

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const DEFAULT_ACCENT_COLOR: AccentColor = 'blue';

export const THEME_MODE_OPTIONS = [
  { value: 'light', label: 'Світла' },
  { value: 'dark', label: 'Темна' },
  { value: 'system', label: 'Системна' },
] as const satisfies readonly { value: ThemeMode; label: string }[];

export const ACCENT_COLORS = [
  {
    value: 'blue',
    label: 'Блакитний',
    main: '#347BE5',
    light: '#64ADFF',
    dark: '#256DCE',
    contrastText: '#FFFFFF',
  },
  {
    value: 'purple',
    label: 'Фіолетовий',
    main: '#A66FFF',
    light: '#C399FF',
    dark: '#8B56F6',
    contrastText: '#FFFFFF',
  },
  {
    value: 'green',
    label: 'Бірюзовий',
    main: '#62B8BC',
    light: '#95D7DA',
    dark: '#4A9397',
    contrastText: '#FFFFFF',
  },
  {
    value: 'orange',
    label: 'Помаранчевий',
    main: '#F0A543',
    light: '#FFC16C',
    dark: '#D66F24',
    contrastText: '#1C1207',
  },
  {
    value: 'rose',
    label: 'Рожевий',
    main: '#FF6081',
    light: '#FF91AA',
    dark: '#D93B61',
    contrastText: '#FFFFFF',
  },
] as const satisfies readonly AccentColorDefinition[];

const ThemeSettingsContext = createContext<ThemeSettingsContextValue | null>(null);

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system';

const isAccentColor = (value: string | null): value is AccentColor =>
  ACCENT_COLORS.some((accent) => accent.value === value);

const getSystemTheme = (): ResolvedThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME_MODE;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME_MODE;
};

const getStoredAccentColor = (): AccentColor => {
  if (typeof window === 'undefined') {
    return DEFAULT_ACCENT_COLOR;
  }

  const storedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY);

  return isAccentColor(storedAccent) ? storedAccent : DEFAULT_ACCENT_COLOR;
};

export const getAccentColor = (color: AccentColor): AccentColorDefinition =>
  ACCENT_COLORS.find((accent) => accent.value === color) ?? ACCENT_COLORS[0];

export const ThemeSettingsProvider = ({ children }: PropsWithChildren) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [accentColor, setAccentColor] = useState<AccentColor>(getStoredAccentColor);
  const [systemTheme, setSystemTheme] = useState<ResolvedThemeMode>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  const resolvedTheme = themeMode === 'system' ? systemTheme : themeMode;
  const accent = useMemo(() => getAccentColor(accentColor), [accentColor]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accentColor);
  }, [accentColor]);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = resolvedTheme;
    root.dataset.themeMode = themeMode;
    root.dataset.accent = accentColor;
    root.style.colorScheme = resolvedTheme;
  }, [accentColor, resolvedTheme, themeMode]);

  const value = useMemo<ThemeSettingsContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      accentColor,
      accent,
      setThemeMode,
      setAccentColor,
    }),
    [accent, accentColor, resolvedTheme, themeMode],
  );

  return (
    <ThemeSettingsContext.Provider value={value}>
      {children}
    </ThemeSettingsContext.Provider>
  );
};

export const useThemeSettings = () => {
  const context = useContext(ThemeSettingsContext);

  if (!context) {
    throw new Error('useThemeSettings must be used within ThemeSettingsProvider');
  }

  return context;
};
