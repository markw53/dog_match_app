import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class ChatScreen extends StatefulWidget {
  final String otherUserId;
  const ChatScreen(this.otherUserId, {super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final msgCtrl = TextEditingController();

  String getChatId(String uid1, String uid2) {
    // Unique ID regardless of order
    return uid1.hashCode <= uid2.hashCode ? "$uid1-$uid2" : "$uid2-$uid1";
  }

  @override
  Widget build(BuildContext context) {
    final myId = FirebaseAuth.instance.currentUser!.uid;
    final chatId = getChatId(myId, widget.otherUserId);
    final messagesRef = FirebaseFirestore.instance.collection('chats/$chatId/messages');

    return Scaffold(
      appBar: AppBar(title: const Text("Chat")),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder(
              stream: messagesRef.orderBy('timestamp', descending: true).snapshots(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
                final docs = snapshot.data!.docs;

                return ListView.builder(
                  reverse: true,
                  itemCount: docs.length,
                  itemBuilder: (ctx, i) {
                    final msg = docs[i];
                    final isMe = msg['senderId'] == myId;
                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: isMe ? Colors.teal[200] : Colors.grey[300],
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(msg['text']),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(controller: msgCtrl, decoration: const InputDecoration(hintText: "Type a message...")),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () async {
                    await messagesRef.add({
                      'text': msgCtrl.text,
                      'senderId': myId,
                      'timestamp': FieldValue.serverTimestamp(),
                    });
                    msgCtrl.clear();
                  },
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}