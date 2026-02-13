import axios from 'axios';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext'; // ✅ fixed path

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth(); // ✅ get user ID for backend

  const handleProfileSetup = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://gloweazy-backend.onrender.com/auth/profile', {
        id: user?.id,
        name,
        phone,
        businessName,
        bio,
      });

      Alert.alert('Success', String(res.data.message || 'Profile setup complete'));
      setName('');
      setPhone('');
      setBusinessName('');
      setBio('');
      router.replace('/(tabs)/client-dashboard'); // ✅ navigate to client dashboard
    } catch (err: any) {
      const errorMsg = String(err?.response?.data?.message || 'Profile setup failed');
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Setup</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#aaa"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Business Name (for stylists)"
            placeholderTextColor="#aaa"
            value={businessName}
            onChangeText={setBusinessName}
          />
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Short Bio"
            placeholderTextColor="#aaa"
            value={bio}
            onChangeText={setBio}
            multiline
          />
          <Button title="Save Profile" onPress={handleProfileSetup} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 24, marginBottom: 20, color: 'white', textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#555',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'white',
    backgroundColor: '#222',
  },
});
