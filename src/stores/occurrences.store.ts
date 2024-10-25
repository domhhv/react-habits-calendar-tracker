import { cacheOccurrence, occurrencesCache, uncacheOccurrence } from '@helpers';
import type {
  Occurrence,
  OccurrencesDateMap,
  OccurrencesInsert,
} from '@models';
import {
  createOccurrence,
  destroyOccurrence,
  listOccurrences,
} from '@services';
import { useHabitsStore, useSnackbarsStore, useTraitsStore } from '@stores';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

type OccurrenceFilters = {
  habitIds?: Set<string>;
  traitIds?: Set<string>;
};

type OccurrencesState = {
  addingOccurrence: boolean;
  fetchingOccurrences: boolean;
  allOccurrences: Occurrence[];
  occurrences: Occurrence[];
  occurrencesByDate: OccurrencesDateMap;
  filteredBy: OccurrenceFilters;
  range: [number, number];
  fetchOccurrences: () => Promise<void>;
  clearOccurrences: () => void;
  filterBy: (options: OccurrenceFilters) => void;
  addOccurrence: (occurrence: OccurrencesInsert) => Promise<void>;
  removeOccurrence: (id: number) => Promise<void>;
  removeOccurrencesByHabitId: (habitId: number) => void;
  onRangeChange: (range: [number, number]) => void;
  updateOccurrences: (
    allOccurrences: Occurrence[],
    filteredBy: OccurrenceFilters
  ) => void;
  updateOccurrencesMap: (occurrences: Occurrence[]) => void;
  updateFilteredBy: (options: OccurrenceFilters) => void;
};

const useOccurrencesStore = create<OccurrencesState>((set, get) => {
  const { showSnackbar } = useSnackbarsStore.getState();
  const { habits } = useHabitsStore.getState();
  const { traits } = useTraitsStore.getState();

  return {
    addingOccurrence: false,
    fetchingOccurrences: false,
    allOccurrences: [],
    occurrences: [],
    occurrencesByDate: {},
    filteredBy: {
      habitIds: new Set(habits.map((habit) => habit.id.toString())),
      traitIds: new Set(traits.map((trait) => trait.id.toString())),
    },
    range: [0, 0],
    fetchOccurrences: async () => {
      const { range } = get();
      try {
        if (range.every(Boolean)) {
          set({ fetchingOccurrences: true });
          const allOccurrences = await listOccurrences(range);
          set({ allOccurrences });
        }
      } catch (error) {
        console.error(error);
        showSnackbar(
          'Something went wrong while fetching your habit entries. Please try reloading the page.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );
      } finally {
        set({ fetchingOccurrences: false });
      }
    },
    clearOccurrences: () => {
      set({ allOccurrences: [] });
      occurrencesCache.clear();
    },
    filterBy: (options: OccurrenceFilters) => set({ filteredBy: options }),
    addOccurrence: async (occurrence: OccurrencesInsert) => {
      set({ addingOccurrence: true });
      const { range } = get();

      try {
        const nextOccurrence = await createOccurrence(occurrence);
        cacheOccurrence(range, nextOccurrence);
        set((state) => ({
          allOccurrences: [...state.allOccurrences, nextOccurrence],
        }));
        showSnackbar('Habit entry(s) are added to the calendar', {
          color: 'success',
          dismissible: true,
          dismissText: 'Done',
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while adding your habit entry. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );
        console.error(error);
      } finally {
        set({ addingOccurrence: false });
      }
    },
    removeOccurrence: async (id: number) => {
      const { range } = get();
      try {
        await destroyOccurrence(id);
        set((state) => ({
          allOccurrences: state.allOccurrences.filter(
            (occurrence) => occurrence.id !== id
          ),
        }));
        uncacheOccurrence(range, id);
        showSnackbar('Your habit entry has been deleted from the calendar.', {
          dismissible: true,
        });
      } catch (error) {
        showSnackbar(
          'Something went wrong while deleting your habit entry. Please try again.',
          {
            description: `Error details: ${getErrorMessage(error)}`,
            color: 'danger',
            dismissible: true,
          }
        );
        console.error(error);
      }
    },
    removeOccurrencesByHabitId: (habitId: number) => {
      const { range } = get();

      set((state) => ({
        allOccurrences: state.allOccurrences.reduce(
          (acc: Occurrence[], occurrence) => {
            if (occurrence.habitId !== habitId) {
              return [...acc, occurrence];
            }

            uncacheOccurrence(range, occurrence.id);

            return acc;
          },
          []
        ),
      }));
    },
    onRangeChange: (range: [number, number]) => set({ range }),
    updateOccurrences: (
      allOccurrences: Occurrence[],
      filteredBy: OccurrenceFilters
    ) => {
      const nextOccurrences = allOccurrences.filter((occurrence) => {
        return (
          filteredBy.habitIds?.has(occurrence.habitId.toString()) &&
          filteredBy.traitIds?.has(occurrence.habit?.trait?.id.toString() || '')
        );
      });

      set({ occurrences: nextOccurrences });
    },
    updateOccurrencesMap: (occurrences: Occurrence[]) => {
      const nextOccurrencesByDate = occurrences.reduce(
        (acc, occurrence) => {
          const { day } = occurrence;
          if (!acc[day]) {
            acc[day] = [occurrence];
          } else {
            acc[day].push(occurrence);
          }
          return acc;
        },
        {} as Record<string, Occurrence[]>
      );

      set({ occurrencesByDate: nextOccurrencesByDate });
    },
    updateFilteredBy: (options: OccurrenceFilters) => {
      set((prevState) => ({
        filteredBy: {
          ...prevState.filteredBy,
          ...options,
        },
      }));
    },
  };
});

useOccurrencesStore.subscribe((state, prevState) => {
  if (prevState.occurrences !== state.occurrences) {
    state.updateOccurrencesMap(state.occurrences);
  }

  if (
    prevState.allOccurrences !== state.allOccurrences ||
    prevState.filteredBy !== state.filteredBy
  ) {
    state.updateOccurrences(state.allOccurrences, state.filteredBy);
  }

  if (prevState.range !== state.range) {
    void state.fetchOccurrences();
  }
});

export default useOccurrencesStore;