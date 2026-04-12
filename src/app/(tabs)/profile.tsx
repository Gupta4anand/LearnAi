import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { moderateScale, fontScale, Layout } from '@/utils/responsive';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { bookmarks } = useCourseStore();

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
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Top Section */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={60} color="#94A3B8" />
              </View>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.userName}>{user?.username || 'Guest Learner'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'learner@learnai.com'}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>AI LEARNER</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{bookmarks.length}</Text>
              <Text style={styles.statLabel}>Bookmarks</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuContainer}>
            <Text style={styles.menuSectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(74, 110, 219, 0.1)' }]}>
                <Ionicons name="person-outline" size={22} color={Colors.learnAI.accent} />
              </View>
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(108, 141, 245, 0.1)' }]}>
                <Ionicons name="settings-outline" size={22} color={Colors.learnAI.secondary} />
              </View>
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                <Ionicons name="notifications-outline" size={22} color="#FBBF24" />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#475569" />
            </TouchableOpacity>

            <Text style={[styles.menuSectionTitle, { marginTop: 24 }]}>Preferences</Text>

            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}>
                <Ionicons name="moon-outline" size={22} color="#94A3B8" />
              </View>
              <Text style={styles.menuText}>Dark Mode</Text>
              <View style={styles.activeIndicator} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { marginTop: 32 }]} onPress={handleLogout}>
              <View style={[styles.menuIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              </View>
              <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.versionText}>LearnAI version 1.0.0</Text>
          </View>

          <View style={{ height: 100 }} />
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
  },
  header: {
    alignItems: 'center',
    marginTop: moderateScale(40),
    marginBottom: moderateScale(32),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: moderateScale(110),
    height: moderateScale(110),
    borderRadius: moderateScale(55),
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  badge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.learnAI.accent,
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.learnAI.background,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: fontScale(24),
    fontWeight: '800',
  },
  userEmail: {
    color: '#94A3B8',
    fontSize: fontScale(14),
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(74, 110, 219, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 12,
  },
  tagText: {
    color: Colors.learnAI.accent,
    fontSize: fontScale(10),
    fontWeight: '700',
    letterSpacing: 1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: moderateScale(24),
    paddingVertical: moderateScale(20),
    marginBottom: moderateScale(32),
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: fontScale(20),
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: fontScale(12),
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#334155',
  },
  menuContainer: {
    width: '100%',
  },
  menuSectionTitle: {
    color: '#475569',
    fontSize: fontScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: moderateScale(14),
    borderRadius: moderateScale(16),
    marginBottom: moderateScale(12),
  },
  menuIconBg: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fontScale(16),
    fontWeight: '600',
    marginLeft: 16,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.learnAI.accent,
  },
  footer: {
    alignItems: 'center',
    marginTop: moderateScale(40),
  },
  versionText: {
    color: '#475569',
    fontSize: fontScale(12),
  },
});
