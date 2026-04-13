import { Colors } from '@/constants/theme';
import { courseService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { fontScale, Layout, moderateScale } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    Animated,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookmarks, toggleBookmark, isBookmarked } = useCourseStore();
  const scrollX = useRef(new Animated.Value(0)).current;
  const displayName = user?.username 
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1) 
    : 'Scholar';

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getRandomProducts(),
  });

  const { data: instructors } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => courseService.getRandomUsers(),
  });

  const courseData = (courses as any)?.data?.data || [];
  const instructorData = (instructors as any)?.data?.data || [];

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonThumb} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonText} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Header Section */}
        <View style={styles.fixedHeader}>
          <View>
            <Text style={styles.greeting}>Hi, {displayName} 👋</Text>
            <Text style={styles.subtext}>Continue your learning journey</Text>
          </View>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatar}>
              {typeof user?.avatar === 'string' && user.avatar.length > 0 ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Ionicons name="person" size={24} color="#94A3B8" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Search Bar */}
          <View style={styles.searchBackground}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              placeholder="Search courses..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          {coursesLoading ? (
            <View style={styles.skeletonContainer}>
              <View style={styles.skeletonBanner} />
              <View style={[styles.skeletonTitle, { width: 150, marginVertical: 24 }]} />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <>
              {/* Featured Carousel */}
              <View style={styles.carouselContainer}>
                <ScrollView 
                  horizontal 
                  pagingEnabled={false}
                  snapToInterval={Layout.window.width - 36}
                  snapToAlignment="start"
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                  scrollEventThrottle={16}
                  contentContainerStyle={{ paddingRight: 24 }}
                >
                  {[
                    { title: "Advanced AI Mastery", tag: "RESUME LEARNING", icon: "play-outline", colors: ['#1E293B', '#334155'], isEnrolled: true, progress: 0.75 },
                    { title: "Deep Learning Bootcamp 2026", tag: "TRENDING", icon: "brain", colors: [Colors.learnAI.primary, Colors.learnAI.secondary] },
                    { title: "AI for Business Strategy", tag: "BEST SELLER", icon: "stats-chart", colors: ['#059669', '#10B981'] },
                    { title: "Neural Networks from Scratch", tag: "ADVANCED", icon: "hardware-chip", colors: ['#DC2626', '#EF4444'] }
                  ].map((banner, index) => (
                    <TouchableOpacity key={index} style={styles.featuredCard} activeOpacity={0.9}>
                      <LinearGradient
                        colors={banner.colors as any}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.featuredGradient}
                      >
                        <View style={styles.featuredContent}>
                          <Text style={styles.featuredTag}>{banner.tag}</Text>
                          <Text style={styles.featuredTitle}>{banner.title}</Text>
                          
                          {banner.isEnrolled ? (
                            <View style={styles.cardProgressContainer}>
                              <View style={styles.cardProgressBar}>
                                <View style={[styles.cardProgressFill, { width: `${banner.progress * 100}%` }]} />
                              </View>
                              <Text style={styles.cardProgressText}>{banner.progress * 100}% Complete</Text>
                            </View>
                          ) : (
                            <View style={styles.enrollBtn}>
                              <Text style={styles.enrollText}>Enroll Now</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.featuredIconBg}>
                          <Ionicons name={banner.icon as any} size={70} color="rgba(255,255,255,0.2)" />
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                {/* Pagination Dots */}
                <View style={styles.pagination}>
                  {[0, 1, 2, 3].map((_, i) => {
                    const width = scrollX.interpolate({
                      inputRange: [(i - 1) * (Layout.window.width - 36), i * (Layout.window.width - 36), (i + 1) * (Layout.window.width - 36)],
                      outputRange: [8, 16, 8],
                      extrapolate: 'clamp',
                    });
                    return <Animated.View key={i} style={[styles.dot, { width }]} />;
                  })}
                </View>
              </View>

              {/* Popular Courses Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Popular Courses</Text>
                <TouchableOpacity onPress={() => router.push('/courses')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.courseList}>
                {courseData.map((item: any, index: number) => {
                  const instructor = instructorData[index % instructorData.length];
                  const courseImage = `https://picsum.photos/seed/learnai_${item.id}/400/300`;
                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.courseCard}
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
                        source={{ uri: courseImage }} 
                        style={styles.courseThumb} 
                        contentFit="cover"
                        transition={200}
                      />
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseName} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.instructor}>by {instructor?.name?.firstname || 'Expert'}</Text>
                        <View style={styles.courseMeta}>
                          <Ionicons name="time-outline" size={14} color="#94A3B8" />
                          <Text style={styles.metaText}>4h 20m</Text>
                          <View style={styles.metaDivider} />
                          <Ionicons name="star" size={14} color="#FBBF24" />
                          <Text style={styles.metaText}>4.8</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => toggleBookmark({
                          id: item.id,
                          title: item.title,
                          instructor: instructor?.name?.firstname || 'Expert',
                          image: courseImage
                        })}
                        style={styles.bookmarkBtn}
                      >
                        <Ionicons 
                          name={bookmarks.some(b => String(b.id) === String(item.id)) ? "bookmark" : "bookmark-outline"} 
                          size={24} 
                          color={bookmarks.some(b => String(b.id) === String(item.id)) ? Colors.learnAI.accent : "#94A3B8"} 
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <View style={{ height: moderateScale(100) }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.learnAI.background,
  },
  safeArea: {
    flex: 1,
  },
  fixedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(20),
    backgroundColor: Colors.learnAI.background,
    zIndex: 10,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: fontScale(24),
    fontWeight: '800',
  },
  subtext: {
    color: '#94A3B8',
    fontSize: fontScale(15),
    marginTop: 4,
  },
  avatarContainer: {
    borderWidth: 2,
    borderColor: 'rgba(74, 110, 219, 0.3)',
    borderRadius: moderateScale(25),
    padding: 2,
  },
  avatar: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: moderateScale(44),
    height: moderateScale(44),
  },
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(8),
  },
  searchBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    height: moderateScale(54),
    marginBottom: moderateScale(24),
  },
  searchIcon: {
    marginRight: moderateScale(10),
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontScale(16),
  },
  carouselContainer: {
    marginBottom: moderateScale(24),
  },
  featuredCard: {
    width: Layout.window.width - 48, // Padding adjustment
    borderRadius: moderateScale(24),
    overflow: 'hidden',
    marginRight: 12, // Gap between cards
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.learnAI.accent,
    marginHorizontal: 4,
    opacity: 0.8,
  },
  featuredGradient: {
    padding: moderateScale(24),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredContent: {
    flex: 1,
  },
  featuredTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontScale(10),
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '800',
    marginBottom: 16,
    lineHeight: 28,
  },
  enrollBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  enrollText: {
    color: Colors.learnAI.primary,
    fontWeight: '700',
    fontSize: fontScale(13),
  },
  cardProgressContainer: {
    marginTop: 8,
  },
  cardProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    width: '100%',
    marginBottom: 6,
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  cardProgressText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontScale(11),
    fontWeight: '600',
  },
  featuredIconBg: {
    marginLeft: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(20),
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '800',
  },
  seeAll: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  courseList: {
    width: '100%',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  courseThumb: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(14),
    backgroundColor: '#334155',
  },
  courseInfo: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  courseName: {
    color: '#FFFFFF',
    fontSize: fontScale(15),
    fontWeight: '700',
    marginBottom: 4,
  },
  instructor: {
    color: '#94A3B8',
    fontSize: fontScale(13),
    marginBottom: 6,
  },
  courseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#94A3B8',
    fontSize: fontScale(12),
    marginLeft: 4,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
    opacity: 0.3,
  },
  bookmarkBtn: {
    padding: 8,
  },
  // Skeleton Styles
  skeletonContainer: {
    width: '100%',
  },
  skeletonBanner: {
    width: '100%',
    height: moderateScale(160),
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(24),
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  skeletonThumb: {
    width: moderateScale(70),
    height: moderateScale(70),
    borderRadius: moderateScale(14),
    backgroundColor: '#334155',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: moderateScale(14),
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonText: {
    height: 10,
    width: '40%',
    backgroundColor: '#334155',
    borderRadius: 4,
  },
});
