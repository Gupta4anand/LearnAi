import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegendList } from '@legendapp/list';
import { Colors } from '@/constants/theme';
import { courseService } from '@/services/api';
import { useCourseStore } from '@/store/courseStore';
import { moderateScale, fontScale, Layout } from '@/utils/responsive';

const CATEGORIES = ['All', 'Popular', 'New', 'Trending', 'Advanced', 'Beginner'];

export default function SeeAllCoursesScreen() {
  const router = useRouter();
  const { bookmarks, toggleBookmark, isBookmarked } = useCourseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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
            <Text style={styles.metaText}>{item.rating || '4.8'}</Text>
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
            size={22} 
            color={bookmarks.some(b => String(b.id) === String(item.id)) ? Colors.learnAI.accent : "#94A3B8"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Courses</Text>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBackground}>
          <Ionicons name="search-outline" size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            placeholder="Search all courses..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
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
            contentContainerStyle={styles.categoryContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveCategory(item)}
                style={[styles.categoryChip, activeCategory === item && styles.activeChip]}
              >
                <Text style={[styles.categoryLabel, activeCategory === item && styles.activeChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* List */}
        {coursesLoading ? (
          <ActivityIndicator color={Colors.learnAI.accent} size="large" style={{ marginTop: 50 }} />
        ) : (
          <LegendList
            data={filteredCourses}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={moderateScale(100)}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={60} color="#1E293B" />
                <Text style={styles.emptyTitle}>No courses found</Text>
                <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
              </View>
            }
          />
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(16),
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  filterBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(20),
    fontWeight: '800',
  },
  searchBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(16),
    marginHorizontal: moderateScale(24),
    paddingHorizontal: moderateScale(16),
    height: moderateScale(54),
    marginBottom: moderateScale(20),
  },
  searchIcon: {
    marginRight: moderateScale(10),
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontScale(16),
  },
  categoryContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(24),
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeChip: {
    backgroundColor: Colors.learnAI.accent,
    borderColor: Colors.learnAI.accent,
  },
  categoryLabel: {
    color: '#94A3B8',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(40),
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
  emptyState: {
    alignItems: 'center',
    marginTop: moderateScale(60),
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    color: '#475569',
    fontSize: fontScale(14),
    marginTop: 8,
  },
});
