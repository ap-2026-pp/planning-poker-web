const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const env = {
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL?.trim() || '/api'),
  signalRHubPath: trimTrailingSlash(
    import.meta.env.VITE_SIGNALR_HUB_PATH?.trim() || '/hubs/game-room'
  ),
};

