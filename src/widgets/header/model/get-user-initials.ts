export const getUserInitials = (value?: string | null) => {
  if (!value) {
    return 'U';
  }

  const normalizedValue = value.includes('@') ? value.split('@')[0] ?? value : value;
  const words = normalizedValue
    .split(/[._\-\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return normalizedValue.slice(0, 1).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
};
