import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart'; // ✅ for time/date formatting

import 'chat_screen.dart';

class MatchesScreen extends StatelessWidget {
  const MatchesScreen({super.key});

  // Helper: consistent chatId (same as in ChatScreen)
  String getChatId(String uid1, String uid2) {
    return uid1.hashCode <= uid2.hashCode ? "$uid1-$uid2" : "$uid2-$uid1";
  }

  // Helper: format timestamp (like WhatsApp)
  String formatTimestamp(Timestamp? ts) {
    if (ts == null) return "";
    final date = ts.toDate();
    final now = DateTime.now();

    if (DateFormat('yyyy-MM-dd').format(date) ==
        DateFormat('yyyy-MM-dd').format(now)) {
      // same day → show time
      return DateFormat.jm().format(date); // e.g. 8:45 PM
    } else if (date.isAfter(now.subtract(const Duration(days: 1)))) {
      return "Yesterday";
    } else if (date.isAfter(now.subtract(const Duration(days: 7)))) {
      return DateFormat.E().format(date); // Mon, Tue
    } else {
      return DateFormat('dd/MM/yy').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser!.uid;

    return Scaffold(
      appBar: AppBar(title: const Text("My Matches")),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance
            .collection('matches')
            .where('users', arrayContains: uid)
            .orderBy('createdAt', descending: true)
            .snapshots(),
        builder: (ctx, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(child: Text("No matches yet 😢"));
          }

          final matches = snapshot.data!.docs;

          return ListView.builder(
            itemCount: matches.length,
            itemBuilder: (ctx, i) {
              final match = matches[i];
              final users = List<String>.from(match['users']);
              final dogIds = List<String>.from(match['dogIds']);
              final otherUserId = users.firstWhere((id) => id != uid);

              return FutureBuilder<DocumentSnapshot>(
                future: FirebaseFirestore.instance
                    .collection('users')
                    .doc(otherUserId)
                    .get(),
                builder: (ctx, userSnap) {
                  if (!userSnap.hasData || !userSnap.data!.exists) {
                    return const ListTile(title: Text("Loading user..."));
                  }
                  final otherUser = userSnap.data!;
                  final displayName =
                      otherUser['displayName'] ?? otherUser['email'] ?? "User";

                  // ✅ Fetch dogs for photo
                  return FutureBuilder<QuerySnapshot>(
                    future: FirebaseFirestore.instance
                        .collection('dogs')
                        .where(FieldPath.documentId, whereIn: dogIds)
                        .get(),
                    builder: (ctx, dogSnap) {
                      if (!dogSnap.hasData) {
                        return const ListTile(title: Text("Loading dogs..."));
                      }

                      final dogs = dogSnap.data!.docs;
                      final firstDog = dogs.isNotEmpty ? dogs.first : null;
                      final photoUrl = firstDog?['photoUrl'];

                      // ✅ Fetch last message preview
                      final chatId = getChatId(uid, otherUserId);
                      final messagesRef = FirebaseFirestore.instance
                          .collection('chats/$chatId/messages')
                          .orderBy('timestamp', descending: true)
                          .limit(1);

                      return StreamBuilder<QuerySnapshot>(
                        stream: messagesRef.snapshots(),
                        builder: (ctx, msgSnap) {
                          String lastMsg = "Say hi 👋"; // default
                          String timeLabel = "";
                          if (msgSnap.hasData &&
                              msgSnap.data!.docs.isNotEmpty) {
                            final msg = msgSnap.data!.docs.first;
                            lastMsg = msg['text'];
                            final sender = msg['senderId'];
                            if (sender == uid) {
                              lastMsg = "You: $lastMsg";
                            }
                            timeLabel = formatTimestamp(msg['timestamp']);
                          }

                          return ListTile(
                            leading: photoUrl != null
                                ? CircleAvatar(backgroundImage: NetworkImage(photoUrl))
                                : const CircleAvatar(child: Icon(Icons.pets)),
                            title: Text(displayName),
                            subtitle: Text(
                              lastMsg,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: Text(
                              timeLabel,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.grey,
                              ),
                            ),
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (ctx) => ChatScreen(otherUserId),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}