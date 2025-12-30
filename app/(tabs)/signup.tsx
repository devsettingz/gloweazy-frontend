import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth, User } from '../../context/AuthContext';
import { signup as apiSignup } from '../../utils/api';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'client' | 'stylist'>('client');

  const handleSignup = async (): Promise<void> => {
    try {
      const user: User = await apiSignup({ email, password, role });
      await login(user);

      // 🚀 Redirect to profile setup
      router.replace('/profile-setup');
    } catch (err: any) {
      Alert.alert(
        'Signup failed',
        String(err?.message || err?.response?.data?.message || 'Could not create account')
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account ✨</Text>

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

      <View style={styles.roleButtons}>
        <Button
          title="I'm a Client"
          onPress={() => setRole('client')}
          color={role === 'client' ? '#0f0' : '#555'}
        />
        <Button
          title="I'm a Stylist"
          onPress={() => setRole('stylist')}
          color={role === 'stylist' ? '#0f0' : '#555'}
        />
      </View>

      <Button title="Sign Up" onPress={handleSignup} />

      <View style={styles.links}>
        <Button title="Login" onPress={() => router.push('/login')} />
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
    fontSize: 16,
  },
  roleButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  links: { marginTop: 20, gap: 15 },
});
