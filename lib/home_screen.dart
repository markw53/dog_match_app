import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';

import 'chat_screen.dart';
import 'location_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextEditingController nameCtrl = TextEditingController();
  final TextEditingController breedCtrl = TextEditingController();
  final TextEditingController ageCtrl = TextEditingController();
  File? _pickedImage;

  double _searchRadiusKm = 20;
  GeoPoint? _currentGeo; // ✅ Firestore GeoPoint

  @override
  void dispose() {
    nameCtrl.dispose();
    breedCtrl.dispose();
    ageCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 70);
    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

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

    final geoFirePoint = await LocationService.getCurrentGeoPoint();

    await FirebaseFirestore.instance.collection('dogs').add({
      'ownerId': uid,
      'name': nameCtrl.text.trim(),
      'breed': breedCtrl.text.trim(),
      'age': int.tryParse(ageCtrl.text.trim()) ?? 0,
      'photoUrl': imageUrl,
      'position': geoFirePoint.data, // ✅ correct
      'createdAt': FieldValue.serverTimestamp(),
    });

    setState(() {
      _pickedImage = null;
      nameCtrl.clear();
      breedCtrl.clear();
      ageCtrl.clear();
      _currentGeo = geoFirePoint.data['geopoint'] as GeoPoint; // ✅ fix
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("✅ Dog profile added")),
    );
  }

  Stream<List<DocumentSnapshot>> _geoQueryNearbyDogs() async* {
    final pos = await LocationService.getCurrentPosition();
    final userGeo = GeoPoint(pos.latitude, pos.longitude);
    setState(() => _currentGeo = userGeo);

    final collectionRef = FirebaseFirestore.instance.collection('dogs');

    yield* GeoCollectionReference(collectionRef).subscribeWithin(
      center: GeoFirePoint(userGeo),
      radiusInKm: _searchRadiusKm,
      field: 'position',
      geopointFrom: (doc) => (doc['position']['geopoint'] as GeoPoint), // ✅ FIX
    );
  }

  double _calculateDistance(GeoPoint dogPoint) {
    if (_currentGeo == null) return 0;
    return LocationService.distanceBetween(_currentGeo!, dogPoint);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Nearby Dogs"),
        actions: [
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
          // ✅ Search radius slider
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              children: [
                Text("Search Radius: ${_searchRadiusKm.toStringAsFixed(0)} km"),
                Slider(
                  min: 1,
                  max: 100,
                  divisions: 99,
                  value: _searchRadiusKm,
                  label: "${_searchRadiusKm.toStringAsFixed(0)} km",
                  onChanged: (val) {
                    setState(() => _searchRadiusKm = val);
                  },
                ),
              ],
            ),
          ),

          // ✅ Add Dog Form
          ExpansionTile(
            title: const Text("Add Dog"),
            children: [
              TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(labelText: 'Name')),
              TextField(
                  controller: breedCtrl,
                  decoration: const InputDecoration(labelText: 'Breed')),
              TextField(
                  controller: ageCtrl,
                  decoration: const InputDecoration(labelText: 'Age')),
              const SizedBox(height: 8),
              if (_pickedImage != null) Image.file(_pickedImage!, height: 100),
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
              ElevatedButton(
                  onPressed: _addDog, child: const Text("Add Dog")),
            ],
          ),

          const Divider(),

          // ✅ Stream of Dogs Nearby
          Expanded(
            child: StreamBuilder<List<DocumentSnapshot>>(
              stream: _geoQueryNearbyDogs(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }
                final dogs = snapshot.data!;
                if (dogs.isEmpty) {
                  return const Center(child: Text("🐾 No dogs nearby"));
                }
                return ListView.builder(
                  itemCount: dogs.length,
                  itemBuilder: (ctx, i) {
                    final data = dogs[i].data()! as Map<String, dynamic>;
                    final dogPoint = data['position']['geopoint'] as GeoPoint;
                    final distKm = _calculateDistance(dogPoint);

                    return ListTile(
                      leading: data['photoUrl'] != null
                          ? CircleAvatar(
                              backgroundImage: NetworkImage(data['photoUrl']))
                          : const CircleAvatar(child: Icon(Icons.pets)),
                      title: Text(data['name']),
                      subtitle: Text(
                          "${data['breed']} (${data['age']} yrs) • ${distKm.toStringAsFixed(1)} km away"),
                      trailing: IconButton(
                        icon: const Icon(Icons.message),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (ctx) =>
                                    ChatScreen(data['ownerId'])),
                          );
                        },
                      ),
                    );
                  },
                );
              },
            ),
          )
        ],
      ),
    );
  }
}