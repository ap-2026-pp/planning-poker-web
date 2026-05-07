export const getUserInitials = (email?: string) => {
  if (!email) {
    return 'U';
  }

  const [localPart] = email.split('@');
  const words = localPart
    .split(/[._-]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return localPart.slice(0, 1).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
};
