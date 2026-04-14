import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { capitalizeName, getInitials } from '@/utils/format';
import { Layout } from '@/utils/responsive';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const { bookmarks, enrolledCourses } = useCourseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.fullName ?? user?.username ?? '');
  const [displayEmail, setDisplayEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string>('');

  useEffect(() => {
    setDisplayName(user?.fullName ?? user?.username ?? '');
    setDisplayEmail(user?.email ?? '');
    const avatar = typeof user?.avatar === 'string' ? user.avatar : '';
    setAvatarUri(avatar);
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handlePickAvatar = async () => {
    try {
      const permissionGetter =
        ImagePicker.getMediaLibraryPermissionsAsync ?? ImagePicker.requestMediaLibraryPermissionsAsync;
      if (typeof permissionGetter !== 'function') {
        Alert.alert(
          'Unsupported',
          'Image picker is not available in this environment.'
        );
        return;
      }

      const permissionResult = await permissionGetter();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to update your avatar.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('cancelled' in result ? !result.cancelled : result.assets?.length) {
        const pickedUri =
          typeof (result as any).uri === 'string'
            ? (result as any).uri
            : typeof result.assets?.[0]?.uri === 'string'
            ? result.assets[0].uri
            : '';
        if (pickedUri) {
          setAvatarUri(pickedUri);
        }
      }
    } catch (error: any) {
      Alert.alert('Image Picker Error', error?.message ?? 'Unable to open the image picker.');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateProfile({
      ...user,
      username: displayName.trim() || user.username,
      fullName: displayName.trim() || user.fullName,
      email: displayEmail.trim() || user.email,
      avatar: avatarUri,
    });
    setIsEditing(false);
    Alert.alert('Profile updated', 'Your profile changes have been saved.');
  };

  const enrolledCount = enrolledCourses.length;
  const completedCount = enrolledCourses.filter(
    (course) => course.completedLessons >= course.totalLessons || course.progress >= 1
  ).length;

  return (
    <Animated.View 
      entering={FadeInDown.duration(800)} 
      className="flex-1 bg-learnAI-background"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          <View className="items-center mt-6 mb-8">
            <View className="relative">
              <LinearGradient
                colors={['#6C8DF5', '#4A6EDB']}
                className="w-32 h-32 rounded-full p-1 shadow-2xl shadow-blue-500/30"
              >
                <View className="w-full h-full rounded-full bg-learnAI-background justify-center items-center overflow-hidden border-4 border-learnAI-background">
                  {typeof avatarUri === 'string' && avatarUri.length > 0 ? (
                    <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full bg-slate-800 justify-center items-center">
                      <Text className="text-white text-3xl font-extrabold tracking-tighter">
                        {getInitials(user?.fullName || user?.username || '') || 'AL'}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
              <TouchableOpacity 
                activeOpacity={0.8}
                className="absolute bottom-1 right-1 w-11 h-11 rounded-full bg-learnAI-accent border-4 border-learnAI-background justify-center items-center shadow-lg" 
                onPress={handlePickAvatar}
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View className="items-center mt-5">
              <Text className="text-white text-[28px] font-extrabold tracking-tight">
                {capitalizeName(user?.fullName || user?.username || 'Guest Learner')}
              </Text>
              <Text className="text-slate-400 text-sm font-medium mt-1">{user?.email ?? 'learner@learnai.com'}</Text>
              <View className="mt-4 px-4 py-1.5 rounded-full bg-slate-800/80 border border-white/5">
                <Text className="text-learnAI-accent text-[10px] font-bold uppercase tracking-[0.2em]">AI Enthusiast</Text>
              </View>
            </View>
          </View>

          <View className="flex-row bg-learnAI-inputBg/50 border border-white/5 rounded-[32px] p-6 mb-8 justify-between items-center">
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold" numberOfLines={1}>{bookmarks.length}</Text>
              <Text className="text-slate-400 text-[10px] tracking-wider mt-2 uppercase" numberOfLines={1}>Bookmarks</Text>
            </View>
            <View className="w-px h-10 bg-slate-700 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold" numberOfLines={1}>{enrolledCount}</Text>
              <Text className="text-slate-400 text-[10px] tracking-wider mt-2 uppercase" numberOfLines={1}>Enrolled</Text>
            </View>
            <View className="w-px h-10 bg-slate-700 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold" numberOfLines={1}>{completedCount}</Text>
              <Text className="text-slate-400 text-[10px] tracking-wider mt-2 uppercase" numberOfLines={1}>Completed</Text>
            </View>
          </View>

          <View className="gap-y-3">
            <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-widest ml-1 mb-3">Account</Text>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4" onPress={() => setIsEditing(true)}>
              <View className="w-10 h-10 rounded-2xl bg-learnAI-accent/10 justify-center items-center">
                <Ionicons name="person-outline" size={22} color={Colors.learnAI.accent} />
              </View>
              <Text className="flex-1 text-white text-base font-semibold ml-4">Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4">
              <View className="w-10 h-10 rounded-2xl bg-learnAI-secondary/10 justify-center items-center">
                <Ionicons name="settings-outline" size={22} color={Colors.learnAI.secondary} />
              </View>
              <Text className="flex-1 text-white text-base font-semibold ml-4">Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4" onPress={() => router.push('/settings/updates')}>
              <View className="w-10 h-10 rounded-2xl bg-amber-400/10 justify-center items-center">
                <Ionicons name="cloud-download-outline" size={22} color="#FBBF24" />
              </View>
              <Text className="flex-1 text-white text-base font-semibold ml-4">Software Update</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4 mt-6" onPress={handleLogout}>
              <View className="w-10 h-10 rounded-2xl bg-red-500/10 justify-center items-center">
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <Text className="flex-1 text-red-500 text-base font-semibold ml-4">Logout</Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-10">
            <Text className="text-slate-500 text-xs">LearnAI version 1.0.0</Text>
          </View>
        </ScrollView>

        <Modal 
          visible={isEditing} 
          animationType="fade" 
          transparent={true} 
          onRequestClose={() => setIsEditing(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <Pressable className="absolute inset-0" onPress={() => setIsEditing(false)} />
            <Animated.View 
              entering={FadeInUp.duration(400)}
              className="bg-slate-900 rounded-t-[40px] px-6 pt-1 pb-12"
            >
              <View className="w-12 h-1.5 bg-slate-700/50 rounded-full self-center mt-3 mb-8" />
              
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-white text-2xl font-bold">Edit Profile</Text>
                <TouchableOpacity 
                  onPress={() => setIsEditing(false)}
                  className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center"
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View>
                <View className="mb-6">
                  <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider ml-1">Display Name</Text>
                  <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 h-16">
                    <Ionicons name="person-outline" size={20} color="#64748B" />
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      className="flex-1 text-white text-base font-semibold ml-3"
                      placeholder="Enter your name"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                <View className="mb-10">
                  <Text className="text-slate-400 text-sm font-bold mb-3 uppercase tracking-wider ml-1">Email Address</Text>
                  <View className="flex-row items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 h-16">
                    <Ionicons name="mail-outline" size={20} color="#64748B" />
                    <TextInput
                      value={displayEmail}
                      onChangeText={setDisplayEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="flex-1 text-white text-base font-semibold ml-3"
                      placeholder="Enter your email"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>

                <View className="flex-row gap-x-4">
                  <TouchableOpacity 
                    className="flex-1 flex-row items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 h-16" 
                    onPress={handlePickAvatar}
                  >
                    <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold text-base ml-2">New Avatar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex-[1.5] rounded-2xl bg-learnAI-accent h-16 items-center justify-center shadow-lg shadow-blue-500/30" 
                    onPress={handleSaveProfile}
                  >
                    <Text className="text-white font-bold text-base">Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </SafeAreaView>
    </Animated.View>
  );
}
