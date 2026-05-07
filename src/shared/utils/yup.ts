import { ValidationError, type AnyObjectSchema } from 'yup';

export type FormErrors<T extends Record<string, unknown>> = Partial<
  Record<Extract<keyof T, string>, string>
>;

export const validateSchema = async <T extends Record<string, unknown>>(
  schema: AnyObjectSchema,
  values: T
): Promise<FormErrors<T>> => {
  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof ValidationError)) {
      throw error;
    }

    const errors: FormErrors<T> = {};

    for (const issue of error.inner) {
      if (!issue.path || errors[issue.path as Extract<keyof T, string>]) {
        continue;
      }

      errors[issue.path as Extract<keyof T, string>] = issue.message;
    }

    if (!error.inner.length && error.path) {
      errors[error.path as Extract<keyof T, string>] = error.message;
    }

    return errors;
  }
};

