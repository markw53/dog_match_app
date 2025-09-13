import 'package:geolocator/geolocator.dart';
import 'package:geoflutterfire_plus/geoflutterfire_plus.dart';
import 'package:cloud_firestore/cloud_firestore.dart'; // ✅ GeoPoint comes from here

class LocationService {
  /// Request permissions & return current position
  static Future<Position> getCurrentPosition() async {
    final permission = await Geolocator.requestPermission();
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      throw Exception("❌ Location permission denied. Enable it in settings.");
    }

    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
    return pos;
  }

  /// Return current location as a Firestore-compatible GeoFirePoint
  static Future<GeoFirePoint> getCurrentGeoPoint() async {
    final pos = await getCurrentPosition();
    return GeoFirePoint(GeoPoint(pos.latitude, pos.longitude)); // ✅ works
  }

  /// Calculate distance between two GeoPoints in km
  static double distanceBetween(GeoPoint from, GeoPoint to) {
    final dist = Geolocator.distanceBetween(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );
    return dist / 1000.0; // convert to km
  }
}