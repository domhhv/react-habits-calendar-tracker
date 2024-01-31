import { FloatingLabelInput } from '@components';
import { Button, DialogActions } from '@mui/joy';
import React from 'react';

import { StyledDialogContent } from './styled';

type AuthFormProps = {
  onSubmit: (username: string, password: string) => void;
  onCancel: () => void;
  disabled: boolean;
  submitButtonLabel: string;
};

export const AuthForm = ({
  submitButtonLabel,
  onSubmit,
  onCancel,
  disabled,
}: AuthFormProps) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(username, password);
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <StyledDialogContent>
        <FloatingLabelInput
          value={username}
          onChange={handleUsernameChange}
          label="Username"
          disabled={disabled}
        />
        <FloatingLabelInput
          value={password}
          onChange={handlePasswordChange}
          label="Password"
          type="password"
          disabled={disabled}
        />
      </StyledDialogContent>
      <DialogActions>
        <Button
          variant="solid"
          color="primary"
          loading={disabled}
          type="submit"
        >
          {submitButtonLabel}
        </Button>
        <Button
          onClick={handleCancel}
          variant="outlined"
          color="neutral"
          disabled={disabled}
        >
          Cancel
        </Button>
      </DialogActions>
    </form>
  );
};
