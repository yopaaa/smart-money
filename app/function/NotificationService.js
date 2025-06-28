import PushNotification from 'react-native-push-notification';

// Konfigurasi utama
export function configurePushNotification() {
  PushNotification.configure({
    onNotification: function (notification) {
      console.log("NOTIFICATION:", notification);
    },
    requestPermissions: true,
  });

  // Buat channel Android
  PushNotification.createChannel(
    {
      channelId: "daily-reminder",
      channelName: "Daily Reminder",
      channelDescription: "Pengingat harian untuk mencatat pengeluaran",
      soundName: "default",
      importance: 4, // High
      vibrate: true,
    },
    (created) => console.log(`Channel created: '${created}'`)
  );
}

import { Alert, Platform } from 'react-native';

// Registrasi izin notifikasi
export async function registerForPushNotificationsAsync() {
  configurePushNotification(); // Init config
  if (Platform.OS === 'android') {
    // Izin diberikan otomatis di Android
    return true;
  }

  try {
    const result = await PushNotification.requestPermissions();
    if (result?.alert || result?.authorizationStatus === 1) {
      return true;
    } else {
      Alert.alert('Izin notifikasi tidak diberikan.');
      return false;
    }
  } catch (e) {
    console.log('Izin gagal:', e);
    return false;
  }
}

// Jadwalkan notifikasi harian
export async function scheduleDailyReminder(hour, minute) {
  // Format waktu (dalam waktu lokal)
  const now = new Date();
  const fireDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );

  if (fireDate <= now) {
    fireDate.setDate(fireDate.getDate() + 1); // besok
  }

  PushNotification.localNotificationSchedule({
    channelId: "daily-reminder",
    title: "Jangan lupa!",
    message: "Catat pengeluaranmu hari ini sebelum tidur.",
    date: fireDate,
    allowWhileIdle: true,
    repeatType: 'day',
  });
}

// Batalkan semua
export async function cancelReminders() {
  PushNotification.cancelAllLocalNotifications();
}
