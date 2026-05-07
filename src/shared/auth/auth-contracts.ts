export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload;

export type StoredSession = {
  accessToken: string;
  refreshToken: string;
  expiration: string;
  email: string;
};
