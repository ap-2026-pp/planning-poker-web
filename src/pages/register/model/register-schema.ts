import * as yup from 'yup';

export const registerSchema = yup.object({
  email: yup.string().email('Вкажіть коректний email').required('Email обовʼязковий'),
  password: yup
    .string()
    .min(6, 'Пароль має містити щонайменше 6 символів')
    .required('Пароль обовʼязковий'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Паролі мають співпадати')
    .required('Підтвердження пароля обовʼязкове'),
});
