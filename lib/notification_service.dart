import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  /// Initialise notification system
  static Future<void> init() async {
    // Ask for permissions (required for iOS & Android 13+ for posting notifications)
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    print("🔔 User granted permission: ${settings.authorizationStatus}");

    // Setup local notification settings for Android
    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    const initSettings = InitializationSettings(android: androidInit);
    await _localNotifications.initialize(initSettings);

    // Handle foreground (while app open)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      final notification = message.notification;
      if (notification != null) {
        _showNotification(notification.title, notification.body);
      }
    });

    // Handle app opened from terminated state
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      print("🔔 App opened by tapping notification: ${message.data}");
      // You can navigate to Chat or Matches screen based on message.data
    });
  }

  /// When a foreground FCM message is received, show it locally
  static Future<void> _showNotification(String? title, String? body) async {
    const androidChannel = AndroidNotificationDetails(
      'dog_match_channel', // channel ID
      'Dog Match Notifications', // channel name
      channelDescription: 'Notifications for messages and matches',
      importance: Importance.max,
      priority: Priority.high,
    );

    const notifDetails = NotificationDetails(android: androidChannel);

    await _localNotifications.show(
      0,
      title ?? "New Notification",
      body ?? "",
      notifDetails,
    );
  }

  /// Get the current device FCM token for this user
  static Future<String?> getToken() async {
    final token = await _messaging.getToken();
    print("📲 FCM Token: $token");
    return token;
  }

  /// To be called after user login if needed (refresh FCM token on app launch)
  static void listenTokenRefresh(Function(String) onRefresh) {
    _messaging.onTokenRefresh.listen((newToken) {
      print("♻️ FCM token refreshed: $newToken");
      onRefresh(newToken);
    });
  }
}