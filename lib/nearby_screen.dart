import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';
import 'package:http/http.dart' as http;
import 'package:google_maps_cluster_manager/google_maps_cluster_manager.dart'
    as gmc; // ✅ alias to avoid conflict

import 'chat_screen.dart';

/// ClusterItem representation for each dog
class DogItem with gmc.ClusterItem {
  final String id;
  final String ownerId;
  final String name;
  final String breed;
  final int age;
  final String? photoUrl;
  final LatLng latLng;

  DogItem({
    required this.id,
    required this.ownerId,
    required this.name,
    required this.breed,
    required this.age,
    this.photoUrl,
    required this.latLng,
  });

  @override
  LatLng get location => latLng;
}

class NearbyScreen extends StatefulWidget {
  const NearbyScreen({super.key});

  @override
  State<NearbyScreen> createState() => _NearbyScreenState();
}

class _NearbyScreenState extends State<NearbyScreen>
    with SingleTickerProviderStateMixin {
  double _searchRadiusKm = 20;
  Position? _currentPosition;

  // ✅ Use final for lists that are initialized once and mutated later
  final List<DogItem> _dogs = [];
  final List<String> _selectedBreeds = []; // filter breeds

  GoogleMapController? _mapController;
  Set<Marker> _markers = {};
  late final gmc.ClusterManager<DogItem> _clusterManager; // ✅ make final

  // ✅ Mark const lists as final
  final List<String> _allBreeds = [
    "Labrador",
    "Golden Retriever",
    "Husky",
    "Beagle",
    "Bulldog",
    "Poodle",
  ];

  @override
  void initState() {
    super.initState();
    _clusterManager = gmc.ClusterManager<DogItem>(
      [],
      _updateMarkers,
      markerBuilder: _markerBuilder,
      stopClusteringZoom: 17,
    );
    _loadLocation();
  }

  Future<void> _loadLocation() async {
    final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    setState(() => _currentPosition = pos);
    _loadDogs();
  }

  Future<void> _loadDogs() async {
    if (_currentPosition == null) return;
    final center = GeoFirePoint(
        GeoPoint(_currentPosition!.latitude, _currentPosition!.longitude));
    final colRef = FirebaseFirestore.instance.collection('dogs');

    final stream = GeoCollectionReference(colRef).within(
      center: center,
      radiusInKm: _searchRadiusKm,
      field: 'position',
    );

    stream.listen((docs) {
      final items = docs.map((d) {
        final data = d.data()! as Map<String, dynamic>;
        final gp = data['position']['geopoint'] as GeoPoint;
        return DogItem(
          id: d.id,
          ownerId: data['ownerId'],
          name: data['name'] ?? "Unknown",
          breed: data['breed'] ?? "Unknown",
          age: (data['age'] ?? 0) as int,
          photoUrl: data['photoUrl'],
          latLng: LatLng(gp.latitude, gp.longitude),
        );
      }).toList();

      // Apply breed filter (if any)
      final filtered = _selectedBreeds.isEmpty
          ? items
          : items.where((dog) => _selectedBreeds.contains(dog.breed)).toList();

      setState(() {
        _dogs
          ..clear()
          ..addAll(filtered);
      });
      _clusterManager.setItems(filtered);
    });
  }

  void _updateMarkers(Set<Marker> m) => setState(() => _markers = m);

  Future<Marker> Function(gmc.Cluster<DogItem>) get _markerBuilder =>
      (cluster) async {
        if (cluster.isMultiple) {
          return Marker(
            markerId: MarkerId(cluster.getId()),
            position: cluster.location,
            icon: await _createClusterIcon(cluster.count),
            onTap: () {
              _mapController?.animateCamera(CameraUpdate.newLatLngZoom(
                  cluster.location, _mapController!.cameraPosition.zoom + 2));
            },
          );
        } else {
          final dog = cluster.items.first;
          BitmapDescriptor icon = BitmapDescriptor.defaultMarker;
          if (dog.photoUrl != null) {
            icon = await _getImageMarker(dog.photoUrl!);
          }
          return Marker(
            markerId: MarkerId(dog.id),
            position: dog.latLng,
            icon: icon,
            infoWindow: InfoWindow(
              title: dog.name,
              snippet: "${dog.breed} (${dog.age} yrs)",
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ChatScreen(dog.ownerId)),
                );
              },
            ),
          );
        }
      };

  Future<BitmapDescriptor> _getImageMarker(String url,
      {int size = 120}) async {
    try {
      final response = await http.get(Uri.parse(url));
      if (response.statusCode != 200) {
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
      }
      final bytes = response.bodyBytes;
      final codec = await ui.instantiateImageCodec(bytes,
          targetWidth: size, targetHeight: size);
      final fi = await codec.getNextFrame();
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      final paint = Paint();
      final rect = Rect.fromLTWH(0, 0, size.toDouble(), size.toDouble());

      final clipPath = Path()
        ..addOval(Rect.fromCircle(
            center: Offset(size / 2, size / 2), radius: size / 2));
      canvas.clipPath(clipPath);
      canvas.drawImageRect(fi.image,
          Rect.fromLTWH(0, 0, fi.image.width.toDouble(),
              fi.image.height.toDouble()), rect, paint);
      final pic = recorder.endRecording();
      final img = await pic.toImage(size, size);
      final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
      return BitmapDescriptor.fromBytes(byteData!.buffer.asUint8List());
    } catch (_) {
      return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
    }
  }

  Future<BitmapDescriptor> _createClusterIcon(int count) async {
    const size = 150;
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final paint = Paint()..color = Colors.teal;

    final textPainter = TextPainter(
      text: TextSpan(
          text: count.toString(),
          style: const TextStyle(fontSize: 48, color: Colors.white)),
      textDirection: TextDirection.ltr,
    );

    canvas.drawCircle(const Offset(size / 2, size / 2), size / 2.0, paint);
    textPainter.layout();
    textPainter.paint(canvas, Offset((size - textPainter.width) / 2,
        (size - textPainter.height) / 2));
    final img = await recorder.endRecording().toImage(size, size);
    final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
    return BitmapDescriptor.fromBytes(byteData!.buffer.asUint8List());
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text("Discover Nearby Dogs"), // const fixes lint
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.list), text: "List"),
              Tab(icon: Icon(Icons.map), text: "Map"),
            ],
          ),
        ),
        body: Column(
          children: [
            // ✅ Slider + Breed Filter chips
            Padding(
              padding: const EdgeInsets.all(10),
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
                      _loadDogs();
                    },
                  ),
                  Wrap(
                    spacing: 8,
                    children: _allBreeds.map((breed) {
                      final isSelected = _selectedBreeds.contains(breed);
                      return FilterChip(
                        label: Text(breed),
                        selected: isSelected,
                        onSelected: (sel) {
                          setState(() {
                            if (sel) {
                              _selectedBreeds.add(breed);
                            } else {
                              _selectedBreeds.remove(breed);
                            }
                          });
                          _loadDogs();
                        },
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            Expanded(
              child: TabBarView(
                children: [
                  // --- LIST TAB ---
                  _currentPosition == null
                      ? const Center(child: CircularProgressIndicator())
                      : ListView.builder(
                          itemCount: _dogs.length,
                          itemBuilder: (ctx, i) {
                            final dog = _dogs[i];
                            final distance = Geolocator.distanceBetween(
                                    _currentPosition!.latitude,
                                    _currentPosition!.longitude,
                                    dog.latLng.latitude,
                                    dog.latLng.longitude) /
                                1000.0;
                            return ListTile(
                              leading: dog.photoUrl != null
                                  ? CircleAvatar(
                                      backgroundImage:
                                          NetworkImage(dog.photoUrl!))
                                  : const CircleAvatar(child: Icon(Icons.pets)),
                              title: Text(dog.name),
                              subtitle: Text(
                                  "${dog.breed} (${dog.age} yrs) • ${distance.toStringAsFixed(1)} km away"),
                              trailing: const Icon(Icons.message),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (_) => ChatScreen(dog.ownerId)),
                                );
                              },
                            );
                          },
                        ),

                  // --- MAP TAB ---
                  _currentPosition == null
                      ? const Center(child: CircularProgressIndicator())
                      : GoogleMap(
                          initialCameraPosition: CameraPosition(
                            target: LatLng(_currentPosition!.latitude,
                                _currentPosition!.longitude),
                            zoom: 12,
                          ),
                          onMapCreated: (controller) {
                            _mapController = controller;
                            _clusterManager.setMapId(controller.mapId);
                          },
                          markers: _markers,
                          myLocationEnabled: true,
                          onCameraMove: _clusterManager.onCameraMove,
                          onCameraIdle: _clusterManager.updateMap,
                        ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}