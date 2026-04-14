import { Colors } from '@/constants/theme';
import { courseService } from '@/services/api';
import { useContentStore } from '@/store/contentStore';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { useNetworkStore } from '@/store/networkStore';
import { Layout, moderateScale } from '@/utils/responsive';
import { capitalizeName } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated as RNAnimated,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookmarks, toggleBookmark, isBookmarked } = useCourseStore();
  const { cachedCourses, cachedInstructors, lastCatalogSyncAt, setCatalogCache } = useContentStore();
  const { isConnected, isInternetReachable } = useNetworkStore();
  const scrollX = useRef(new RNAnimated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isOffline = isConnected === false || isInternetReachable === false;
  const displayName = capitalizeName(user?.fullName || user?.username || 'Scholar');

  const { 
    data: courses, 
    isLoading: coursesLoading, 
    isError: coursesError, 
    error: coursesErrorInfo,
    refetch: refetchCourses 
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getRandomProducts(),
    enabled: !isOffline,
  });

  const { 
    data: instructors, 
    isError: instructorsError, 
    error: instructorsErrorInfo,
    refetch: refetchInstructors 
  } = useQuery({
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

  const hasFetchError = coursesError || instructorsError;
  const fetchErrorMessage =
    (coursesErrorInfo as any)?.message ||
    (instructorsErrorInfo as any)?.message ||
    'Unable to load content. Check your connection.';

  const liveCourseData = (courses as any)?.data?.data;
  const liveInstructorData = (instructors as any)?.data?.data;
  const courseData = Array.isArray(liveCourseData) && liveCourseData.length > 0 ? liveCourseData : cachedCourses;
  const instructorData =
    Array.isArray(liveInstructorData) && liveInstructorData.length > 0 ? liveInstructorData : cachedInstructors;
  const hasCachedCatalog = courseData.length > 0 || instructorData.length > 0;
  const filteredCourses = searchQuery.trim().length
    ? courseData.filter((item: any) =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : courseData;

  const SkeletonCard = () => (
    <View className="flex-row bg-learnAI-inputBg rounded-[20px] p-3 items-center mb-4">
      <View className="w-[70px] h-[70px] rounded-[14px] bg-slate-700" />
      <View className="flex-1 ml-3.5">
        <View className="h-3.5 w-[70%] bg-slate-700 rounded mb-2" />
        <View className="h-2.5 w-[40%] bg-slate-700 rounded" />
      </View>
    </View>
  );

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        {/* Fixed Header Section */}
        <View className="flex-row justify-between items-center px-6 py-5 bg-learnAI-background z-10">
          <View>
            <Text className="text-white text-2xl font-extrabold">Hi, {displayName} 👋</Text>
            <Text className="text-slate-400 text-[15px] mt-1">Continue your learning journey</Text>
          </View>
          <TouchableOpacity className="border-2 border-slate-700 rounded-full p-0.5" onPress={() => router.push('/(tabs)/profile')}>
            <View className="w-11 h-11 rounded-full bg-slate-800 justify-center items-center overflow-hidden">
              {typeof user?.avatar === 'string' && user.avatar.length > 0 ? (
                <Image source={{ uri: user.avatar }} style={{ width: 44, height: 44 }} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={24} color="#94A3B8" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="pt-2"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.learnAI.accent}
              colors={[Colors.learnAI.accent]}
            />
          }
        >
          {/* Offline/Error Banner */}
          {(isOffline || hasFetchError) && (
            <View className={`mx-6 rounded-2xl p-4 mb-6 ${hasCachedCatalog ? 'bg-amber-500/20' : 'bg-red-500'}`}>
              <View className="flex-row items-center mb-1">
                <Ionicons name="cloud-offline-outline" size={20} color="#FFFFFF" />
                <Text className="text-white text-[15px] font-bold ml-2">
                  {isOffline ? 'Offline Mode' : 'Connection Issue'}
                </Text>
              </View>
              <Text className="text-white/90 text-[13px] leading-4.5">
                {isOffline
                  ? hasCachedCatalog
                    ? `Showing your last saved catalog${lastCatalogSyncAt ? ` from ${new Date(lastCatalogSyncAt).toLocaleString()}` : ''}.`
                    : 'No saved catalog is available yet. Reconnect to load courses.'
                  : fetchErrorMessage}
              </Text>
            </View>
          )}

          {/* Search Bar */}
          <View className="mx-6 flex-row items-center bg-learnAI-inputBg rounded-2xl px-4 h-14 mb-6">
            <Ionicons name="search-outline" size={20} color="#94A3B8" className="mr-2.5" />
            <TextInput
              placeholder="Search courses..."
              placeholderTextColor="#94A3B8"
              className="flex-1 text-white text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          {coursesLoading && !hasCachedCatalog ? (
            <View className="px-6 w-full">
              <View className="w-full h-40 bg-learnAI-inputBg rounded-3xl" />
              <View className="h-3.5 w-[150px] bg-slate-700 rounded my-6" />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <>
              {/* Featured Carousel */}
              <View className="mb-8 overflow-visible">
                <ScrollView 
                  horizontal 
                  pagingEnabled={false}
                  snapToInterval={Layout.window.width - 32} // Card width (width-48) + margin (16)
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 10 }}
                >
                  {[
                    { id: 'featured-1', title: "Advanced AI Mastery", tag: "RESUME LEARNING", icon: "play-outline", colors: ['rgba(30, 41, 59, 0.8)', 'rgba(15, 23, 42, 0.9)'], image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=600', isEnrolled: true, progress: 0.75 },
                    { id: 'featured-2', title: "Deep Learning Bootcamp", tag: "TRENDING", icon: "pulse", colors: ['rgba(74, 110, 219, 0.8)', 'rgba(59, 130, 246, 0.9)'], image: 'https://images.unsplash.com/photo-1620712943543-bcc4628c6731?auto=format&fit=crop&q=80&w=600' },
                    { id: 'featured-3', title: "AI Business Strategy", tag: "BEST SELLER", icon: "stats-chart", colors: ['rgba(5, 150, 105, 0.8)', 'rgba(16, 185, 129, 0.9)'], image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600' },
                    { id: 'featured-4', title: "Neural Networks", tag: "ADVANCED", icon: "hardware-chip", colors: ['rgba(220, 38, 38, 0.8)', 'rgba(239, 68, 68, 0.9)'], image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600' }
                  ].map((banner, index) => (
                    <TouchableOpacity 
                      key={index} 
                      className="mr-4 overflow-hidden rounded-3xl relative bg-slate-800" 
                      style={{ width: Layout.window.width - 48, height: 160 }} 
                      activeOpacity={0.9}
                      onPress={() => {
                        if (banner.isEnrolled) {
                          router.push({
                            pathname: '/course/viewer',
                            params: { 
                              courseId: banner.id, 
                              courseTitle: banner.title,
                              courseDescription: "Continue where you left off in this advanced mastery course."
                            }
                          });
                        } else {
                          router.push('/courses');
                        }
                      }}
                    >
                      <Image 
                        source={{ uri: banner.image }} 
                        className="absolute inset-0"
                        contentFit="cover"
                        transition={200}
                      />
                      <LinearGradient
                        colors={banner.colors as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute inset-0 p-6 flex-row justify-between items-center"
                      >
                        <View className="flex-1 items-start justify-center">
                          <Text className="text-white/80 text-[10px] font-bold tracking-widest mb-1">{banner.tag}</Text>
                          <Text className="text-white text-[22px] font-extrabold mb-3 leading-7" numberOfLines={2}>
                            {banner.title}
                          </Text>
                          
                          {banner.isEnrolled ? (
                            <View className="w-full">
                              <View className="h-1 bg-white/20 rounded-full w-[80%] mb-1.5 overflow-hidden">
                                <View className="h-full bg-white rounded-full" style={{ width: `${banner.progress * 100}%` }} />
                              </View>
                              <Text className="text-white/80 text-[11px] font-semibold">{banner.progress * 100}% Complete</Text>
                            </View>
                          ) : (
                            <View className="bg-white px-4 py-2 rounded-xl">
                              <Text className="text-slate-900 font-bold text-[13px]">Enroll Now</Text>
                            </View>
                          )}
                        </View>
                        <View className="ml-2 opacity-30">
                          <Ionicons name={banner.icon as any} size={64} color="#FFFFFF" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Pagination Dots */}
                <View className="flex-row justify-center items-center mt-3">
                  {[0, 1, 2, 3].map((_, i) => {
                    const widthLimit = scrollX.interpolate({
                      inputRange: [(i - 1) * (Layout.window.width - 32), i * (Layout.window.width - 32), (i + 1) * (Layout.window.width - 32)],
                      outputRange: [8, 16, 8],
                      extrapolate: 'clamp',
                    });
                    return <RNAnimated.View key={i} className="h-1.5 rounded-full bg-learnAI-accent mx-1 opacity-80" style={{ width: widthLimit }} />;
                  })}
                </View>
              </View>

              {/* Popular Courses Section */}
              <View className="px-6 flex-row justify-between items-center mb-5">
                <Text className="text-white text-lg font-extrabold">Popular Courses</Text>
                <TouchableOpacity onPress={() => router.push('/courses')}>
                  <Text className="text-learnAI-accent text-sm font-semibold">See All</Text>
                </TouchableOpacity>
              </View>

              <View className="px-6 w-full">
                {filteredCourses.length === 0 ? (
                  <Text className="text-slate-400 text-sm text-center mt-6">No courses found for "{searchQuery}".</Text>
                ) : (
                  filteredCourses.map((item: any, index: number) => {
                    const instructor = instructorData[index % instructorData.length];
                    const courseImage = `https://picsum.photos/seed/learnai_${item.id}/400/300`;
                    return (
                      <TouchableOpacity 
                        key={item.id} 
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
                            <Text className="text-slate-400 text-xs ml-1">4.8</Text>
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
                            name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                            size={24} 
                            color={isBookmarked(item.id) ? Colors.learnAI.accent : "#94A3B8"} 
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  }))}
              </View>
            </>
          )}

          <View className="h-24" />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
