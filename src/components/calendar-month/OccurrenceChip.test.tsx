import { useScreenWidth } from '@hooks';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { makeTestOccurrence } from '@tests';
import { getHabitIconUrl } from '@utils';
import React from 'react';

import OccurrenceChip, { type OccurrenceChipProps } from './OccurrenceChip';

jest.mock('@hooks', () => ({
  useScreenWidth: jest.fn(),
}));

jest.mock('@stores', () => ({
  useOccurrencesStore: jest.fn(),
  useNotesStore: jest.fn().mockReturnValue({
    notes: [],
  }),
}));

jest.mock('@hooks', () => ({
  useScreenWidth: jest.fn().mockReturnValue({ screenWidth: 1000 }),
}));

describe(OccurrenceChip.name, () => {
  const mockOnDelete = jest.fn();
  const props: OccurrenceChipProps = {
    occurrences: [makeTestOccurrence()],
    onDelete: mockOnDelete,
  };

  it('should render img with habit icon', async () => {
    const { getByAltText } = render(<OccurrenceChip {...props} />);
    const img = getByAltText('Test Habit Name icon');
    expect(img).toBeInTheDocument();
    await waitFor(() => {
      expect(img).toHaveAttribute(
        'src',
        getHabitIconUrl('https://i.ibb.co/vvgw7bx/habitrack-logo.png')
      );
    });
  });

  it.skip('should call onDelete when delete button is clicked', async () => {
    const { getByRole } = render(<OccurrenceChip {...props} />);
    const chip = getByRole('habit-chip');
    fireEvent.mouseOver(chip);
    const deleteButton = getByRole('habit-chip-delete-button');
    await waitFor(() => {
      expect(deleteButton).toBeDefined();
    });
    deleteButton.click();
    expect(mockOnDelete).toHaveBeenCalledWith(1, expect.anything());
  });

  it('should not render delete button on small screens', () => {
    (useScreenWidth as jest.Mock).mockReturnValue({ screenWidth: 1024 });
    const { queryByRole } = render(<OccurrenceChip {...props} />);
    const chipDelete = queryByRole('habit-chip-delete-button');
    expect(chipDelete).toBeNull();
  });
});
