import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';

class ChatScreen extends StatefulWidget {
  final String otherUserId;
  const ChatScreen(this.otherUserId, {super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController msgCtrl = TextEditingController();

  @override
  void dispose() {
    msgCtrl.dispose();
    super.dispose();
  }

  String getChatId(String uid1, String uid2) =>
      uid1.hashCode <= uid2.hashCode ? "$uid1-$uid2" : "$uid2-$uid1";

  String _formatTime(Timestamp? ts) {
    if (ts == null) return "";
    final date = ts.toDate();
    return DateFormat.jm().format(date);
  }

  @override
  Widget build(BuildContext context) {
    final myId = FirebaseAuth.instance.currentUser!.uid;
    final chatId = getChatId(myId, widget.otherUserId);

    final messagesRef = FirebaseFirestore.instance
        .collection('chats/$chatId/messages')
        .orderBy('timestamp', descending: true);

    // ✅ Mark "sent" → "delivered"
    FirebaseFirestore.instance
        .collection('chats/$chatId/messages')
        .where('senderId', isEqualTo: widget.otherUserId)
        .where('status', isEqualTo: 'sent')
        .get()
        .then((snap) {
      for (final doc in snap.docs) {
        doc.reference.update({'status': 'delivered'});
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text("Chat")),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: messagesRef.snapshots(),
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
                    final String text = msg['text'] ?? '';
                    final String status = msg['status'] ?? 'sent';
                    final Timestamp? ts = msg['timestamp'] as Timestamp?;
                    final timeLabel = _formatTime(ts);

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
                              MediaQuery.of(context).size.width * 0.7,
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
                            Text(text,
                                style: const TextStyle(fontSize: 16)),
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
                                        ? Icons.check
                                        : Icons.done_all,
                                    size: 14,
                                    color: status == 'read'
                                        ? Colors.blue
                                        : Colors.black54,
                                  ),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Input
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8),
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
                        contentPadding:
                            EdgeInsets.symmetric(vertical: 10, horizontal: 15),
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
                          'status': 'sent',
                        });
                        msgCtrl.clear();
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}