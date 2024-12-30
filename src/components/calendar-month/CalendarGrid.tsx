import { getYearWeekNumberFromMonthWeek } from '@helpers';
import { type CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { Button } from '@nextui-org/react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useCalendarGrid, useLocale } from 'react-aria';
import { type CalendarState } from 'react-stately';

import type { CellPosition, CellRangeStatus } from './CalendarCell';
import CalendarCell from './CalendarCell';

type CalendarGridProps = {
  state: CalendarState;
  onAddNote: (dateNumber: number, monthIndex: number, fullYear: number) => void;
  onAddOccurrence: (
    dateNumber: number,
    monthIndex: number,
    fullYear: number
  ) => void;
  activeMonthLabel: string;
  activeYear: number;
  onWeekClick: (weekNum: number) => void;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CalendarGrid = ({
  state,
  onAddNote,
  onAddOccurrence,
  activeMonthLabel,
  activeYear,
  onWeekClick,
}: CalendarGridProps) => {
  const { gridProps } = useCalendarGrid({}, state);
  const { locale } = useLocale();
  const weeksInMonthCount = getWeeksInMonth(state.visibleRange.start, locale);
  const weekIndexes = [...new Array(weeksInMonthCount).keys()];
  const { month: activeMonth } = state.visibleRange.start;

  const getCellPosition = (
    weekIndex: number,
    dayIndex: number
  ): CellPosition => {
    if (weekIndex === 0 && dayIndex === 0) {
      return 'top-left';
    }

    if (weekIndex === 0 && dayIndex === 6) {
      return 'top-right';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 0) {
      return 'bottom-left';
    }

    if (weekIndex === weeksInMonthCount - 1 && dayIndex === 6) {
      return 'bottom-right';
    }

    return '';
  };

  return (
    <div {...gridProps} className="flex flex-1 flex-col gap-0 lg:gap-4">
      <div className="mb-1 flex">
        {[...Array(7)].map((_, index) => {
          return (
            <div
              key={index}
              className="flex flex-1 items-center justify-center text-neutral-600 dark:text-neutral-300"
            >
              <p className="font-bold">{WEEK_DAYS[index]}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          className="flex flex-1 flex-col"
          key={activeMonthLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {weekIndexes.map((weekIndex) => {
            const weekNum = getYearWeekNumberFromMonthWeek(
              activeMonthLabel,
              activeYear,
              weekIndex
            );

            return (
              <div key={weekIndex} className="group flex items-center gap-4">
                <Button
                  className={clsx(
                    'h-[110px] basis-[40px]',
                    'hidden' // TODO: show the week number button, open weekly view (WIP) on click
                  )}
                  variant="ghost"
                  onClick={() => onWeekClick(weekNum)}
                >
                  {weekNum}
                </Button>
                <div
                  className={clsx(
                    'flex h-[110px] w-full basis-full justify-between border-l-2 border-r-2 border-neutral-500 last-of-type:border-b-2 group-first-of-type:border-t-2 dark:border-neutral-400 lg:h-auto',
                    weekIndex === 0 && 'rounded-t-lg',
                    weekIndex === weeksInMonthCount - 1 && 'rounded-b-lg'
                  )}
                >
                  {state
                    .getDatesInWeek(weekIndex)
                    .map((calendarDate: CalendarDate | null, dayIndex) => {
                      if (!calendarDate) {
                        return null;
                      }

                      const { month, day, year } = calendarDate;

                      const rangeStatus: CellRangeStatus =
                        month < activeMonth
                          ? 'below-range'
                          : month > activeMonth
                            ? 'above-range'
                            : 'in-range';

                      const [cellKey] = calendarDate.toString().split('T');

                      const position = getCellPosition(weekIndex, dayIndex);

                      return (
                        <CalendarCell
                          key={cellKey}
                          dateNumber={day}
                          monthNumber={month}
                          fullYear={year}
                          onAddOccurrence={onAddOccurrence}
                          onAddNote={onAddNote}
                          rangeStatus={rangeStatus}
                          position={position}
                          onNavigateBack={state.focusPreviousPage}
                          onNavigateForward={state.focusNextPage}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarGrid;