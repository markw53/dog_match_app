import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'auth_screen.dart';
import 'notification_service.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

/// Background handler for push messages
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print("📩 Background message: ${message.messageId}");
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Setup FCM background messages
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  // Initialise local + foreground notifications
  await NotificationService.init();

  runApp(const DogMatchApp());
}

class DogMatchApp extends StatelessWidget {
  const DogMatchApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dog Match App',
      theme: ThemeData(
        primarySwatch: Colors.teal,
      ),
      home: const AuthScreen(),
    );
  }
}