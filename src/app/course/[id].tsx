import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useCourseStore } from '@/store/courseStore';
import GradientButton from '@/components/GradientButton';
import { Layout } from '@/utils/responsive';

const TOTAL_LESSONS = 5;

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { toggleBookmark, isBookmarked, enrollCourse, isEnrolled, getEnrollment, updateCourseProgress } = useCourseStore();
  
  const [activeTab, setActiveTab] = useState('About');

  // Fallback data if params are missing
  const courseId = params.id as string;
  const title = params.title as string || 'AI Advanced Mastery';
  const image = params.image as string || 'https://picsum.photos/seed/ai/800/400';
  const instructor = params.instructor as string || 'Dr. Sarah Chen';
  const enrollment = getEnrollment(courseId);
  const enrolled = isEnrolled(courseId);

  const handleBookmark = () => {
    toggleBookmark({
      id: courseId,
      title,
      image,
      instructor
    });
  };

  const handleEnroll = () => {
    enrollCourse(
      {
        id: courseId,
        title,
        image,
        instructor,
      },
      TOTAL_LESSONS
    );
  };

  const handleOpenLesson = (lessonIndex: number) => {
    if (!enrolled) {
      handleEnroll();
    }

    const nextCompletedLessons = Math.max(enrollment?.completedLessons ?? 0, lessonIndex + 1);
    updateCourseProgress(courseId, nextCompletedLessons, TOTAL_LESSONS);

    router.push({
      pathname: '/course/viewer',
      params: {
        courseId,
        courseTitle: title,
        courseDescription:
          'Dive into practical AI workflows, guided explanations, and an interactive checkpoint built for a polished mobile learning experience.',
        instructor,
      }
    });
  };

  const lessons = [
    { title: 'Introduction to Neural Networks', duration: '15:00', completed: true },
    { title: 'Deep Learning Architectures', duration: '24:30', completed: true },
    { title: 'Natural Language Processing basics', duration: '18:15', completed: false },
    { title: 'Computer Vision in Practice', duration: '32:00', completed: false },
    { title: 'Deploying AI Models at Scale', duration: '21:45', completed: false },
  ];

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* Fixed Sticky Header */}
      <SafeAreaView className="absolute top-0 left-0 right-0 flex-row justify-between px-5 z-20" edges={['top']}>
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-slate-900/60 justify-center items-center border border-white/10" 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-slate-900/60 justify-center items-center border border-white/10" 
          onPress={handleBookmark}
        >
          <Ionicons 
            name={isBookmarked(courseId) ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isBookmarked(courseId) ? Colors.learnAI.accent : "#FFFFFF"} 
          />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Banner Section */}
        <View style={{ width: Layout.window.width, height: 320 }} className="relative bg-slate-900">
          <Image 
            source={{ uri: image }} 
            className="w-full h-full" 
            contentFit="cover"
            transition={300}
            style={{ width: '100%', height: '100%' }}
          />
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.4)', 'transparent', 'rgba(15, 23, 42, 1)']}
            className="absolute inset-0"
          />
          
          <View className="absolute bottom-6 left-6 right-6">
            <View className="bg-learnAI-accent px-2.5 py-1 rounded-lg self-start mb-3">
              <Text className="text-white text-[10px] font-bold uppercase">Advanced AI</Text>
            </View>
            <Text className="text-white text-[26px] font-extrabold leading-8">{title}</Text>
          </View>
        </View>

        {/* Course Info Section */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center mb-6">
            <View className="w-11 h-11 rounded-full bg-slate-800 justify-center items-center mr-3 border border-slate-700">
              <Ionicons name="person" size={20} color="#94A3B8" />
            </View>
            <View>
              <Text className="text-white text-[15px] font-bold">{instructor}</Text>
              <Text className="text-slate-400 text-sm">Senior AI Scientist</Text>
            </View>
            <View className="flex-row items-center bg-amber-400/10 px-2.5 py-1.5 rounded-xl ml-auto">
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text className="text-amber-400 text-xs font-bold ml-1">4.9 (2.1k reviews)</Text>
            </View>
          </View>

          {enrolled && (
            <View className="bg-learnAI-inputBg rounded-2xl p-4 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-white text-sm font-semibold">Your Progress</Text>
                <Text className="text-learnAI-accent text-sm font-bold">
                  {Math.round((enrollment?.progress ?? 0) * 100)}%
                </Text>
              </View>
              <View className="h-1.5 bg-white/10 rounded-full w-full">
                <View
                  className="h-full bg-learnAI-accent rounded-full"
                  style={{ width: `${Math.round((enrollment?.progress ?? 0) * 100)}%` }}
                />
              </View>
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row border-b border-slate-800 mb-5">
            {['About', 'Lessons', 'Reviews'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                className={`py-3 mr-6 border-b-2 ${activeTab === tab ? 'border-learnAI-accent' : 'border-transparent'}`}
              >
                <Text className={`text-base font-semibold ${activeTab === tab ? 'text-learnAI-accent' : 'text-slate-400'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'About' && (
            <View className="pb-5">
              <Text className="text-slate-400 text-[15px] leading-6 mb-6">
                This course provides a comprehensive introduction to the world of Artificial Intelligence. 
                You will explore the latest trends, technologies, and practical applications of AI in various industries. 
                Perfect for engineers, data scientists, and anyone curious about the future of tech.
              </Text>
              <Text className="text-white text-lg font-bold mb-4">What you'll learn</Text>
              {[
                'Fundamentals of Neural Networks',
                'Hands-on Deep Learning with PyTorch',
                'Advanced NLP techniques',
                'Computer Vision Architectures'
              ].map((item, idx) => (
                <View key={idx} className="flex-row items-center mb-3">
                  <Ionicons name="checkmark-circle" size={18} color={Colors.learnAI.accent} />
                  <Text className="text-white text-sm ml-3">{item}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Lessons' && (
            <View className="pb-5">
              {lessons.map((lesson, idx) => {
                const lessonCompleted = (enrollment?.completedLessons ?? 0) > idx;

                return (
                  <TouchableOpacity 
                    key={idx} 
                    className="flex-row items-center bg-learnAI-inputBg p-3.5 rounded-2xl mb-3"
                    onPress={() => handleOpenLesson(idx)}
                  >
                    <View className={`w-[30px] h-[30px] rounded-full justify-center items-center mr-3.5 ${lessonCompleted ? 'bg-learnAI-accent' : 'bg-slate-700'}`}>
                      {lessonCompleted ? (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      ) : (
                        <Text className="text-white text-xs font-bold">{idx + 1}</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-sm font-semibold">{lesson.title}</Text>
                      <Text className="text-slate-500 text-xs mt-0.5">{lesson.duration}</Text>
                    </View>
                    <Ionicons name="play-circle" size={24} color={Colors.learnAI.accent} />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
        
        <View className="h-32" />
      </ScrollView>

      {/* Floating Bottom Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-learnAI-background border-t border-slate-800 px-6 pt-4 pb-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-slate-400 text-xs">Price</Text>
            <Text className="text-white text-[22px] font-extrabold">$49.99</Text>
          </View>
          <View className="flex-[2] ml-5">
            <GradientButton 
              title={enrolled ? "Continue Learning" : "Enroll Now"} 
              onPress={() => {
                if (!enrolled) {
                  handleEnroll();
                }

                const nextCompletedLessons = Math.max(enrollment?.completedLessons ?? 0, 1);
                updateCourseProgress(courseId, nextCompletedLessons, TOTAL_LESSONS);
                router.push({
                  pathname: '/course/viewer',
                  params: {
                    courseId,
                    courseTitle: title,
                    courseDescription:
                      'Dive into practical AI workflows, guided explanations, and an interactive checkpoint built for a polished mobile learning experience.',
                    instructor,
                  }
                });
              }}
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
