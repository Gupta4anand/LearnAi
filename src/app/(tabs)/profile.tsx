import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const { bookmarks, enrolledCourses } = useCourseStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.username ?? '');
  const [displayEmail, setDisplayEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string>('');

  useEffect(() => {
    setDisplayName(user?.username ?? '');
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
          <View className="items-center mt-10 mb-8">
            <View className="relative mb-4">
              <View className="w-28 h-28 rounded-full bg-slate-800 justify-center items-center border border-slate-700 overflow-hidden">
                {typeof avatarUri === 'string' && avatarUri.length > 0 ? (
                  <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={60} color="#94A3B8" />
                )}
              </View>
              <TouchableOpacity 
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-learnAI-accent border-4 border-learnAI-background justify-center items-center" 
                onPress={handlePickAvatar}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text className="text-white text-2xl font-extrabold">{user?.username ?? 'Guest Learner'}</Text>
            <Text className="text-slate-400 text-sm mt-2">{user?.email ?? 'learner@learnai.com'}</Text>
            <View className="mt-3 rounded-full bg-slate-800 px-4 py-1.5">
              <Text className="text-learnAI-accent text-[10px] font-bold uppercase tracking-widest">AI Learner</Text>
            </View>
          </View>

          <View className="flex-row bg-learnAI-inputBg rounded-[24px] p-5 mb-8 justify-between items-center">
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold">{bookmarks.length}</Text>
              <Text className="text-slate-400 text-[11px] tracking-widest mt-2 uppercase">Bookmarks</Text>
            </View>
            <View className="w-px h-12 bg-slate-700 mx-3" />
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold">{enrolledCount}</Text>
              <Text className="text-slate-400 text-[11px] tracking-widest mt-2 uppercase">Enrolled</Text>
            </View>
            <View className="w-px h-12 bg-slate-700 mx-3" />
            <View className="flex-1 items-center">
              <Text className="text-white text-2xl font-extrabold">{completedCount}</Text>
              <Text className="text-slate-400 text-[11px] tracking-widest mt-2 uppercase">Completed</Text>
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

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4">
              <View className="w-10 h-10 rounded-2xl bg-amber-400/10 justify-center items-center">
                <Ionicons name="notifications-outline" size={22} color="#FBBF24" />
              </View>
              <Text className="flex-1 text-white text-base font-semibold ml-4">Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <Text className="text-slate-500 text-[11px] font-bold uppercase tracking-widest ml-1 mt-6 mb-3">Preferences</Text>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4">
              <View className="w-10 h-10 rounded-2xl bg-slate-400/10 justify-center items-center">
                <Ionicons name="moon-outline" size={22} color="#94A3B8" />
              </View>
              <Text className="flex-1 text-white text-base font-semibold ml-4">Dark Mode</Text>
              <View className="w-2 h-2 rounded-full bg-learnAI-accent" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-learnAI-inputBg rounded-[24px] p-4 mt-8" onPress={handleLogout}>
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

        <Modal visible={isEditing} animationType="slide" transparent={true} onRequestClose={() => setIsEditing(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-learnAI-background rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-white text-lg font-bold">Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-slate-400 mb-2">Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  className="rounded-3xl bg-slate-900 px-4 py-3.5 text-white"
                  placeholder="Enter your name"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View className="mb-4">
                <Text className="text-slate-400 mb-2">Email Address</Text>
                <TextInput
                  value={displayEmail}
                  onChangeText={setDisplayEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="rounded-3xl bg-slate-900 px-4 py-3.5 text-white"
                  placeholder="Enter your email"
                  placeholderTextColor="#64748B"
                />
              </View>

              <TouchableOpacity className="w-full rounded-3xl bg-blue-600 py-4 items-center mb-4" onPress={handlePickAvatar}>
                <Text className="text-white font-bold">Choose Avatar</Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-full rounded-3xl bg-emerald-500 py-4 items-center" onPress={handleSaveProfile}>
                <Text className="text-white font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Animated.View>
  );
}
