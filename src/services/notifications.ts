import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_NOTIFICATION_KEY = 'learnai_return_reminder_id';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function scheduleReturnReminderNotification() {
  try {
    const existingId = await AsyncStorage.getItem(REMINDER_NOTIFICATION_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Come back to LearnAI',
        body: 'It has been a while — explore new AI courses now!',
        data: { type: 'RETURN_REMINDER' },
      },
      trigger: {
        type: 'timeInterval',
        seconds: 24 * 60 * 60,
        repeats: false,
      },
    });

    await AsyncStorage.setItem(REMINDER_NOTIFICATION_KEY, notificationId);
  } catch (error) {
    console.warn('Failed to schedule return reminder notification:', error);
  }
}

export async function registerForPushNotificationsAsync() {
  try {
    if (Constants.appOwnership === 'expo') {
      console.warn('Expo Go does not support expo-notifications registration. Skipping notification setup.');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Notifications permission not granted.');
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    await scheduleReturnReminderNotification();
    return true;
  } catch (error) {
    console.warn('Notification registration failed:', error);
    return false;
  }
}

export async function sendBookmarkNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bookmark milestone reached!',
        body: 'You have bookmarked 5 courses — keep learning.',
        data: { type: 'BOOKMARK_MILESTONE' },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('Failed to send bookmark notification:', error);
  }
}
