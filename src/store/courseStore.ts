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

export interface EnrolledCourse extends Course {
  enrolledAt: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
}

interface CourseState {
  bookmarks: Course[];
  enrolledCourses: EnrolledCourse[];
  toggleBookmark: (course: Course) => void;
  isBookmarked: (courseId: string) => boolean;
  enrollCourse: (course: Course, totalLessons?: number) => void;
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => EnrolledCourse | undefined;
  updateCourseProgress: (courseId: string, completedLessons: number, totalLessons?: number) => void;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      enrolledCourses: [],
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
      isBookmarked: (courseId) => get().bookmarks.some(item => String(item.id) === String(courseId)),
      enrollCourse: (course, totalLessons = 5) => {
        const { enrolledCourses } = get();
        const existingCourse = enrolledCourses.find((item) => String(item.id) === String(course.id));

        if (existingCourse) {
          return;
        }

        const newEnrollment: EnrolledCourse = {
          ...course,
          enrolledAt: new Date().toISOString(),
          progress: 0,
          completedLessons: 0,
          totalLessons,
        };

        set({
          enrolledCourses: [...enrolledCourses, newEnrollment],
        });
      },
      isEnrolled: (courseId) => get().enrolledCourses.some(item => String(item.id) === String(courseId)),
      getEnrollment: (courseId) => get().enrolledCourses.find(item => String(item.id) === String(courseId)),
      updateCourseProgress: (courseId, completedLessons, totalLessons) => {
        const { enrolledCourses } = get();

        set({
          enrolledCourses: enrolledCourses.map((course) => {
            if (String(course.id) !== String(courseId)) {
              return course;
            }

            const lessonCount = totalLessons ?? course.totalLessons;
            const normalizedCompletedLessons = Math.max(0, Math.min(completedLessons, lessonCount));

            return {
              ...course,
              totalLessons: lessonCount,
              completedLessons: normalizedCompletedLessons,
              progress: lessonCount > 0 ? normalizedCompletedLessons / lessonCount : 0,
            };
          }),
        });
      },
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
