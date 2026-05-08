import * as yup from 'yup';

export const accountDisplayNameSchema = yup.object({
  displayName: yup
    .string()
    .trim()
    .required('Глобальне імʼя обовʼязкове')
    .max(200, 'Глобальне імʼя не має перевищувати 200 символів'),
});

export const accountPasswordSchema = yup.object({
  oldPassword: yup.string().required('Поточний пароль обовʼязковий'),
  newPassword: yup
    .string()
    .required('Новий пароль обовʼязковий')
    .min(8, 'Новий пароль має містити щонайменше 8 символів'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Паролі мають співпадати')
    .required('Підтвердження пароля обовʼязкове'),
});
