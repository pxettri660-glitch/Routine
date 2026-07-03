import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function requestNotificationPermissions() {
  if (Capacitor.isNativePlatform()) {
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  }
  return false;
}

export async function scheduleNotification(id: number, title: string, body: string, date: Date) {
  if (!Capacitor.isNativePlatform()) return;
  
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        title,
        body,
        id,
        schedule: { at: date },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: null
      }
    ]
  });
}

export async function cancelNotification(id: number) {
  if (!Capacitor.isNativePlatform()) return;
  await LocalNotifications.cancel({ notifications: [{ id }] });
}
