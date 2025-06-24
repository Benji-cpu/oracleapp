import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../stores/authStore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationData {
  type: 'deck_complete' | 'ai_job_finished' | 'daily_reminder' | 'reading_insight';
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  private notificationListener: any = null;
  private responseListener: any = null;

  async initialize(): Promise<void> {
    await this.registerForPushNotifications();
    this.setupNotificationListeners();
  }

  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  private async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted');
      return null;
    }

    // Get the push token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: '434de78c-a825-4b39-9e33-f458e0edfcf6', // Replace with your actual Expo project ID
    });

    console.log('Push token:', token.data);

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create specific channels for different notification types
      await Notifications.setNotificationChannelAsync('ai_updates', {
        name: 'AI Updates',
        description: 'Notifications about AI-generated content',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
      });

      await Notifications.setNotificationChannelAsync('daily_reminders', {
        name: 'Daily Reminders',
        description: 'Daily reading and reflection reminders',
        importance: Notifications.AndroidImportance.LOW,
      });
    }

    // Store the token in our database
    await this.savePushToken(token.data);

    return token.data;
  }

  private async savePushToken(token: string): Promise<void> {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const platform = Platform.OS;

      // Save token to Supabase
      const { error } = await supabase
        .from('push_tokens')
        .upsert(
          {
            user_id: user.id,
            token,
            platform,
          },
          {
            onConflict: 'user_id,token',
          }
        );

      if (error) {
        console.error('Error saving push token:', error);
      } else {
        console.log('Push token saved successfully');
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  private setupNotificationListeners(): void {
    // Handle notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Handle notification responses (taps)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  private handleNotificationReceived(notification: Notifications.Notification): void {
    console.log('Notification received:', notification);
    
    // You can handle foreground notifications here
    // For example, show in-app notification banner
  }

  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    console.log('Notification response:', response);
    
    const data = response.notification.request.content.data;
    
    // Handle notification tap based on type
    if (data?.type) {
      this.handleNotificationTap(data.type, data);
    }
  }

  private handleNotificationTap(type: string, data: any): void {
    // Navigate to appropriate screen based on notification type
    switch (type) {
      case 'deck_complete':
        // Navigate to deck gallery or specific deck
        console.log('Navigate to deck:', data.deckId);
        break;
      case 'ai_job_finished':
        // Navigate to card studio or reading result
        console.log('Navigate to AI result:', data);
        break;
      case 'daily_reminder':
        // Navigate to reading setup
        console.log('Navigate to daily reading');
        break;
      case 'reading_insight':
        // Navigate to journal or reading result
        console.log('Navigate to reading insight:', data.readingId);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  async scheduleLocalNotification(notification: NotificationData, delay: number = 0): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: true,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Time for Your Daily Reading 🔮',
          body: 'Draw your cards and discover what the universe has in store for you today.',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          channelId: 'daily_reminders',
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async getNotificationSettings(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  // Helper method to send push notification via our Edge Function
  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-push', {
        body: {
          user_id: userId,
          title,
          body,
          data,
        },
      });

      if (error) {
        throw error;
      }

      console.log('Push notification sent:', result);
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Common notification templates
  async notifyDeckComplete(deckName: string, deckId: string): Promise<void> {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await this.sendPushNotification(
      user.id,
      'Deck Complete! 🎉',
      `Your "${deckName}" deck is ready for readings.`,
      { type: 'deck_complete', deckId }
    );
  }

  async notifyAIJobFinished(jobType: 'meaning' | 'image' | 'interpretation', cardTitle?: string): Promise<void> {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const messages = {
      meaning: `AI meaning generated for "${cardTitle}"`,
      image: `AI image generated for "${cardTitle}"`,
      interpretation: 'Your reading interpretation is ready',
    };

    await this.sendPushNotification(
      user.id,
      'AI Generation Complete ✨',
      messages[jobType],
      { type: 'ai_job_finished', jobType, cardTitle }
    );
  }

  async notifyReadingInsight(readingId: string): Promise<void> {
    const { user } = useAuthStore.getState();
    if (!user) return;

    await this.sendPushNotification(
      user.id,
      'New Reading Insight 💫',
      'Reflect on your reading and add it to your journal.',
      { type: 'reading_insight', readingId }
    );
  }
}

export const notificationService = new NotificationService();