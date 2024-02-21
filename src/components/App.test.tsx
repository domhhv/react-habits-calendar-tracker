jest.mock('react-aria', () => ({
  useLocale: jest.fn(),
  useCalendar: jest.fn(),
}));

jest.mock('react-stately', () => ({
  useCalendarState: jest.fn(),
}));

jest.mock('@internationalized/date', () => ({
  getWeeksInMonth: jest.fn(),
}));

jest.mock('@utils', () => ({
  generateCalendarRange: jest.fn(),
}));

jest.mock('@components', () => ({
  Calendar: jest.fn(),
  HabitsPage: jest.fn(),
  AppHeader: jest.fn(),
  AccountPage: jest.fn(),
}));

import { getWeeksInMonth } from '@internationalized/date';
import { act, render } from '@testing-library/react';
import { generateCalendarRange } from '@utils';
import React from 'react';
import { useLocale, useCalendar } from 'react-aria';
import { useCalendarState } from 'react-stately';

import App from './App';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe(App.name, () => {
  it('should call generateCalendarRange', () => {
    (useLocale as jest.Mock).mockReturnValue({ locale: 'en-US' });
    (useCalendarState as jest.Mock).mockReturnValue({
      visibleRange: {
        start: new Date('2022-01-01'),
        end: new Date('2022-01-31'),
      },
      getDatesInWeek: jest.fn().mockReturnValue([]),
    });
    (getWeeksInMonth as jest.Mock).mockReturnValue(5);
    (useCalendar as jest.Mock).mockReturnValue({
      title: '',
    });
    (generateCalendarRange as jest.Mock).mockReturnValue([]);

    act(() => render(<App />));

    expect(useLocale).toHaveBeenCalled();
    expect(useCalendarState).toHaveBeenCalled();
    expect(getWeeksInMonth).toHaveBeenCalledWith(
      new Date('2022-01-01'),
      'en-US'
    );
  });
});
