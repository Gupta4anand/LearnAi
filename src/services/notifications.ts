import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * NOTE: expo-notifications is restricted in Expo Go for SDK 53+.
 * We have completely removed the library imports to prevent crashes.
 * Notifications will be mocked until you use a Development Build.
 */

export async function registerForPushNotificationsAsync() {
  console.log('Notifications (MOCKED): Registration complete.');
  return true;
}

export async function sendBookmarkNotification() {
  console.log('🏆 Milestone Reached: You have bookmarked 5 courses! (Notification Mocked)');
}
