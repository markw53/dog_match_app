import 'dart:io';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';

import 'chat_screen.dart'; // Your ChatScreen implementation

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

  double _searchRadiusKm = 20; // default radius
  Position? _currentPosition; // cache current location

  // --- Pick image (gallery/camera) ---
  Future<void> _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: source, imageQuality: 70);
    if (picked != null) {
      setState(() => _pickedImage = File(picked.path));
    }
  }

  // --- Get current location ---
  Future<GeoFirePoint> _getCurrentLocation() async {
    LocationPermission permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception("Location permission denied. Please enable it.");
    }
    final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    _currentPosition = pos; // save to state
    return GeoFirePoint(GeoPoint(pos.latitude, pos.longitude));
  }

  // --- Add Dog ---
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

    final geoPoint = await _getCurrentLocation();

    await FirebaseFirestore.instance.collection('dogs').add({
      'ownerId': uid,
      'name': nameCtrl.text.trim(),
      'breed': breedCtrl.text.trim(),
      'age': int.tryParse(ageCtrl.text.trim()) ?? 0,
      'photoUrl': imageUrl,
      'position': geoPoint.data, // 👈 geohash + geopoint
      'createdAt': FieldValue.serverTimestamp(),
    });

    setState(() {
      _pickedImage = null;
      nameCtrl.clear();
      breedCtrl.clear();
      ageCtrl.clear();
    });

    if (!mounted) return;
    ScaffoldMessenger.of(context)
        .showSnackBar(const SnackBar(content: Text("✅ Dog profile added")));
  }

  // --- Geo Query ---
  Stream<List<DocumentSnapshot>> _geoQueryNearbyDogs() async* {
    final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    _currentPosition = pos; // cache user location

    final center = GeoFirePoint(GeoPoint(pos.latitude, pos.longitude));
    final collectionRef = FirebaseFirestore.instance.collection('dogs');

    yield* GeoCollectionReference(collectionRef).subscribeWithin(
      center: center,
      radiusInKm: _searchRadiusKm,
      field: 'position',
      geopointFrom: (doc) => (doc['position']['geopoint'] as GeoPoint),
    );
  }

  // --- Calculate distance in km ---
  double _calculateDistance(GeoPoint dogPoint) {
    if (_currentPosition == null) return 0;
    final distanceInMeters = Geolocator.distanceBetween(
      _currentPosition!.latitude,
      _currentPosition!.longitude,
      dogPoint.latitude,
      dogPoint.longitude,
    );
    return distanceInMeters / 1000.0; // km
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Nearby Dogs"),
        actions: [
          IconButton(
            icon: const Icon(Icons.map),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (ctx) => const MapScreen()),
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
          // --- Radius Slider ---
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
                    setState(() {
                      _searchRadiusKm = val;
                    });
                  },
                ),
              ],
            ),
          ),

          // --- Add Dog Form ---
          ExpansionTile(
            title: const Text("Add Dog"),
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Name')),
              TextField(controller: breedCtrl, decoration: const InputDecoration(labelText: 'Breed')),
              TextField(controller: ageCtrl, decoration: const InputDecoration(labelText: 'Age')),
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
              ElevatedButton(onPressed: _addDog, child: const Text("Add Dog")),
            ],
          ),

          const Divider(),

          // --- Dogs Nearby ---
          Expanded(
            child: StreamBuilder<List<DocumentSnapshot>>(
              stream: _geoQueryNearbyDogs(),
              builder: (ctx, snapshot) {
                if (!snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator());
                }

                final dogs = snapshot.data!;
                if (dogs.isEmpty) {
                  return const Center(child: Text("🐾 No dogs found nearby"));
                }

                return ListView.builder(
                  itemCount: dogs.length,
                  itemBuilder: (ctx, i) {
                    final data = dogs[i].data()! as Map<String, dynamic>;
                    final ownerId = data['ownerId'];
                    final dogPoint = (data['position']['geopoint'] as GeoPoint);
                    final distanceKm = _calculateDistance(dogPoint);

                    return ListTile(
                      leading: data['photoUrl'] != null
                          ? CircleAvatar(backgroundImage: NetworkImage(data['photoUrl']))
                          : const CircleAvatar(child: Icon(Icons.pets)),
                      title: Text(data['name']),
                      subtitle: Text(
                          "${data['breed']} (${data['age']} yrs) • ${distanceKm.toStringAsFixed(1)} km away"),
                      trailing: IconButton(
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