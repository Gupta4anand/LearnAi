import { Colors } from '@/constants/theme';
import { useCourseStore } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview/lib/WebViewTypes';

type WebViewActionMessage =
  | { type: 'COMPLETED'; courseId: string }
  | { type: 'LIKED'; courseId: string }
  | { type: 'ROUTE_NAVIGATE'; route: string }
  | { type: 'DOWNLOAD_CERTIFICATE'; courseId: string };

interface CoursePayload {
  id: string;
  title: string;
  description: string;
  instructor: string;
}

const TOTAL_LESSONS = 5;
const DEFAULT_DESCRIPTION =
  'Explore practical AI concepts, guided examples, and interactive checkpoints designed to feel like a premium mobile learning experience.';

export default function CourseViewerScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const { token } = useAuthStore();
  const { updateCourseProgress, getEnrollment, toggleBookmark, isBookmarked, enrollCourse } = useCourseStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const params = useLocalSearchParams<{
    courseId?: string;
    courseTitle?: string;
    courseDescription?: string;
    instructor?: string;
  }>();

  const courseData = useMemo<CoursePayload>(
    () => ({
      id: params.courseId ?? 'interactive-course',
      title: params.courseTitle ?? 'Interactive AI Learning',
      description: params.courseDescription ?? DEFAULT_DESCRIPTION,
      instructor: params.instructor ?? 'LearnAI Faculty',
    }),
    [params.courseDescription, params.courseId, params.courseTitle, params.instructor]
  );

  const courseTitle = courseData.title.length > 28 ? `${courseData.title.slice(0, 28)}...` : courseData.title;
  const enrollment = getEnrollment(courseData.id);

  // Authenticated Session Metadata
  const injectedMetadata = useMemo(
    () => ({
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-learnai-course-id': courseData.id,
        'x-learnai-platform': 'mobile-native',
      },
      userSession: {
        isAuthenticated: !!token,
        lastSync: new Date().toISOString(),
      },
      course: courseData,
    }),
    [courseData, token]
  );

  const webContent = useMemo(
    () => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
          <style>
            :root {
              color-scheme: dark;
              --bg: #0F172A;
              --panel: #111C33;
              --panel-border: rgba(148, 163, 184, 0.18);
              --muted: #94A3B8;
              --text: #F8FAFC;
              --accent: #6C8DF5;
              --accent-strong: #4A6EDB;
              --success: #10B981;
              --like: #F59E0B;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              background:
                radial-gradient(circle at top right, rgba(108, 141, 245, 0.25), transparent 28%),
                linear-gradient(180deg, #0F172A 0%, #111827 100%);
              color: var(--text);
              padding: 24px 18px 40px;
            }
            .shell {
              max-width: 720px;
              margin: 0 auto;
            }
            .eyebrow {
              color: var(--muted);
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.16em;
              margin-bottom: 12px;
            }
            .card {
              background: rgba(17, 28, 51, 0.9);
              border: 1px solid var(--panel-border);
              border-radius: 28px;
              padding: 24px;
              box-shadow: 0 24px 60px rgba(2, 6, 23, 0.45);
              backdrop-filter: blur(14px);
            }
            h1 {
              margin: 0 0 12px;
              font-size: 30px;
              line-height: 1.15;
            }
            .description {
              margin: 0 0 18px;
              color: #CBD5E1;
              font-size: 15px;
              line-height: 1.7;
            }
            .meta {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              margin-bottom: 24px;
            }
            .pill {
              background: rgba(148, 163, 184, 0.12);
              color: var(--muted);
              padding: 10px 14px;
              border-radius: 999px;
              font-size: 13px;
            }
            .module {
              margin-top: 20px;
              padding: 18px;
              border-radius: 20px;
              background: linear-gradient(135deg, rgba(74, 110, 219, 0.18), rgba(15, 23, 42, 0.65));
              border: 1px solid rgba(108, 141, 245, 0.24);
            }
            .module-title {
              margin: 0 0 8px;
              font-size: 18px;
              font-weight: 700;
            }
            .actions {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
              margin-top: 24px;
            }
            button {
              border: 0;
              border-radius: 18px;
              min-height: 52px;
              font-size: 15px;
              font-weight: 700;
              color: white;
              cursor: pointer;
              transition: transform 0.15s ease, opacity 0.15s ease;
            }
            button:active {
              transform: scale(0.98);
            }
            .complete-btn {
              background: linear-gradient(135deg, var(--success), #059669);
            }
            .like-btn {
              background: linear-gradient(135deg, var(--like), #D97706);
            }
            .feedback {
              min-height: 22px;
              margin-top: 18px;
              color: var(--muted);
              font-size: 14px;
            }
            @media (max-width: 520px) {
              .actions {
                grid-template-columns: 1fr;
              }
              h1 {
                font-size: 26px;
              }
            }
          </style>
        </head>
        <body>
          <div class="shell">
            <div class="eyebrow">Interactive Course Viewer</div>
            <div class="card">
              <h1 id="course-title">Loading course...</h1>
              <p id="course-description" class="description">Preparing interactive content.</p>
              <div class="meta">
                <div class="pill" id="course-instructor">Instructor: LearnAI</div>
                <div class="pill">Mode: Interactive lesson</div>
              </div>
              <div class="module">
                <p class="module-title">Hands-on checkpoint</p>
                <p class="description" style="margin-bottom: 0;">
                  Review the lesson, then send actions back to the native layer to simulate a production-ready mobile learning flow.
                </p>
              </div>
              <div class="actions">
                <button class="complete-btn" onclick="markCompleted()">Mark as Completed</button>
                <button class="like-btn" onclick="likeCourse()">Like Course</button>
              </div>
              <div class="module" id="post-completion" style="display: none; margin-top: 24px; border-color: var(--success);">
                <p class="module-title" style="color: var(--success);">Scholar Milestone reached!</p>
                <button class="pill" style="width: 100%; margin-top: 10px; border: 1px solid var(--success); background: transparent; color: var(--success);" onclick="downloadCert()">
                   Download Course Certificate (.pdf)
                </button>
              </div>
              <div id="feedback" class="feedback">Native and WebView are connected.</div>
              
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--panel-border); display: flex; justify-content: space-between;">
                <a href="#" onclick="navigateNative('/(tabs)/profile')" style="color: var(--muted); font-size: 13px; text-decoration: none;">View Profile</a>
                <a href="#" onclick="navigateNative('/modal')" style="color: var(--muted); font-size: 13px; text-decoration: none;">Help Support</a>
              </div>
            </div>
          </div>
          <script>
            var course = window.__INITIAL_COURSE__ || {};
            var nativeHeaders = window.__NATIVE_HEADERS__ || {};
            
            console.log('WebView Initialized with Headers:', JSON.stringify(nativeHeaders));

            function renderCourse(nextCourse) {
              course = nextCourse || course || {};
              document.getElementById('course-title').innerText = course.title || 'Interactive course';
              document.getElementById('course-description').innerText = course.description || 'Course description unavailable.';
              document.getElementById('course-instructor').innerText = 'Instructor: ' + (course.instructor || 'LearnAI');
            }

            function showFeedback(message) {
              document.getElementById('feedback').innerText = message;
            }

            function sendMessage(payload) {
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(payload));
              }
            }

            function markCompleted() {
              document.getElementById('post-completion').style.display = 'block';
              showFeedback('Completion sent to native app.');
              sendMessage({ type: 'COMPLETED', courseId: course.id || 'interactive-course' });
            }

            function likeCourse() {
              showFeedback('Like sent to native app.');
              sendMessage({ type: 'LIKED', courseId: course.id || 'interactive-course' });
            }
            
            function downloadCert() {
              showFeedback('Requesting certificate download...');
              sendMessage({ type: 'DOWNLOAD_CERTIFICATE', courseId: course.id });
            }
            
            function navigateNative(route) {
              sendMessage({ type: 'ROUTE_NAVIGATE', route: route });
            }

            window.addEventListener('message', function(event) {
              try {
                var message = JSON.parse(event.data);
                if (message.type === 'SET_COURSE') {
                  renderCourse(message.payload);
                  showFeedback('Course content synced from native app.');
                }
              } catch (error) {}
            });

            if (nativeHeaders['x-learnai-course-title'] && !course.title) {
              course.title = nativeHeaders['x-learnai-course-title'];
            }
            if (nativeHeaders['x-learnai-instructor'] && !course.instructor) {
              course.instructor = nativeHeaders['x-learnai-instructor'];
            }

            renderCourse(course);
          </script>
        </body>
      </html>
    `,
    []
  );

  const injectedJavaScript = useMemo(
    () => `
      window.__NATIVE_HEADERS__ = ${JSON.stringify(injectedMetadata.headers)};
      window.__INITIAL_COURSE__ = ${JSON.stringify(injectedMetadata.course)};
      true;
    `,
    [injectedMetadata]
  );

  const sendCourseDataToWebView = useCallback(() => {
    webViewRef.current?.postMessage(
      JSON.stringify({
        type: 'SET_COURSE',
        payload: courseData,
      })
    );
  }, [courseData]);

  const handleRetry = useCallback(() => {
    setHasLoadError(false);
    setIsLoading(true);
    setReloadKey((current) => current + 1);
  }, []);

  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasLoadError(false);
  }, []);

  const handleLoadEnd = useCallback(
    () => {
      setIsLoading(false);
      sendCourseDataToWebView();
    },
    [sendCourseDataToWebView]
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as WebViewActionMessage;

        if (message.type === 'COMPLETED') {
          enrollCourse(
            {
              id: courseData.id,
              title: courseData.title,
              instructor: courseData.instructor,
              image: 'https://picsum.photos/seed/learnai_viewer/400/300',
            },
            TOTAL_LESSONS
          );
          updateCourseProgress(courseData.id, TOTAL_LESSONS, TOTAL_LESSONS);
          Alert.alert('Course completed', 'This course is now marked as completed in your profile.');
          return;
        }

        if (message.type === 'LIKED') {
          const bookmarked = isBookmarked(message.courseId);
          if (!bookmarked) {
            enrollCourse(
              {
                id: courseData.id,
                title: courseData.title,
                instructor: courseData.instructor,
                image: 'https://picsum.photos/seed/learnai_viewer/400/300',
              },
              TOTAL_LESSONS
            );
            toggleBookmark({
              id: courseData.id,
              title: courseData.title,
              instructor: courseData.instructor,
              image: 'https://picsum.photos/seed/learnai_viewer/400/300',
            });
          }
          Alert.alert('Course liked', bookmarked ? 'This course is already in your bookmarks.' : 'The course was added to your bookmarks.');
          return;
        }

        if (message.type === 'DOWNLOAD_CERTIFICATE') {
          Alert.alert(
            'Download Started',
            'Your certificate for ' + courseData.title + ' is being generated and will be saved to your device.',
            [{ text: 'OK' }]
          );
          return;
        }

        if (message.type === 'ROUTE_NAVIGATE') {
          router.push(message.route as any);
        }
      } catch (error) {
        Alert.alert('Viewer message error', 'The interactive content sent an invalid response.');
      }
    },
    [courseData.id, courseData.instructor, courseData.title, enrollCourse, isBookmarked, toggleBookmark, updateCourseProgress]
  );

  const handleError = useCallback(() => {
    setHasLoadError(true);
    setIsLoading(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-learnAI-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <View className="flex-row items-center justify-between px-5 py-3 bg-learnAI-background border-b border-white/5">
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-slate-800 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="flex-1 mx-4 text-center text-white text-base font-bold" numberOfLines={1}>
          {courseTitle}
        </Text>
        <View className="w-11 h-11" />
      </View>

      {hasLoadError ? (
        <View className="flex-1 items-center justify-center px-8 bg-learnAI-background">
          <Ionicons name="alert-circle-outline" size={56} color={Colors.learnAI.error} />
          <Text className="text-white text-xl font-bold mt-5">Interactive content failed to load</Text>
          <Text className="text-slate-400 text-center mt-3 leading-6">
            The WebView could not render this lesson. Retry to reload the local content.
          </Text>
          <TouchableOpacity
            className="mt-6 rounded-2xl bg-learnAI-accent px-6 py-4"
            onPress={handleRetry}
          >
            <Text className="text-white font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-1 bg-learnAI-background">
          <WebView
            key={reloadKey}
            ref={webViewRef}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            source={{ html: webContent }}
            injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onMessage={handleMessage}
            onError={handleError}
            onHttpError={handleError}
            onContentProcessDidTerminate={handleError}
            startInLoadingState
            className="flex-1"
            style={{ backgroundColor: Colors.learnAI.background }}
          />

          {isLoading && (
            <View className="absolute inset-0 items-center justify-center bg-learnAI-background">
              <ActivityIndicator size="large" color={Colors.learnAI.accent} />
              <Text className="text-slate-400 mt-4">Loading interactive lesson...</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
