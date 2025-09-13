import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';
import 'package:geolocator/geolocator.dart';

import 'chat_screen.dart';
import 'location_service.dart'; // ✅ reuse LocationService

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  Set<Marker> _markers = {};
  final double _searchRadiusKm = 20;
  
  @override
  void initState() {
    super.initState();
    _loadCurrentPosition();
  }

  Future<void> _loadCurrentPosition() async {
    final pos = await LocationService.getCurrentPosition();
    setState(() => _currentPosition = pos);
    _loadDogs();
  }

  /// Convert dog photo into circular marker
  Future<BitmapDescriptor> _getImageMarker(String imageUrl,
      {int size = 120}) async {
    try {
      final response = await http.get(Uri.parse(imageUrl));
      if (response.statusCode != 200) {
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
      }

      final bytes = response.bodyBytes;
      final codec = await ui.instantiateImageCodec(
        bytes,
        targetWidth: size,
        targetHeight: size,
      );
      final fi = await codec.getNextFrame();

      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);
      final paint = Paint();
      final rect = Rect.fromLTWH(0, 0, size.toDouble(), size.toDouble());

      final clipPath = Path()
        ..addOval(Rect.fromCircle(center: Offset(size / 2, size / 2), radius: size / 2));
      canvas.clipPath(clipPath);
      canvas.drawImageRect(
        fi.image,
        Rect.fromLTWH(0, 0, fi.image.width.toDouble(), fi.image.height.toDouble()),
        rect,
        paint,
      );

      final pic = recorder.endRecording();
      final img = await pic.toImage(size, size);
      final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
      return BitmapDescriptor.bytes(byteData!.buffer.asUint8List());
    } catch (_) {
      return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure);
    }
  }

  /// Load dogs near my location and create markers
  Future<void> _loadDogs() async {
    if (_currentPosition == null) return;

    final center = GeoFirePoint(
        GeoPoint(_currentPosition!.latitude, _currentPosition!.longitude));
    final colRef = FirebaseFirestore.instance.collection('dogs');

    final stream = GeoCollectionReference(colRef).subscribeWithin(
      center: center,
      radiusInKm: _searchRadiusKm,
      field: 'position',
      geopointFrom: (doc) => (doc['position']['geopoint'] as GeoPoint),
    );

    stream.listen((docs) async {
      final newMarkers = <Marker>{};
      for (final d in docs) {
        final data = d.data()!;
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

  /// 🛰 Recenter button
  Future<void> _recenter() async {
    final pos = await LocationService.getCurrentPosition();
    _mapController?.animateCamera(
      CameraUpdate.newLatLngZoom(
        LatLng(pos.latitude, pos.longitude),
        14,
      ),
    );
  }

  /// 🐾 Fit-to-Dogs button
  Future<void> _fitToDogs() async {
    if (_markers.isEmpty || _mapController == null) return;

    final bounds = _boundsFromMarkers(_markers);
    _mapController?.animateCamera(CameraUpdate.newLatLngBounds(bounds, 50));
  }

  /// Create LatLngBounds from markers
  LatLngBounds _boundsFromMarkers(Set<Marker> markers) {
    final latitudes = markers.map((m) => m.position.latitude).toList();
    final longitudes = markers.map((m) => m.position.longitude).toList();

    final southwest = LatLng(
      latitudes.reduce((a, b) => a < b ? a : b),
      longitudes.reduce((a, b) => a < b ? a : b),
    );
    final northeast = LatLng(
      latitudes.reduce((a, b) => a > b ? a : b),
      longitudes.reduce((a, b) => a > b ? a : b),
    );

    return LatLngBounds(southwest: southwest, northeast: northeast);
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
          target: LatLng(
            _currentPosition!.latitude,
            _currentPosition!.longitude,
          ),
          zoom: 12,
        ),
        onMapCreated: (controller) => _mapController = controller,
        markers: _markers,
        myLocationEnabled: true,
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          FloatingActionButton(
            heroTag: "recenterBtn",
            onPressed: _recenter,
            backgroundColor: Colors.teal,
            child: const Icon(Icons.my_location, color: Colors.white),
          ),
          const SizedBox(height: 10),
          FloatingActionButton(
            heroTag: "fitDogsBtn",
            onPressed: _fitToDogs,
            backgroundColor: Colors.deepOrange,
            child: const Icon(Icons.fullscreen, color: Colors.white),
          ),
        ],
      ),
    );
  }
}