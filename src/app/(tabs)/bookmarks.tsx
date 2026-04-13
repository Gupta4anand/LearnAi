import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LegendList } from '@legendapp/list';
import { Colors } from '@/constants/theme';
import { useCourseStore, Course } from '@/store/courseStore';
import { moderateScale } from '@/utils/responsive';

export default function BookmarksScreen() {
  const { bookmarks, toggleBookmark } = useCourseStore();
  const router = useRouter();

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity 
      className="flex-row bg-learnAI-inputBg rounded-[20px] p-3 items-center mb-4"
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
        source={item.image ? { uri: item.image } : undefined}
        placeholder={{ blurhash: 'L35#Q8xu00?b~qofM{of00Rj-;of' }}
        style={{ width: 80, height: 80, borderRadius: 14, backgroundColor: '#334155' }}
        contentFit="cover"
        transition={200}
      />
      <View className="flex-1 ml-4 mr-2">
        <Text className="text-white text-base font-bold mb-1" numberOfLines={2}>{item.title}</Text>
        <Text className="text-slate-400 text-sm">by {item.instructor}</Text>
      </View>
      <TouchableOpacity 
        className="p-2"
        onPress={() => toggleBookmark(item)}
      >
        <Ionicons name="bookmark" size={24} color={Colors.learnAI.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View className="flex-1 justify-center items-center mt-[100px] px-10">
      <View className="w-[120px] h-[120px] rounded-full bg-slate-800 justify-center items-center mb-6">
        <Ionicons name="bookmark-outline" size={60} color="#94A3B8" />
      </View>
      <Text className="text-white text-xl font-bold mb-3">No bookmarks yet</Text>
      <Text className="text-slate-400 text-[15px] text-center leading-5.5 mb-8">
        Start saving courses to view them here and access them anytime.
      </Text>
      <TouchableOpacity 
        className="bg-learnAI-accent px-8 py-3.5 rounded-2xl"
        onPress={() => router.replace('/(tabs)')}
      >
        <Text className="text-white text-base font-bold">Explore Courses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <View className="px-6 pt-5 mb-6">
          <Text className="text-white text-[28px] font-extrabold">Your Bookmarks</Text>
          <Text className="text-slate-400 text-[15px] mt-1">Saved courses for later</Text>
        </View>

        <LegendList
          data={bookmarks}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={100}
        />
      </SafeAreaView>
    </Animated.View>
  );
}
