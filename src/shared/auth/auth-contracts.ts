export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload;

export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};
