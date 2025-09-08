import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:google_maps_cluster_manager/google_maps_cluster_manager.dart';

class DogItem with ClusterItem {
  final String id;
  final String name;
  final String breed;
  final int age;
  final String? photoUrl;
  final LatLng latLng;
  final String ownerId;

  DogItem({
    required this.id,
    required this.name,
    required this.breed,
    required this.age,
    this.photoUrl,
    required this.latLng,
    required this.ownerId,
  });

  @override
  LatLng get location => latLng;
}