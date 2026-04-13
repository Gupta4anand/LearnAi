import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CatalogItem {
  id: string | number;
  [key: string]: any;
}

interface ContentState {
  cachedCourses: CatalogItem[];
  cachedInstructors: CatalogItem[];
  lastCatalogSyncAt: string | null;
  setCatalogCache: (payload: { courses?: CatalogItem[]; instructors?: CatalogItem[] }) => void;
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      cachedCourses: [],
      cachedInstructors: [],
      lastCatalogSyncAt: null,
      setCatalogCache: ({ courses, instructors }) =>
        set((state) => ({
          cachedCourses: Array.isArray(courses) && courses.length > 0 ? courses : state.cachedCourses,
          cachedInstructors: Array.isArray(instructors) && instructors.length > 0 ? instructors : state.cachedInstructors,
          lastCatalogSyncAt: new Date().toISOString(),
        })),
    }),
    {
      name: 'content-cache-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
