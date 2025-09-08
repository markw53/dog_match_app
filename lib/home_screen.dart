import 'dart:io';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import 'chat_screen.dart';
import 'matches_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final nameCtrl = TextEditingController();
  final breedCtrl = TextEditingController();
  final ageCtrl = TextEditingController();
  File? _pickedImage;

  // --- Pick Image from Gallery ---
  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 70);

    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  // --- Add Dog Profile to Firestore ---
  Future<void> _addDog() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    String? imageUrl;
    if (_pickedImage != null) {
      final storageRef = FirebaseStorage.instance
          .ref()
          .child('dog_images')
          .child('${DateTime.now().millisecondsSinceEpoch}.jpg');
      await storageRef.putFile(_pickedImage!);
      imageUrl = await storageRef.getDownloadURL();
    }

    await FirebaseFirestore.instance.collection('dogs').add({
      'ownerId': uid,
      'name': nameCtrl.text.trim(),
      'breed': breedCtrl.text.trim(),
      'age': int.tryParse(ageCtrl.text.trim()) ?? 0,
      'photoUrl': imageUrl,
      'createdAt': FieldValue.serverTimestamp(),
    });

    setState(() {
      _pickedImage = null;
      nameCtrl.clear();
      breedCtrl.clear();
      ageCtrl.clear();
    });

    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text("Dog added!")));
  }

  // --- Like a Dog & Check for Mutual Match ---
  Future<void> _likeDog(String dogId, String ownerId) async {
    final uid = FirebaseAuth.instance.currentUser!.uid;
    final likesRef = FirebaseFirestore.instance.collection('likes');
    final matchesRef = FirebaseFirestore.instance.collection('matches');

    // Save like
    await likesRef.add({
      'likerId': uid,
      'likedDogId': dogId,
      'dogOwnerId': ownerId,
      'createdAt': FieldValue.serverTimestamp(),
    });

    // Get my dogs
    // final myDogs = await FirebaseFirestore.instance
    //     .collection('dogs')
    //     .where('ownerId', isEqualTo: uid)
    //     .get();
    // final myDogIds = myDogs.docs.map((d) => d.id).toList();

    // Did the other user like one of my dogs?
    final mutual = await likesRef
        .where('likerId', isEqualTo: ownerId)
        .where('dogOwnerId', isEqualTo: uid)
        .get();

    if (mutual.docs.isNotEmpty) {
      // Create Match
      await matchesRef.add({
        'users': [uid, ownerId],
        'dogIds': [dogId, mutual.docs.first['likedDogId']],
        'createdAt': FieldValue.serverTimestamp(),
      });

      // ✅ Only show Snackbar if this widget is still mounted
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("🎉 It's a Match! You can now chat.")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final uid = FirebaseAuth.instance.currentUser!.uid;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Dog Profiles"),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite), // ❤️ Matches button
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (ctx) => const MatchesScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await FirebaseAuth.instance.signOut();
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // --- Add Dog Form ---
          ExpansionTile(
            title: const Text("Add Dog"),
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name')),
              TextField(controller: breedCtrl, decoration: const InputDecoration(labelText: 'Breed')),
              TextField(controller: ageCtrl, decoration: const InputDecoration(labelText: 'Age')),
              const SizedBox(height: 8),
              if (_pickedImage != null)
                Image.file(_pickedImage!, height: 100),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  TextButton.icon(
                    onPressed: () => _pickImage(ImageSource.gallery),
                    icon: const Icon(Icons.photo),
                    label: const Text("Gallery"),
                  ),
                  const SizedBox(width: 16),
                  TextButton.icon(
                    onPressed: () => _pickImage(ImageSource.camera),
                    icon: const Icon(Icons.camera_alt),
                    label: const Text("Camera"),
                  ),
                ],
              ),
              ElevatedButton(onPressed: _addDog, child: const Text("Add Dog")),
            ],
          ),

          const Divider(),

          // --- Dog Profiles List ---
          Expanded(
            child: StreamBuilder<QuerySnapshot>(
              stream: FirebaseFirestore.instance
                  .collection('dogs')
                  .orderBy('createdAt', descending: true)
                  .snapshots(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final dogs = snapshot.data!.docs;

                return ListView.builder(
                  itemCount: dogs.length,
                  itemBuilder: (ctx, i) {
                    final dog = dogs[i];
                    final ownerId = dog['ownerId'];
                    return ListTile(
                      leading: dog['photoUrl'] != null
                          ? CircleAvatar(backgroundImage: NetworkImage(dog['photoUrl']))
                          : const CircleAvatar(child: Icon(Icons.pets)),
                      title: Text(dog['name']),
                      subtitle: Text("${dog['breed']} (${dog['age']} yrs)"),

                      // Buttons (Like + Chat if matched)
                      trailing: FutureBuilder<QuerySnapshot>(
                        future: FirebaseFirestore.instance
                            .collection('matches')
                            .where('users', arrayContains: uid)
                            .get(),
                        builder: (ctx, snap) {
                          if (!snap.hasData) return const SizedBox.shrink();
                          final isMatched = snap.data!.docs.any((doc) {
                            final users = List.from(doc['users']);
                            return users.contains(ownerId);
                          });

                          return Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.favorite_border),
                                onPressed: () => _likeDog(dog.id, ownerId),
                              ),
                              if (isMatched)
                                IconButton(
                                  icon: const Icon(Icons.message),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (ctx) => ChatScreen(ownerId),
                                      ),
                                    );
                                  },
                                ),
                            ],
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}