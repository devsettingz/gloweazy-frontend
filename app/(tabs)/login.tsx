import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth, User } from '../../context/AuthContext';
import { login as apiLogin } from '../../utils/api';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async (): Promise<void> => {
    try {
      const user: User = await apiLogin({ email, password });
      await login(user);

      if (user.role === 'stylist') {
        router.replace('/stylist-bookings');
      } else {
        router.replace('/client-bookings');
      }
    } catch (err: any) {
      Alert.alert('Login failed', String(err?.message || err?.response?.data?.message || 'Invalid credentials'));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(text) => setEmail(text ?? '')}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(text) => setPassword(text ?? '')}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />

      <View style={styles.links}>
        <Button title="Sign Up" onPress={() => router.push('/signup')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 30, textAlign: 'center' },
  input: {
    backgroundColor: '#222',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16
  },
  links: { marginTop: 20, gap: 15 }
});
