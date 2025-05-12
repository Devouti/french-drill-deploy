import { create } from 'zustand';

type AudioStore = {
  audioFiles: Record<string, File>;
  setAudioFiles: (files: Record<string, File>) => void;
};

export const useAudioStore = create<AudioStore>((set) => ({
  audioFiles: {},
  setAudioFiles: (files) => set({ audioFiles: files }),
}));