import * as yup from 'yup';

export const joinGameSchema = yup.object({
  inviteCode: yup.string().required('Код кімнати обовʼязковий'),
  displayName: yup.string().max(200, 'Display name не має перевищувати 200 символів'),
});
