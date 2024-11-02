import React from 'react';
import { Button, Tooltip } from '@nextui-org/react';
import { useUser } from '@supabase/auth-helpers-react';

import { VisuallyHiddenInput } from '@components';
import { type Habit } from '@models';
import { useHabitsStore } from '@stores';
import { getHabitIconUrl } from '@utils';

type HabitIconCellProps = {
  habit: Habit;
};

const HabitIconCell = ({ habit }: HabitIconCellProps) => {
  const { updateHabit } = useHabitsStore();
  const user = useUser();
  const iconUrl = getHabitIconUrl(habit.iconPath);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async ({
    target: { files },
  }) => {
    if (!user || !files) {
      return null;
    }

    const [iconFile] = files;

    await updateHabit(habit.id, user.id, {}, iconFile);
  };

  return (
    <Tooltip content="Upload new icon">
      <Button
        isIconOnly
        size="lg"
        variant="light"
        as="label"
        className="mr-1 flex h-12 w-12 cursor-pointer p-1 opacity-100"
        isDisabled={!user?.id}
      >
        <img
          src={iconUrl}
          alt={habit.name}
          role="habit-icon"
          className="h-8 w-8"
        />
        <VisuallyHiddenInput onChange={handleFileChange} />
      </Button>
    </Tooltip>
  );
};

export default HabitIconCell;
