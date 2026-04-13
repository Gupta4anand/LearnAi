import { Colors } from '@/constants/theme';
import { courseService } from '@/services/api';
import { useContentStore } from '@/store/contentStore';
import { useCourseStore } from '@/store/courseStore';
import { useNetworkStore } from '@/store/networkStore';
import { moderateScale } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { LegendList } from '@legendapp/list';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';

const CATEGORIES = ['All', 'Popular', 'New', 'Trending', 'Advanced', 'Beginner'];

export default function SeeAllCoursesScreen() {
  const router = useRouter();
  const { bookmarks, toggleBookmark } = useCourseStore();
  const { cachedCourses, cachedInstructors, lastCatalogSyncAt, setCatalogCache } = useContentStore();
  const { isConnected, isInternetReachable } = useNetworkStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOffline = isConnected === false || isInternetReachable === false;

  const { data: courses, isLoading: coursesLoading, isError: coursesError, error: coursesErrorInfo, refetch: refetchCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getRandomProducts(),
    enabled: !isOffline,
  });

  const { data: instructors, isError: instructorsError, error: instructorsErrorInfo, refetch: refetchInstructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => courseService.getRandomUsers(),
    enabled: !isOffline,
  });

  useEffect(() => {
    const nextCourses = (courses as any)?.data?.data;
    const nextInstructors = (instructors as any)?.data?.data;

    if ((Array.isArray(nextCourses) && nextCourses.length > 0) || (Array.isArray(nextInstructors) && nextInstructors.length > 0)) {
      setCatalogCache({
        courses: nextCourses,
        instructors: nextInstructors,
      });
    }
  }, [courses, instructors, setCatalogCache]);

  const liveCourseData = (courses as any)?.data?.data;
  const liveInstructorData = (instructors as any)?.data?.data;
  const courseData = Array.isArray(liveCourseData) && liveCourseData.length > 0 ? liveCourseData : cachedCourses;
  const instructorData =
    Array.isArray(liveInstructorData) && liveInstructorData.length > 0 ? liveInstructorData : cachedInstructors;
  const hasCachedCatalog = courseData.length > 0 || instructorData.length > 0;

  const hasFetchError = coursesError || instructorsError;
  const fetchErrorMessage =
    (coursesErrorInfo as any)?.message ||
    (instructorsErrorInfo as any)?.message ||
    'Unable to load content. Check your connection and try again.';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isOffline) {
        return;
      }
      await Promise.all([refetchCourses(), refetchInstructors()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredCourses = useMemo(() => {
    return courseData.filter((item: any) => {
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = activeCategory === 'All' || item.category === activeCategory.toLowerCase();
      return matchSearch && matchCategory;
    });
  }, [courseData, searchQuery, activeCategory]);

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const instructor = instructorData[index % instructorData.length];
    const courseImage = `https://picsum.photos/seed/learnai_${item.id}/400/300`;

    return (
      <TouchableOpacity 
        className="flex-row bg-learnAI-inputBg rounded-[20px] p-3 items-center mb-4"
        onPress={() => router.push({
          pathname: `/course/${item.id}`,
          params: { 
            title: item.title, 
            image: courseImage, 
            instructor: instructor?.name?.firstname || 'Expert'
          }
        })}
      >
        <Image 
          source={{ uri: item.image || courseImage }} 
          style={{ width: 70, height: 70, borderRadius: 14 }}
          className="bg-slate-700"
          contentFit="cover"
          transition={200}
        />
        <View className="flex-1 ml-3.5">
          <Text className="text-white text-[15px] font-bold mb-1" numberOfLines={1}>{item.title}</Text>
          <Text className="text-slate-400 text-[13px] mb-1.5">by {instructor?.name?.firstname || 'Expert'}</Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color="#94A3B8" />
            <Text className="text-slate-400 text-xs ml-1">4h 20m</Text>
            <View className="w-1 h-1 rounded-full bg-slate-400/30 mx-2" />
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text className="text-slate-400 text-xs ml-1">{item.rating || '4.8'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => toggleBookmark({
            id: item.id,
            title: item.title,
            instructor: instructor?.name?.firstname || 'Expert',
            image: courseImage
          })}
          className="p-2"
        >
          <Ionicons 
            name={bookmarks.some(b => String(b.id) === String(item.id)) ? "bookmark" : "bookmark-outline"} 
            size={22} 
            color={bookmarks.some(b => String(b.id) === String(item.id)) ? Colors.learnAI.accent : "#94A3B8"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-extrabold">All Courses</Text>
          <TouchableOpacity className="w-10 h-10 items-end justify-center">
            <Ionicons name="options-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Offline Alert */}
        {(isOffline || hasFetchError) && (
          <View className={`rounded-2xl p-4 mx-6 mb-4 ${hasCachedCatalog ? 'bg-amber-500/20' : 'bg-red-700'}`}>
            <Text className="text-white text-[15px] font-bold mb-1.5">
              {isOffline ? 'You are offline' : 'Unable to refresh catalog'}
            </Text>
            <Text className="text-red-100 text-[13px] leading-5 mb-3">
              {isOffline
                ? hasCachedCatalog
                  ? `Showing saved catalog${lastCatalogSyncAt ? ` from ${new Date(lastCatalogSyncAt).toLocaleString()}` : ''}.`
                  : 'No saved courses are available yet. Reconnect to load the catalog.'
                : fetchErrorMessage}
            </Text>
            {!isOffline && (
              <TouchableOpacity className="self-start bg-red-400 rounded-xl py-2.5 px-4" onPress={handleRefresh}>
                <Text className="text-white text-[14px] font-bold">Retry</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Search */}
        <View className="flex-row items-center bg-learnAI-inputBg rounded-2xl mx-6 px-4 h-14 mb-5">
          <Ionicons name="search-outline" size={20} color="#94A3B8" className="mr-2.5" />
          <TextInput
            placeholder="Search all courses..."
            placeholderTextColor="#94A3B8"
            className="flex-1 text-white text-base"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories */}
        <View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                className={`px-5 py-2.5 rounded-xl mr-2.5 border border-white/5 ${
                  activeCategory === item ? 'bg-learnAI-accent' : 'bg-learnAI-inputBg'
                }`}
              >
                <Text className={`text-sm font-semibold ${
                  activeCategory === item ? 'text-white' : 'text-slate-400'
                }`}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* List */}
        {coursesLoading && !hasCachedCatalog ? (
          <ActivityIndicator color={Colors.learnAI.accent} size="large" className="mt-12" />
        ) : hasFetchError && !hasCachedCatalog ? (
          <View className="items-center mt-14">
            <Ionicons name="wifi-off" size={60} color="#F87171" />
            <Text className="text-white text-lg font-bold mt-4">Unable to Load Courses</Text>
            <Text className="text-slate-500 text-sm mt-2 text-center max-w-[85%]">{fetchErrorMessage}</Text>
            <TouchableOpacity className="mt-5 bg-learnAI-accent rounded-2xl py-3 px-6" onPress={handleRefresh}>
              <Text className="text-white text-sm font-bold">Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <LegendList
            data={filteredCourses}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={100}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.learnAI.accent}
                colors={[Colors.learnAI.accent]}
              />
            }
            ListEmptyComponent={
              <View className="items-center mt-14">
                <Ionicons name="search-outline" size={60} color="#1E293B" />
                <Text className="text-white text-lg font-bold mt-4">No courses found</Text>
                <Text className="text-slate-500 text-sm mt-2 text-center max-w-[85%]">Try adjusting your search or filters</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </Animated.View>
  );
}
