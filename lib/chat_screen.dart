import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart'; // For formatting timestamps

class ChatScreen extends StatefulWidget {
  final String otherUserId;
  const ChatScreen(this.otherUserId, {super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController msgCtrl = TextEditingController();

  /// Helper to get consistent chatId
  String getChatId(String uid1, String uid2) {
    return uid1.hashCode <= uid2.hashCode ? "$uid1-$uid2" : "$uid2-$uid1";
  }

  /// Format timestamp nicely
  String formatTime(Timestamp? ts) {
    if (ts == null) return "";
    final date = ts.toDate();
    return DateFormat.jm().format(date); // e.g. "8:45 PM"
  }

  @override
  Widget build(BuildContext context) {
    final myId = FirebaseAuth.instance.currentUser!.uid;
    final chatId = getChatId(myId, widget.otherUserId);
    final msgsQuery = FirebaseFirestore.instance
        .collection('chats/$chatId/messages')
        .orderBy('timestamp', descending: true);

    // Mark any "sent" messages from other user as delivered (when I open chat)
    FirebaseFirestore.instance
        .collection('chats/$chatId/messages')
        .where('senderId', isEqualTo: widget.otherUserId)
        .where('status', isEqualTo: 'sent')
        .get()
        .then((snapshot) {
      for (var doc in snapshot.docs) {
        doc.reference.update({'status': 'delivered'});
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text("Chat")),
      body: Column(
        children: [
          // --- Messages List ---
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: msgsQuery.snapshots(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final msgs = snapshot.data!.docs;

                return ListView.builder(
                  reverse: true,
                  itemCount: msgs.length,
                  itemBuilder: (ctx, i) {
                    final msg = msgs[i];
                    final isMe = msg['senderId'] == myId;
                    final text = msg['text'] ?? '';
                    final status = msg['status'] ?? 'sent';
                    final timestamp = msg['timestamp'] as Timestamp?;
                    final timeLabel = formatTime(timestamp);

                    // If I saw their messages, mark as read
                    if (!isMe && status != 'read') {
                      msg.reference.update({'status': 'read'});
                    }

                    return Align(
                      alignment:
                          isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(
                            vertical: 4, horizontal: 8),
                        padding: const EdgeInsets.all(10),
                        constraints: BoxConstraints(
                          maxWidth:
                              MediaQuery.of(context).size.width * 0.7, // bubble width
                        ),
                        decoration: BoxDecoration(
                          color: isMe ? Colors.teal[200] : Colors.grey[300],
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(12),
                            topRight: const Radius.circular(12),
                            bottomLeft:
                                isMe ? const Radius.circular(12) : Radius.zero,
                            bottomRight:
                                isMe ? Radius.zero : const Radius.circular(12),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: isMe
                              ? CrossAxisAlignment.end
                              : CrossAxisAlignment.start,
                          children: [
                            Text(
                              text,
                              style: const TextStyle(fontSize: 16),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  timeLabel,
                                  style: const TextStyle(
                                      fontSize: 10, color: Colors.black54),
                                ),
                                if (isMe) ...[
                                  const SizedBox(width: 4),
                                  Icon(
                                    status == 'sent'
                                        ? Icons.check // one tick
                                        : Icons.done_all, // double tick
                                    size: 14,
                                    color: status == 'read'
                                        ? Colors.blue
                                        : Colors.black54,
                                  ),
                                ],
                              ],
                            )
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // --- Input ---
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: msgCtrl,
                      decoration: const InputDecoration(
                        hintText: "Type a message...",
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(20)),
                        ),
                        contentPadding: EdgeInsets.symmetric(
                            vertical: 10, horizontal: 15),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white),
                      onPressed: () async {
                        if (msgCtrl.text.trim().isEmpty) return;
                        await FirebaseFirestore.instance
                            .collection('chats/$chatId/messages')
                            .add({
                          'text': msgCtrl.text.trim(),
                          'senderId': myId,
                          'timestamp': FieldValue.serverTimestamp(),
                          'status': 'sent', // initially sent
                        });
                        msgCtrl.clear();
                      },
                    ),
                  )
                ],
              ),
            ),
          )
        ],
      ),
    );
  }
}