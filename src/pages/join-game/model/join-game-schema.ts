import * as yup from 'yup';

export const joinGameSchema = yup.object({
  inviteCode: yup.string().trim().required('Код кімнати обовʼязковий'),
  displayName: yup.string().trim().max(200, 'Імʼя в кімнаті не має перевищувати 200 символів'),
});
