import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendBookmarkNotification } from '@/services/notifications';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  image: string;
}

interface CourseState {
  bookmarks: Course[];
  toggleBookmark: (course: Course) => void;
  isBookmarked: (courseId: string) => boolean;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      toggleBookmark: (course) => {
        const { bookmarks } = get();
        // Use a more robust check for existing items
        const isAlreadyBookmarked = bookmarks.some(item => String(item.id) === String(course.id));
        
        let newBookmarks;
        if (isAlreadyBookmarked) {
          // Remove bookmark
          newBookmarks = bookmarks.filter(item => String(item.id) !== String(course.id));
        } else {
          // Add bookmark (ensure we don't accidentally push duplicates)
          const filtered = bookmarks.filter(item => String(item.id) !== String(course.id));
          newBookmarks = [...filtered, course];
        }
        
        set({ bookmarks: newBookmarks });
        
        // Trigger notification when exactly 5 courses are bookmarked
        if (newBookmarks.length === 5) {
          sendBookmarkNotification();
        }
      },
      isBookmarked: (courseId) => get().bookmarks.some(item => item.id === courseId),
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
