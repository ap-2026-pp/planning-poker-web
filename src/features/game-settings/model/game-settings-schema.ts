import * as yup from 'yup';

import { VotingSystem } from '@entities/game';

export const createGameSchema = yup.object({
  name: yup
    .string()
    .trim()
    .max(200, 'Назва не має перевищувати 200 символів')
    .required('Назва обовʼязкова'),
  customValues: yup.string().when('votingSystem', {
    is: VotingSystem.Custom,
    then: (schema) =>
      schema
        .trim()
        .required('Для Custom потрібно вказати значення карток')
        .max(200, 'Значення карток не мають перевищувати 200 символів')
        .matches(
          /^[^,]+(,[^,]+)*$/,
          'Значення мають бути розділені комами без порожніх елементів',
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  defaultTimerMinutes: yup
    .number()
    .typeError('Тривалість таймера має бути числом')
    .integer('Тривалість таймера має бути цілим числом')
    .min(1, 'Тривалість таймера має бути не менше 1 хвилини')
    .required('Тривалість таймера обовʼязкова'),
});
