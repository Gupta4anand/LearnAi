import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, StatusBar } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Layout } from '@/utils/responsive';

export default function OTAUpdateScreen() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>(null);

  const currentUpdateId = Updates.updateId || 'Development Build';
  const runtimeVersion = Updates.runtimeVersion || 'N/A';

  const onCheckForUpdates = async () => {
    if (__DEV__) {
      Alert.alert('Development Mode', 'OTA updates are not available in development mode.');
      return;
    }

    setIsChecking(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        setUpdateAvailable(true);
        setUpdateInfo(update.manifest);
        Alert.alert('Update Available', 'A new version of the app is available. Would you like to download it?', [
          { text: 'Later', style: 'cancel' },
          { text: 'Download', onPress: fetchUpdate }
        ]);
      } else {
        Alert.alert('Up to Date', 'You are already using the latest version of LearnAI.');
      }
    } catch (error: any) {
      Alert.alert('Check Failed', error.message || 'Could not check for updates.');
    } finally {
      setIsChecking(false);
    }
  };

  const fetchUpdate = async () => {
    setIsDownloading(true);
    try {
      await Updates.fetchUpdateAsync();
      Alert.alert('Update Downloaded', 'The update has been downloaded and will be applied the next time you restart the app.', [
        { text: 'Restart Now', onPress: () => Updates.reloadAsync() },
        { text: 'Later', style: 'default' }
      ]);
    } catch (error: any) {
      Alert.alert('Download Failed', error.message || 'Could not download the update.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Animated.View entering={FadeInDown.duration(800)} className="flex-1 bg-learnAI-background">
      <Stack.Screen options={{ 
        headerShown: false,
        title: 'App Updates'
      }} />
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-start justify-center">
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-extrabold ml-2">Software Update</Text>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="items-center mt-10 mb-12">
            <View className="w-24 h-24 rounded-[30px] bg-learnAI-accent/10 items-center justify-center mb-6">
              <Ionicons name="cloud-download-outline" size={48} color={Colors.learnAI.accent} />
            </View>
            <Text className="text-white text-2xl font-bold">LearnAI 1.0.0</Text>
            <Text className="text-slate-400 mt-2">Check for the latest features and fixes</Text>
          </View>

          <View className="bg-learnAI-inputBg rounded-[32px] p-6 mb-8 border border-white/5">
            <Text className="text-white font-bold mb-6 text-lg">System Information</Text>
            
            <View className="flex-row justify-between mb-5">
              <Text className="text-slate-400">Update ID</Text>
              <Text className="text-white font-medium" numberOfLines={1}>{currentUpdateId.slice(0, 8)}...</Text>
            </View>
            
            <View className="flex-row justify-between mb-5">
              <Text className="text-slate-400">Runtime Version</Text>
              <Text className="text-white font-medium">{runtimeVersion}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-400">Status</Text>
              <Text className="text-emerald-400 font-bold uppercase text-xs tracking-widest mt-0.5">Verified</Text>
            </View>
          </View>

          <View className="bg-learnAI-inputBg rounded-[32px] p-6 mb-10 border border-white/5">
            <Text className="text-white font-bold mb-4">Automatic Updates</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-slate-400 flex-1 mr-4">Keep your app up to date automatically when connected to Wi-Fi.</Text>
              <View className="w-10 h-6 bg-learnAI-accent rounded-full items-end px-1 justify-center">
                <View className="w-4 h-4 bg-white rounded-full" />
              </View>
            </View>
          </View>

          <TouchableOpacity 
            onPress={onCheckForUpdates}
            disabled={isChecking || isDownloading}
            className={`h-16 rounded-2xl items-center justify-center mb-4 ${isChecking || isDownloading ? 'bg-slate-800' : 'bg-learnAI-accent'}`}
          >
            {isChecking ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#FFFFFF" className="mr-2" />
                <Text className="text-white font-bold text-base">Checking...</Text>
              </View>
            ) : isDownloading ? (
               <View className="flex-row items-center">
                <ActivityIndicator color="#FFFFFF" className="mr-2" />
                <Text className="text-white font-bold text-base">Downloading...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-base">Check for Updates</Text>
            )}
          </TouchableOpacity>
          
          <Text className="text-slate-500 text-center text-xs px-4">
            LearnAI uses secure over-the-air updates to provide critical fixes and improvements instantly.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}
