import type { Trait, TraitsInsert } from '@models';
import { listTraits, createTrait } from '@services';
import { useSnackbarsStore } from '@stores';
import { makeTestTrait } from '@tests';
import { getErrorMessage } from '@utils';
import { create } from 'zustand';

type TraitsState = {
  traits: Trait[];
  fetchingTraits: boolean;
  addingTrait: boolean;
  fetchTraits: () => Promise<void>;
  addTrait: (trait: TraitsInsert) => Promise<void>;
  clearTraits: () => void;
};

const testTraits = [
  makeTestTrait({ name: 'Test Good Trait', color: '#2AF004' }),
  makeTestTrait({ name: 'Test Bad Trait', color: '#F6F6F6' }),
];

const useTraitsStore = create<TraitsState>((set) => ({
  traits: testTraits,
  fetchingTraits: false,
  addingTrait: false,
  fetchTraits: async () => {
    const { showSnackbar } = useSnackbarsStore.getState();
    try {
      set({ fetchingTraits: true });
      const traits = await listTraits();
      set({ traits });
    } catch (error) {
      console.error(error);
      showSnackbar(
        'Something went wrong while fetching your traits. Please try reloading the page.',
        {
          description: `Error details: ${getErrorMessage(error)}`,
          color: 'danger',
          dismissible: true,
        }
      );
    } finally {
      set({ fetchingTraits: false });
    }
  },
  addTrait: async (trait: TraitsInsert) => {
    const { showSnackbar } = useSnackbarsStore.getState();
    try {
      set({ addingTrait: true });
      const newTrait = await createTrait(trait);
      set((state) => ({ traits: [...state.traits, newTrait] }));
      showSnackbar('Trait added successfully', {
        color: 'success',
        dismissible: true,
        dismissText: 'Done',
      });
    } catch (error) {
      console.error(error);
      showSnackbar('Something went wrong while adding your trait', {
        description: `Error details: ${getErrorMessage(error)}`,
        color: 'danger',
        dismissible: true,
      });
    } finally {
      set({ addingTrait: false });
    }
  },
  clearTraits: () => {
    set({ traits: [] });
  },
}));

export default useTraitsStore;
