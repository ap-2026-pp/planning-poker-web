import { useEffect, useState } from 'react';

type UseDisplayNameDialogOptions = {
  initialValue: string;
  requiredMessage: string;
  maxLengthMessage: string;
  fallbackErrorMessage?: string;
  onSave: (value: string) => Promise<void>;
};

export const useDisplayNameDialog = ({
  initialValue,
  requiredMessage,
  maxLengthMessage,
  fallbackErrorMessage = 'Не вдалося оновити імʼя',
  onSave,
}: UseDisplayNameDialogOptions) => {
  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const open = () => {
    setValue(initialValue);
    setErrorMessage(null);
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setErrorMessage(null);
  };

  const submit = async () => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      setErrorMessage(requiredMessage);
      return;
    }

    if (normalizedValue.length > 200) {
      setErrorMessage(maxLengthMessage);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await onSave(normalizedValue);
      setOpen(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallbackErrorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isOpen,
    value,
    errorMessage,
    isSubmitting,
    setValue,
    open,
    close,
    submit,
  };
};