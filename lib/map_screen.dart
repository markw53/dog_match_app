import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';
import 'package:http/http.dart' as http;

import 'chat_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  Set<Marker> _markers = {};
  double _searchRadiusKm = 20;

  @override
  void initState() {
    super.initState();
    _loadCurrentPosition();
  }

  Future<void> _loadCurrentPosition() async {
    final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    setState(() {
      _currentPosition = pos;
    });
    _loadDogs();
  }

  /// Convert image from URL into a round marker icon
  Future<BitmapDescriptor> _getImageMarker(String imageUrl,
      {int size = 120}) async {
    try {
      final response = await http.get(Uri.parse(imageUrl));
      if (response.statusCode != 200) {
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
      }

      final bytes = response.bodyBytes;
      final codec = await ui.instantiateImageCodec(bytes,
          targetWidth: size, targetHeight: size);
      final fi = await codec.getNextFrame();
      final roundedRecorder = ui.PictureRecorder();
      final canvas = Canvas(roundedRecorder);
      final paint = Paint();
      final imageSize = size.toDouble();

      // Draw circular profile image
      final rect = Rect.fromLTWH(0, 0, imageSize, imageSize);
      paint.isAntiAlias = true;
      final clipPath = Path()
        ..addOval(Rect.fromCircle(
            center: Offset(imageSize / 2, imageSize / 2),
            radius: imageSize / 2));
      canvas.clipPath(clipPath);
      canvas.drawImageRect(
          fi.image,
          Rect.fromLTWH(0, 0, fi.image.width.toDouble(),
              fi.image.height.toDouble()),
          rect,
          paint);

      final picture = roundedRecorder.endRecording();
      final img = await picture.toImage(size, size);
      final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
      final uint8List = byteData!.buffer.asUint8List();

      return BitmapDescriptor.fromBytes(uint8List);
    } catch (e) {
      debugPrint("❌ Error loading marker image: $e");
      return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
    }
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

    stream.listen((docs) async {
      Set<Marker> newMarkers = {};
      for (var d in docs) {
        final data = d.data()! as Map<String, dynamic>;
        if (data['position']?['geopoint'] != null) {
          final gp = data['position']['geopoint'] as GeoPoint;

          BitmapDescriptor icon;
          if (data['photoUrl'] != null && data['photoUrl'].toString().isNotEmpty) {
            icon = await _getImageMarker(data['photoUrl']);
          } else {
            icon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
          }

          newMarkers.add(
            Marker(
              markerId: MarkerId(d.id),
              position: LatLng(gp.latitude, gp.longitude),
              icon: icon,
              infoWindow: InfoWindow(
                title: data['name'] ?? "Unknown",
                snippet: "${data['breed']} (${data['age']} yrs)",
                onTap: () {
                  final ownerId = data['ownerId'];
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ChatScreen(ownerId)),
                  );
                },
              ),
            ),
          );
        }
      }
      setState(() => _markers = newMarkers);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_currentPosition == null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Dogs on Map")),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text("Dogs on Map")),
      body: GoogleMap(
        initialCameraPosition: CameraPosition(
          target:
              LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
          zoom: 12,
        ),
        onMapCreated: (controller) => _mapController = controller,
        markers: _markers,
        myLocationEnabled: true,
      ),
    );
  }
}