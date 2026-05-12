import * as yup from 'yup';

export const createGameSchema = yup.object({
  name: yup.string().max(200, 'Назва не має перевищувати 200 символів').required('Назва обовʼязкова'),
  hostDisplayName: yup.string().max(200, 'Імʼя хоста не має перевищувати 200 символів'),
});
