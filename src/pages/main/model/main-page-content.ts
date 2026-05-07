import { appRoutes } from '@shared/config/routes';

export type Accent = 'purple' | 'green' | 'blue';

export type MainPageIcon =
  | 'instant-start'
  | 'transparent-voting'
  | 'live-discussion'
  | 'decision-history'
  | 'create-game'
  | 'join-game';

export type MainPageFeature = {
  accent: Accent;
  title: string;
  description: string;
  icon: MainPageIcon;
};

export type MainPageAction = {
  accent: Accent;
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
  icon: MainPageIcon;
  featured?: boolean;
  featuredLabel?: string;
};

export const featureWidgets: MainPageFeature[] = [
  {
    accent: 'purple',
    icon: 'instant-start',
    title: 'Миттєвий старт',
    description: 'Створюйте кімнату або підключайтеся по коду без довгих налаштувань і зайвих кроків.',
  },
  {
    accent: 'blue',
    icon: 'transparent-voting',
    title: 'Прозоре голосування',
    description: 'Усі оцінки відкриваються одночасно, щоб команда чесно порівнювала думки по задачі.',
  },
  {
    accent: 'green',
    icon: 'live-discussion',
    title: 'Живе обговорення',
    description: 'Після розкриття карток команда одразу бачить розбіжності та швидко доходить згоди.',
  },
  {
    accent: 'purple',
    icon: 'decision-history',
    title: 'Історія рішень',
    description: 'Поверніться до попередніх голосувань і тримайте під рукою результати минулих оцінок.',
  },
];

const authenticatedActions: MainPageAction[] = [
  {
    accent: 'purple',
    icon: 'create-game',
    title: 'Створити нову гру',
    description: 'Запустіть нову сесію, запросіть команду та почніть оцінювання за кілька кліків.',
    buttonLabel: 'Створити гру',
    to: appRoutes.createGame,
    featured: true,
    featuredLabel: 'Нова сесія',
  },
  {
    accent: 'blue',
    icon: 'join-game',
    title: 'Приєднатися до гри',
    description: 'Введіть код кімнати та швидко поверніться до поточного командного обговорення.',
    buttonLabel: 'Приєднатися',
    to: appRoutes.joinGame,
    featured: true,
    featuredLabel: 'Швидкий вхід',
  },
];

const guestActions: MainPageAction[] = [
  {
    accent: 'blue',
    icon: 'join-game',
    title: 'Приєднатися до гри',
    description: 'Отримали код кімнати від команди? Заходьте в активну сесію та долучайтеся до оцінювання.',
    buttonLabel: 'Приєднатися',
    to: appRoutes.joinGame,
    featured: true,
    featuredLabel: 'Швидкий вхід',
  },
];

export const getMainPageHeroContent = (isAuthenticated: boolean) => ({
  title: isAuthenticated ? 'Ласкаво просимо до' : 'Planning Poker',
  accentTitle: isAuthenticated ? 'Planning Poker!' : 'для вашої команди',
  description: isAuthenticated
    ? 'Створюйте ігри, запрошуйте команду та оцінюйте user stories разом легко та зручно.'
    : 'Простий інструмент для оцінки задач та спільного планування в команді.',
});

export const getMainPageActions = (isAuthenticated: boolean) =>
  isAuthenticated ? authenticatedActions : guestActions;
