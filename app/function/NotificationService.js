// NotificationService.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

// Izin dan channel Android
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Notifikasi hanya tersedia di perangkat fisik.');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Izin notifikasi tidak diberikan.');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  return true;
}

// Jadwalkan notifikasi
export async function scheduleDailyReminder(hour, minute) {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Jangan lupa!',
      body: 'Catat pengeluaranmu hari ini sebelum tidur.',
      sound: 'default',
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

// Batalkan semua
export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
