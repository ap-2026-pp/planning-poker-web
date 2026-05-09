export const appRoutes = {
  home: '/',
  login: '/login',
  register: '/register',
  account: '/account',
  myGames: '/games',
  createGame: '/games/create',
  editGame: (gameId: string) => `/games/${gameId}/edit`,
  joinGame: '/join',
  gameRoom: (gameId: string) => `/games/${gameId}`,
  votingHistory: (gameId: string) => `/games/${gameId}/history`,
};

export const isGameRoomRoute = (pathname: string) => {
  const match = pathname.match(/^\/games\/([^/]+)$/);

  return Boolean(match && match[1] !== 'create');
};
