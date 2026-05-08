export const appRoutes = {
  home: '/',
  login: '/login',
  register: '/register',
  account: '/account',
  createGame: '/games/create',
  joinGame: '/join',
  gameRoom: (gameId: string) => `/games/${gameId}`,
  votingHistory: (gameId: string) => `/games/${gameId}/history`,
};

export const isGameRoomRoute = (pathname: string) => /^\/games\/[^/]+$/.test(pathname);
