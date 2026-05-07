import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Вкажіть коректний email').required('Email обовʼязковий'),
  password: yup.string().required('Пароль обовʼязковий'),
});
