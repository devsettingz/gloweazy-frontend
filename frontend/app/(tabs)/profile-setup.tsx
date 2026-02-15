import { useRouter } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, RADIUS, GRADIENTS } from '../../constants/luxuryTheme';

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (success) {
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [success]);

  const handleProfileSetup = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
        businessName: businessName.trim(),
        bio: bio.trim(),
      });

      setSuccess(true);
      
      // Wait for animation then navigate
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (err: any) {
      const errorMsg = String(err?.response?.data?.error || err?.response?.data?.message || 'Profile setup failed');
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0;

  // Success Screen
  if (success) {
    return (
      <View style={styles.successContainer}>
        <Animated.View
          style={[
            styles.successContent,
            { opacity: successAnim, transform: [{ scale: successAnim }] },
          ]}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Profile Created!</Text>
          <Text style={styles.successSubtitle}>
            Welcome to GlowEazy, {name.split(' ')[0]}
          </Text>
          <Text style={styles.successText}>
            Your profile has been set up successfully. Taking you to your dashboard...
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading && <LoadingOverlay message="Setting up your profile..." />}

        {/* Background */}
        <LinearGradient colors={GRADIENTS.light} style={styles.background} />

        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.greeting}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about yourself to get started
          </Text>
        </Animated.View>

        {/* Progress Indicator */}
        <Animated.View
          style={[
            styles.progressContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 2</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            styles.formContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'name' && styles.inputContainerFocused,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={focusedField === 'name' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'phone' && styles.inputContainerFocused,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={focusedField === 'phone' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="+233 XX XXX XXXX"
                placeholderTextColor={COLORS.textMuted}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Business Name Input (for stylists) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Business Name
              <Text style={styles.optional}> (for stylists)</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                focusedField === 'business' && styles.inputContainerFocused,
              ]}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={focusedField === 'business' ? COLORS.primary : COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Your business name"
                placeholderTextColor={COLORS.textMuted}
                value={businessName}
                onChangeText={setBusinessName}
                onFocus={() => setFocusedField('business')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Bio Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Bio
              <Text style={styles.optional}> (optional)</Text>
            </Text>
            <View
              style={[
                styles.inputContainer,
                styles.textAreaContainer,
                focusedField === 'bio' && styles.inputContainerFocused,
              ]}
            >
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell clients about yourself..."
                placeholderTextColor={COLORS.textMuted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
            onPress={handleProfileSetup}
            disabled={!canSubmit || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canSubmit ? GRADIENTS.gold : ['#E0E0E0', '#D0D0D0']}
              style={styles.saveButtonGradient}
            >
              <Text style={[styles.saveButtonText, !canSubmit && styles.saveButtonTextDisabled]}>
                Complete Setup
              </Text>
              <Ionicons name="arrow-forward" size={20} color={canSubmit ? COLORS.ivory : COLORS.textMuted} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Skip Option */}
          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: SPACING.xxl,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '300',
    color: COLORS.charcoal,
    marginBottom: SPACING.xs,
    fontFamily: TYPOGRAPHY.serif,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginBottom: SPACING.xl,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.small,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  formContainer: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.charcoal,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  required: {
    color: COLORS.error,
  },
  optional: {
    color: COLORS.textMuted,
    fontWeight: '400',
    textTransform: 'none',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.subtle,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    ...SHADOWS.soft,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.body,
    color: COLORS.charcoal,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: RADIUS.lg,
    ...SHADOWS.soft,
    marginTop: SPACING.md,
  },
  saveButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.ivory,
    letterSpacing: 1,
  },
  saveButtonTextDisabled: {
    color: COLORS.textMuted,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textDecorationLine: 'underline',
  },
  // Success Screen Styles
  successContainer: {
    flex: 1,
    backgroundColor: COLORS.ivory,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successContent: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.successLight || '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: COLORS.charcoal,
    marginBottom: SPACING.sm,
    fontFamily: TYPOGRAPHY.serif,
  },
  successSubtitle: {
    fontSize: TYPOGRAPHY.h4,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
