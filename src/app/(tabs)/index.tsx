import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '@/constants/theme';
import { courseService } from '@/services/api';
import { useCourseStore } from '@/store/courseStore';
import { useAuthStore } from '@/store/authStore';
import { moderateScale, fontScale, verticalScale, Layout } from '@/utils/responsive';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { bookmarks, toggleBookmark, isBookmarked } = useCourseStore();
  
  // Format the name for display (e.g., capitalize first letter)
  const displayName = user?.username 
    ? user.username.charAt(0).toUpperCase() + user.username.slice(1) 
    : 'Scholar';
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getRandomProducts(),
  });

  const { data: instructors, isLoading: usersLoading } = useQuery({
    queryKey: ['instructors'],
    queryFn: () => courseService.getRandomUsers(),
  });

  const isLoading = coursesLoading || usersLoading;
  const courseData = (courses as any)?.data?.data || [];
  const instructorData = (instructors as any)?.data?.data || [];

  console.log('Courses Data (FreeAPI):', JSON.stringify(courseData, null, 2));

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
          <TouchableOpacity style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#94A3B8" />
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

          {isLoading ? (
            <ActivityIndicator color={Colors.learnAI.accent} size="large" style={{ marginTop: 50 }} />
          ) : (
            <>
              {/* Featured Course Card (Hero) */}
              <View style={styles.featuredContainer}>
                <LinearGradient
                  colors={Colors.learnAI.primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.featuredCard}
                >
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>Trending</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{courseData[0]?.title || 'AI Mastery'}</Text>
                  <Text style={styles.featuredSubtitle}>Master the art of building scalable AI models</Text>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: '65%' }]} />
                    </View>
                    <Text style={styles.progressText}>65% Complete</Text>
                  </View>

                  <TouchableOpacity style={styles.continueBtn}>
                    <Text style={styles.continueBtnText}>Continue</Text>
                  </TouchableOpacity>
                </LinearGradient>
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
                            instructor: instructor?.name?.firstname 
                          }
                        })}
                      >
                        <Image 
                          source={courseImage} 
                          style={styles.courseThumb} 
                          contentFit="cover"
                          transition={200}
                          placeholder="https://via.placeholder.com/70"
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
                          name={isBookmarked(item.id) ? "bookmark" : "bookmark-outline"} 
                          size={20} 
                          color={isBookmarked(item.id) ? Colors.learnAI.accent : "#94A3B8"} 
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Extra Spacing for Floating Tab Bar */}
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
  scrollContent: {
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(8),
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
    fontSize: fontScale(14),
    marginTop: 4,
  },
  avatarContainer: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: '#1E293B',
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatar: {
    flex: 1,
    borderRadius: moderateScale(22),
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
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
  featuredContainer: {
    marginBottom: moderateScale(32),
  },
  featuredCard: {
    borderRadius: moderateScale(24),
    padding: moderateScale(24),
    overflow: 'hidden',
  },
  featuredBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
    alignSelf: 'flex-start',
    marginBottom: moderateScale(12),
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '800',
    marginBottom: moderateScale(8),
  },
  featuredSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: fontScale(14),
    marginBottom: moderateScale(20),
  },
  progressContainer: {
    marginBottom: moderateScale(24),
  },
  progressBar: {
    height: moderateScale(6),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: moderateScale(3),
    marginBottom: moderateScale(8),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(3),
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  continueBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(12),
    alignItems: 'center',
  },
  continueBtnText: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(16),
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '700',
  },
  seeAll: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  courseList: {
    gap: moderateScale(16),
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    alignItems: 'center',
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
});
