import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuthStore();
  const { bookmarks } = useCourseStore();
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
          'Image picker is not available in this environment. Restart the app or use Expo Go with the image picker module installed.'
        );
        return;
      }

      const permissionResult = await permissionGetter();
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to update your avatar. You may also need to enable permissions from system settings.'
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
      Alert.alert(
        'Image Picker Error',
        error?.message ?? 'Unable to open the image picker. Please restart the app or rebuild with expo-image-picker installed.'
      );
      console.error('handlePickAvatar error:', error);
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

  const enrolledCount = Math.max(bookmarks.length, 8);
  const completedCount = Math.min(bookmarks.length, 4);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarFrame}>
                {typeof avatarUri === 'string' && avatarUri.length > 0 ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <Ionicons name="person" size={60} color="#94A3B8" />
                )}
              </View>
              <TouchableOpacity style={styles.avatarPicker} onPress={handlePickAvatar}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.nameText}>{user?.username ?? 'Guest Learner'}</Text>
            <Text style={styles.emailText}>{user?.email ?? 'learner@learnai.com'}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>AI Learner</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{bookmarks.length}</Text>
              <Text style={styles.statLabel}>Bookmarks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{enrolledCount}</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.sectionGroup}>
            <Text style={styles.sectionHeader}>Account</Text>

            <TouchableOpacity style={styles.cardButton} onPress={() => setIsEditing(true)}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(74,110,219,0.1)' }]}>
                <Ionicons name="person-outline" size={22} color={Colors.learnAI.accent} />
              </View>
              <Text style={styles.cardTitle}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardButton}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(108,141,245,0.1)' }]}>
                <Ionicons name="settings-outline" size={22} color={Colors.learnAI.secondary} />
              </View>
              <Text style={styles.cardTitle}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardButton}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(251,191,36,0.1)' }]}>
                <Ionicons name="notifications-outline" size={22} color="#FBBF24" />
              </View>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={styles.sectionHeaderWithMargin}>Preferences</Text>

            <TouchableOpacity style={styles.cardButton}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(148,163,184,0.1)' }]}>
                <Ionicons name="moon-outline" size={22} color="#94A3B8" />
              </View>
              <Text style={styles.cardTitle}>Dark Mode</Text>
              <View style={styles.preferenceStatus} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.versionRow}>
            <Text style={styles.versionText}>LearnAI version 1.0.0</Text>
          </View>
        </ScrollView>

        <Modal visible={isEditing} animationType="slide" transparent={true} onRequestClose={() => setIsEditing(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalField}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  value={displayEmail}
                  onChangeText={setDisplayEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#64748B"
                />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handlePickAvatar}>
                <Text style={styles.buttonText}>Choose Avatar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleSaveProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarFrame: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPicker: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C8DF5',
    borderWidth: 4,
    borderColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  emailText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 8,
  },
  badge: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#6C8DF5',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
  sectionGroup: {
    gap: 12,
  },
  sectionHeader: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
    marginBottom: 12,
  },
  sectionHeaderWithMargin: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
    marginTop: 24,
    marginBottom: 12,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  preferenceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C8DF5',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
    marginTop: 32,
  },
  logoutText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 16,
  },
  versionRow: {
    alignItems: 'center',
    marginTop: 40,
  },
  versionText: {
    color: '#475569',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalField: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    borderRadius: 24,
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
  },
  primaryButton: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
