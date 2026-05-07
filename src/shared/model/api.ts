export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export const isApiEnvelope = <T>(value: unknown): value is ApiEnvelope<T> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'data' in value;
};

