import { AddHabitDialogButton, ViewAllHabitsModalButton } from '@components';
import { HabitsContext } from '@context';
import { AccountCircleOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/joy';
import { styled } from '@mui/joy/styles';
import React from 'react';

const StyledAppHeader = styled('header')(() => ({
  width: '100%',
  height: 50,
  backgroundColor: '#d6d3d1',
  borderBottom: '1px solid #78716c',
}));

const StyledButtonsContainer = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  '& > button:first-of-type': {
    marginRight: 10,
  },
}));

const StyledAppHeaderContent = styled('div')(() => ({
  width: 1050,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '0 auto',
  height: '100%',
}));

export default function Header() {
  const { fetchingHabits } = React.useContext(HabitsContext);

  return (
    <StyledAppHeader>
      <StyledAppHeaderContent>
        <StyledButtonsContainer>
          <AddHabitDialogButton disabled={fetchingHabits} />
          <ViewAllHabitsModalButton loading={fetchingHabits} />
        </StyledButtonsContainer>
        <IconButton>
          <AccountCircleOutlined />
        </IconButton>
      </StyledAppHeaderContent>
    </StyledAppHeader>
  );
}
