import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final nameCtrl = TextEditingController();
  final breedCtrl = TextEditingController();
  final ageCtrl = TextEditingController();

  Future<void> _addDog() async {
    final uid = FirebaseAuth.instance.currentUser?.uid;
    if (uid == null) return;

    await FirebaseFirestore.instance.collection('dogs').add({
      'ownerId': uid,
      'name': nameCtrl.text.trim(),
      'breed': breedCtrl.text.trim(),
      'age': int.tryParse(ageCtrl.text.trim()) ?? 0,
      'createdAt': FieldValue.serverTimestamp(),
    });
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text("Dog added!")));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Dog Profiles"), actions: [
        IconButton(
          icon: Icon(Icons.logout),
          onPressed: () async {
            await FirebaseAuth.instance.signOut();
          },
        )
      ]),
      body: Column(
        children: [
          TextField(controller: nameCtrl, decoration: InputDecoration(labelText: 'Name')),
          TextField(controller: breedCtrl, decoration: InputDecoration(labelText: 'Breed')),
          TextField(controller: ageCtrl, decoration: InputDecoration(labelText: 'Age')),
          ElevatedButton(onPressed: _addDog, child: Text("Add Dog")),
          Expanded(
            child: StreamBuilder(
              stream: FirebaseFirestore.instance.collection('dogs').snapshots(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) return Center(child: CircularProgressIndicator());
                final dogs = snapshot.data!.docs;
                return ListView.builder(
                  itemCount: dogs.length,
                  itemBuilder: (ctx, i) {
                    var dog = dogs[i];
                    return ListTile(
                      title: Text(dog['name']),
                      subtitle: Text("${dog['breed']} (${dog['age']} yrs)"),
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