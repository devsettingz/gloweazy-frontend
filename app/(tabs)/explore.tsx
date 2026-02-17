import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Stylist = {
  _id: string;
  name: string;
  specialty: string[];
  rating: number;
  profileImage?: string;
};

export default function ExploreScreen() {
  const router = useRouter();
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const res = await axios.get('https://gloweazy-backend.onrender.com/stylists/search');
        // ✅ handle both possible response shapes
        const data = res.data.stylists ?? res.data;
        setStylists(data);
      } catch (err) {
        console.error('Error fetching stylists:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStylists();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Explore Stylists 💇🏽‍♀️</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#E75480" />
      ) : stylists.length === 0 ? (
        <Text style={styles.subtitle}>No stylists available</Text>
      ) : (
        stylists.map((s) => (
          <View key={s._id} style={styles.card}>
            {s.profileImage && (
              <Image source={{ uri: s.profileImage }} style={styles.avatar} />
            )}
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardText}>Specialty: {s.specialty?.join(', ') || 'General'}</Text>
            <Text style={styles.cardText}>Rating: ⭐ {s.rating}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: '/book/[id]',
                  params: { id: s._id },
                })
              }
            >
              <Text style={styles.buttonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFFFFF' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F2F2F7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#E75480', marginBottom: 8 },
  cardText: { color: '#2C2C2C', fontSize: 14 },
  button: {
    backgroundColor: '#E75480',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
