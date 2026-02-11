import axios from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View, Platform } from 'react-native';

// Only import react-native-maps on native platforms
let MapView: any;
let Marker: any;
let Callout: any;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Callout = Maps.Callout;
}

export default function NearbyStylists() {
  const [location, setLocation] = useState<any>(null);
  const [stylists, setStylists] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc.coords);

        const res = await axios.get(
          `https://gloweazy-backend.onrender.com/stylists/nearby?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`
        );
        setStylists(res.data);
      } catch (err) {
        console.error('Error fetching nearby stylists:', err);
        setError('Failed to load stylists');
      }
    })();
  }, []);

  // Web placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webPlaceholder}>
          <Text style={styles.webTitle}>📍 Nearby Stylists</Text>
          <Text style={styles.webText}>
            Map view is not available on web.{'\n'}
            Please use the mobile app to see stylists on a map.
          </Text>
          {stylists.length > 0 && (
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>Nearby Stylists:</Text>
              {stylists.map((s) => (
                <View key={s._id} style={styles.stylistItem}>
                  <Text style={styles.stylistName}>{s.name}</Text>
                  <Text style={styles.stylistServices}>{s.services?.join(', ')}</Text>
                  <Button title="Book Now" onPress={() => router.push(`/stylist/${s._id}`)} />
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!location) return <Text style={styles.loading}>Loading map...</Text>;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Client marker */}
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You are here"
          pinColor="blue"
        />

        {/* Stylist markers with popup */}
        {stylists.map((s) => (
          <Marker
            key={s._id}
            coordinate={{
              latitude: s.location.coordinates[1],
              longitude: s.location.coordinates[0],
            }}
            pinColor="red"
          >
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.services}>{s.services.join(', ')}</Text>
                <Button
                  title="Book Now"
                  onPress={() => router.push(`/stylist/${s._id}`)}
                />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 16 },
  error: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red' },
  callout: { width: 200, padding: 10, backgroundColor: '#fff', borderRadius: 8 },
  name: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  services: { fontSize: 14, marginBottom: 8 },
  // Web styles
  webPlaceholder: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F7',
  },
  webTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  webText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  listContainer: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  stylistItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stylistName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stylistServices: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
});
