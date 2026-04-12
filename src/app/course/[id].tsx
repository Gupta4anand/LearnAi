import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useCourseStore } from '@/store/courseStore';
import GradientButton from '@/components/GradientButton';
import { moderateScale, fontScale, verticalScale, Layout } from '@/utils/responsive';

const { width } = Dimensions.get('window');

export default function CourseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { bookmarks, toggleBookmark, isBookmarked } = useCourseStore();
  
  const [activeTab, setActiveTab] = useState('About');
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Fallback data if params are missing
  const courseId = params.id as string;
  const title = params.title as string || 'AI Advanced Mastery';
  const image = params.image as string || 'https://picsum.photos/seed/ai/800/400';
  const instructor = params.instructor as string || 'Dr. Sarah Chen';

  const handleBookmark = () => {
    toggleBookmark({
      id: courseId,
      title,
      image,
      instructor
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Section */}
        <View style={styles.bannerContainer}>
          <Image source={{ uri: image }} style={styles.bannerImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.8)', 'transparent', 'rgba(15, 23, 42, 1)']}
            style={styles.gradientOverlay}
          />
          
          <SafeAreaView style={styles.headerActions} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleBookmark}>
              <Ionicons 
                name={isBookmarked(courseId) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isBookmarked(courseId) ? Colors.learnAI.accent : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.bannerInfo}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>Advanced AI</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        {/* Course Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.instructorRow}>
            <View style={styles.instructorAvatar}>
              <Ionicons name="person" size={20} color="#94A3B8" />
            </View>
            <View>
              <Text style={styles.instructorName}>{instructor}</Text>
              <Text style={styles.instructorTitle}>Senior AI Scientist</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>4.9 (2.1k reviews)</Text>
            </View>
          </View>

          {isEnrolled && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressPercent}>40%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '40%' }]} />
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {['About', 'Lessons', 'Reviews'].map((tab) => (
              <TouchableOpacity 
                key={tab} 
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'About' && (
            <View style={styles.tabContent}>
              <Text style={styles.description}>
                This course provides a comprehensive introduction to the world of Artificial Intelligence. 
                You will explore the latest trends, technologies, and practical applications of AI in various industries. 
                Perfect for engineers, data scientists, and anyone curious about the future of tech.
              </Text>
              <Text style={styles.sectionTitle}>What you'll learn</Text>
              {[
                'Fundamentals of Neural Networks',
                'Hands-on Deep Learning with PyTorch',
                'Advanced NLP techniques',
                'Computer Vision Architectures'
              ].map((item, idx) => (
                <View key={idx} style={styles.bulletItem}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.learnAI.accent} />
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'Lessons' && (
            <View style={styles.tabContent}>
              {lessons.map((lesson, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.lessonItem}
                  onPress={() => router.push('/webview')}
                >
                  <View style={[styles.lessonNum, lesson.completed && styles.lessonCompleted]}>
                    {lesson.completed ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={styles.lessonNumText}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                  </View>
                  <Ionicons name="play-circle" size={24} color={Colors.learnAI.accent} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {/* Fill extra space */}
        <View style={{ height: moderateScale(120) }} />
      </ScrollView>

      {/* Floating Bottom Action */}
      <SafeAreaView edges={['bottom']} style={styles.stickyFooter}>
        <View style={styles.footerContent}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.priceValue}>$49.99</Text>
          </View>
          <View style={styles.actionBtn}>
            <GradientButton 
              title={isEnrolled ? "Continue Learning" : "Enroll Now"} 
              onPress={() => {
                if (!isEnrolled) setIsEnrolled(true);
                else router.push('/webview');
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.learnAI.background,
  },
  scrollContent: {
    paddingBottom: moderateScale(40),
  },
  bannerContainer: {
    width: width,
    height: verticalScale(320),
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    zIndex: 10,
  },
  iconBtn: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerInfo: {
    position: 'absolute',
    bottom: moderateScale(24),
    left: moderateScale(24),
    right: moderateScale(24),
  },
  categoryBadge: {
    backgroundColor: Colors.learnAI.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: fontScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontScale(26),
    fontWeight: '800',
    lineHeight: 34,
  },
  infoSection: {
    paddingHorizontal: moderateScale(24),
    marginTop: moderateScale(24),
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(24),
  },
  instructorAvatar: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(22),
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructorName: {
    color: '#FFFFFF',
    fontSize: fontScale(15),
    fontWeight: '700',
  },
  instructorTitle: {
    color: '#94A3B8',
    fontSize: fontScale(13),
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  ratingText: {
    color: '#FBBF24',
    fontSize: fontScale(12),
    fontWeight: '700',
    marginLeft: 4,
  },
  progressContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  progressPercent: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(14),
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.learnAI.accent,
    borderRadius: 3,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.learnAI.accent,
  },
  tabText: {
    color: '#94A3B8',
    fontSize: fontScale(16),
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.learnAI.accent,
  },
  tabContent: {
    paddingBottom: 20,
  },
  description: {
    color: '#94A3B8',
    fontSize: fontScale(15),
    lineHeight: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(18),
    fontWeight: '700',
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    marginLeft: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  lessonNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  lessonCompleted: {
    backgroundColor: Colors.learnAI.accent,
  },
  lessonNumText: {
    color: '#FFFFFF',
    fontSize: fontScale(12),
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  lessonDuration: {
    color: '#475569',
    fontSize: fontScale(12),
    marginTop: 2,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: moderateScale(24),
    paddingVertical: moderateScale(16),
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    color: '#94A3B8',
    fontSize: fontScale(12),
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '800',
  },
  actionBtn: {
    flex: 2,
    marginLeft: 20,
  },
});
