export const getIssueToneIndex = (issue: {
  id: string;
  code?: string | null;
  title?: string | null;
}) => {
  const source = (issue.code?.trim() || issue.id || issue.title || '').toLowerCase();

  if (!source) {
    return 0;
  }

  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
    hash |= 0;
  }

  return Math.abs(hash) % 4;
};