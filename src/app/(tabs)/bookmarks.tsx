import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useCourseStore, Course } from '@/store/courseStore';
import { moderateScale, fontScale, Layout } from '@/utils/responsive';

export default function BookmarksScreen() {
  const { bookmarks, toggleBookmark } = useCourseStore();
  const router = useRouter();

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({
        pathname: `/course/${item.id}`,
        params: { 
          title: item.title, 
          image: item.image, 
          instructor: item.instructor 
        }
      })}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.thumb} 
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructor}>by {item.instructor}</Text>
      </View>
      <TouchableOpacity 
        style={styles.bookmarkIcon}
        onPress={() => toggleBookmark(item)}
      >
        <Ionicons name="bookmark" size={24} color={Colors.learnAI.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="bookmark-outline" size={60} color="#94A3B8" />
      </View>
      <Text style={styles.emptyTitle}>No bookmarks yet</Text>
      <Text style={styles.emptySubtitle}>
        Start saving courses to view them here and access them anytime.
      </Text>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.exploreBtnText}>Explore Courses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Bookmarks</Text>
          <Text style={styles.headerSubtitle}>Saved courses for later</Text>
        </View>

        <FlatList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: moderateScale(24),
    paddingTop: moderateScale(20),
    marginBottom: moderateScale(24),
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(28),
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: fontScale(15),
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: moderateScale(24),
    paddingBottom: moderateScale(100),
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  thumb: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(14),
    backgroundColor: '#334155',
  },
  info: {
    flex: 1,
    marginLeft: moderateScale(16),
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '700',
    marginBottom: 4,
  },
  instructor: {
    color: '#94A3B8',
    fontSize: fontScale(14),
  },
  bookmarkIcon: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: moderateScale(100),
    paddingHorizontal: moderateScale(40),
  },
  emptyIconBg: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: fontScale(20),
    fontWeight: '700',
    marginBottom: 12,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: fontScale(15),
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    backgroundColor: Colors.learnAI.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '700',
  },
});
