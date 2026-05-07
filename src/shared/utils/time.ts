export const formatDateTime = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatDuration = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  return value;
};

